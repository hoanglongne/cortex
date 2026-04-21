"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  MicOff,
  Phone,
  RefreshCw,
  MoreVertical,
  Star,
  Volume2,
  Loader2,
  ArrowRight,
  User,
  Repeat,
  Check,
  X,
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
import { getPartAndPosition, QUESTIONS_PER_PART, TOTAL_QUESTIONS } from "@/lib/question-utils";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { IeltsQuestion, Match } from "@/lib/types/database";

interface InCallScreenProps {
  partner?: { name: string; band: string };
  onEndCall: (callData: CallData) => void;
  onEvaluate: (callData: CallData) => void;
  roomId?: string;
  token?: string | null;
  matchId?: string;
  userId?: string;
}

export interface CallData {
  duration: number;
  topicsDiscussed: string[];
}

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
        <Repeat className="w-3 h-3" /> Partner requests swap
      </span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onAccept}
          disabled={isLoading}
          className="px-2.5 py-1 rounded-md bg-emerald-500/80 hover:bg-emerald-500 text-white text-xs font-medium transition-all disabled:opacity-50"
        >
          OK
        </button>
        <button
          onClick={onDecline}
          disabled={isLoading}
          className="px-2.5 py-1 rounded-md bg-zinc-700/80 hover:bg-zinc-600 text-white text-xs font-medium transition-all disabled:opacity-50"
        >
          No
        </button>
      </div>
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
  currentPart: number;
  questionInTurn: number;
  questionsPerTurn: number;
  turnInPart: 1 | 2;
  swapPending: boolean;
}) {
  return (
    <div className="relative w-full max-w-2xl mx-auto space-y-3">
      {/* Role Badge + Swap */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-oratio-primary/10 border border-oratio-primary/30">
          <User className="w-3.5 h-3.5 text-oratio-primary" />
          <span className="text-xs font-medium text-oratio-primary">Interviewer</span>
        </div>
        <PartProgress currentPart={currentPart} questionInTurn={questionInTurn} questionsPerTurn={questionsPerTurn} turnInPart={turnInPart} />
        {swapPending ? (
          <button
            onClick={onCancelSwap}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 transition-all hover:bg-amber-500/20 text-xs text-amber-400"
          >
            <Loader2 className="w-3 h-3 animate-spin" /> Pending
            <X className="w-3 h-3" />
          </button>
        ) : (
          <button
            onClick={onRequestSwap}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs text-zinc-400"
          >
            <Repeat className="w-3 h-3" /> Swap
          </button>
        )}
      </div>

      {/* Current Question Card */}
      <div className="relative p-6 rounded-3xl bg-zinc-900/80 border border-white/10 backdrop-blur-sm">
        {currentQuestion ? (
          <>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Part {currentQuestion.part} • {currentQuestion.category}
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <span className="text-xs font-medium text-zinc-400 capitalize">
                  {currentQuestion.difficulty}
                </span>
              </div>
            </div>
            <p className="text-lg font-medium text-white/90 leading-relaxed mb-6">
              {currentQuestion.question_text}
            </p>
            <button
              onClick={onNextQuestion}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-oratio-primary to-oratio-secondary hover:from-[#6db0e4] hover:to-[#9dc5e5] text-white font-medium transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Next Question</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-zinc-400 mb-4">No question loaded yet</p>
            <button
              onClick={onNextQuestion}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-oratio-primary to-oratio-secondary hover:from-[#6db0e4] hover:to-[#9dc5e5] text-white font-medium transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Load First Question"
              )}
            </button>
          </div>
        )}
        {/* Subtle gradient border effect */}
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
      {/* Role Badge */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-oratio-secondary/10 border border-oratio-secondary/30">
          <User className="w-3.5 h-3.5 text-oratio-secondary" />
          <span className="text-xs font-medium text-oratio-secondary">Candidate</span>
        </div>
        <PartProgress currentPart={currentPart} questionInTurn={questionInTurn} questionsPerTurn={questionsPerTurn} turnInPart={turnInPart} />
        {swapPending ? (
          <button
            onClick={onCancelSwap}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 transition-all hover:bg-amber-500/20 text-xs text-amber-400"
          >
            <Loader2 className="w-3 h-3 animate-spin" /> Pending
            <X className="w-3 h-3" />
          </button>
        ) : (
          <button
            onClick={onRequestSwap}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs text-zinc-400"
          >
            <Repeat className="w-3 h-3" /> Swap
          </button>
        )}
      </div>

      {/* Topic Display */}
      <div className="relative p-8 rounded-3xl bg-zinc-900/80 border border-white/10 backdrop-blur-sm text-center">
        {currentQuestion ? (
          <>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">
              Part {currentQuestion.part} • Listen and Respond
            </p>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-oratio-secondary/10 border border-oratio-secondary/30 mb-4">
              <Mic className="w-8 h-8 text-oratio-secondary" />
            </div>
            <p className="text-lg font-medium text-white/70 leading-relaxed">
              {currentQuestion.category}
            </p>
            <p className="text-sm text-zinc-500 mt-4">
              Your turn to speak - answer the interviewer&apos;s question
            </p>
          </>
        ) : (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4">
              <Loader2 className="w-8 h-8 text-zinc-600 animate-spin" />
            </div>
            <p className="text-zinc-400">Waiting for interviewer...</p>
          </>
        )}
        {/* Subtle gradient border effect */}
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-oratio-secondary/20 via-transparent to-oratio-primary/20 -z-10 blur-sm" />
      </div>
    </div>
  );
}

// Topic Card Component (deprecated - keeping for backward compatibility)
function TopicCard({
  topic,
  onRefresh,
}: {
  topic: string;
  onRefresh: () => void;
}) {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="relative p-5 rounded-3xl bg-zinc-900/80 border border-white/10 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Speaking Topic
            </p>
            <p className="text-base font-medium text-white/90 leading-relaxed">
              {topic}
            </p>
          </div>
          <button
            onClick={onRefresh}
            className="shrink-0 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 hover:scale-105 active:scale-95 group"
            aria-label="Refresh topic"
          >
            <RefreshCw className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors group-hover:rotate-180 duration-300" />
          </button>
        </div>
      </div>
      {/* Subtle gradient border effect */}
      <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-oratio-primary/20 via-transparent to-oratio-secondary/20 -z-10 blur-sm" />
    </div>
  );
}

// Control Bar Component
function ControlBar({
  isMuted,
  onMuteToggle,
  onEndCall,
  onEvaluate,
  isConnecting = false,
}: {
  isMuted: boolean;
  onMuteToggle: () => void;
  onEndCall: () => void;
  onEvaluate: () => void;
  isConnecting?: boolean;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 pb-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between gap-4 p-4 rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/10">
          {/* Mute Button */}
          <button
            onClick={onMuteToggle}
            disabled={isConnecting}
            className={`flex items-center justify-center w-14 h-14 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 ${isMuted
              ? "bg-zinc-700 text-white"
              : "bg-zinc-800 text-white hover:bg-zinc-700"
              }`}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </button>

          {/* End Call Button */}
          <button
            onClick={onEndCall}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-red-500/30"
            aria-label="End call"
          >
            <Phone className="w-7 h-7 rotate-135" />
          </button>

          {/* Evaluate Button */}
          <button
            onClick={onEvaluate}
            className="flex items-center gap-2 px-5 h-12 rounded-full bg-gradient-to-r from-oratio-primary to-oratio-secondary hover:from-[#6db0e4] hover:to-[#9dc5e5] text-white font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/25"
          >
            <Star className="w-4 h-4" />
            <span className="text-sm whitespace-nowrap">Finish & Rate</span>
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
      <p className="text-zinc-400">Connecting to room...</p>
    </div>
  );
}

// Inner content component that uses LiveKit hooks or mock mode
function InCallContent({
  partner,
  onEndCall,
  onEvaluate,
  isLiveKit,
  matchId,
  userId,
}: {
  partner: { name: string; band: string };
  onEndCall: (callData: CallData) => void;
  onEvaluate: (callData: CallData) => void;
  isLiveKit: boolean;
  matchId?: string;
  userId?: string;
}) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isMutedLocal, setIsMutedLocal] = useState(false);
  const [currentTopic, setCurrentTopic] = useState(
    "Describe a book you recently read."
  );
  const [discussedTopics, setDiscussedTopics] = useState<string[]>([
    "Describe a book you recently read.",
  ]);

  // Q&A states
  const [isInterviewer, setIsInterviewer] = useState<boolean | null>(null);
  const [currentQuestion, setCurrentQuestionState] =
    useState<IeltsQuestion | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [progress, setProgress] = useState<ReturnType<typeof getPartAndPosition>>(getPartAndPosition(0));

  // Session completion states
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // Swap request states
  const [swapRequestedBy, setSwapRequestedBy] = useState<string | null>(null);
  const [isSwapLoading, setIsSwapLoading] = useState(false);

  // Derived: did *I* request the swap?
  const iMySwapPending = swapRequestedBy === userId;
  // Derived: did the *other* user request a swap?
  const partnerRequestedSwap = !!swapRequestedBy && swapRequestedBy !== userId;

  // Ref for current question to avoid stale closure in realtime handler
  const currentQuestionRef = useRef<IeltsQuestion | null>(null);
  currentQuestionRef.current = currentQuestion;

  const startTimeRef = useRef<number | null>(null);
  const hasPartnerEverConnected = useRef(false);
  const partnerDisconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debug logging
  console.log("[InCallScreen] Props:", { matchId, userId, isInterviewer });

  // Conditionally use LiveKit hooks - only call when inside LiveKitRoom context
  // This is safe because isLiveKit is a stable prop that doesn't change
  let localParticipant = null;
  let remoteParticipants: RemoteParticipant[] = [];
  let isMuted = isMutedLocal;
  let isPartnerConnected = true;
  let room: Room | null = null;

  const topics = [
    "Describe a book you recently read.",
    "Talk about a memorable trip you took.",
    "Describe your favorite place to relax.",
    "Talk about a skill you would like to learn.",
    "Describe a person who inspires you.",
    "Talk about an important decision you made.",
    "Describe a festival or celebration in your country.",
    "Talk about your daily routine.",
  ];

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

    // Listen for participant disconnected events
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (!room) return;

      const handleParticipantDisconnected = () => {
        console.log("[LiveKit Event] Participant disconnected event fired");
      };

      room.on('participantDisconnected', handleParticipantDisconnected);

      return () => {
        if (room) {
          room.off('participantDisconnected', handleParticipantDisconnected);
        }
      };
    }, [room]);
  }

  // Timer effect - count up
  useEffect(() => {
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
    }
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current!) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Store onEndCall in ref to avoid useEffect re-triggering
  const onEndCallRef = useRef(onEndCall);
  onEndCallRef.current = onEndCall;

  // Store current values in refs to avoid useEffect re-trigger
  const elapsedTimeRef = useRef(elapsedTime);
  elapsedTimeRef.current = elapsedTime;
  const discussedTopicsRef = useRef(discussedTopics);
  discussedTopicsRef.current = discussedTopics;

  // Detect partner disconnect (LiveKit mode only)
  useEffect(() => {
    if (!isLiveKit) return;

    const currentPartnerCount = remoteParticipants.length;

    console.log("[Partner Detect] remoteParticipants count:", currentPartnerCount);

    // Track if partner has ever connected
    if (currentPartnerCount > 0) {
      hasPartnerEverConnected.current = true;
      console.log("[Partner Detect] Partner is connected");
      // Clear any pending disconnect timeout
      if (partnerDisconnectTimeoutRef.current) {
        console.log("[Partner Detect] Clearing disconnect timeout");
        clearTimeout(partnerDisconnectTimeoutRef.current);
        partnerDisconnectTimeoutRef.current = null;
      }
    }

    // If partner disconnects after having been connected, auto-end call
    if (
      currentPartnerCount === 0 &&
      hasPartnerEverConnected.current &&
      !partnerDisconnectTimeoutRef.current
    ) {
      console.log("[Partner Detect] Partner disconnected! Setting timeout...");
      partnerDisconnectTimeoutRef.current = setTimeout(() => {
        console.log("[Partner Detect] Auto-ending call due to partner disconnect");
        // Use refs to get latest values without re-triggering effect
        onEndCallRef.current({
          duration: elapsedTimeRef.current,
          topicsDiscussed: discussedTopicsRef.current,
        });
      }, 3000); // 3 second grace period for network issues
    }

    return () => {
      // Clear timeout when component unmounts completely
      if (partnerDisconnectTimeoutRef.current) {
        console.log("[Partner Detect] Clearing timeout on unmount");
        clearTimeout(partnerDisconnectTimeoutRef.current);
        partnerDisconnectTimeoutRef.current = null;
      }
    };
  }, [isLiveKit, remoteParticipants.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (partnerDisconnectTimeoutRef.current) {
        clearTimeout(partnerDisconnectTimeoutRef.current);
      }
    };
  }, []);

  // Fetch match data and determine role
  useEffect(() => {
    async function fetchMatchData() {
      if (!matchId || !userId) {
        console.log("[Q&A] No matchId or userId, skipping role fetch");
        return;
      }

      try {
        console.log("[Q&A] Fetching match state for:", matchId);

        const state = await getMatchState(matchId);

        if (!state.success) {
          console.error("[Q&A] Failed to get match state:", state.error);
          return;
        }

        console.log("[Q&A] Match state:", state);

        // If roles not assigned, auto-assign via server action
        if (!state.interviewer_id || !state.candidate_id) {
          console.warn("[Q&A] Roles not assigned, auto-assigning...");
          const assignResult = await assignMatchRoles(matchId);
          console.log("[Q&A] Auto-assign result:", assignResult);

          if (assignResult.success && assignResult.interviewer_id) {
            const isUserInterviewer = assignResult.interviewer_id === userId;
            setIsInterviewer(isUserInterviewer);
            console.log(`[Q&A] Auto-assigned role: ${isUserInterviewer ? "Interviewer" : "Candidate"}`);
          } else {
            console.error("[Q&A] Auto-assign failed:", assignResult.error);
          }
          return;
        }

        // Roles are assigned - determine user's role
        const isUserInterviewer = state.interviewer_id === userId;
        setIsInterviewer(isUserInterviewer);
        console.log(`[Q&A] Role: ${isUserInterviewer ? "Interviewer" : "Candidate"}`);

        // Sync progress
        const count = state.questions_asked_count ?? 0;
        if (count > 0) {
          setProgress(getPartAndPosition(count - 1));
        }

        // Load current question if exists
        if (state.current_question_id) {
          const result = await getQuestionById(state.current_question_id);
          if (result.success && result.question) {
            setCurrentQuestionState(result.question);
          }
        }
      } catch (error) {
        console.error("[Q&A] Error in fetchMatchData:", error);
      }
    }

    fetchMatchData();
  }, [matchId, userId]);

  // Poll match state every 3s to supplement realtime (handles realtime failures)
  useEffect(() => {
    if (!matchId || !userId) return;

    const poll = async () => {
      try {
        const state = await getMatchState(matchId);
        if (!state.success || !state.interviewer_id) return;

        // Sync role
        setIsInterviewer(state.interviewer_id === userId);

        // Sync swap request
        setSwapRequestedBy(state.swap_requested_by ?? null);

        // Sync progress
        const count = state.questions_asked_count ?? 0;
        if (count > 0) {
          setProgress(getPartAndPosition(count - 1));
        }
        if (count >= TOTAL_QUESTIONS) {
          setSessionCompleted(true);
        }

        // Sync current question (only fetch if ID changed)
        if (
          state.current_question_id &&
          state.current_question_id !== currentQuestionRef.current?.id
        ) {
          const result = await getQuestionById(state.current_question_id);
          if (result.success && result.question) {
            setCurrentQuestionState(result.question);
          }
        }
      } catch (error) {
        console.error("[Poll] Error:", error);
      }
    };

    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [matchId, userId]);

  // Subscribe to match updates for role swaps and question changes
  useEffect(() => {
    if (!matchId) return;

    const supabase = getSupabaseClient();
    const channel = supabase
      .channel(`match-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "matches",
          filter: `id=eq.${matchId}`,
        },
        async (payload) => {
          const newMatch = payload.new as Match;

          // Update role if changed
          if (userId && newMatch.interviewer_id !== undefined) {
            const isUserInterviewer = newMatch.interviewer_id === userId;
            setIsInterviewer(isUserInterviewer);
          }

          // Update swap request state
          setSwapRequestedBy(newMatch.swap_requested_by ?? null);

          // Sync progress from questions_asked
          if (newMatch.questions_asked) {
            const count = (newMatch.questions_asked as string[]).length;
            if (count > 0) {
              setProgress(getPartAndPosition(count - 1));
            }
            // Detect session completion
            if (count >= TOTAL_QUESTIONS) {
              setSessionCompleted(true);
            }
          }

          // Update current question if changed (use ref to avoid stale closure)
          if (
            newMatch.current_question_id &&
            newMatch.current_question_id !== currentQuestionRef.current?.id
          ) {
            const result = await getQuestionById(newMatch.current_question_id);
            if (result.success && result.question) {
              setCurrentQuestionState(result.question);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, userId]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Get call data
  const getCallData = useCallback(
    (): CallData => ({
      duration: elapsedTime,
      topicsDiscussed: discussedTopics,
    }),
    [elapsedTime, discussedTopics]
  );

  // Handle topic refresh
  const handleRefreshTopic = () => {
    const otherTopics = topics.filter((t: string) => t !== currentTopic);
    const randomTopic =
      otherTopics[Math.floor(Math.random() * otherTopics.length)];
    setCurrentTopic(randomTopic);
    if (!discussedTopics.includes(randomTopic)) {
      setDiscussedTopics((prev) => [...prev, randomTopic]);
    }
  };

  // Handle next question (interviewer only)
  const handleNextQuestion = async () => {
    if (!matchId || !isInterviewer || sessionCompleted) return;

    setIsLoadingQuestion(true);
    try {
      const result = await getNextQuestion(matchId);

      // Session completed — no more questions
      if (result.completed) {
        setSessionCompleted(true);
        return;
      }

      if (result.success && result.question) {
        // Set question + progress locally (single atomic update already persisted to DB)
        setCurrentQuestionState(result.question);
        if (result.progress) setProgress(result.progress);
        // Update role based on actual DB state returned by server
        if (userId && result.newInterviewerId !== undefined) {
          setIsInterviewer(result.newInterviewerId === userId);
        }
        if (result.autoSwapped) {
          console.log("[Q&A] Roles auto-swapped for next turn");
        }
        console.log("[Q&A] Next question:", result.progress);
      } else {
        console.error("[Q&A] Failed to get next question:", result.error);
      }
    } catch (error) {
      console.error("[Q&A] Error loading next question:", error);
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  // Handle swap request
  const handleRequestSwap = async () => {
    if (!matchId || !userId) return;
    setIsSwapLoading(true);
    try {
      await requestSwapRoles(matchId, userId);
    } catch (error) {
      console.error("[Q&A] Error requesting swap:", error);
    } finally {
      setIsSwapLoading(false);
    }
  };

  // Handle cancel swap request
  const handleCancelSwap = async () => {
    if (!matchId) return;
    setIsSwapLoading(true);
    try {
      await cancelSwapRequest(matchId);
    } catch (error) {
      console.error("[Q&A] Error cancelling swap:", error);
    } finally {
      setIsSwapLoading(false);
    }
  };

  // Handle respond to swap request (accept/decline)
  const handleRespondToSwap = async (accept: boolean) => {
    if (!matchId) return;
    setIsSwapLoading(true);
    try {
      await respondToSwapRequest(matchId, accept);
    } catch (error) {
      console.error("[Q&A] Error responding to swap:", error);
    } finally {
      setIsSwapLoading(false);
    }
  };

  // Handle mute toggle (real LiveKit or mock)
  const handleMuteToggle = async () => {
    if (isLiveKit && localParticipant) {
      const currentlyEnabled = localParticipant.isMicrophoneEnabled;
      await localParticipant.setMicrophoneEnabled(!currentlyEnabled);
    } else {
      // Mock mode
      setIsMutedLocal(!isMutedLocal);
    }
  };

  // Handle end call
  const handleEndCall = async () => {
    // Disconnect from LiveKit room before ending call
    if (isLiveKit && room) {
      console.log("[End Call] Disconnecting from LiveKit room...");
      try {
        await room.disconnect();
        console.log("[End Call] Disconnected successfully");
      } catch (error) {
        console.error("[End Call] Error disconnecting:", error);
      }
    }
    onEndCall(getCallData());
  };

  // Handle evaluate
  const handleEvaluate = () => {
    onEvaluate(getCallData());
  };

  // Countdown + auto-end when session is completed
  useEffect(() => {
    if (!sessionCompleted) return;
    if (countdown <= 0) {
      handleEndCall();
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionCompleted, countdown]);

  return (
    <>
      {/* Invisible audio renderer for LiveKit */}
      {isLiveKit && <RoomAudioRenderer />}

      <div className="min-h-screen bg-[#050505] flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-4 pt-6">
          <div className="w-10" /> {/* Spacer for centering */}
          <TimerPill time={formatTime(elapsedTime)} />
          <button
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/5 transition-colors"
            aria-label="More options"
          >
            <MoreVertical className="w-5 h-5 text-zinc-400" />
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-start px-4 pt-2 pb-40">
          {/* Connection Status Badge */}
          <div className="flex items-center gap-2 mb-8">
            <div
              className={`w-2 h-2 rounded-full ${isPartnerConnected ? "bg-emerald-500" : "bg-amber-500"
                }`}
            />
            <Volume2 className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-zinc-400">
              {isLiveKit
                ? isPartnerConnected
                  ? "Connected via LiveKit"
                  : "Waiting for partner..."
                : "Connected (Demo)"}
            </span>
          </div>

          {/* Audio Visualizer */}
          <div className="mb-8">
            <AudioVisualizer isActive={!isMuted && isPartnerConnected} />
          </div>

          {/* Partner Info */}
          <div className="text-center mb-10">
            <h1 className="text-2xl font-semibold text-white mb-1">
              {partner.name}
            </h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-oratio-primary/10 to-oratio-secondary/10 border border-white/10">
              <span className="text-sm font-medium text-zinc-300">
                Band {partner.band}
              </span>
            </div>
          </div>

          {/* Loading Q&A mode indicator */}
          {matchId && userId && isInterviewer === null && (
            <div className="w-full max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
                <p className="text-sm text-zinc-400">
                  Loading Q&A mode...
                </p>
              </div>
            </div>
          )}

          {/* Session completed overlay */}
          {sessionCompleted && (
            <div className="w-full max-w-2xl mx-auto mb-4 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-sm text-center">
              <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-base font-semibold text-emerald-300 mb-1">
                Session completed!
              </p>
              <p className="text-sm text-zinc-400">
                All questions finished. Ending call in{" "}
                <span className="text-white font-mono">{countdown}s</span>
              </p>
            </div>
          )}

          {/* Swap request notification */}
          {matchId && userId && partnerRequestedSwap && (
            <SwapRequestBanner
              onAccept={() => handleRespondToSwap(true)}
              onDecline={() => handleRespondToSwap(false)}
              isLoading={isSwapLoading}
            />
          )}

          {/* Q&A Mode or Topic Card */}
          {matchId && userId && isInterviewer !== null ? (
            isInterviewer ? (
              <InterviewerControls
                currentQuestion={currentQuestion}
                onNextQuestion={handleNextQuestion}
                onRequestSwap={handleRequestSwap}
                onCancelSwap={handleCancelSwap}
                isLoading={isLoadingQuestion}
                currentPart={progress.part}
                questionInTurn={progress.questionInTurn}
                questionsPerTurn={progress.questionsPerTurn}
                turnInPart={progress.turnInPart}
                swapPending={iMySwapPending}
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
                swapPending={iMySwapPending}
              />
            )
          ) : (
            <TopicCard topic={currentTopic} onRefresh={handleRefreshTopic} />
          )}
        </main>

        {/* Control Bar */}
        <ControlBar
          isMuted={isMuted}
          onMuteToggle={handleMuteToggle}
          onEndCall={handleEndCall}
          onEvaluate={handleEvaluate}
          isConnecting={false}
        />
      </div>
    </>
  );
}

// Main In-Call Screen Component (Wrapper)
export default function InCallScreen({
  partner = { name: "Partner", band: "6.5" },
  onEndCall,
  onEvaluate,
  roomId,
  token,
  matchId,
  userId,
}: InCallScreenProps) {
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
  const [isConnecting, setIsConnecting] = useState(!!token);

  // Handle LiveKit connection errors
  const handleError = (error: Error) => {
    console.error("LiveKit error:", error);
    setIsConnecting(false);
  };

  // Handle successful connection
  const handleConnected = () => {
    console.log("Successfully connected to LiveKit room");
    setIsConnecting(false);
  };

  // If we have token and roomId, use real LiveKit
  if (token && roomId && livekitUrl) {
    return (
      <LiveKitRoom
        serverUrl={livekitUrl}
        token={token}
        connect={true}
        audio={true}
        video={false}
        onConnected={handleConnected}
        onError={handleError}
        onDisconnected={() => {
          console.log("Disconnected from LiveKit");
        }}
      >
        {isConnecting ? (
          <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <ConnectingState />
          </div>
        ) : (
          <InCallContent
            partner={partner}
            onEndCall={onEndCall}
            onEvaluate={onEvaluate}
            isLiveKit={true}
            matchId={matchId}
            userId={userId}
          />
        )}
      </LiveKitRoom>
    );
  }

  // Fallback to demo mode (no LiveKit)
  return (
    <InCallContent
      partner={partner}
      onEndCall={onEndCall}
      onEvaluate={onEvaluate}
      isLiveKit={false}
      matchId={matchId}
      userId={userId}
    />
  );
}
