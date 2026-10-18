"use client";

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import {
  Mic,
  MicOff,
  Phone,
  Volume2,
  Loader2,
  ArrowRight,
  User,
  Repeat,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useRemoteParticipants,
  useRoomContext,
} from "@livekit/components-react";
import "@livekit/components-styles";
import type { RemoteParticipant, Room } from "livekit-client";
import {
  getNextQuestion,
  getQuestionById,
  getMatchState,
  requestSwapRoles,
  respondToSwapRequest,
  cancelSwapRequest,
  assignMatchRoles,
} from "@/actions/questions";
import { Part2Timer, QuestionText } from "./QuestionParts";
import { getPartAndPosition, QUESTIONS_PER_PART, TOTAL_QUESTIONS } from "@/lib/question-utils";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { IeltsQuestion, Match } from "@/lib/types/database";

interface InCallScreenProps {
  partner?: { name: string; band: string };
  /** The call ended (by this user, the partner, or the 18th question) */
  onEndCall: (callData: CallData) => void;
  /** The partner left before the call started */
  onMatchCancelled: () => void;
  /** Ask for a new call token after a failed join */
  onRetryJoin: () => void;
  roomId?: string;
  token?: string | null;
  matchId?: string;
  userId?: string;
  /** NEXT_PUBLIC_DEMO_MODE: no LiveKit, no server */
  demo?: boolean;
}

export interface CallData {
  duration: number;
  /** Questions asked in the call, in order */
  questions: { part: number; text: string }[];
}

/** Without a partner in the room after this long, offer to leave. */
const PARTNER_JOIN_TIMEOUT_S = 60;

// Audio Visualizer Component
function AudioVisualizer({ isActive = true }: { isActive?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1.5 h-32 w-64 mx-auto">
      {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
        <div
          key={bar}
          className={`audio-bar-${bar} w-3 rounded-full bg-gradient-to-t from-oratio-primary via-oratio-secondary to-oratio-primary transition-opacity ${isActive ? "opacity-100" : "opacity-30"
            }`}
          style={{
            minHeight: "16px",
          }}
        />
      ))}
    </div>
  );
}

// Timer Pill Component
function TimerPill({ time }: { time: string }) {
  return (
    <div className="timer-pulse inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      <span className="text-sm font-semibold tracking-wide text-white/90 tabular-nums">
        {time}
      </span>
    </div>
  );
}

