"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { claimAll, releaseQueueEntries } from "@/lib/matchmaking/claim";
import {
  CLAIM_IN_PROGRESS_MS,
  MIN_POLL_INTERVAL_MS,
  QUEUE_STALE_AFTER_MS,
  isBandCompatible,
  msSince,
} from "@/lib/matchmaking/rules";
import { clampBandRange, overallBand, validateFeedback, type FeedbackInput } from "@/lib/feedback";
import { lastActivity, requireParticipant, type AdminClient } from "@/lib/server/match-access";
import { reliabilities } from "@/lib/server/answers";
import type { FindMatchResult, Match, MatchQueueEntry, PublicProfile } from "@/lib/types/database";

/** Server logs for matchmaking, only when ORATIO_DEBUG=true. Never sent to the client. */
const debug = (msg: string) => {
  if (process.env.ORATIO_DEBUG === "true") console.log(`[matchmaking] ${msg}`);
};

/** A pending match nobody confirmed in this long is dropped. */
const PENDING_TIMEOUT_MS = 60_000;
/** An active match where one person never joined the call is dropped. */
const NEVER_STARTED_TIMEOUT_MS = 3 * 60_000;
/** An active call with no sign of life from either screen for this long is over. */
const ABANDONED_AFTER_MS = 60_000;

// Country is shared with the matched partner only (it is not in public_profiles)
type PartnerFields = Pick<PublicProfile, "id" | "username" | "current_band" | "avatar_url"> & { country: string | null };

const toPartner = (p: PartnerFields) => ({
  id: p.id,
  username: p.username,
  band: Number(p.current_band),
  avatarUrl: p.avatar_url,
  country: p.country ?? null,
});

async function partnerOf(admin: AdminClient, partnerId: string) {
  const { data } = await admin
    .from("profiles")
    .select("id, username, current_band, avatar_url, country")
    .eq("id", partnerId)
    .maybeSingle();
  return data ? toPartner(data as PartnerFields) : undefined;
}

/**
 * Closes the user's open matches that are no longer real (nobody pressed
 * Ready, one person never joined, or both screens went quiet) and returns
 * the one still in progress, if any.
 */
async function liveOpenMatch(admin: AdminClient, userId: string): Promise<Match | null> {
  const { data } = await admin
    .from("matches")
    .select("*")
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .in("status", ["pending", "active"])
    .order("created_at", { ascending: false })
    .limit(5);

  let live: Match | null = null;
  for (const m of (data ?? []) as Match[]) {
    const now = new Date().toISOString();
    if (m.status === "pending" && msSince(m.created_at) > PENDING_TIMEOUT_MS) {
      debug(`cancel stale pending match ${m.id}`);
      await admin.from("matches").update({ status: "cancelled", ended_at: now }).eq("id", m.id).eq("status", "pending");
    } else if (m.status === "active" && !m.started_at && msSince(m.created_at) > NEVER_STARTED_TIMEOUT_MS) {
      debug(`cancel match ${m.id}: the call never started`);
      await admin.from("matches").update({ status: "cancelled", ended_at: now }).eq("id", m.id).eq("status", "active");
    } else if (m.status === "active" && m.started_at && msSince(lastActivity(m)) > ABANDONED_AFTER_MS) {
      debug(`finish abandoned match ${m.id}`);
      await admin
        .from("matches")
        .update({ status: "finished", ended_at: lastActivity(m) })
        .eq("id", m.id)
        .eq("status", "active");
    } else if (!live) {
      live = m;
    }
  }
  return live;
}

/**
 * One matchmaking poll for the signed-in user (the client calls it every 2s).
 *
 * 1. An open match in progress is returned, so a reload rejoins it.
 * 2. The user's queue entry is created or refreshed (heartbeat).
 * 3. A band-compatible online partner is claimed together with the user's
 *    own entry, so two people can't both be matched to the same person.
 * 4. The match is created; the database refuses a second open match per user.
 */
