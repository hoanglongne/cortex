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
const AchievementsScreen = lazy(() => import("./AchievementsScreen"));
const FriendsScreen = lazy(() => import("./FriendsScreen"));
const ProfileScreen = lazy(() => import("./ProfileScreen"));
const CallHistoryScreen = lazy(() => import("./CallHistoryScreen"));
import { useSupabaseAuth } from "@/hooks/useSupabase";
import { useMatchmaking, useLiveKitToken } from "@/hooks/useMatchmaking";
import { endCall as endCallAction, submitFeedback } from "@/actions/matchmaking";
import { getSupabaseClient } from "@/lib/supabase/client";

type Screen =
  | "auth"
  | "home"
  | "matchmaking"
  | "partner-found"
  | "in-call"
  | "rating"
  | "summary"
  | "leaderboard"
  | "achievements"
  | "friends"
  | "profile"
  | "history";

interface Partner {
  id: string;
  name: string;
  band: string;
  avatarUrl?: string | null;
}

interface MatchInfo {
  matchId: string;
  roomId: string;
}

interface SessionData {
  duration: number;
  topicsDiscussed: string[];
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

// Demo mode flag - set to true to skip auth during development
const DEMO_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL;

export default function AppFlow() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(DEMO_MODE ? "home" : "auth");
  const [partner, setPartner] = useState<Partner | null>(null);
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [callData, setCallData] = useState<CallData | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [bandRange, setBandRange] = useState({ min: 5.0, max: 7.5 });
  const [liveKitToken, setLiveKitToken] = useState<string | null>(null);

  // Auth hook
  const { user, profile, isLoading: authLoading, signIn, signUp, signOut } = useSupabaseAuth();

  // Auto-navigate from auth to home when user logs in
  useEffect(() => {
    if (user && currentScreen === "auth") {
      setCurrentScreen("home");
    } else if (!user && currentScreen !== "auth" && !DEMO_MODE) {
      // User logged out, go back to auth (except in demo mode)
      setCurrentScreen("auth");
    }
  }, [user, currentScreen]);

  // Prefetch critical screens when user is on home screen
  useEffect(() => {
    if (currentScreen === "home") {
      // Prefetch MatchmakingScreen since it's the most likely next screen
      import("./MatchmakingScreen");
    }
  }, [currentScreen]);

  // LiveKit token hook
  const { getToken } = useLiveKitToken();

