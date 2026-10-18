"use client";

import { useState, useEffect, useLayoutEffect, useMemo, useRef, useCallback } from "react";
import { Mic, MicOff, Phone, Loader2, Repeat, X } from "lucide-react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useIsSpeaking,
  useLocalParticipant,
  useRemoteParticipants,
  useRoomContext,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
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
import { getPartAndPosition, QUESTIONS_PER_PART, TOTAL_QUESTIONS } from "@/lib/question-utils";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { IeltsQuestion, Match } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Label, Notice } from "@/components/ui/card";
import { CueCard } from "@/components/ui/cue-card";
import { LiveWaveform, OnAirLamp } from "@/components/ui/on-air";
import { Part2Timer, formatClock } from "@/components/ui/timer";
import { cn } from "@/lib/utils";

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

/** P1 / P2 / P3 as three thin segments; the current one says where we are. */
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
    <div className="grid grid-cols-3 gap-2" role="group" aria-label="Tiến độ buổi thi">
      {[1, 2, 3].map((part) => {
        const perTurn = QUESTIONS_PER_PART[part as keyof typeof QUESTIONS_PER_PART];
        const isCurrent = part === currentPart;
        const isDone = part < currentPart;
        return (
          <div key={part} aria-current={isCurrent ? "step" : undefined}>
            <span className={cn("block h-0.5 rounded-full", isCurrent ? "bg-ink-2" : isDone ? "bg-subtle" : "bg-surface-3")} />
            <p className={cn("mt-1.5 truncate font-mono text-[11px] tabular", isCurrent ? "text-ink-2" : "text-subtle")}>
              P{part}
              {isCurrent && ` · ${questionInTurn}/${perTurn} · T${turnInPart}`}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// Swap request banner (shown to the OTHER user)
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
    <Notice className="mb-4 items-center">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <Repeat className="size-3.5" /> Bạn kia muốn đổi vai
        </span>
        <span className="flex items-center gap-1.5">
          <Button size="sm" variant="secondary" onClick={onAccept} disabled={isLoading}>
            Đồng ý
          </Button>
          <Button size="sm" variant="ghost" onClick={onDecline} disabled={isLoading}>
            Không
          </Button>
        </span>
      </div>
    </Notice>
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
    <Button variant="ghost" size="sm" onClick={onCancelSwap} aria-label="Huỷ yêu cầu đổi vai">
      <Loader2 className="animate-spin" /> Đang chờ đổi vai <X />
    </Button>
  ) : (
    <Button variant="ghost" size="sm" onClick={onRequestSwap}>
      <Repeat /> Đổi vai
    </Button>
  );
}

/** Role as a quiet mono label, one sentence of what to do, and the swap button. */
function RoleLine({
  role,
  hint,
  swap,
}: {
  role: string;
  hint: string;
  swap: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <Label>{role}</Label>
        <p className="mt-1 text-sm text-muted">{hint}</p>
      </div>
      <div className="shrink-0">{swap}</div>
    </div>
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
    <div className="space-y-5">
      <RoleLine
        role="Giám khảo"
        hint="Đọc to câu hỏi cho bạn kia, rồi bấm “Câu tiếp theo”."
        swap={<SwapButton swapPending={swapPending} onRequestSwap={onRequestSwap} onCancelSwap={onCancelSwap} />}
      />
      <PartProgress currentPart={currentPart} questionInTurn={questionInTurn} questionsPerTurn={questionsPerTurn} turnInPart={turnInPart} />

      {currentQuestion ? (
        <>
          <CueCard key={currentQuestion.id} question={currentQuestion}>
            {currentQuestion.part === 2 && <Part2Timer key={currentQuestion.id} />}
          </CueCard>
          <Button variant="primary" size="lg" block onClick={onNextQuestion} disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : "Câu tiếp theo"}
          </Button>
        </>
      ) : (
        <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
          <p className="text-muted">Bấm để lấy câu hỏi đầu tiên khi cả hai đã nghe được nhau.</p>
          <Button className="mt-4" variant="primary" size="lg" block onClick={onNextQuestion} disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : "Bắt đầu câu đầu tiên"}
          </Button>
        </div>
      )}
      {error && <Notice tone="error">{error}</Notice>}
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
  const hint =
    currentQuestion?.part === 2
      ? "Đây là thẻ đề của bạn. Chuẩn bị 1 phút rồi nói khoảng 2 phút."
      : "Nghe giám khảo đọc câu hỏi rồi trả lời. Nghe chưa rõ thì mở câu hỏi ra xem.";
  return (
    <div className="space-y-5">
      <RoleLine
        role="Thí sinh"
        hint={currentQuestion ? hint : "Chờ giám khảo bắt đầu câu đầu tiên."}
        swap={<SwapButton swapPending={swapPending} onRequestSwap={onRequestSwap} onCancelSwap={onCancelSwap} />}
      />
      <PartProgress currentPart={currentPart} questionInTurn={questionInTurn} questionsPerTurn={questionsPerTurn} turnInPart={turnInPart} />

      {currentQuestion ? (
        <CueCard key={currentQuestion.id} question={currentQuestion} hidden>
          {currentQuestion.part === 2 && <Part2Timer key={currentQuestion.id} />}
        </CueCard>
      ) : (
        <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-line bg-surface p-5 text-muted" aria-live="polite">
          <Loader2 className="size-4 animate-spin" />
          <p>Chờ giám khảo bắt đầu câu đầu tiên…</p>
        </div>
      )}
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
    <div className="sticky bottom-0 border-t border-line bg-bg pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-2xl items-center justify-center gap-3 px-4 py-3">
        <Button
          variant="secondary"
          size="icon"
          onClick={onMuteToggle}
          aria-label={isMuted ? "Bật micro" : "Tắt micro"}
          aria-pressed={isMuted}
        >
          {isMuted ? <MicOff /> : <Mic />}
        </Button>
        <Button variant="danger" onClick={onEndCall}>
          <Phone className="rotate-135" /> Kết thúc
        </Button>
      </div>
    </div>
  );
}

// Connecting State Component
function ConnectingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3" aria-live="polite">
      <Loader2 className="size-6 animate-spin text-muted" />
      <p className="text-muted">Đang vào phòng…</p>
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
  let localSpeaking = false;
  let remoteSpeaking = false;
  let remoteTrack: MediaStreamTrack | undefined;

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
    // eslint-disable-next-line react-hooks/rules-of-hooks
    localSpeaking = useIsSpeaking(localParticipant);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    remoteSpeaking = useIsSpeaking(remoteParticipants[0]);
    remoteTrack = remoteParticipants[0]?.getTrackPublication(Track.Source.Microphone)?.track?.mediaStreamTrack;
  }
  // The partner's real voice for the waveform; one stream per track
  const remoteTrackId = remoteTrack?.id;
  const remoteStream = useMemo(
    () => (remoteTrack ? new MediaStream([remoteTrack]) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [remoteTrackId]
  );
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

  const partnerName = partner.name;
  const speakingLabel = localSpeaking ? "Bạn đang nói" : remoteSpeaking ? `${partnerName} đang nói` : "On air";

  return (
    <>
      {isLiveKit && <RoomAudioRenderer />}

      <div className="flex min-h-dvh flex-col bg-bg">
        <header className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between gap-3 px-4">
          <p className="font-mono text-sm tabular text-ink-2" aria-label={`Đã gọi ${formatClock(elapsedTime)}`}>
            {formatClock(elapsedTime)}
          </p>
          <OnAirLamp on={localSpeaking || remoteSpeaking} label={speakingLabel} />
        </header>

        <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-8 pt-2">
          <div className="mb-6">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-ink">{partnerName}</h1>
            <p className="mt-1 text-sm text-muted">
              Band <span className="font-mono tabular text-ink-2">{partner.band}</span>
              <span className="mx-2 text-subtle" aria-hidden>
                ·
              </span>
              <span aria-live="polite">
                {isLiveKit ? (isPartnerConnected ? "Đã kết nối" : "Đang chờ bạn kia vào phòng…") : "Chế độ demo (không có âm thanh)"}
              </span>
            </p>
            <div className="mt-4">
              {remoteStream ? <LiveWaveform stream={remoteStream} className="h-10" /> : <div className="h-px w-full bg-line" aria-hidden />}
            </div>
          </div>

          {mediaError && (
            <Notice tone="error" className="mb-4">
              {mediaError}
            </Notice>
          )}

          {partnerMissing && (
            <Notice tone="error" className="mb-4">
              <p>Bạn kia vẫn chưa vào phòng. Có thể họ gặp sự cố kết nối.</p>
              <Button className="mt-3" variant="secondary" size="sm" onClick={finish}>
                Rời phòng
              </Button>
            </Notice>
          )}

          {matchId && userId && isInterviewer === null && (
            <Notice className="mb-4">
              <span className="flex items-center gap-3">
                <Loader2 className="size-4 animate-spin" /> Đang chia vai…
              </span>
            </Notice>
          )}

          {sessionCompleted && (
            <Notice className="mb-4">
              <p className="text-ink">Xong cả 18 câu.</p>
              <p className="mt-0.5 text-muted">
                Cuộc gọi kết thúc sau <span className="font-mono tabular text-ink">{countdown}s</span>
              </p>
            </Notice>
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
          <div className="flex min-h-dvh items-center justify-center bg-bg">
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
    <div className="flex min-h-dvh items-center justify-center bg-bg px-4">
      <div role="alert" className="w-full max-w-sm rounded-[var(--radius-card)] border border-line bg-surface p-6">
        <h1 className="text-lg font-semibold text-ink">Không vào được phòng gọi</h1>
        <p className="mt-2 text-sm text-muted">
          {connectError ?? "Có lỗi khi lấy quyền vào phòng."} Kiểm tra mạng rồi thử lại.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            variant="primary"
            onClick={() => {
              setConnectError(null);
              setIsConnecting(true);
              onRetryJoin();
            }}
          >
            Thử lại
          </Button>
          <Button variant="ghost" onClick={onMatchCancelled}>
            Rời
          </Button>
        </div>
      </div>
    </div>
  );
}
