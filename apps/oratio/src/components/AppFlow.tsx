"use client";

import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import HomeScreen from "./HomeScreen";
import AuthScreen from "./AuthScreen";
import LoadingSpinner from "./LoadingSpinner";
import type { CallData } from "./InCallScreen";

// Lazy load all secondary screens
const MatchmakingScreen = lazy(() => import("./MatchmakingScreen"));
const PartnerFoundScreen = lazy(() => import("./PartnerFoundScreen"));
const InCallScreen = lazy(() => import("./InCallScreen"));
const RatingScreen = lazy(() => import("./RatingScreen"));
const CallSummaryScreen = lazy(() => import("./CallSummaryScreen"));
const LeaderboardScreen = lazy(() => import("./LeaderboardScreen"));
const ProgressScreen = lazy(() => import("./ProgressScreen"));
const MeScreen = lazy(() => import("./MeScreen"));
const PartnersScreen = lazy(() => import("./PartnersScreen"));
const CallHistoryScreen = lazy(() => import("./CallHistoryScreen"));
const SoloPracticeScreen = lazy(() => import("./SoloPracticeScreen"));
const ReviewScreen = lazy(() => import("./ReviewScreen"));
const ClassScreen = lazy(() => import("./ClassScreen"));
const OnboardingScreen = lazy(() => import("./OnboardingScreen"));
import { useSupabaseAuth } from "@/hooks/useSupabase";
import { useMatchmaking, useLiveKitToken } from "@/hooks/useMatchmaking";
import { declineMatch, endCall as endCallAction, submitFeedback } from "@/actions/matchmaking";
import { overallBand } from "@/lib/feedback";
import { getSupabaseClient } from "@/lib/supabase/client";
import { pendingCode, reportToClasses } from "@/lib/classroom";
import type { Tab } from "./ui/shell";

type Screen =
  | "auth"
  | "home"
  | "matchmaking"
  | "partner-found"
  | "in-call"
  | "rating"
  | "summary"
  | "leaderboard"
  | "progress"
  | "partners"
  | "me"
  | "history"
  | "solo"
  | "review"
  | "class"
  | "onboarding";

/** Tabs map to screens; "practice" is Home. */
const TAB_SCREEN: Record<Tab, Screen> = { practice: "home", review: "review", history: "history", progress: "progress", me: "me" };

interface Partner {
  id: string;
  name: string;
  band: string;
  avatarUrl?: string | null;
  country?: string | null;
}

interface MatchInfo {
  matchId: string;
  roomId: string;
}

interface SessionData {
  duration: number;
  questions: { part: number; text: string }[];
  partnerName: string;
  partnerBand: string;
  myScores: {
    fluency: number;
    vocabulary: number;
    grammar: number;
    pronunciation: number;
  } | null;
  myOverallBand: number | null;
  myTags: string[];
  myComments: string;
}

type RatingData = {
  scores: { fluency: number; vocabulary: number; grammar: number; pronunciation: number };
  wouldMatchAgain: boolean | null;
  tags: string[];
  comments: string;
};

// Demo mode skips auth and matchmaking. Opt-in only (NEXT_PUBLIC_DEMO_MODE=true)
// and never in production, so a missing Supabase env var can't bypass auth.
const DEMO_MODE =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" &&
  process.env.NODE_ENV !== "production";

const ANY_BAND = { min: 1, max: 9 };

function bandLabel(range: { min: number; max: number }) {
  if (range.min <= 1 && range.max >= 9) return "Bất kỳ";
  if (range.max >= 9) return `${range.min.toFixed(1)}+`;
  return `${range.min.toFixed(1)}–${range.max.toFixed(1)}`;
}

const ONBOARDED_KEY = "oratio-onboarded";

/** First sign-in on this device goes through Ơ's short onboarding. */
function isOnboarded() {
  try {
    return localStorage.getItem(ONBOARDED_KEY) === "1";
  } catch {
    return true;
  }
}

const fallback = (message: string) => (
  <div className="min-h-dvh bg-bg flex items-center justify-center">
    <LoadingSpinner size="md" message={message} />
  </div>
);

