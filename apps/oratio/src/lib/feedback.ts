/**
 * Pure checks for what the client sends to the matchmaking actions, kept out
 * of the "use server" file so they can be unit tested.
 */

export const CRITERIA = ["fluency", "vocabulary", "grammar", "pronunciation"] as const;
export type Criterion = (typeof CRITERIA)[number];
export type CriterionScores = Record<Criterion, number>;

export interface FeedbackInput {
  scores: CriterionScores;
  wouldMatchAgain: boolean | null;
  tags: string[];
  comments: string | null;
}

export const MAX_TAGS = 16;
export const MAX_TAG_LENGTH = 40;
export const MAX_COMMENT_LENGTH = 1000;

/** IELTS overall band: the mean of the four criteria, rounded to the nearest .5. */
export function overallBand(scores: CriterionScores): number {
  const mean = CRITERIA.reduce((sum, c) => sum + scores[c], 0) / CRITERIA.length;
  return Math.round(mean * 2) / 2;
}

export function validateFeedback(
  input: unknown
): { ok: true; value: FeedbackInput } | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "Invalid feedback" };
  const raw = input as Record<string, unknown>;
  const rawScores = (raw.scores ?? {}) as Record<string, unknown>;

  const scores = {} as CriterionScores;
  for (const c of CRITERIA) {
    const v = rawScores[c];
    // Criterion bands are whole numbers in IELTS
    if (typeof v !== "number" || !Number.isInteger(v) || v < 1 || v > 9) {
      return { ok: false, error: "Each score must be a band from 1 to 9" };
    }
    scores[c] = v;
  }

  const tags = Array.isArray(raw.tags)
    ? [...new Set(raw.tags.filter((t): t is string => typeof t === "string").map((t) => t.trim().slice(0, MAX_TAG_LENGTH)))]
        .filter(Boolean)
        .slice(0, MAX_TAGS)
    : [];

  const comments =
    typeof raw.comments === "string" && raw.comments.trim() ? raw.comments.trim().slice(0, MAX_COMMENT_LENGTH) : null;

  const wouldMatchAgain = typeof raw.wouldMatchAgain === "boolean" ? raw.wouldMatchAgain : null;

  return { ok: true, value: { scores, tags, comments, wouldMatchAgain } };
}

/** The partner's band range to search; "any" when the input makes no sense. */
export function clampBandRange(min: unknown, max: unknown): { min: number; max: number } {
  const clamp = (v: unknown, fallback: number) =>
    typeof v === "number" && Number.isFinite(v) ? Math.min(9, Math.max(1, Math.round(v * 2) / 2)) : fallback;
  const lo = clamp(min, 1);
  const hi = clamp(max, 9);
  return lo <= hi ? { min: lo, max: hi } : { min: 1, max: 9 };
}
