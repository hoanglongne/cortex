"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { findMatch, cancelMatch } from "@/actions/matchmaking";
import type { FindMatchResult, Match, Profile } from "@/lib/types/database";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface UseMatchmakingOptions {
  bandMin?: number;
  bandMax?: number;
  onMatchFound?: (match: MatchDetails) => void;
  onError?: (error: string) => void;
}

interface MatchDetails {
  roomId: string;
  matchId: string;
  partner: {
    id: string;
    username: string;
    band: number;
    avatarUrl: string | null;
  };
}

interface UseMatchmakingReturn {
  status: "idle" | "searching" | "matched" | "error";
  matchDetails: MatchDetails | null;
  error: string | null;
  searchTime: number;
  startSearching: () => Promise<void>;
  cancelSearching: () => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook for matchmaking with realtime subscription
 *
 * Usage:
 * ```tsx
 * const { status, matchDetails, startSearching, cancelSearching } = useMatchmaking({
 *   bandMin: 5.5,
 *   bandMax: 7.5,
 *   onMatchFound: (match) => console.log('Found!', match),
 * });
 *
 * // Start searching
 * await startSearching();
 *
 * // Cancel if needed
 * await cancelSearching();
 * ```
 */
export function useMatchmaking(
  options: UseMatchmakingOptions = {}
): UseMatchmakingReturn {
  const { bandMin = 5.0, bandMax = 7.5, onMatchFound } = options;

  const [status, setStatus] = useState<
    "idle" | "searching" | "matched" | "error"
  >("idle");
  const [matchDetails, setMatchDetails] = useState<MatchDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTime, setSearchTime] = useState(0);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const userIdRef = useRef<string | null>(null);

  // Store callbacks in refs to avoid re-triggering effects when they change
  const onMatchFoundRef = useRef(onMatchFound);
  onMatchFoundRef.current = onMatchFound;

  /**
   * Start the search timer
   */
  const startSearchTimer = useCallback(() => {
    setSearchTime(0);
    timerRef.current = setInterval(() => {
      setSearchTime((prev) => prev + 1);
    }, 1000);
  }, []);

