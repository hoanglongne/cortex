"use server";

import { createClient } from "@/lib/supabase/server";

export interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatar_url: string | null;
  current_band: number;
  current_streak: number;
  /** Calls of at least a minute in the timeframe */
  sessions: number;
  /** Minutes spoken in the timeframe; this is what ranks people */
  minutes: number;
  isCurrentUser: boolean;
}

export type TimeFrame = "weekly" | "monthly" | "allTime";

const DAY_MS = 24 * 60 * 60 * 1000;

function since(timeframe: TimeFrame): string {
  if (timeframe === "weekly") return new Date(Date.now() - 7 * DAY_MS).toISOString();
  if (timeframe === "monthly") return new Date(Date.now() - 30 * DAY_MS).toISOString();
  return "1970-01-01T00:00:00Z";
}

/**
 * Ranks people by minutes practised in the timeframe (the peer-given band
 * is shown but doesn't rank: it is noisy and easy to argue about).
 */
export async function getLeaderboard(
  timeframe: TimeFrame = "weekly",
  limit: number = 50
): Promise<{ data: LeaderboardEntry[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: [], error: "Not authenticated" };

    const tf: TimeFrame = timeframe === "monthly" || timeframe === "allTime" ? timeframe : "weekly";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc("leaderboard", {
      since: since(tf),
      lim: Math.min(Math.max(1, limit), 200),
    });
    if (error) {
      console.error("[getLeaderboard]", error);
      return { data: [], error: "Không tải được bảng xếp hạng." };
    }

    type Row = {
      id: string;
      username: string;
      avatar_url: string | null;
      current_band: number | string;
      current_streak: number | null;
      sessions: number | string;
      minutes: number | string;
    };
    const entries = ((data ?? []) as Row[]).map((r, i) => ({
      id: r.id,
      rank: i + 1,
      username: r.username,
      avatar_url: r.avatar_url,
      current_band: Number(r.current_band),
      current_streak: r.current_streak ?? 0,
      sessions: Number(r.sessions),
      minutes: Number(r.minutes),
      isCurrentUser: r.id === user.id,
    }));
    return { data: entries, error: null };
  } catch (err) {
    console.error("[getLeaderboard]", err);
    return { data: [], error: "Không tải được bảng xếp hạng." };
  }
}
