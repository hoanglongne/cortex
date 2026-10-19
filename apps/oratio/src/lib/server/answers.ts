import { CRITERIA, type CriterionScores } from "@/lib/feedback";
import {
  answerBand,
  mean,
  MIN_SAMPLES,
  overallOf,
  reliabilityOf,
  type AnswerBand,
  type Reliability,
  type ReviewerHistory,
} from "@/lib/review-scoring";
import type { AdminClient } from "./match-access";

/**
 * Server-only helpers for answers and Chấm chéo. Not a "use server" file:
 * nothing here is callable from the browser.
 */

export const AUDIO_BUCKET = "oratio-answers";
/** Audio sent to Chấm chéo is kept this long */
export const AUDIO_TTL_DAYS = 30;
/** A claim older than this no longer holds an answer for its reviewer */
export const CLAIM_TTL_MS = 15 * 60_000;

export interface ReviewRow {
  answer_id: string;
  reviewer_id: string;
  fluency: number;
  vocabulary: number;
  grammar: number;
  pronunciation: number;
  tags: string[];
  comment: string | null;
  created_at: string;
}

export const scoresOf = (r: Pick<ReviewRow, "fluency" | "vocabulary" | "grammar" | "pronunciation">): CriterionScores => ({
  fluency: Number(r.fluency),
  vocabulary: Number(r.vocabulary),
  grammar: Number(r.grammar),
  pronunciation: Number(r.pronunciation),
});

const REVIEW_COLS = "answer_id, reviewer_id, fluency, vocabulary, grammar, pronunciation, tags, comment, created_at";

/** Reliability of each reviewer, from their anchor reviews and agreement with others. */
export async function reliabilities(admin: AdminClient, reviewerIds: string[]): Promise<Map<string, Reliability>> {
  const out = new Map<string, Reliability>();
  if (reviewerIds.length === 0) return out;

  const { data: given } = await admin
    .from("answer_reviews")
    .select(REVIEW_COLS)
    .in("reviewer_id", reviewerIds)
    .order("created_at", { ascending: false })
    .limit(1000);
  const reviews = (given ?? []) as ReviewRow[];
  const answerIds = [...new Set(reviews.map((r) => r.answer_id))];

  const [{ data: answers }, { data: all }] = await Promise.all([
    answerIds.length
      ? admin.from("answers").select("id, mode, anchor_scores").in("id", answerIds)
      : Promise.resolve({ data: [] }),
    answerIds.length ? admin.from("answer_reviews").select(REVIEW_COLS).in("answer_id", answerIds) : Promise.resolve({ data: [] }),
  ]);
  const answerById = new Map(
    ((answers ?? []) as { id: string; mode: string; anchor_scores: Record<string, number> | null }[]).map((a) => [a.id, a])
  );
  const byAnswer = new Map<string, ReviewRow[]>();
  for (const r of (all ?? []) as ReviewRow[]) byAnswer.set(r.answer_id, [...(byAnswer.get(r.answer_id) ?? []), r]);

  for (const id of reviewerIds) {
    const history: ReviewerHistory = { anchors: [], consensus: [] };
    for (const r of reviews.filter((x) => x.reviewer_id === id)) {
      const answer = answerById.get(r.answer_id);
      const given = overallOf(scoresOf(r));
      if (answer?.mode === "anchor" && answer.anchor_scores) {
        const ref = CRITERIA.map((c) => Number(answer.anchor_scores![c])).filter((v) => !Number.isNaN(v));
        if (ref.length) history.anchors.push({ given, reference: mean(ref) });
      } else {
        const others = (byAnswer.get(r.answer_id) ?? []).filter((x) => x.reviewer_id !== id);
        if (others.length >= MIN_SAMPLES - 1) history.consensus.push({ given, reference: mean(others.map((o) => overallOf(scoresOf(o)))) });
      }
    }
    out.set(id, reliabilityOf(history));
  }
  return out;
}

export interface ReceivedReview {
  scores: CriterionScores;
  tags: string[];
  comment: string | null;
  createdAt: string;
}

/** Band ranges and the (anonymous) reviews of some answers. */
export async function bandsFor(
  admin: AdminClient,
  answerIds: string[]
): Promise<Map<string, { band: AnswerBand | null; reviews: ReceivedReview[] }>> {
  const out = new Map<string, { band: AnswerBand | null; reviews: ReceivedReview[] }>();
  if (answerIds.length === 0) return out;
  const { data } = await admin.from("answer_reviews").select(REVIEW_COLS).in("answer_id", answerIds);
  const rows = (data ?? []) as ReviewRow[];
  const weights = await reliabilities(admin, [...new Set(rows.map((r) => r.reviewer_id))]);
  for (const id of answerIds) {
    const mine = rows.filter((r) => r.answer_id === id);
    out.set(id, {
      band: answerBand(mine.map((r) => ({ scores: scoresOf(r), weight: weights.get(r.reviewer_id)?.weight ?? 0.6 }))),
      reviews: mine
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .map((r) => ({ scores: scoresOf(r), tags: r.tags ?? [], comment: r.comment, createdAt: r.created_at })),
    });
  }
  return out;
}

/** Reviews given and answers sent by a user (anchors aside). */
export async function exchangeCounts(admin: AdminClient, userId: string): Promise<{ given: number; submitted: number }> {
  const [{ count: given }, { count: submitted }] = await Promise.all([
    admin.from("answer_reviews").select("answer_id", { count: "exact", head: true }).eq("reviewer_id", userId),
    admin
      .from("answers")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .not("submitted_at", "is", null),
  ]);
  return { given: given ?? 0, submitted: submitted ?? 0 };
}
