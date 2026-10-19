"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { currentUserId, isUuid } from "@/lib/server/match-access";
import { AUDIO_BUCKET, CLAIM_TTL_MS, exchangeCounts, reliabilities } from "@/lib/server/answers";
import { CRITERIA, MAX_COMMENT_LENGTH, MAX_TAG_LENGTH, type CriterionScores } from "@/lib/feedback";
import { pickNext, submissionsLeft, type QueueCandidate } from "@/lib/review-scoring";

/**
 * Chấm chéo (docs/ORATIO_REDESIGN.md §5.2): listen to someone's answer,
 * score the four criteria; two reviews earn one answer sent. Reviewers
 * never see who they score, and owners never see who scored them.
 */

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
/** Playback links last as long as a claim */
const AUDIO_URL_TTL_S = CLAIM_TTL_MS / 1000;

export interface ReviewStatus {
  reviewsGiven: number;
  submitted: number;
  submissionsLeft: number;
  /** 0–1, null until enough anchors or shared answers */
  reliability: number | null;
  trusted: boolean;
  /** Answers waiting for a review that this user could take */
  waiting: number;
}

export interface ReviewTask {
  answerId: string;
  part: number;
  questionText: string;
  durationMs: number;
  audioUrl: string;
}

export async function getReviewStatus(): Promise<{ status: ReviewStatus | null; error?: string }> {
  if (DEMO) return { status: { reviewsGiven: 0, submitted: 0, submissionsLeft: 1, reliability: null, trusted: false, waiting: 0 } };
  try {
    const userId = await currentUserId();
    if (!userId) return { status: null, error: "Not authenticated" };
    const admin = createAdminClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    const [{ given, submitted }, rel, candidates] = await Promise.all([
      exchangeCounts(admin, userId),
      reliabilities(admin, [userId]),
      queueFor(admin, userId),
    ]);
    const r = rel.get(userId);
    return {
      status: {
        reviewsGiven: given,
        submitted,
        submissionsLeft: submissionsLeft(given, submitted),
        reliability: r?.score ?? null,
        trusted: r?.trusted ?? false,
        waiting: candidates.filter((c) => !c.isAnchor).length,
      },
    };
  } catch (error) {
    console.error("[getReviewStatus]", error);
    return { status: null, error: "Không tải được" };
  }
}

/** Answers this user may review: not their own, not reviewed or skipped by them, audio still there. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function queueFor(admin: any, userId: string): Promise<QueueCandidate[]> {
  const now = new Date().toISOString();
  const { data: rows } = await admin
    .from("answers")
    .select("id, user_id, mode, submitted_at")
    .not("submitted_at", "is", null)
    .not("audio_path", "is", null)
    .or(`audio_expires_at.gt.${now},mode.eq.anchor`)
    .order("submitted_at", { ascending: true })
    .limit(300);
  const answers = ((rows ?? []) as { id: string; user_id: string | null; mode: string; submitted_at: string }[]).filter(
    (a) => a.user_id !== userId
  );
  if (answers.length === 0) return [];
  const ids = answers.map((a) => a.id);

  const since = new Date(Date.now() - CLAIM_TTL_MS).toISOString();
  const [{ data: reviews }, { data: claims }] = await Promise.all([
    admin.from("answer_reviews").select("answer_id, reviewer_id").in("answer_id", ids),
    admin.from("review_claims").select("answer_id, reviewer_id, claimed_at").in("answer_id", ids),
  ]);
  const done = (reviews ?? []) as { answer_id: string; reviewer_id: string }[];
  const held = (claims ?? []) as { answer_id: string; reviewer_id: string; claimed_at: string }[];
  const mineSeen = new Set([...done, ...held].filter((r) => r.reviewer_id === userId).map((r) => r.answer_id));

  const owners = [...new Set(answers.map((a) => a.user_id).filter((x): x is string => !!x))];
  const { data: ownerReviews } = owners.length
    ? await admin.from("answer_reviews").select("reviewer_id").in("reviewer_id", owners)
    : { data: [] };
  const givenBy = new Map<string, number>();
  for (const r of (ownerReviews ?? []) as { reviewer_id: string }[]) givenBy.set(r.reviewer_id, (givenBy.get(r.reviewer_id) ?? 0) + 1);

  return answers
    .filter((a) => !mineSeen.has(a.id))
    .map((a) => ({
      id: a.id,
      isAnchor: a.mode === "anchor",
      submittedAt: a.submitted_at,
      reviews:
        done.filter((r) => r.answer_id === a.id).length +
        held.filter((c) => c.answer_id === a.id && c.claimed_at > since && !done.some((r) => r.answer_id === a.id && r.reviewer_id === c.reviewer_id)).length,
      ownerReviewsGiven: a.user_id ? givenBy.get(a.user_id) ?? 0 : 0,
    }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function taskFor(admin: any, answerId: string): Promise<ReviewTask | null> {
  const { data: a } = await admin.from("answers").select("id, part, question_text, duration_ms, audio_path").eq("id", answerId).maybeSingle();
  if (!a?.audio_path) return null;
  const { data: signed } = await admin.storage.from(AUDIO_BUCKET).createSignedUrl(a.audio_path, AUDIO_URL_TTL_S);
  if (!signed?.signedUrl) return null;
  return { answerId: a.id, part: a.part, questionText: a.question_text, durationMs: a.duration_ms, audioUrl: signed.signedUrl };
}

/** The next answer to review (or the one already open), with a short-lived audio link. */
export async function claimNextReview(): Promise<{ task: ReviewTask | null; error?: string }> {
  if (DEMO) return { task: null };
  try {
    const userId = await currentUserId();
    if (!userId) return { task: null, error: "Not authenticated" };
    const admin = createAdminClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    // Resume an open claim (page reload) instead of taking a new one
    const since = new Date(Date.now() - CLAIM_TTL_MS).toISOString();
    const { data: open } = await admin
      .from("review_claims")
      .select("answer_id, claimed_at")
      .eq("reviewer_id", userId)
      .gt("claimed_at", since)
      .order("claimed_at", { ascending: false })
      .limit(5);
    for (const c of (open ?? []) as { answer_id: string }[]) {
      const { data: reviewed } = await admin
        .from("answer_reviews")
        .select("answer_id")
        .eq("answer_id", c.answer_id)
        .eq("reviewer_id", userId)
        .maybeSingle();
      if (!reviewed) {
        const task = await taskFor(admin, c.answer_id);
        if (task) return { task };
      }
    }

    const next = pickNext(await queueFor(admin, userId));
    if (!next) return { task: null };
    const { error } = await admin.from("review_claims").upsert({ answer_id: next.id, reviewer_id: userId, claimed_at: new Date().toISOString() });
    if (error) return { task: null, error: error.message };
    return { task: await taskFor(admin, next.id) };
  } catch (error) {
    console.error("[claimNextReview]", error);
    return { task: null, error: "Không lấy được câu để chấm" };
  }
}