export async function findMatch(bandMin: number = 1, bandMax: number = 9): Promise<FindMatchResult> {
  try {
    const supabase = await createClient();
    const admin = createAdminClient() as AdminClient;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { status: "error", error: "Please log in to find a match" };

    const range = clampBandRange(bandMin, bandMax);

    // 1. Already in a match
    const open = await liveOpenMatch(admin, user.id);
    if (open) {
      const partnerId = open.user1_id === user.id ? open.user2_id : open.user1_id;
      return { status: "matched", roomId: open.room_id, matchId: open.id, partner: await partnerOf(admin, partnerId) };
    }

    // 2. Own queue entry
    const { data: entryData } = await admin.from("match_queue").select("*").eq("user_id", user.id).maybeSingle();
    let entry = entryData as MatchQueueEntry | null;

    if (entry?.status === "waiting") {
      if (msSince(entry.last_seen_at) < MIN_POLL_INTERVAL_MS) return { status: "waiting" };
      await admin.from("match_queue").update({ last_seen_at: new Date().toISOString() }).eq("id", entry.id);
    } else if (entry?.status === "matched" && msSince(entry.last_seen_at) < CLAIM_IN_PROGRESS_MS) {
      // A partner just claimed us and is creating the match
      return { status: "waiting" };
    } else if (entry) {
      await admin.from("match_queue").delete().eq("id", entry.id);
      entry = null;
    }

    if (!entry) {
      const now = new Date().toISOString();
      const { data: inserted, error: insertError } = await admin
        .from("match_queue")
        .upsert(
          {
            user_id: user.id,
            target_band_min: range.min,
            target_band_max: range.max,
            status: "waiting",
            created_at: now,
            last_seen_at: now,
          },
          { onConflict: "user_id" }
        )
        .select()
        .single();
      if (insertError || !inserted) {
        console.error("[findMatch] queue insert failed:", insertError);
        return { status: "error", error: "Failed to join queue" };
      }
      entry = inserted as MatchQueueEntry;
    }

    // The user's band (the profile normally comes from the signup trigger)
    const { data: me } = await admin.from("profiles").select("current_band").eq("id", user.id).maybeSingle();
    if (!me) {
      const { error: createError } = await admin.from("profiles").insert({
        id: user.id,
        email: user.email,
        username: String(user.user_metadata?.username || user.email?.split("@")[0] || "User").slice(0, 40),
      });
      if (createError) {
        console.error("[findMatch] profile create failed:", createError);
        return { status: "error", error: "Failed to create user profile" };
      }
    }
    const myBand = Number(me?.current_band ?? 5.5);

    // 3. Online, band-compatible partners, oldest first
    const onlineSince = new Date(Date.now() - QUEUE_STALE_AFTER_MS).toISOString();
    const { data: queueData, error: queueError } = await admin
      .from("match_queue")
      .select("*")
      .eq("status", "waiting")
      .neq("user_id", user.id)
      .gte("last_seen_at", onlineSince)
      .order("created_at", { ascending: true })
      .limit(50);
    if (queueError) {
      console.error("[findMatch] queue query failed:", queueError);
      return { status: "error", error: "Failed to search for matches" };
    }

    const others = (queueData ?? []) as MatchQueueEntry[];
    const profiles = new Map<string, PartnerFields>();
    if (others.length > 0) {
      const { data: rows } = await admin
        .from("profiles")
        .select("id, username, current_band, avatar_url, country")
        .in("id", others.map((e) => e.user_id));
      for (const p of (rows ?? []) as PartnerFields[]) profiles.set(p.id, p);
    }

    const waitedMs = msSince(entry.created_at);
    const candidates = others.filter((e) => {
      const p = profiles.get(e.user_id);
      if (!p) return false;
      return isBandCompatible(
        { band: myBand, wantMin: range.min, wantMax: range.max, waitedMs },
        { band: Number(p.current_band), targetMin: e.target_band_min, targetMax: e.target_band_max }
      ).compatible;
    });
    debug(`${user.id}: ${others.length} online, ${candidates.length} compatible, waited ${Math.round(waitedMs / 1000)}s`);

    // Claim our own entry and the partner's together
    let partnerEntry: MatchQueueEntry | null = null;
    let claimed: string[] = [];
    for (const candidate of candidates) {
      const ids = [entry.id, candidate.id];
      const result = await claimAll(admin, ids);
      if (result.ok) {
        partnerEntry = candidate;
        claimed = ids;
        break;
      }
      if (result.failedId === entry.id) return { status: "waiting" }; // someone claimed us
    }
    if (!partnerEntry) return { status: "waiting" };

    // 4. Create the match with roles
    const user1First = Math.random() > 0.5;
    const { data: created, error: matchError } = await admin
      .from("matches")
      .insert({
        user1_id: user.id,
        user2_id: partnerEntry.user_id,
        room_id: `room_${uuidv4()}`,
        status: "pending",
        interviewer_id: user1First ? user.id : partnerEntry.user_id,
        candidate_id: user1First ? partnerEntry.user_id : user.id,
      })
      .select()
      .single();

    if (matchError || !created) {
      // Usually the database refusing a second open match for one of us
      debug(`match insert refused: ${matchError?.message}`);
      await releaseQueueEntries(admin, claimed);
      return { status: "waiting" };
    }

    await admin.from("match_queue").delete().in("id", claimed);
    revalidatePath("/");

    const match = created as Match;
    return {
      status: "matched",
      roomId: match.room_id,
      matchId: match.id,
      partner: toPartner(profiles.get(partnerEntry.user_id)!),
    };
  } catch (error) {
    console.error("[findMatch]", error);
    return { status: "error", error: "An unexpected error occurred" };
  }
}

