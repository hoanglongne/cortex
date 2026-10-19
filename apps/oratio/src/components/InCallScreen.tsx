"use client";

import { Component, useState, useEffect, useLayoutEffect, useMemo, useRef, useCallback, type ReactNode } from "react";
import { Mic, MicOff, Phone, Loader2, Repeat, X } from "lucide-react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useRemoteParticipants,
  useRoomContext,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { ParticipantEvent, Track } from "livekit-client";
import type { Participant, RemoteParticipant, Room } from "livekit-client";
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
import { Card, EmptyState, Label, Notice } from "@/components/ui/card";
import { CueCard } from "@/components/ui/cue-card";
import { LiveWaveform, SpeakingPill } from "@/components/ui/on-air";
import { FlowShell } from "@/components/ui/shell";
import { Part2Timer, formatClock } from "@/components/ui/timer";
import { cn } from "@/lib/utils";
import { ExaminerPanel } from "@/components/live/ExaminerPanel";
import { SelfRecordNote } from "@/components/live/SelfRecordNote";
import type { LiveAnswer } from "@/components/live/types";
import { useSelfRecording } from "@/components/live/useSelfRecording";

export type { LiveAnswer };

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
  /** The examiner's private notes; never sent to the partner */
  notes?: string;
  /** This user's own recorded answers (device only), when they were the candidate */
  myAnswers?: LiveAnswer[];
}

/** Without a partner in the room after this long, offer to leave. */
const PARTNER_JOIN_TIMEOUT_S = 60;

/** P1 / P2 / P3 as three segments; the current one says where we are. */
/**
 * Whether someone is speaking. LiveKit's useIsSpeaking throws when the
 * participant is missing (the partner has not joined yet), which took the
 * whole page down; this one reads false until they are there.
 */
function useSpeaking(participant: Participant | undefined | null): boolean {
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => {
    if (!participant) return;
    const update = (v: boolean) => setSpeaking(v);
    update(participant.isSpeaking);
    participant.on(ParticipantEvent.IsSpeakingChanged, update);
    return () => {
      participant.off(ParticipantEvent.IsSpeakingChanged, update);
      setSpeaking(false);
    };
  }, [participant]);
  return participant ? speaking : false;
}

/** A failure inside the call shows a way out instead of a blank "This page couldn't load". */
class CallErrorBoundary extends Component<{ children: ReactNode; onLeave: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error("[InCall]", error);
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-ink">
        <p className="text-lg font-semibold">Cuộc gọi gặp lỗi</p>
        <p className="max-w-sm text-sm text-muted">Phòng gọi không hiển thị được. Bạn có thể rời phòng và ghép lại.</p>
        <Button variant="primary" onClick={this.props.onLeave}>
          Rời phòng
        </Button>
      </div>
    );
  }
}