export interface ReviewInput {
  answerId: string;
  scores: CriterionScores;
  tags: string[];
  comment: string | null;
}

export async function submitReview(input: ReviewInput): Promise<{ submissionsLeft?: number; error?: string }> {
  try {
    const userId = await currentUserId();
    if (!userId) return { error: "Not authenticated" };
    if (!input || !isUuid(input.answerId)) return { error: "Invalid answer" };
    const scores = {} as CriterionScores;
    for (const c of CRITERIA) {
      const v = input.scores?.[c];
      if (typeof v !== "number" || !Number.isInteger(v) || v < 1 || v > 9) return { error: "Mỗi tiêu chí cần một band từ 1 đến 9" };
      scores[c] = v;
    }
    const tags = Array.isArray(input.tags)
      ? [...new Set(input.tags.filter((t) => typeof t === "string").map((t) => t.trim().slice(0, MAX_TAG_LENGTH)))].filter(Boolean).slice(0, 4)
      : [];
    const comment =
      typeof input.comment === "string" && input.comment.trim() ? input.comment.trim().slice(0, Math.min(500, MAX_COMMENT_LENGTH)) : null;

    const admin = createAdminClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    // Only an answer this user was given to review, and never their own
    const { data: claim } = await admin
      .from("review_claims")
      .select("answer_id")
      .eq("answer_id", input.answerId)
      .eq("reviewer_id", userId)
      .maybeSingle();
    if (!claim) return { error: "Câu này không còn trong lượt chấm của bạn" };
    const { data: a } = await admin.from("answers").select("user_id").eq("id", input.answerId).maybeSingle();
    if (!a || a.user_id === userId) return { error: "Invalid answer" };

    const { error } = await admin.from("answer_reviews").insert({
      answer_id: input.answerId,
      reviewer_id: userId,
      ...scores,
      tags,
      comment,
    });
    if (error) return { error: error.code === "23505" ? "Bạn đã chấm câu này rồi" : error.message };

    const { given, submitted } = await exchangeCounts(admin, userId);
    return { submissionsLeft: submissionsLeft(given, submitted) };
  } catch (error) {
    console.error("[submitReview]", error);
    return { error: "Không gửi được điểm" };
  }
}

/** Skip an answer (bad audio, can't judge). The claim stays so it isn't served again. */
export async function skipReview(answerId: string): Promise<{ error?: string }> {
  try {
    const userId = await currentUserId();
    if (!userId) return { error: "Not authenticated" };
    if (!isUuid(answerId)) return { error: "Invalid answer" };
    const admin = createAdminClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    // Backdate the claim so it no longer counts as in progress for others
    await admin
      .from("review_claims")
      .update({ claimed_at: new Date(0).toISOString() })
      .eq("answer_id", answerId)
      .eq("reviewer_id", userId);
    return {};
  } catch (error) {
    console.error("[skipReview]", error);
    return { error: "Không bỏ qua được" };
  }
}
