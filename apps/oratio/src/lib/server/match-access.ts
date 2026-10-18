import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { Match } from "@/lib/types/database";

/**
 * Server-side checks shared by the server actions. Kept out of the
 * "use server" files: everything exported from those becomes a public
 * endpoint, these helpers must not.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AdminClient = any;

export const isUuid = (v: unknown): v is string =>
  typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

/** The signed-in user's id, or null. */
export async function currentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export type MatchAccess =
  | { ok: true; userId: string; partnerId: string; match: Match; admin: AdminClient }
  | { ok: false; error: string };

/** Loads a match the signed-in user is part of. */
export async function requireParticipant(matchId: unknown): Promise<MatchAccess> {
  if (!isUuid(matchId)) return { ok: false, error: "Invalid match" };
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Not authenticated" };

  const admin = createAdminClient();
  const { data, error } = await admin.from("matches").select("*").eq("id", matchId).maybeSingle();
  if (error || !data) return { ok: false, error: "Match not found" };

  const match = data as Match;
  if (match.user1_id !== userId && match.user2_id !== userId) {
    return { ok: false, error: "Match not found" };
  }
  const partnerId = match.user1_id === userId ? match.user2_id : match.user1_id;
  return { ok: true, userId, partnerId, match, admin };
}

/** The last time anyone in an active match showed a sign of life. */
export function lastActivity(match: Pick<Match, "last_activity_at" | "started_at" | "created_at">): string {
  return match.last_activity_at ?? match.started_at ?? match.created_at;
}