  // Matchmaking hook with callbacks
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
    onMatchFound: async (match) => {
      // Set partner and match info
      setPartner({
        id: match.partner.id,
        name: match.partner.username,
        band: match.partner.band.toFixed(1),
        avatarUrl: match.partner.avatarUrl,
      });
      setMatchInfo({
        matchId: match.matchId,
        roomId: match.roomId,
      });

      // Navigate to partner found screen
      setCurrentScreen("partner-found");
    },
    onError: (error) => {
      console.error("Matchmaking error:", error);
      // Could show a toast notification here
    },
  });

  // Monitor match status changes (detect when partner declines)
  useEffect(() => {
    if (DEMO_MODE || !matchInfo || currentScreen !== "partner-found") return;

    const supabase = getSupabaseClient();

    console.log(`[Match Monitor] Subscribing to match ${matchInfo.matchId} status changes`);

    const channel = supabase
      .channel(`match-status-${matchInfo.matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchInfo.matchId}`,
        },
        (payload) => {
          console.log('[Match Monitor] Match updated:', payload);
          const updatedMatch = payload.new as { status: string };

          // If partner declined (status changed to cancelled/finished)
          if (updatedMatch.status === 'cancelled' || updatedMatch.status === 'finished') {
            console.log('[Match Monitor] Match was cancelled/finished by partner. Going back to home.');
            // Reset state and go back to home
            setPartner(null);
            setMatchInfo(null);
            setLiveKitToken(null);
            resetMatchmaking();
            setCurrentScreen('home');
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Match Monitor] Subscribed to match status changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Match Monitor] Failed to subscribe');
        }
      });

    return () => {
      console.log('[Match Monitor] Unsubscribing from match status');
      supabase.removeChannel(channel);
    };
  }, [matchInfo, currentScreen, resetMatchmaking]);

  // Handle auth state changes (Render-time update pattern)
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (!DEMO_MODE && !authLoading) {
    if (user && currentScreen === "auth") {
      console.log("Switching to home");
      setCurrentScreen("home");
    } else if (!user && currentScreen !== "auth") {
      console.log("Switching to auth");
      setCurrentScreen("auth");
    }
  }

  // Auth handlers
  const handleSignIn = useCallback(async (email: string, password: string) => {
    return await signIn(email, password);
  }, [signIn]);

  const handleSignUp = useCallback(async (email: string, password: string, username: string) => {
    return await signUp(email, password, username);
  }, [signUp]);

  // Navigation handlers
  const handleStartMatching = useCallback(async () => {
    setCurrentScreen("matchmaking");

    if (DEMO_MODE) {
      // Demo mode - simulate finding a partner after 3 seconds
      setTimeout(() => {
        setPartner({
          id: "demo-user-123",
          name: "Alex",
          band: "6.5",
          avatarUrl: null,
        });
        setMatchInfo({
          matchId: "demo-match-123",
          roomId: "demo-room-123",
        });
        setCurrentScreen("partner-found");
      }, 3000);
    } else {
      // Real mode - use the matchmaking hook
      await startSearching();
    }
  }, [startSearching]);

  const handleCancelMatching = useCallback(async () => {
    if (!DEMO_MODE) {
      await cancelSearching();
    }
    setCurrentScreen("home");
  }, [cancelSearching]);

  const handleDeclineMatch = useCallback(async () => {
    // Cancel the match and go back to home
    if (!DEMO_MODE && matchInfo) {
      try {
        // Cancel the match by updating its status to finished
        await endCallAction(matchInfo.matchId);
      } catch (error) {
        console.error("Failed to decline match:", error);
      }
    }
    // Reset state and go back home
    setPartner(null);
    setMatchInfo(null);
    setLiveKitToken(null);
    resetMatchmaking();
    setCurrentScreen("home");
  }, [matchInfo, resetMatchmaking]);

  const handleStartCall = useCallback(async () => {
    if (!DEMO_MODE && matchInfo) {
      try {
        // Get LiveKit token
        const tokenData = await getToken(
          matchInfo.roomId,
          profile?.username || user?.email?.split("@")[0] || "User"
        );
        setLiveKitToken(tokenData.token);
      } catch (error) {
        console.error("Failed to get LiveKit token:", error);

        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('cancelled') || errorMessage.includes('finished')) {
          console.log('[Start Call] Match was cancelled by partner. Returning to home.');
          setPartner(null);
          setMatchInfo(null);
          setLiveKitToken(null);
          resetMatchmaking();
          setCurrentScreen('home');
          return;
        }

        // For other errors, continue anyway (InCallScreen will handle)
      }
    }
    setCurrentScreen("in-call");
  }, [matchInfo, getToken, profile, user, resetMatchmaking]);

  const handleEndCall = useCallback(
    async (data: CallData) => {
      setCallData(data);

      // End the call on the server
      if (!DEMO_MODE && matchInfo) {
        await endCallAction(matchInfo.matchId);
      }

      // Set initial session data (scores will be filled after rating)
      setSessionData({
        duration: data.duration,
        topicsDiscussed: data.topicsDiscussed,
        partnerName: partner?.name || "Partner",
        partnerBand: partner?.band || "6.5",
        myScores: null,
        myOverallBand: null,
        myTags: [],
        myComments: "",
      });

      setCurrentScreen("rating");
    },
    [partner, matchInfo]
  );

  const handleEvaluate = useCallback(
    (data: CallData) => {
      handleEndCall(data);
    },
    [handleEndCall]
  );

  const handleRatingSubmit = useCallback(
    async (data: {
      scores: { fluency: number; vocabulary: number; grammar: number; pronunciation: number };
      overallBand: number;
      wouldMatchAgain: boolean | null;
      tags: string[];
      comments: string;
    }) => {
      // Update sessionData with the peer scores
      setSessionData((prev) =>
        prev
          ? {
            ...prev,
            myScores: data.scores,
            myOverallBand: data.overallBand,
            myTags: data.tags,
            myComments: data.comments,
          }
          : prev
      );

      // Submit feedback to server
      if (!DEMO_MODE && matchInfo && partner) {
        console.log("Submitting feedback:", {
          matchId: matchInfo.matchId,
          partnerId: partner.id,
          overallBand: data.overallBand,
        });
        const scores = {
          ...data.scores,
          overall: data.overallBand,
        };
        const result = await submitFeedback(
          matchInfo.matchId,
          partner.id,
          Math.round(data.overallBand),
          data.wouldMatchAgain,
          data.tags,
          data.comments || null,
          scores
        );
        if (!result.success) {
          console.error("Failed to submit feedback:", result.error);
        } else {
          console.log("Feedback submitted successfully");
        }
      } else {
        console.warn("Skipping feedback submission:", {
          DEMO_MODE,
          hasMatchInfo: !!matchInfo,
          hasPartner: !!partner,
        });
      }
      setCurrentScreen("summary");
    },
    [matchInfo, partner]
  );

  const handleRatingSkip = useCallback(() => {
    setCurrentScreen("summary");
  }, []);

  const handleGoHome = useCallback(() => {
    // Reset all state
    setPartner(null);
    setMatchInfo(null);
    setCallData(null);
    setSessionData(null);
    setLiveKitToken(null);
    resetMatchmaking();
    setCurrentScreen("home");
  }, [resetMatchmaking]);

  const handlePracticeAgain = useCallback(() => {
    // Reset call data but keep going
    setPartner(null);
    setMatchInfo(null);
    setCallData(null);
    setSessionData(null);
    setLiveKitToken(null);
    resetMatchmaking();
    setCurrentScreen("matchmaking");

    if (DEMO_MODE) {
      // Demo mode - simulate finding a partner
      setTimeout(() => {
        setPartner({
          id: "demo-user-456",
          name: "Jordan",
          band: "7.0",
          avatarUrl: null,
        });
        setMatchInfo({
          matchId: "demo-match-456",
          roomId: "demo-room-456",
        });
        setCurrentScreen("partner-found");
      }, 3000);
    } else {
      startSearching();
    }
  }, [resetMatchmaking, startSearching]);

  const handleNavigate = useCallback(
    (screen: "leaderboard" | "achievements" | "friends" | "profile" | "history") => {
      setCurrentScreen(screen);
    },
    []
  );

  const handleBackToHome = useCallback(() => {
    setCurrentScreen("home");
  }, []);

  const handleProfileNavigate = useCallback((screen: "history" | "settings") => {
    if (screen === "history") {
      setCurrentScreen("history");
    }
  }, []);

  const handleBackToProfile = useCallback(() => {
    setCurrentScreen("profile");
  }, []);

  const handleBandRangeChange = useCallback((range: string) => {
    const ranges: Record<string, { min: number; max: number }> = {
      "5.0-5.5": { min: 5.0, max: 5.5 },
      "5.5-6.5": { min: 5.5, max: 6.5 },
      "6.5-7.5": { min: 6.5, max: 7.5 },
      "7.5+": { min: 7.5, max: 9.0 },
    };
    setBandRange(ranges[range] || { min: 5.5, max: 6.5 });
  }, []);

  // Render current screen
  switch (currentScreen) {
    case "auth":
      return (
        <AuthScreen
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          isLoading={authLoading}
        />
      );

    case "home":
      return (
        <HomeScreen
          profile={profile}
          onStartMatching={handleStartMatching}
          onNavigate={handleNavigate}
          onBandRangeChange={handleBandRangeChange}
        />
      );

    case "matchmaking":
      return (
        <Suspense fallback={
          <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <LoadingSpinner size="md" message="Loading matchmaking..." />
          </div>
        }>
          <MatchmakingScreen
            bandRange={`${bandRange.min}-${bandRange.max}`}
            onCancel={handleCancelMatching}
            onPartnerFound={(p) => {
              // This is called by the demo mode simulation
              console.log("Demo match found:", p);
              setPartner({
                id: "demo-partner-id",
                name: p.name,
                band: p.band,
                avatarUrl: p.avatarUrl,
              });
              setMatchInfo({
                matchId: "demo-match-id",
                roomId: "demo-room-id",
              });
              setCurrentScreen("partner-found");
            }}
            // Pass real matchmaking state
            status={DEMO_MODE ? "searching" : (matchmakingStatus === "idle" ? "searching" : matchmakingStatus)}
            searchTime={DEMO_MODE ? undefined : searchTime}
            error={matchmakingError}
            userId={user?.id}
          />
        </Suspense>
      );

    case "partner-found":
      return partner ? (
        <Suspense fallback={
          <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <LoadingSpinner size="md" message="Loading..." />
          </div>
        }>
          <PartnerFoundScreen
            partner={{ name: partner.name, band: partner.band }}
            onStartCall={handleStartCall}
            onDecline={handleDeclineMatch}
          />
        </Suspense>
      ) : null;

    case "in-call":
      console.log("[AppFlow DEBUG] Rendering InCallScreen with:", {
        matchId: matchInfo?.matchId,
        userId: user?.id,
        hasUser: !!user,
        hasMatchInfo: !!matchInfo,
      });
      return (
        <Suspense fallback={
          <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <LoadingSpinner size="md" message="Connecting to call..." />
          </div>
        }>
          <InCallScreen
            partner={partner ? { name: partner.name, band: partner.band } : undefined}
            onEndCall={handleEndCall}
            onEvaluate={handleEvaluate}
            roomId={matchInfo?.roomId}
            token={liveKitToken}
            matchId={matchInfo?.matchId}
            userId={user?.id}
          />
        </Suspense>
      );

    case "rating":
      return partner && callData ? (
        <Suspense fallback={
          <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <LoadingSpinner size="md" message="Loading..." />
          </div>
        }>
          <RatingScreen
            partner={{ name: partner.name, band: partner.band }}
            callDuration={callData.duration}
            onSubmit={handleRatingSubmit}
            onSkip={handleRatingSkip}
          />
        </Suspense>
      ) : null;

    case "summary":
      return sessionData ? (
        <Suspense fallback={
          <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <LoadingSpinner size="md" message="Loading..." />
          </div>
        }>
          <CallSummaryScreen
            sessionData={sessionData}
            onGoHome={handleGoHome}
            onPracticeAgain={handlePracticeAgain}
          />
        </Suspense>
      ) : null;

    case "leaderboard":
      return (
        <Suspense fallback={
          <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <LoadingSpinner size="md" message="Loading leaderboard..." />
          </div>
        }>
          <LeaderboardScreen onBack={handleBackToHome} />
        </Suspense>
      );

    case "achievements":
      return (
        <Suspense fallback={
          <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <LoadingSpinner size="md" message="Loading achievements..." />
          </div>
        }>
          <AchievementsScreen onBack={handleBackToHome} />
        </Suspense>
      );

    case "friends":
      return (
        <Suspense fallback={
          <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <LoadingSpinner size="md" message="Loading friends..." />
          </div>
        }>
          <FriendsScreen onBack={handleBackToHome} />
        </Suspense>
      );

    case "profile":
      return (
        <Suspense fallback={
          <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <LoadingSpinner size="md" message="Loading profile..." />
          </div>
        }>
          <ProfileScreen
            profile={profile}
            user={user}
            onBack={handleBackToHome}
            onNavigate={handleProfileNavigate}
            onSignOut={signOut}
          />
        </Suspense>
      );

    case "history":
      return (
        <Suspense fallback={
          <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <LoadingSpinner size="md" message="Loading history..." />
          </div>
        }>
          <CallHistoryScreen onBack={handleBackToProfile} />
        </Suspense>
      );

    default:
      return (
        <HomeScreen
          profile={profile}
          onStartMatching={handleStartMatching}
          onNavigate={handleNavigate}
        />
      );
  }
}
