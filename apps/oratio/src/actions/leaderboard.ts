"use server";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database";

export interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatar_url: string | null;
  current_band: number;
  total_sessions: number;
  current_streak: number;
  score: number; // Composite score for ranking
  isCurrentUser?: boolean;
}

type TimeFrame = "weekly" | "monthly" | "allTime";

/**
 * Calculate a composite score for ranking users
 * Formula: (total_sessions * 10) + (current_band * 100) + (current_streak * 5)
 */
function calculateScore(profile: Profile): number {
  return (
    profile.total_sessions * 10 +
    profile.current_band * 100 +
    profile.current_streak * 5
  );
}

/**
 * Get leaderboard data for a specific timeframe
 * For MVP, we'll use all-time data for all timeframes
 * In future, can filter by created_at/last_practice_date
 */
export async function getLeaderboard(
  timeframe: TimeFrame = "weekly",
  limit: number = 50,
  currentUserId?: string
): Promise<{ data: LeaderboardEntry[]; error: string | null }> {
  try {
    const supabase = await createClient();

    // Fetch top users by total sessions and band score
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, current_band, total_sessions, current_streak")
      .order("total_sessions", { ascending: false })
      .order("current_band", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Leaderboard fetch error:", error);
      return { data: [], error: error.message };
    }

    if (!profiles || profiles.length === 0) {
      return { data: [], error: null };
    }

    // Calculate scores and sort
    type ProfileRow = {
      id: string;
      username: string;
      avatar_url: string | null;
      current_band: number;
      total_sessions: number;
      current_streak: number;
    };

    const scoredProfiles = (profiles as ProfileRow[]).map((profile) => {
      // Calculate score using only the fields we have
      const score = (
        profile.total_sessions * 10 +
        profile.current_band * 100 +
        profile.current_streak * 5
      );

      return {
        ...profile,
        score,
      };
    });

    // Sort by composite score
    scoredProfiles.sort((a, b) => b.score - a.score);

    // Convert to leaderboard entries with ranks
    const leaderboardData: LeaderboardEntry[] = scoredProfiles.map((profile, index) => ({
      id: profile.id,
      rank: index + 1,
      username: profile.username,
      avatar_url: profile.avatar_url,
      current_band: profile.current_band,
      total_sessions: profile.total_sessions,
      current_streak: profile.current_streak,
      score: profile.score,
      isCurrentUser: currentUserId ? profile.id === currentUserId : false,
    }));

    return { data: leaderboardData, error: null };
  } catch (err) {
    console.error("Leaderboard error:", err);
    return {
      data: [],
      error: err instanceof Error ? err.message : "Failed to fetch leaderboard"
    };
  }
}

/**
 * Get a specific user's rank and position in the leaderboard
 */
export async function getUserRank(
  userId: string,
  timeframe: TimeFrame = "weekly"
): Promise<{ rank: number | null; total: number; error: string | null }> {
  try {
    const { data: leaderboard, error } = await getLeaderboard(timeframe, 1000, userId);

    if (error) {
      return { rank: null, total: 0, error };
    }

    const userEntry = leaderboard.find((entry) => entry.id === userId);

    return {
      rank: userEntry?.rank || null,
      total: leaderboard.length,
      error: null,
    };
  } catch (err) {
    console.error("Get user rank error:", err);
    return {
      rank: null,
      total: 0,
      error: err instanceof Error ? err.message : "Failed to get user rank",
    };
  }
}