  /**
   * Stop the search timer
   */
  const stopSearchTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /**
   * Subscribe to realtime changes on the matches table
   * This allows us to detect when another user creates a match with us
   */
  const subscribeToMatches = useCallback(async () => {
    const supabase = getSupabaseClient();

    // Get current user ID
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Failed to get user for matchmaking subscription:", userError);
      return false;
    }

    userIdRef.current = user.id;

    // Unsubscribe from existing channel
    if (channelRef.current) {
      await supabase.removeChannel(channelRef.current);
    }

    // Handle match event
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMatchEvent = async (payload: any) => {
      console.log("Match found via realtime!", payload);
      const newMatch = payload.new as Match;

      // Determine partner ID
      // If we are user1, partner is user2. If we are user2, partner is user1.
      const partnerId = newMatch.user1_id === user.id ? newMatch.user2_id : newMatch.user1_id;

      // Fetch partner details
      const { data: partnerData } = await supabase
        .from("profiles")
        .select("id, username, current_band, avatar_url")
        .eq("id", partnerId)
        .single();

      const partner = partnerData as Pick<
        Profile,
        "id" | "username" | "current_band" | "avatar_url"
      > | null;

      const details: MatchDetails = {
        roomId: newMatch.room_id,
        matchId: newMatch.id,
        partner: partner
          ? {
            id: partner.id,
            username: partner.username,
            band: partner.current_band,
            avatarUrl: partner.avatar_url,
          }
          : {
            id: partnerId,
            username: "Partner",
            band: 6.0,
            avatarUrl: null,
          },
      };

      setMatchDetails(details);
      setStatus("matched");
      stopSearchTimer();
      onMatchFoundRef.current?.(details);
    };

    // Subscribe to INSERT events on matches table where we are a participant
    // We need to listen for both cases:
    // 1. We are user1 (we triggered the match)
    // 2. We are user2 (someone matched with us)
    channelRef.current = supabase
      .channel("matches-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "matches",
          filter: `user2_id=eq.${user.id}`,
        },
        handleMatchEvent
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "matches",
          filter: `user1_id=eq.${user.id}`,
        },
        handleMatchEvent
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Subscribed to matches realtime");
        } else if (status === "CHANNEL_ERROR") {
          console.error("Failed to subscribe to matches");
          setError("Failed to connect to matchmaking service");
          setStatus("error");
        }
      });

    return true;
  }, [stopSearchTimer]);

  /**
   * Unsubscribe from realtime channel
   */
  const unsubscribeFromMatches = useCallback(async () => {
    if (channelRef.current) {
      const supabase = getSupabaseClient();
      await supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  /**
   * Start searching for a match
   */
  const startSearching = useCallback(async () => {
    try {
      setStatus("searching");
      setError(null);
      setMatchDetails(null);
      startSearchTimer();

      // First, subscribe to realtime updates
      const subscribed = await subscribeToMatches();

      if (!subscribed) {
        throw new Error("Failed to subscribe to matchmaking service. Please check your connection or sign in again.");
      }

      // Clear any old queue entries first to prevent stale matches
      await cancelMatch().catch(err => {
        console.log("No existing queue entry to cancel:", err);
      });

      // Initial search
      const result: FindMatchResult = await findMatch(bandMin, bandMax);

      if (result.status === "error") {
        throw new Error(result.error || "Failed to start matchmaking");
      } else if (result.status === "matched" && result.partner) {
        setMatchDetails({
          roomId: result.roomId!,
          matchId: result.matchId!,
          partner: result.partner,
        });
        setStatus("matched");
        stopSearchTimer();
        onMatchFoundRef.current?.({
          roomId: result.roomId!,
          matchId: result.matchId!,
          partner: result.partner,
        });
      }
      // If waiting, we just stay in searching state
      // The polling effect will handle retries
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error("Error starting search:", err);
      setError(err.message || "Failed to start searching");
      setStatus("error");
      stopSearchTimer();
      unsubscribeFromMatches();
    }
  }, [
    bandMin,
    bandMax,
    startSearchTimer,
    stopSearchTimer,
    subscribeToMatches,
    unsubscribeFromMatches,
  ]);

  // Polling mechanism to retry matching if we are stuck in queue
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isCancelled = false;

    const poll = async () => {
      if (isCancelled || status !== "searching") return;

      try {
        console.log("Polling: Retrying matchmaking...");
        const result = await findMatch(bandMin, bandMax);
        console.log("Polling result:", result); // Log full result for debugging

        if (isCancelled) return;

        if (result.status === "matched" && result.partner) {
          console.log("Match found via polling!", result);
          setMatchDetails({
            roomId: result.roomId!,
            matchId: result.matchId!,
            partner: result.partner,
          });
          setStatus("matched");
          stopSearchTimer();
          onMatchFoundRef.current?.({
            roomId: result.roomId!,
            matchId: result.matchId!,
            partner: result.partner,
          });
          return; // Stop polling
        } else if (result.status === "error") {
          console.error("Polling error result:", result.error);
          // We don't stop searching, just log
        }
      } catch (err) {
        console.error("Polling error:", err);
        // Don't stop searching on poll error, just log it
      }

      // Schedule next poll if still searching
      if (!isCancelled && status === "searching") {
        timeoutId = setTimeout(poll, 2000);
      }
    };

    if (status === "searching") {
      // Start polling after 2 seconds
      timeoutId = setTimeout(poll, 2000);
    }

    return () => {
      isCancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [status, bandMin, bandMax, stopSearchTimer]);

  /**
   * Cancel the current search
   */
  const cancelSearching = useCallback(async () => {
    try {
      stopSearchTimer();
      await unsubscribeFromMatches();

      const result = await cancelMatch();

      if (!result.success) {
        console.error("Failed to cancel match:", result.error);
      }

      setStatus("idle");
      setMatchDetails(null);
      setError(null);
      setSearchTime(0);
    } catch (err) {
      console.error("Cancel searching error:", err);
      // Still reset the state even if the server call fails
      setStatus("idle");
      setMatchDetails(null);
      setSearchTime(0);
    }
  }, [stopSearchTimer, unsubscribeFromMatches]);

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    stopSearchTimer();
    unsubscribeFromMatches();
    setStatus("idle");
    setMatchDetails(null);
    setError(null);
    setSearchTime(0);
  }, [stopSearchTimer, unsubscribeFromMatches]);

  // Track status in a ref so the cleanup effect doesn't re-run when status changes
  const statusRef = useRef(status);
  statusRef.current = status;

  // Cleanup on unmount - IMPORTANT: Cancel match to remove from queue
  useEffect(() => {
    return () => {
      stopSearchTimer();
      unsubscribeFromMatches();
      // Auto-cancel to prevent stale queue entries
      if (statusRef.current === "searching") {
        cancelMatch().catch(err => {
          console.error("Failed to cleanup queue on unmount:", err);
        });
      }
    };
  }, [stopSearchTimer, unsubscribeFromMatches]);

  return {
    status,
    matchDetails,
    error,
    searchTime,
    startSearching,
    cancelSearching,
    reset,
  };
}

/**
 * Hook to get a LiveKit token for a room
 */
export function useLiveKitToken() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = useCallback(
    async (roomName: string, participantName: string) => {
      setIsLoading(true);
      setError(null);
      setToken(null);

      try {
        const response = await fetch("/api/livekit/get-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ roomName, participantName }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to get token");
        }

        const data = await response.json();
        setToken(data.token);
        return data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to get token";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    token,
    isLoading,
    error,
    getToken,
  };
}
