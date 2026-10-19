import { CRITERIA, type Criterion, type CriterionScores } from "@/lib/feedback";

/**
 * Chấm chéo maths (docs/ORATIO_REDESIGN.md §5.2), pure so it can be tested:
 * how far a reviewer can be trusted, the band range of an answer, how many
 * answers a learner may send, and which answer a reviewer gets next.
 */

/** Within this many bands of the reference counts as agreeing. */
export const AGREE_WITHIN = 0.5;
/** Anchors (or consensus answers) needed before reliability means anything. */
export const MIN_SAMPLES = 3;
/** Reviews needed before an answer leaves the queue. */
export const TARGET_REVIEWS = 3;
/** No answer gets more reviews than this. */
export const MAX_REVIEWS = 5;
/** Reviews you give for each answer you may send. */
export const REVIEWS_PER_SUBMISSION = 2;
/** About one in this many reviews is an anchor. */
export const ANCHOR_EVERY = 5;

export const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

export const overallOf = (s: CriterionScores) => mean(CRITERIA.map((c) => s[c]));

/** IELTS rounding to the nearest half band. */
export const toHalfBand = (x: number) => Math.min(9, Math.max(1, Math.round(x * 2) / 2));

export interface ReviewerHistory {
  /** Overall the reviewer gave vs. the teacher's overall, per anchor reviewed */
  anchors: { given: number; reference: number }[];
  /** Overall the reviewer gave vs. the mean of the others, per answer with enough other reviews */
  consensus: { given: number; reference: number }[];
}

export interface Reliability {
  /** 0–1, or null while there isn't enough data */
  score: number | null;
  /** Weight of this reviewer's scores in an answer's band */
  weight: number;
  anchorsReviewed: number;
  /** Earned the "tin cậy" label */
  trusted: boolean;
}

const agreeRate = (pairs: { given: number; reference: number }[]) =>
  pairs.filter((p) => Math.abs(p.given - p.reference) <= AGREE_WITHIN).length / pairs.length;

export function reliabilityOf(h: ReviewerHistory): Reliability {
  const hasAnchors = h.anchors.length >= MIN_SAMPLES;
  const hasConsensus = h.consensus.length >= MIN_SAMPLES;
  let score: number | null = null;
  if (hasAnchors && hasConsensus) score = 0.7 * agreeRate(h.anchors) + 0.3 * agreeRate(h.consensus);
  else if (hasAnchors) score = agreeRate(h.anchors);
  else if (hasConsensus) score = agreeRate(h.consensus);
  return {
    score,
    // New reviewers count a bit more than half; a reliable one counts fully
    weight: score === null ? 0.6 : 0.2 + 0.8 * score,
    anchorsReviewed: h.anchors.length,
    trusted: score !== null && score >= 0.75 && h.anchors.length >= 5,
  };
}

export interface WeightedReview {
  scores: CriterionScores;
  weight: number;
}

export interface AnswerBand {
  low: number;
  high: number;
  raters: number;
  /** Weighted mean per criterion, rounded to half bands */
  criteria: Record<Criterion, number>;
}

/** The band range of an answer from its reviews, or null with none. */
export function answerBand(reviews: WeightedReview[]): AnswerBand | null {
  if (reviews.length === 0) return null;
  const total = reviews.reduce((a, r) => a + r.weight, 0);
  const wmean = (f: (r: WeightedReview) => number) => reviews.reduce((a, r) => a + r.weight * f(r), 0) / total;

  const criteria = {} as Record<Criterion, number>;
  for (const c of CRITERIA) criteria[c] = toHalfBand(wmean((r) => r.scores[c]));

  const overall = wmean((r) => overallOf(r.scores));
  // One rater: ±0.5. More: the weighted spread, at least a quarter band each way.
  const spread =
    reviews.length === 1 ? 0.5 : Math.max(0.25, Math.sqrt(wmean((r) => (overallOf(r.scores) - overall) ** 2)));
  const low = toHalfBand(overall - spread);
  const high = toHalfBand(overall + spread);
  return { low, high: Math.max(low, high), raters: reviews.length, criteria };
}

/** Answers the learner may still send to Chấm chéo (the first one is free). */
export function submissionsLeft(reviewsGiven: number, submitted: number): number {
  return Math.max(0, 1 + Math.floor(reviewsGiven / REVIEWS_PER_SUBMISSION) - submitted);
}

export interface QueueCandidate {
  id: string;
  isAnchor: boolean;
  submittedAt: string;
  /** Reviews done plus claims in progress */
  reviews: number;
  /** How many reviews the owner has given (helpers get reviewed first) */
  ownerReviewsGiven: number;
}

/**
 * The next answer for a reviewer. Candidates must already exclude the
 * reviewer's own answers and the ones they reviewed or skipped. About one
 * review in ANCHOR_EVERY is an anchor, at random, so reviewers can't tell.
 */
export function pickNext(candidates: QueueCandidate[], random: () => number = Math.random): QueueCandidate | null {
  const open = candidates.filter((c) => c.reviews < MAX_REVIEWS);
  const anchors = open.filter((c) => c.isAnchor);
  const answers = open.filter((c) => !c.isAnchor);

  if (anchors.length > 0 && (answers.length === 0 || random() < 1 / ANCHOR_EVERY)) {
    return anchors[Math.floor(random() * anchors.length)];
  }
  if (answers.length === 0) return null;

  // Answers short of TARGET_REVIEWS first; then the longest wait, where each
  // review the owner gave others counts as an extra hour of waiting.
  const HOUR = 3_600_000;
  const key = (c: QueueCandidate) => new Date(c.submittedAt).getTime() - Math.min(c.ownerReviewsGiven, 24) * HOUR;
  return [...answers].sort((a, b) => {
    const needA = a.reviews < TARGET_REVIEWS ? 0 : 1;
    const needB = b.reviews < TARGET_REVIEWS ? 0 : 1;
    return needA - needB || key(a) - key(b);
  })[0];
}