/** Leaves the queue. */
export async function cancelMatch(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const admin = createAdminClient() as AdminClient;
    const { error } = await admin.from("match_queue").delete().eq("user_id", user.id).eq("status", "waiting");
    if (error) {
      console.error("[cancelMatch]", error);
      return { success: false, error: "Failed to cancel" };
    }
    return { success: true };
  } catch (error) {
    console.error("[cancelMatch]", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * "Find another partner" on the partner-found screen, or leaving a call the
 * partner never joined. The match is cancelled; nothing counts.
 */
export async function declineMatch(matchId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const access = await requireParticipant(matchId);
    if (!access.ok) return { success: false, error: access.error };
    const { match, admin } = access;

    if (match.status === "pending" || (match.status === "active" && !match.started_at)) {
      await admin
        .from("matches")
        .update({ status: "cancelled", ended_at: new Date().toISOString() })
        .eq("id", match.id)
        .eq("status", match.status);
    }
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("[declineMatch]", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Ends the call. A call both people joined is finished (and counts); one
 * that never started is cancelled. Returns what the match became.
 */
export async function endCall(
  matchId: string
): Promise<{ success: boolean; status?: "finished" | "cancelled"; error?: string }> {
  try {
    const access = await requireParticipant(matchId);
    if (!access.ok) return { success: false, error: access.error };
    const { match, admin } = access;

    if (match.status === "pending" || match.status === "active") {
      const next = match.status === "active" && match.started_at ? "finished" : "cancelled";
      await admin
        .from("matches")
        .update({ status: next, ended_at: new Date().toISOString() })
        .eq("id", match.id)
        .eq("status", match.status);
    }

    const { data } = await admin.from("matches").select("*").eq("id", match.id).single();
    const final = data as Match;
    const status = final.status === "finished" && final.started_at ? "finished" : "cancelled";

    if (status === "finished") await logToCortex(final);
    revalidatePath("/");
    return { success: true, status };
  } catch (error) {
    console.error("[endCall]", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Tells the Cortex hub the signed-in user finished a speaking session (for
 * XP and the cross-app activity log). Optional: only when CORTEX_API_URL is
 * set and Oratio shares the hub's Supabase project, since the hub checks the
 * user's own access token. No transcript is sent, so the hub's vocabulary
 * and fluency profile is not touched.
 */
async function logToCortex(match: Match) {
  const base = process.env.CORTEX_API_URL;
  if (!base || !match.started_at || !match.ended_at) return;
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const minutes = Math.round((new Date(match.ended_at).getTime() - new Date(match.started_at).getTime()) / 60_000);
    await fetch(`${base.replace(/\/$/, "")}/actions/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({
        appSource: "oratio",
        actionType: "COMPLETE_ORATIO_SESSION",
        metadata: {
          matchId: match.id,
          minutes,
          questionsCount: (match.questions_asked || []).length,
          topic: match.topic,
        },
      }),
      signal: AbortSignal.timeout(3000),
    });
  } catch (error) {
    console.error("[Cortex] session log failed:", error);
  }
}

type HistoryFeedback = {
  match_id: string;
  from_user_id: string;
  to_user_id: string;
  scores: Record<string, number> | null;
  feedback_tags: string[] | null;
  comments: string | null;
  would_match_again: boolean | null;
};

/** The signed-in user's finished calls with the feedback both ways. */
export async function getCallHistory(limit: number = 20) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { sessions: [], error: "Not authenticated" };

    const admin = createAdminClient() as AdminClient;
    const { data: matches, error } = await admin
      .from("matches")
      .select("*")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq("status", "finished")
      .not("started_at", "is", null)
      .order("ended_at", { ascending: false, nullsFirst: false })
      .limit(Math.min(Math.max(1, limit), 50));

    if (error) {
      console.error("[getCallHistory]", error);
      return { sessions: [], error: "Failed to fetch history" };
    }
    const rows = (matches ?? []) as Match[];
    if (rows.length === 0) return { sessions: [], error: null };

    const partnerIds = [...new Set(rows.map((m) => (m.user1_id === user.id ? m.user2_id : m.user1_id)))];
    const questionIds = [...new Set(rows.flatMap((m) => m.questions_asked || []))];

    const [{ data: partners }, { data: feedbacks }, { data: questions }] = await Promise.all([
      admin.from("profiles").select("id, username, current_band, avatar_url").in("id", partnerIds),
      admin.from("session_feedback").select("*").in("match_id", rows.map((m) => m.id)),
      questionIds.length > 0
        ? admin.from("ielts_questions").select("id, part, question_text").in("id", questionIds)
        : Promise.resolve({ data: [] }),
    ]);

    const partnerById = new Map(((partners ?? []) as PartnerFields[]).map((p) => [p.id, p]));
    const questionById = new Map(
      ((questions ?? []) as { id: string; part: number; question_text: string }[]).map((q) => [q.id, q])
    );
    const fb = (feedbacks ?? []) as HistoryFeedback[];

    const shape = (f: HistoryFeedback | undefined) =>
      f
        ? {
            overallBand: f.scores?.overall ?? null,
            scores: f.scores
              ? {
                  fluency: f.scores.fluency,
                  vocabulary: f.scores.vocabulary,
                  grammar: f.scores.grammar,
                  pronunciation: f.scores.pronunciation,
                }
              : null,
            tags: f.feedback_tags || [],
            comments: f.comments || "",
            wouldMatchAgain: f.would_match_again,
          }
        : null;

    const sessions = rows.map((m) => {
      const partnerId = m.user1_id === user.id ? m.user2_id : m.user1_id;
      const partner = partnerById.get(partnerId);
      const duration =
        m.started_at && m.ended_at
          ? Math.max(0, Math.floor((new Date(m.ended_at).getTime() - new Date(m.started_at).getTime()) / 1000))
          : 0;
      return {
        id: m.id,
        date: m.ended_at || m.created_at,
        duration,
        questionsCount: (m.questions_asked || []).length,
        questions: (m.questions_asked || [])
          .map((id) => questionById.get(id))
          .filter((q): q is { id: string; part: number; question_text: string } => !!q)
          .map((q) => ({ part: q.part, text: q.question_text })),
        topic: m.topic,
        partner: {
          id: partnerId,
          name: partner?.username ?? "Partner",
          band: partner ? Number(partner.current_band).toFixed(1) : "–",
          avatarUrl: partner?.avatar_url ?? null,
        },
        myFeedback: shape(fb.find((f) => f.match_id === m.id && f.from_user_id === user.id)),
        peerFeedback: shape(fb.find((f) => f.match_id === m.id && f.to_user_id === user.id)),
      };
    });

    return { sessions, error: null };
  } catch (error) {
    console.error("[getCallHistory]", error);
    return { sessions: [], error: "An unexpected error occurred" };
  }
}

/**
 * Rates the partner after a call. The partner, the overall band and the
 * rounding are decided here, not by the client, and only a call both people
 * joined can be rated, once.
 */
export async function submitFeedback(
  matchId: string,
  input: FeedbackInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const access = await requireParticipant(matchId);
    if (!access.ok) return { success: false, error: access.error };
    const { userId, partnerId, match, admin } = access;

    if (match.status !== "finished" || !match.started_at) {
      return { success: false, error: "Only a finished call can be rated" };
    }

    const checked = validateFeedback(input);
    if (!checked.ok) return { success: false, error: checked.error };
    const { scores, tags, comments, wouldMatchAgain } = checked.value;
    const overall = overallBand(scores);
    // Raters who score Chấm chéo answers close to the teacher count more (§5.3)
    const raterWeight = (await reliabilities(admin, [userId]).catch(() => null))?.get(userId)?.weight ?? 0.6;

    const { error } = await admin.from("session_feedback").insert({
      rater_weight: Math.round(raterWeight * 100) / 100,
      match_id: match.id,
      from_user_id: userId,
      to_user_id: partnerId,
      overall_rating: Math.min(9, Math.max(1, Math.round(overall))),
      would_match_again: wouldMatchAgain,
      feedback_tags: tags,
      comments,
      scores: { ...scores, overall },
    });

    if (error) {
      if (error.code === "23505") return { success: false, error: "Bạn đã đánh giá buổi này rồi." };
      console.error("[submitFeedback]", error);
      return { success: false, error: "Không gửi được đánh giá, thử lại nhé." };
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("[submitFeedback]", error);
    return { success: false, error: "Không gửi được đánh giá, thử lại nhé." };
  }
}
