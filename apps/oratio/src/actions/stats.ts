"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { QUEUE_STALE_AFTER_MS } from "@/lib/matchmaking/rules";
import { CRITERIA, type Criterion } from "@/lib/feedback";

/** People in the matchmaking queue right now (polled in the last 15s). */
export async function getOnlineLearnersCount(): Promise<{ count: number; error?: string }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;
    const since = new Date(Date.now() - QUEUE_STALE_AFTER_MS).toISOString();
    const { count, error } = await admin
      .from("match_queue")
      .select("id", { count: "exact", head: true })
      .eq("status", "waiting")
      .gte("last_seen_at", since);

    if (error) {
      console.error("[getOnlineLearnersCount]", error);
      return { count: 0, error: "Failed to fetch online count" };
    }
    return { count: count || 0 };
  } catch (error) {
    console.error("[getOnlineLearnersCount]", error);
    return { count: 0, error: "An unexpected error occurred" };
  }
}

export interface FeedbackSummary {
  /** Ratings received (the averages use the latest 20). */
  count: number;
  averages: Record<Criterion, number> | null;
  overall: number | null;
  /** Tags partners gave most often, most common first. */
  topTags: string[];
}

/** Averages of the scores partners gave the signed-in user. */
export async function getMyFeedbackSummary(): Promise<{ summary: FeedbackSummary | null; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { summary: null, error: "Not authenticated" };

    // RLS lets users read feedback they received
    const { data, error } = await supabase
      .from("session_feedback")
      .select("scores, feedback_tags")
      .eq("to_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) return { summary: null, error: error.message };

    const rows = (data ?? []) as { scores: Record<string, number> | null; feedback_tags: string[] | null }[];
    const scored = rows.filter((r) => r.scores && CRITERIA.every((c) => typeof r.scores![c] === "number"));

    const averages = scored.length
      ? (Object.fromEntries(
          CRITERIA.map((c) => [c, Math.round((scored.reduce((s, r) => s + r.scores![c], 0) / scored.length) * 10) / 10])
        ) as Record<Criterion, number>)
      : null;
    const overall = averages
      ? Math.round((CRITERIA.reduce((s, c) => s + averages[c], 0) / CRITERIA.length) * 2) / 2
      : null;

    const tagCounts = new Map<string, number>();
    for (const r of rows) for (const t of r.feedback_tags ?? []) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
    const topTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([t]) => t);

    return { summary: { count: rows.length, averages, overall, topTags } };
  } catch (error) {
    console.error("[getMyFeedbackSummary]", error);
    return { summary: null, error: "An unexpected error occurred" };
  }
}