function PartProgress({ currentPart, questionInTurn, turnInPart }: { currentPart: number; questionInTurn: number; turnInPart: 1 | 2 }) {
  return (
    <div className="grid grid-cols-3 gap-2" role="group" aria-label="Tiến độ buổi thi">
      {[1, 2, 3].map((part) => {
        const perTurn = QUESTIONS_PER_PART[part as keyof typeof QUESTIONS_PER_PART];
        const isCurrent = part === currentPart;
        const isDone = part < currentPart;
        return (
          <div key={part} aria-current={isCurrent ? "step" : undefined}>
            <span className={cn("block h-1.5 rounded-full", isCurrent ? "bg-voice" : isDone ? "bg-good" : "bg-surface-3")} />
            <p className={cn("mt-1 truncate text-[11px] font-bold tabular", isCurrent ? "text-ink" : "text-subtle")}>
              Part {part}
              {isCurrent && ` · ${questionInTurn}/${perTurn} · lượt ${turnInPart}`}
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
  swapPending,
}: {
  currentQuestion: IeltsQuestion | null;
  onNextQuestion: () => void;
  onRequestSwap: () => void;
  onCancelSwap: () => void;
  isLoading: boolean;
  error: string | null;
  swapPending: boolean;
}) {
  return (
    <div className="space-y-5">
      <RoleLine
        role="Bạn là giám khảo"
        hint="Đọc to câu hỏi cho bạn kia, rồi bấm “Câu tiếp theo”."
        swap={<SwapButton swapPending={swapPending} onRequestSwap={onRequestSwap} onCancelSwap={onCancelSwap} />}
      />

      {currentQuestion ? (
        <>
          <CueCard key={currentQuestion.id} question={currentQuestion}>
            {currentQuestion.part === 2 && <Part2Timer key={currentQuestion.id} />}
          </CueCard>
          <Button variant="primary" size="lg" block onClick={onNextQuestion} disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : "Câu tiếp theo"}
            {!isLoading && <kbd className="hidden rounded-[6px] border border-on-voice/40 px-1.5 text-xs md:inline">Enter</kbd>}
          </Button>
        </>
      ) : (
        <Card>
          <p className="text-muted">Bấm để lấy câu hỏi đầu tiên khi cả hai đã nghe được nhau.</p>
          <Button className="mt-4" variant="primary" size="lg" block onClick={onNextQuestion} disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : "Bắt đầu câu đầu tiên"}
          </Button>
        </Card>
      )}
      {error && (
        <Notice tone="error">{error}</Notice>
      )}
    </div>
  );
}

// Candidate View Component
function CandidateView({
  currentQuestion,
  onRequestSwap,
  onCancelSwap,
  swapPending,
}: {
  currentQuestion: IeltsQuestion | null;
  onRequestSwap: () => void;
  onCancelSwap: () => void;
  swapPending: boolean;
}) {
  const hint =
    currentQuestion?.part === 2
      ? "Đây là thẻ đề của bạn. Chuẩn bị 1 phút rồi nói khoảng 2 phút."
      : "Nghe giám khảo đọc câu hỏi rồi trả lời. Nghe chưa rõ thì mở câu hỏi ra xem.";
  return (
    <div className="space-y-5">
      <RoleLine
        role="Bạn là thí sinh"
        hint={currentQuestion ? hint : "Chờ giám khảo bắt đầu câu đầu tiên."}
        swap={<SwapButton swapPending={swapPending} onRequestSwap={onRequestSwap} onCancelSwap={onCancelSwap} />}
      />

      {currentQuestion ? (
        <CueCard key={currentQuestion.id} question={currentQuestion} hidden>
          {currentQuestion.part === 2 && <Part2Timer key={currentQuestion.id} />}
        </CueCard>
      ) : (
        <Card className="flex items-center gap-3 text-muted" aria-live="polite">
          <Loader2 className="size-4 animate-spin" />
          <p>Chờ giám khảo bắt đầu câu đầu tiên…</p>
        </Card>
      )}
    </div>
  );
}

/** Private notes for rating later. They live in this screen's state and travel only to our own rating step. */
function NotesCard({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Card>
      <label htmlFor="call-notes" className="block text-xs font-extrabold uppercase tracking-[0.06em] text-subtle">
        Ghi chú cho lúc chấm
      </label>
      <p className="mt-1 text-[13px] text-subtle">Chỉ bạn thấy, bạn kia không nhận được. Sẽ hiện lại khi bạn chấm điểm.</p>
      <textarea
        id="call-notes"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={2000}
        placeholder="Ghi nhanh điều bạn nghe được…"
        className="mt-3 h-36 w-full resize-none rounded-[var(--radius-control)] border border-line-strong bg-surface-2 p-3 text-[15px] text-ink placeholder:text-subtle focus-visible:border-voice"
      />
    </Card>
  );
}

/** The partner (and you) with who-is-speaking pills and real waveforms. */
function PartnerCard({
  partner,
  status,
  remoteSpeaking,
  localSpeaking,
  remoteStream,
  localStream,
  showWaves,
}: {
  partner: { name: string; band: string };
  status: string;
  remoteSpeaking: boolean;
  localSpeaking: boolean;
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
  showWaves: boolean;
}) {
  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-extrabold tracking-[-0.03em] text-ink">{partner.name}</h2>
          <p className="mt-0.5 text-sm text-muted">
            Band <span className="font-bold text-ink-2 tabular">{partner.band}</span> · <span aria-live="polite">{status}</span>
          </p>
        </div>
        <SpeakingPill on={remoteSpeaking} label={remoteSpeaking ? "Đang nói" : "Im lặng"} />
      </div>
      {showWaves && (remoteStream ? <LiveWaveform stream={remoteStream} className="h-10" /> : <div className="h-px w-full bg-line" aria-hidden />)}
      <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
        <span className="text-sm font-bold text-ink">Bạn</span>
        <SpeakingPill on={localSpeaking} label={localSpeaking ? "Đang nói" : "Im lặng"} />
      </div>
      {showWaves && localStream && <LiveWaveform stream={localStream} className="h-10" />}
    </Card>
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
    <div className="flex items-center justify-center gap-3">
      <Button variant="secondary" size="icon" onClick={onMuteToggle} aria-label={isMuted ? "Bật micro" : "Tắt micro"} aria-pressed={isMuted}>
        {isMuted ? <MicOff /> : <Mic />}
      </Button>
      <Button variant="danger" size="lg" onClick={onEndCall}>
        <Phone className="rotate-135" /> Kết thúc
      </Button>
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
  // Private examiner notes, never sent anywhere until the rating step
  const [notes, setNotes] = useState("");
  const notesRef = useRef("");

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
  let localTrack: MediaStreamTrack | undefined;

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
    localSpeaking = useSpeaking(localParticipant);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    remoteSpeaking = useSpeaking(remoteParticipants[0]);
    remoteTrack = remoteParticipants[0]?.getTrackPublication(Track.Source.Microphone)?.track?.mediaStreamTrack;
    localTrack = localParticipant?.getTrackPublication(Track.Source.Microphone)?.track?.mediaStreamTrack;
  }
  // The partner's real voice for the waveform; one stream per track
  const remoteTrackId = remoteTrack?.id;
  const remoteStream = useMemo(
    () => (remoteTrack ? new MediaStream([remoteTrack]) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [remoteTrackId]
  );
  const localTrackId = localTrack?.id;
  const localStream = useMemo(
    () => (localTrack ? new MediaStream([localTrack]) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [localTrackId]
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

  // Own-mic recording while this user is the candidate (never in demo, never the partner)
  const [recordingOn, setRecordingOn] = useState(true);
  const isCandidate = isLiveKit && isInterviewer === false;
  const selfRec = useSelfRecording({
    active: isCandidate && recordingOn,
    muted: isMuted,
    question: currentQuestion ? { id: currentQuestion.id, part: currentQuestion.part, text: currentQuestion.question_text } : null,
  });
  const selfFinishRef = useRef(selfRec.finish);

  const callData = useCallback(
    (myAnswers: LiveAnswer[]): CallData => ({
      duration: Math.floor((Date.now() - startTimeRef.current) / 1000),
      questions: questionsSeenRef.current.map((q) => ({ part: q.part, text: q.question_text })),
      notes: notesRef.current.trim() || undefined,
      myAnswers: myAnswers.length > 0 ? myAnswers : undefined,
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
    notesRef.current = notes;
    selfFinishRef.current = selfRec.finish;
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
    // Close the clip in progress so the last answer is included
    const mine = await selfFinishRef.current().catch(() => []);
    onEndCallRef.current(callData(mine));
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

  // Enter = next question for the examiner, unless typing or on a focused control
  const nextRef = useRef(handleNextQuestion);
  useLayoutEffect(() => {
    nextRef.current = handleNextQuestion;
  });
  useEffect(() => {
    if (!isInterviewer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.repeat || e.isComposing) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("textarea, input, select, button, a, [contenteditable]")) return;
      e.preventDefault();
      void nextRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isInterviewer]);

  const partnerMissing =
    isLiveKit && !isPartnerConnected && !partnerEverJoined && elapsedTime >= PARTNER_JOIN_TIMEOUT_S;

  const statusText = isLiveKit ? (isPartnerConnected ? "Đã kết nối" : "Đang chờ bạn kia vào phòng…") : "Chế độ demo (không có âm thanh)";
  const swapProps = {
    onRequestSwap: handleRequestSwap,
    onCancelSwap: handleCancelSwap,
    swapPending: mySwapPending,
  };

  return (
    <>
      {isLiveKit && <RoomAudioRenderer />}

      <FlowShell
        tone="dark"
        wide
        progress={<PartProgress currentPart={progress.part} questionInTurn={progress.questionInTurn} turnInPart={progress.turnInPart} />}
        right={
          <span className="text-sm font-extrabold text-ink-2 tabular" aria-label={`Đã gọi ${formatClock(elapsedTime)}`}>
            {formatClock(elapsedTime)}
          </span>
        }
        footer={<ControlBar isMuted={isMuted} onMuteToggle={handleMuteToggle} onEndCall={finish} />}
      >
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
            <p className="font-bold">Xong cả 18 câu.</p>
            <p className="mt-0.5">
              Cuộc gọi kết thúc sau <span className="font-bold tabular">{countdown}s</span>
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

        <div className="grid gap-5 md:grid-cols-[1.4fr_1fr] md:items-start">
          <div>
            {!matchId && (
              <EmptyState title="Chế độ demo">Không có máy chủ nên không chia vai giám khảo và không có câu hỏi.</EmptyState>
            )}
            {isInterviewer !== null &&
              (isInterviewer ? (
                <InterviewerControls
                  currentQuestion={currentQuestion}
                  onNextQuestion={handleNextQuestion}
                  isLoading={isLoadingQuestion}
                  error={questionError}
                  {...swapProps}
                />
              ) : (
                <CandidateView currentQuestion={currentQuestion} {...swapProps} />
              ))}
          </div>

          <div className="space-y-5">
            <PartnerCard
              partner={partner}
              status={statusText}
              remoteSpeaking={remoteSpeaking}
              localSpeaking={localSpeaking}
              remoteStream={remoteStream}
              localStream={localStream}
              showWaves={isLiveKit}
            />
            {isInterviewer && (
              <ExaminerPanel
                position={{
                  part: progress.part,
                  questionInTurn: progress.questionInTurn,
                  turnInPart: progress.turnInPart,
                  hasQuestion: !!currentQuestion,
                  completed: sessionCompleted,
                }}
              />
            )}
            {isInterviewer && <NotesCard value={notes} onChange={setNotes} />}
            {isCandidate && <SelfRecordNote on={recordingOn} onToggle={() => setRecordingOn((v) => !v)} error={selfRec.error} />}
          </div>
        </div>
      </FlowShell>
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
          <div data-theme="dark" className="flex min-h-dvh items-center justify-center bg-bg text-ink">
            <ConnectingState />
          </div>
        ) : (
          <CallErrorBoundary onLeave={onMatchCancelled}>
            <InCallContent
              partner={partner}
              onEndCall={onEndCall}
              onMatchCancelled={onMatchCancelled}
              isLiveKit={true}
              matchId={matchId}
              userId={userId}
              mediaError={mediaError}
            />
          </CallErrorBoundary>
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
    <div data-theme="dark" className="flex min-h-dvh items-center justify-center bg-bg px-4 text-ink">
      <div role="alert" className="w-full max-w-sm rounded-[var(--radius-card)] border border-line bg-surface p-6">
        <h1 className="text-lg font-extrabold tracking-[-0.02em] text-ink">Không vào được phòng gọi</h1>
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