// Part progress indicator with question counts
function PartProgress({
  currentPart,
  questionInTurn,
  turnInPart,
}: {
  currentPart: number;
  questionInTurn: number;
  questionsPerTurn: number;
  turnInPart: 1 | 2;
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {[1, 2, 3].map((part) => {
        const perTurn = QUESTIONS_PER_PART[part as keyof typeof QUESTIONS_PER_PART];
        const isCurrent = part === currentPart;
        const isDone = part < currentPart;
        return (
          <div
            key={part}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${isCurrent
              ? "bg-white/10 border border-white/20 text-white"
              : isDone
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-white/5 border border-white/5 text-zinc-600"
              }`}
          >
            {isDone && <Check className="w-3 h-3" />}
            P{part}
            {isCurrent && (
              <span className="text-[10px] opacity-70">
                {questionInTurn}/{perTurn} · T{turnInPart}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Swap request banner — compact inline (shown to the OTHER user)
function SwapRequestBanner({
  onAccept,
  onDecline,
  isLoading,
}: {
  onAccept: () => void;
  onDecline: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-3 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm flex items-center justify-between gap-2">
      <span className="text-xs text-amber-300 flex items-center gap-1.5">
        <Repeat className="w-3 h-3" /> Bạn kia muốn đổi vai
      </span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onAccept}
          disabled={isLoading}
          className="px-2.5 py-1 rounded-md bg-emerald-500/80 hover:bg-emerald-500 text-white text-xs font-medium transition-all disabled:opacity-50"
        >
          Đồng ý
        </button>
        <button
          onClick={onDecline}
          disabled={isLoading}
          className="px-2.5 py-1 rounded-md bg-zinc-700/80 hover:bg-zinc-600 text-white text-xs font-medium transition-all disabled:opacity-50"
        >
          Không
        </button>
      </div>
    </div>
  );
}

function SwapButton({
  swapPending,
  onRequestSwap,
  onCancelSwap,
}: {
  swapPending: boolean;
  onRequestSwap: () => void;
  onCancelSwap: () => void;
}) {
  return swapPending ? (
    <button
      onClick={onCancelSwap}
      aria-label="Huỷ yêu cầu đổi vai"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 transition-all hover:bg-amber-500/20 text-xs text-amber-400"
    >
      <Loader2 className="w-3 h-3 animate-spin" /> Đang chờ đổi vai
      <X className="w-3 h-3" />
    </button>
  ) : (
    <button
      onClick={onRequestSwap}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs text-zinc-400"
    >
      <Repeat className="w-3 h-3" /> Đổi vai
    </button>
  );
}

// Interviewer Controls Component
function InterviewerControls({
  currentQuestion,
  onNextQuestion,
  onRequestSwap,
  onCancelSwap,
  isLoading,
  error,
  currentPart,
  questionInTurn,
  questionsPerTurn,
  turnInPart,
  swapPending,
}: {
  currentQuestion: IeltsQuestion | null;
  onNextQuestion: () => void;
  onRequestSwap: () => void;
  onCancelSwap: () => void;
  isLoading: boolean;
  error: string | null;
  currentPart: number;
  questionInTurn: number;
  questionsPerTurn: number;
  turnInPart: 1 | 2;
  swapPending: boolean;
}) {
  return (
    <div className="relative w-full max-w-2xl mx-auto space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-oratio-primary/10 border border-oratio-primary/30">
          <User className="w-3.5 h-3.5 text-oratio-primary" />
          <span className="text-xs font-medium text-oratio-primary">Bạn là giám khảo</span>
        </div>
        <PartProgress currentPart={currentPart} questionInTurn={questionInTurn} questionsPerTurn={questionsPerTurn} turnInPart={turnInPart} />
        <SwapButton swapPending={swapPending} onRequestSwap={onRequestSwap} onCancelSwap={onCancelSwap} />
      </div>

      <div className="relative p-6 rounded-3xl bg-zinc-900/80 border border-white/10 backdrop-blur-sm">
        {currentQuestion ? (
          <>
            <div className="flex items-start justify-between gap-3 mb-4">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Part {currentQuestion.part} • {currentQuestion.category}
              </p>
            </div>
            <p className="text-sm text-zinc-400 mb-2">Đọc to câu này cho bạn kia:</p>
            <div className="mb-5">
              <QuestionText question={currentQuestion} revealable={false} />
            </div>
            {currentQuestion.part === 2 && (
              <div className="mb-5">
                <Part2Timer key={currentQuestion.id} />
              </div>
            )}
            <button
              onClick={onNextQuestion}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-oratio-primary to-oratio-secondary hover:from-[#6db0e4] hover:to-[#9dc5e5] text-white font-medium transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Câu tiếp theo</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-zinc-400 mb-4">Bấm để lấy câu hỏi đầu tiên khi cả hai đã nghe được nhau.</p>
            <button
              onClick={onNextQuestion}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-oratio-primary to-oratio-secondary hover:from-[#6db0e4] hover:to-[#9dc5e5] text-white font-medium transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Bắt đầu câu đầu tiên"}
            </button>
          </div>
        )}
        {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-oratio-primary/20 via-transparent to-oratio-secondary/20 -z-10 blur-sm" />
      </div>
    </div>
  );
}

// Candidate View Component
function CandidateView({
  currentQuestion,
  onRequestSwap,
  onCancelSwap,
  currentPart,
  questionInTurn,
  questionsPerTurn,
  turnInPart,
  swapPending,
}: {
  currentQuestion: IeltsQuestion | null;
  onRequestSwap: () => void;
  onCancelSwap: () => void;
  currentPart: number;
  questionInTurn: number;
  questionsPerTurn: number;
  turnInPart: 1 | 2;
  swapPending: boolean;
}) {
  return (
    <div className="relative w-full max-w-2xl mx-auto space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-oratio-secondary/10 border border-oratio-secondary/30">
          <User className="w-3.5 h-3.5 text-oratio-secondary" />
          <span className="text-xs font-medium text-oratio-secondary">Bạn là thí sinh</span>
        </div>
        <PartProgress currentPart={currentPart} questionInTurn={questionInTurn} questionsPerTurn={questionsPerTurn} turnInPart={turnInPart} />
        <SwapButton swapPending={swapPending} onRequestSwap={onRequestSwap} onCancelSwap={onCancelSwap} />
      </div>

      <div className="relative p-6 sm:p-8 rounded-3xl bg-zinc-900/80 border border-white/10 backdrop-blur-sm text-center">
        {currentQuestion ? (
          <>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-4">
              Part {currentQuestion.part} • {currentQuestion.category}
            </p>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-oratio-secondary/10 border border-oratio-secondary/30 mb-4">
              <Mic className="w-7 h-7 text-oratio-secondary" />
            </div>
            <p className="text-sm text-zinc-400 mb-4">
              {currentQuestion.part === 2
                ? "Đây là thẻ đề của bạn. Chuẩn bị 1 phút rồi nói khoảng 2 phút."
                : "Nghe giám khảo đọc câu hỏi rồi trả lời. Nghe chưa rõ thì mở câu hỏi ra xem."}
            </p>
            <div className="mb-1">
              <QuestionText key={currentQuestion.id} question={currentQuestion} revealable />
            </div>
            {currentQuestion.part === 2 && (
              <div className="mt-5">
                <Part2Timer key={currentQuestion.id} />
              </div>
            )}
          </>
        ) : (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4">
              <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
            </div>
            <p className="text-zinc-400">Chờ giám khảo bắt đầu câu đầu tiên…</p>
          </>
        )}
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-oratio-secondary/20 via-transparent to-oratio-primary/20 -z-10 blur-sm" />
      </div>
    </div>
  );
}

// Control Bar Component
function ControlBar({
  isMuted,
  onMuteToggle,
  onEndCall,
}: {
  isMuted: boolean;
  onMuteToggle: () => void;
  onEndCall: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 pb-8">
      <div className="max-w-xs mx-auto">
        <div className="flex items-center justify-center gap-6 p-4 rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/10">
          <button
            onClick={onMuteToggle}
            className={`flex items-center justify-center w-14 h-14 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 ${isMuted
              ? "bg-zinc-700 text-white"
              : "bg-zinc-800 text-white hover:bg-zinc-700"
              }`}
            aria-label={isMuted ? "Bật micro" : "Tắt micro"}
            aria-pressed={isMuted}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <button
            onClick={onEndCall}
            className="flex items-center gap-2 px-5 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-red-500/30"
          >
            <Phone className="w-6 h-6 rotate-135" />
            <span className="text-sm font-medium">Kết thúc</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Connecting State Component
function ConnectingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 text-oratio-primary animate-spin" />
      <p className="text-zinc-400">Đang vào phòng…</p>
    </div>
  );
}

// Inner content component that uses LiveKit hooks or demo mode
function InCallContent({
  partner,
  onEndCall,
  onMatchCancelled,
  isLiveKit,
  matchId,
  userId,
  mediaError,
}: {
  partner: { name: string; band: string };
  onEndCall: (callData: CallData) => void;
  onMatchCancelled: () => void;
  isLiveKit: boolean;
  matchId?: string;
  userId?: string;
  mediaError: string | null;
}) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isMutedLocal, setIsMutedLocal] = useState(false);

  // Q&A states
  const [isInterviewer, setIsInterviewer] = useState<boolean | null>(null);
  const [currentQuestion, setCurrentQuestionState] = useState<IeltsQuestion | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ReturnType<typeof getPartAndPosition>>(getPartAndPosition(0));

  // Session completion states
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // Swap request states
  const [swapRequestedBy, setSwapRequestedBy] = useState<string | null>(null);
  const [isSwapLoading, setIsSwapLoading] = useState(false);

  const mySwapPending = swapRequestedBy === userId;
  const partnerRequestedSwap = !!swapRequestedBy && swapRequestedBy !== userId;

  // Questions seen in this call, in order (for the summary)
  const questionsSeenRef = useRef<IeltsQuestion[]>([]);
  const currentQuestionRef = useRef<IeltsQuestion | null>(null);
  const showQuestion = useCallback((q: IeltsQuestion) => {
    currentQuestionRef.current = q;
    if (!questionsSeenRef.current.some((seen) => seen.id === q.id)) questionsSeenRef.current.push(q);
    setCurrentQuestionState(q);
  }, []);

  const startTimeRef = useRef<number>(0);
  const hasPartnerEverConnected = useRef(false);
  const [partnerEverJoined, setPartnerEverJoined] = useState(false);
  const partnerDisconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const endedRef = useRef(false);

  // LiveKit hooks only exist inside LiveKitRoom; isLiveKit never changes for a mounted component
  let localParticipant = null;
  let remoteParticipants: RemoteParticipant[] = [];
  let isMuted = isMutedLocal;
  let isPartnerConnected = true;
  let room: Room | null = null;

  if (isLiveKit) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const lkLocal = useLocalParticipant();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const lkRemote = useRemoteParticipants();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    room = useRoomContext();

    localParticipant = lkLocal.localParticipant;
    remoteParticipants = lkRemote;
    isMuted = !localParticipant?.isMicrophoneEnabled;
    isPartnerConnected = remoteParticipants.length > 0;
  }
  // Remember that the partner was here (state adjusted during render, not in an effect)
  if (isLiveKit && isPartnerConnected && !partnerEverJoined) setPartnerEverJoined(true);

  // Timer: count up from mount
  useEffect(() => {
    startTimeRef.current = Date.now();
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const callData = useCallback(
    (): CallData => ({
      duration: Math.floor((Date.now() - startTimeRef.current) / 1000),
      questions: questionsSeenRef.current.map((q) => ({ part: q.part, text: q.question_text })),
    }),
    []
  );

  // End once, whoever triggers it (button, partner leaving, last question)
  const roomRef = useRef<Room | null>(null);
  const onEndCallRef = useRef(onEndCall);
  const onMatchCancelledRef = useRef(onMatchCancelled);
  useLayoutEffect(() => {
    roomRef.current = room;
    onEndCallRef.current = onEndCall;
    onMatchCancelledRef.current = onMatchCancelled;
  });

  const finish = useCallback(async () => {
    if (endedRef.current) return;
    endedRef.current = true;
    if (roomRef.current) {
      try {
        await roomRef.current.disconnect();
      } catch (error) {
        console.error("[End Call] Error disconnecting:", error);
      }
    }
    onEndCallRef.current(callData());
  }, [callData]);

  const cancelled = useCallback(async () => {
    if (endedRef.current) return;
    endedRef.current = true;
    if (roomRef.current) {
      try {
        await roomRef.current.disconnect();
      } catch {
        // already gone
      }
    }
    onMatchCancelledRef.current();
  }, []);

  // Partner left the room after having joined: end after a short grace period
  useEffect(() => {
    if (!isLiveKit) return;
    const count = remoteParticipants.length;

    if (count > 0) {
      hasPartnerEverConnected.current = true;
      if (partnerDisconnectTimeoutRef.current) {
        clearTimeout(partnerDisconnectTimeoutRef.current);
        partnerDisconnectTimeoutRef.current = null;
      }
    }
    if (count === 0 && hasPartnerEverConnected.current && !partnerDisconnectTimeoutRef.current) {
      partnerDisconnectTimeoutRef.current = setTimeout(finish, 3000);
    }
    return () => {
      if (partnerDisconnectTimeoutRef.current) {
        clearTimeout(partnerDisconnectTimeoutRef.current);
        partnerDisconnectTimeoutRef.current = null;
      }
    };
  }, [isLiveKit, remoteParticipants.length, finish]);

  /** Applies the server's view of the match to this screen. */
  const applyState = useCallback(
    async (state: {
      status?: string;
      interviewer_id?: string | null;
      swap_requested_by?: string | null;
      questions_asked_count?: number;
      current_question_id?: string | null;
    }) => {
      if (state.status === "cancelled") return cancelled();
      if (state.status === "finished") return finish();

      if (userId && state.interviewer_id) setIsInterviewer(state.interviewer_id === userId);
      setSwapRequestedBy(state.swap_requested_by ?? null);

      const count = state.questions_asked_count ?? 0;
      if (count > 0) setProgress(getPartAndPosition(count - 1));
      if (count >= TOTAL_QUESTIONS) setSessionCompleted(true);

      if (state.current_question_id && state.current_question_id !== currentQuestionRef.current?.id) {
        const result = await getQuestionById(state.current_question_id);
        if (result.success && result.question) showQuestion(result.question);
      }
    },
    [userId, cancelled, finish, showQuestion]
  );

  // Initial state, roles (assigned if missing), then a 3s poll that also tells the server we're here
  useEffect(() => {
    if (!matchId || !userId) return;
    let stop = false;

    const load = async () => {
      const state = await getMatchState(matchId);
      if (stop || !state.success) return;
      if (!state.interviewer_id) {
        const assigned = await assignMatchRoles(matchId);
        if (!stop && assigned.success && assigned.interviewer_id) setIsInterviewer(assigned.interviewer_id === userId);
      }
      if (!stop) await applyState(state);
    };

    load().catch((error) => console.error("[InCall] load failed:", error));
    const interval = setInterval(() => {
      getMatchState(matchId)
        .then((state) => {
          if (!stop && state.success) return applyState(state);
        })
        .catch((error) => console.error("[InCall] poll failed:", error));
    }, 3000);
    return () => {
      stop = true;
      clearInterval(interval);
    };
  }, [matchId, userId, applyState]);

  // Realtime updates for role swaps and question changes (the poll covers missed events)
  useEffect(() => {
    if (!matchId) return;

    const supabase = getSupabaseClient();
    const channel = supabase
      .channel(`match-${matchId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "matches", filter: `id=eq.${matchId}` },
        (payload) => {
          const m = payload.new as Match;
          applyState({
            status: m.status,
            interviewer_id: m.interviewer_id,
            swap_requested_by: m.swap_requested_by,
            questions_asked_count: (m.questions_asked || []).length,
            current_question_id: m.current_question_id,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, applyState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Next question (interviewer only)
  const handleNextQuestion = async () => {
    if (!matchId || !isInterviewer || sessionCompleted) return;

    setIsLoadingQuestion(true);
    setQuestionError(null);
    try {
      const result = await getNextQuestion(matchId);
      if (result.completed) {
        setSessionCompleted(true);
        return;
      }
      if (result.success && result.question) {
        showQuestion(result.question);
        if (result.progress) setProgress(result.progress);
        if (userId && result.newInterviewerId !== undefined) {
          setIsInterviewer(result.newInterviewerId === userId);
        }
      } else if (result.error && result.error !== "The question already changed") {
        setQuestionError("Không lấy được câu hỏi, thử lại nhé.");
      }
    } catch (error) {
      console.error("[Q&A] Error loading next question:", error);
      setQuestionError("Không lấy được câu hỏi, thử lại nhé.");
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const runSwap = async (action: () => Promise<unknown>) => {
    if (!matchId) return;
    setIsSwapLoading(true);
    try {
      await action();
    } catch (error) {
      console.error("[Q&A] Swap action failed:", error);
    } finally {
      setIsSwapLoading(false);
    }
  };
  const handleRequestSwap = () => runSwap(() => requestSwapRoles(matchId!));
  const handleCancelSwap = () => runSwap(() => cancelSwapRequest(matchId!));
  const handleRespondToSwap = (accept: boolean) => runSwap(() => respondToSwapRequest(matchId!, accept));

  const handleMuteToggle = async () => {
    if (isLiveKit && localParticipant) {
      await localParticipant.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled);
    } else {
      setIsMutedLocal(!isMutedLocal);
    }
  };

  // Countdown + auto-end when all questions are done
  useEffect(() => {
    if (!sessionCompleted) return;
    if (countdown <= 0) {
      finish();
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [sessionCompleted, countdown, finish]);

  const partnerMissing =
    isLiveKit && !isPartnerConnected && !partnerEverJoined && elapsedTime >= PARTNER_JOIN_TIMEOUT_S;

  return (
    <>
      {isLiveKit && <RoomAudioRenderer />}

      <div className="min-h-screen bg-[#050505] flex flex-col">
        <header className="flex items-center justify-center p-4 pt-6">
          <TimerPill time={formatTime(elapsedTime)} />
        </header>

        <main className="flex-1 flex flex-col items-center justify-start px-4 pt-2 pb-40">
          {/* Connection status */}
          <div className="flex items-center gap-2 mb-8" aria-live="polite">
            <div className={`w-2 h-2 rounded-full ${isPartnerConnected ? "bg-emerald-500" : "bg-amber-500"}`} />
            <Volume2 className={`w-4 h-4 ${isPartnerConnected ? "text-emerald-500" : "text-amber-500"}`} />
            <span className="text-sm text-zinc-400">
              {isLiveKit ? (isPartnerConnected ? "Đã kết nối" : "Đang chờ bạn kia vào phòng…") : "Chế độ demo (không có âm thanh)"}
            </span>
          </div>

          {mediaError && (
            <div role="alert" className="w-full max-w-2xl mx-auto mb-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{mediaError}</p>
            </div>
          )}

          {partnerMissing && (
            <div role="alert" className="w-full max-w-2xl mx-auto mb-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
              <p className="text-sm text-amber-200 mb-3">Bạn kia vẫn chưa vào phòng. Có thể họ gặp sự cố kết nối.</p>
              <button
                onClick={finish}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm text-white transition-colors"
              >
                Rời phòng
              </button>
            </div>
          )}

          <div className="mb-8">
            <AudioVisualizer isActive={!isMuted && isPartnerConnected} />
          </div>

          <div className="text-center mb-10">
            <h1 className="text-2xl font-semibold text-white mb-1">{partner.name}</h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-oratio-primary/10 to-oratio-secondary/10 border border-white/10">
              <span className="text-sm font-medium text-zinc-300">Band {partner.band}</span>
            </div>
          </div>

          {matchId && userId && isInterviewer === null && (
            <div className="w-full max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
                <p className="text-sm text-zinc-400">Đang chia vai…</p>
              </div>
            </div>
          )}

          {sessionCompleted && (
            <div className="w-full max-w-2xl mx-auto mb-4 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-sm text-center" aria-live="polite">
              <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-base font-semibold text-emerald-300 mb-1">Xong cả 18 câu!</p>
              <p className="text-sm text-zinc-400">
                Cuộc gọi kết thúc sau <span className="text-white font-mono">{countdown}s</span>
              </p>
            </div>
          )}

          {matchId && userId && partnerRequestedSwap && (
            <SwapRequestBanner
              onAccept={() => handleRespondToSwap(true)}
              onDecline={() => handleRespondToSwap(false)}
              isLoading={isSwapLoading}
            />
          )}

          {isInterviewer !== null &&
            (isInterviewer ? (
              <InterviewerControls
                currentQuestion={currentQuestion}
                onNextQuestion={handleNextQuestion}
                onRequestSwap={handleRequestSwap}
                onCancelSwap={handleCancelSwap}
                isLoading={isLoadingQuestion}
                error={questionError}
                currentPart={progress.part}
                questionInTurn={progress.questionInTurn}
                questionsPerTurn={progress.questionsPerTurn}
                turnInPart={progress.turnInPart}
                swapPending={mySwapPending}
              />
            ) : (
              <CandidateView
                currentQuestion={currentQuestion}
                onRequestSwap={handleRequestSwap}
                onCancelSwap={handleCancelSwap}
                currentPart={progress.part}
                questionInTurn={progress.questionInTurn}
                questionsPerTurn={progress.questionsPerTurn}
                turnInPart={progress.turnInPart}
                swapPending={mySwapPending}
              />
            ))}
        </main>

        <ControlBar isMuted={isMuted} onMuteToggle={handleMuteToggle} onEndCall={finish} />
      </div>
    </>
  );
}

// Main In-Call Screen Component (Wrapper)
export default function InCallScreen({
  partner = { name: "Partner", band: "–" },
  onEndCall,
  onMatchCancelled,
  onRetryJoin,
  roomId,
  token,
  matchId,
  userId,
  demo = false,
}: InCallScreenProps) {
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  if (token && roomId && livekitUrl && !connectError) {
    return (
      <LiveKitRoom
        serverUrl={livekitUrl}
        token={token}
        connect={true}
        audio={true}
        video={false}
        onConnected={() => setIsConnecting(false)}
        onError={(error) => {
          console.error("LiveKit error:", error);
          if (isConnecting) setConnectError("Không kết nối được phòng gọi.");
        }}
        onMediaDeviceFailure={() =>
          setMediaError("Không dùng được micro. Hãy cho phép trình duyệt dùng micro rồi tải lại trang.")
        }
      >
        {isConnecting ? (
          <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <ConnectingState />
          </div>
        ) : (
          <InCallContent
            partner={partner}
            onEndCall={onEndCall}
            onMatchCancelled={onMatchCancelled}
            isLiveKit={true}
            matchId={matchId}
            userId={userId}
            mediaError={mediaError}
          />
        )}
      </LiveKitRoom>
    );
  }

  if (demo) {
    return (
      <InCallContent
        partner={partner}
        onEndCall={onEndCall}
        onMatchCancelled={onMatchCancelled}
        isLiveKit={false}
        matchId={undefined}
        userId={undefined}
        mediaError={null}
      />
    );
  }

  // No token (it failed) or the room refused us: say so instead of a silent fake call
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <div role="alert" className="max-w-sm w-full p-6 rounded-2xl bg-zinc-900/80 border border-white/10 text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h1 className="text-lg font-semibold text-white mb-2">Không vào được phòng gọi</h1>
        <p className="text-sm text-zinc-400 mb-5">
          {connectError ?? "Có lỗi khi lấy quyền vào phòng."} Kiểm tra mạng rồi thử lại.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              setConnectError(null);
              setIsConnecting(true);
              onRetryJoin();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-oratio-primary to-oratio-secondary text-white text-sm font-medium"
          >
            Thử lại
          </button>
          <button
            onClick={onMatchCancelled}
            className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 text-sm"
          >
            Rời
          </button>
        </div>
      </div>
    </div>
  );
}