export default function AppFlow() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(DEMO_MODE ? "home" : "auth");
  const [partner, setPartner] = useState<Partner | null>(null);
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [callData, setCallData] = useState<CallData | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [bandRange, setBandRange] = useState(ANY_BAND);
  const [liveKitToken, setLiveKitToken] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  /** One-line message shown on Home (why we came back there) */
  const [notice, setNotice] = useState<string | null>(null);
  /** Where "Bảng giờ nói" was opened from, to go back there */
  const [leaderboardFrom, setLeaderboardFrom] = useState<Screen>("progress");

  const { user, profile, isLoading: authLoading, signIn, signUp, signOut, refreshProfile } = useSupabaseAuth();

  // Keep classes up to date: quietly when the app opens, always after a call
  const userId = user?.id;
  useEffect(() => {
    if (userId && !DEMO_MODE) void reportToClasses();
  }, [userId]);

  // Follow the auth state: signed in → home, signed out → auth (adjusted during render)
  if (!DEMO_MODE && !authLoading) {
    // A class link waiting for sign-in opens "Lớp học"; first sign-in here meets Ơ
    if (user && currentScreen === "auth") setCurrentScreen(pendingCode() ? "class" : isOnboarded() ? "home" : "onboarding");
    else if (!user && currentScreen !== "auth") setCurrentScreen("auth");
  }

  // Prefetch the most likely next screen
  useEffect(() => {
    if (currentScreen === "home") import("./MatchmakingScreen");
  }, [currentScreen]);

  const { getToken } = useLiveKitToken();

  const {
    status: matchmakingStatus,
    error: matchmakingError,
    searchTime,
    startSearching,
    cancelSearching,
    reset: resetMatchmaking,
  } = useMatchmaking({
    bandMin: bandRange.min,
    bandMax: bandRange.max,
    onMatchFound: (match) => {
      setPartner({
        id: match.partner.id,
        name: match.partner.username,
        band: match.partner.band.toFixed(1),
        avatarUrl: match.partner.avatarUrl,
        country: match.partner.country ?? null,
      });
      setMatchInfo({ matchId: match.matchId, roomId: match.roomId });
      setJoinError(null);
      setCurrentScreen("partner-found");
    },
  });

  /** Clears the current match and returns Home, optionally with a message. */
  const backHome = useCallback(
    (message: string | null = null) => {
      setPartner(null);
      setMatchInfo(null);
      setCallData(null);
      setSessionData(null);
      setLiveKitToken(null);
      setIsStarting(false);
      setJoinError(null);
      resetMatchmaking();
      setNotice(message);
      setCurrentScreen("home");
      refreshProfile();
    },
    [resetMatchmaking, refreshProfile]
  );

  // On the partner-found screen, notice when the partner declines
  useEffect(() => {
    if (DEMO_MODE || !matchInfo || currentScreen !== "partner-found") return;

    const supabase = getSupabaseClient();
    const channel = supabase
      .channel(`match-status-${matchInfo.matchId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "matches", filter: `id=eq.${matchInfo.matchId}` },
        (payload) => {
          const updated = payload.new as { status: string };
          if (updated.status === "cancelled" || updated.status === "finished") {
            backHome("Bạn kia đã chọn tìm người khác. Thử ghép lại nhé.");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchInfo, currentScreen, backHome]);

  const simulateDemoMatch = useCallback(() => {
    setTimeout(() => {
      setPartner({ id: "demo-user", name: "Alex", band: "6.5", avatarUrl: null });
      setMatchInfo({ matchId: "demo-match", roomId: "demo-room" });
      setCurrentScreen("partner-found");
    }, 3000);
  }, []);

  const handleStartMatching = useCallback(async () => {
    setNotice(null);
    setCurrentScreen("matchmaking");
    if (DEMO_MODE) simulateDemoMatch();
    else await startSearching();
  }, [startSearching, simulateDemoMatch]);

  const handleCancelMatching = useCallback(async () => {
    if (!DEMO_MODE) await cancelSearching();
    setCurrentScreen("home");
  }, [cancelSearching]);

  const handleSoloFromMatchmaking = useCallback(async () => {
    if (!DEMO_MODE) await cancelSearching();
    setCurrentScreen("solo");
  }, [cancelSearching]);

  // "Find another partner": drop this match and search again
  const handleDeclineMatch = useCallback(async () => {
    if (!DEMO_MODE && matchInfo) {
      await declineMatch(matchInfo.matchId).catch((error) => console.error("Failed to decline match:", error));
    }
    setPartner(null);
    setMatchInfo(null);
    setLiveKitToken(null);
    resetMatchmaking();
    handleStartMatching();
  }, [matchInfo, resetMatchmaking, handleStartMatching]);

  /** Fetches a call token; returns false (and says why) when it fails. */
  const joinRoom = useCallback(async (): Promise<boolean> => {
    if (DEMO_MODE || !matchInfo) return true;
    try {
      const tokenData = await getToken(matchInfo.roomId);
      setLiveKitToken(tokenData.token);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("cancelled") || message.includes("finished")) {
        backHome("Bạn kia đã rời trước khi cuộc gọi bắt đầu.");
      } else {
        setJoinError("Không vào được phòng gọi. Kiểm tra mạng rồi bấm Sẵn sàng lần nữa.");
      }
      return false;
    }
  }, [matchInfo, getToken, backHome]);

  const handleStartCall = useCallback(async () => {
    setIsStarting(true);
    setJoinError(null);
    const ok = await joinRoom();
    setIsStarting(false);
    if (ok) setCurrentScreen("in-call");
  }, [joinRoom]);

  const handleRetryJoin = useCallback(async () => {
    setLiveKitToken(null);
    await joinRoom();
  }, [joinRoom]);

  const handleEndCall = useCallback(
    async (data: CallData) => {
      setCallData(data);

      if (!DEMO_MODE && matchInfo) {
        const result = await endCallAction(matchInfo.matchId).catch(() => null);
        if (result?.status === "cancelled") {
          backHome("Cuộc gọi chưa bắt đầu (bạn kia chưa vào phòng) nên không được tính.");
          return;
        }
      }

      setSessionData({
        duration: data.duration,
        questions: data.questions,
        partnerName: partner?.name || "Partner",
        partnerBand: partner?.band || "–",
        myScores: null,
        myOverallBand: null,
        myTags: [],
        myComments: "",
      });
      setLiveKitToken(null);
      setCurrentScreen("rating");
      if (!DEMO_MODE) void reportToClasses(true);
    },
    [partner, matchInfo, backHome]
  );

  const handleMatchCancelled = useCallback(async () => {
    if (!DEMO_MODE && matchInfo) {
      await declineMatch(matchInfo.matchId).catch(() => null);
    }
    backHome("Cuộc gọi đã kết thúc trước khi bắt đầu.");
  }, [matchInfo, backHome]);

  const handleRatingSubmit = useCallback(
    async (data: RatingData): Promise<{ error?: string }> => {
      if (!DEMO_MODE && matchInfo) {
        const result = await submitFeedback(matchInfo.matchId, {
          scores: data.scores,
          wouldMatchAgain: data.wouldMatchAgain,
          tags: data.tags,
          comments: data.comments || null,
        });
        if (!result.success) return { error: result.error || "Không gửi được đánh giá, thử lại nhé." };
      }

      setSessionData((prev) =>
        prev
          ? {
            ...prev,
            myScores: data.scores,
            myOverallBand: overallBand(data.scores),
            myTags: data.tags,
            myComments: data.comments,
          }
          : prev
      );
      setCurrentScreen("summary");
      return {};
    },
    [matchInfo]
  );

  const handleRatingSkip = useCallback(() => {
    setCurrentScreen("summary");
  }, []);

  const handleGoHome = useCallback(() => backHome(), [backHome]);

  const handlePracticeAgain = useCallback(() => {
    backHome();
    handleStartMatching();
  }, [backHome, handleStartMatching]);

  const handleTab = useCallback((tab: Tab) => {
    setNotice(null);
    setCurrentScreen(TAB_SCREEN[tab]);
  }, []);

  const handleBackToHome = useCallback(() => {
    setCurrentScreen("home");
  }, []);

  switch (currentScreen) {
    case "auth":
      return <AuthScreen onSignIn={signIn} onSignUp={signUp} isLoading={authLoading} />;

    case "matchmaking":
      return (
        <Suspense fallback={fallback("Đang tải…")}>
          <MatchmakingScreen
            bandLabel={bandLabel(bandRange)}
            onCancel={handleCancelMatching}
            onRetry={handleStartMatching}
            onPracticeSolo={handleSoloFromMatchmaking}
            status={matchmakingStatus === "error" ? "error" : matchmakingStatus === "matched" ? "matched" : "searching"}
            searchTime={searchTime}
            error={matchmakingError}
          />
        </Suspense>
      );

    case "partner-found":
      return partner ? (
        <Suspense fallback={fallback("Đang tải…")}>
          <PartnerFoundScreen
            partner={{ name: partner.name, band: partner.band, country: partner.country }}
            onStartCall={handleStartCall}
            onDecline={handleDeclineMatch}
            isStarting={isStarting}
            error={joinError}
          />
        </Suspense>
      ) : null;

    case "in-call":
      return (
        <Suspense fallback={fallback("Đang vào phòng…")}>
          <InCallScreen
            partner={partner ? { name: partner.name, band: partner.band } : undefined}
            onEndCall={handleEndCall}
            onMatchCancelled={handleMatchCancelled}
            onRetryJoin={handleRetryJoin}
            roomId={matchInfo?.roomId}
            token={liveKitToken}
            matchId={DEMO_MODE ? undefined : matchInfo?.matchId}
            userId={user?.id}
            demo={DEMO_MODE}
          />
        </Suspense>
      );

    case "rating":
      return partner && callData ? (
        <Suspense fallback={fallback("Đang tải…")}>
          <RatingScreen
            partner={{ name: partner.name, band: partner.band }}
            callDuration={callData.duration}
            notes={callData.notes}
            onSubmit={handleRatingSubmit}
            onSkip={handleRatingSkip}
          />
        </Suspense>
      ) : null;

    case "summary":
      return sessionData ? (
        <Suspense fallback={fallback("Đang tải…")}>
          <CallSummaryScreen
            sessionData={sessionData}
            onGoHome={handleGoHome}
            onPracticeAgain={handlePracticeAgain}
          />
        </Suspense>
      ) : null;

    case "solo":
      return (
        <Suspense fallback={fallback("Đang tải câu hỏi…")}>
          <SoloPracticeScreen onBack={handleBackToHome} onFindPartner={handleStartMatching} />
        </Suspense>
      );

    case "leaderboard":
      return (
        <Suspense fallback={fallback("Đang tải bảng xếp hạng…")}>
          <LeaderboardScreen onBack={() => setCurrentScreen(leaderboardFrom)} />
        </Suspense>
      );

    case "progress":
      return (
        <Suspense fallback={fallback("Đang tải…")}>
          <ProgressScreen profile={profile} onTab={handleTab} onOpenLeaderboard={() => {
              setLeaderboardFrom("progress");
              setCurrentScreen("leaderboard");
            }}
          />
        </Suspense>
      );

    case "partners":
      return (
        <Suspense fallback={fallback("Đang tải…")}>
          <PartnersScreen onBack={() => setCurrentScreen("me")} />
        </Suspense>
      );

    case "me":
      return (
        <Suspense fallback={fallback("Đang tải…")}>
          <MeScreen
            profile={profile}
            user={user}
            onTab={handleTab}
            onSignOut={signOut}
            onProfileUpdated={refreshProfile}
            onOpenPartners={() => setCurrentScreen("partners")}
            onOpenClasses={() => setCurrentScreen("class")}
            onOpenLeaderboard={() => {
              setLeaderboardFrom("me");
              setCurrentScreen("leaderboard");
            }}
          />
        </Suspense>
      );

    case "onboarding":
      return (
        <Suspense fallback={fallback("Đang tải…")}>
          <OnboardingScreen
            profile={profile}
            onProfileUpdated={refreshProfile}
            onDone={(start) => {
              try {
                localStorage.setItem(ONBOARDED_KEY, "1");
              } catch {}
              if (start === "exam") handleStartMatching();
              else setCurrentScreen("solo");
            }}
          />
        </Suspense>
      );

    case "review":
      return (
        <Suspense fallback={fallback("Đang tải…")}>
          <ReviewScreen profile={profile} onTab={handleTab} />
        </Suspense>
      );

    case "history":
      return (
        <Suspense fallback={fallback("Đang tải lịch sử…")}>
          <CallHistoryScreen onTab={handleTab} />
        </Suspense>
      );

    case "class":
      return (
        <Suspense fallback={fallback("Đang tải lớp học…")}>
          <ClassScreen defaultName={profile?.username ?? ""} onBack={() => setCurrentScreen("home")} />
        </Suspense>
      );

    case "home":
    default:
      return (
        <HomeScreen
          profile={profile}
          onStartMatching={handleStartMatching}
          onStartSolo={() => setCurrentScreen("solo")}
          onOpenClasses={() => setCurrentScreen("class")}
          onTab={handleTab}
          bandRange={bandRange}
          onBandRangeChange={setBandRange}
          notice={notice}
          onDismissNotice={() => setNotice(null)}
        />
      );
  }
}
