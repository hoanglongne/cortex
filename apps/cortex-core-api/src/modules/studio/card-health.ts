/**
 * "Sức khoẻ nội dung" (issue #62): which cards are worst this week, from the
 * nightly numbers (cortex_card_stats). A card needs enough answers before its
 * rate counts; a card with reports always counts. Pure, unit tested.
 */
export interface CardStatsRow {
  card_id: string;
  quiz_answers: number;
  quiz_correct: number;
  quiz_median_ms: number | null;
  test_answers: number;
  test_correct: number;
  duel_answers: number;
  duel_correct: number;
  reports: number;
  reasons: Record<string, number>;
}

/** Answers a card needs before its right-answer rate is trusted. */
export const MIN_ANSWERS = 8;
/** Below this share right, a card is "hard for its level". */
export const LOW_RATE = 0.5;

export interface CardHealth extends CardStatsRow {
  answers: number;
  /** Share of answers that were right, null with too few answers. */
  rate: number | null;
  /** Why it is on the list. */
  flags: ('low_rate' | 'reported')[];
}

export function healthOf(r: CardStatsRow): CardHealth {
  const answers = r.quiz_answers + r.test_answers + r.duel_answers;
  const right = r.quiz_correct + r.test_correct + r.duel_correct;
  const rate = answers >= MIN_ANSWERS ? right / answers : null;
  const flags: CardHealth['flags'] = [];
  if (rate !== null && rate < LOW_RATE) flags.push('low_rate');
  if (r.reports > 0) flags.push('reported');
  return { ...r, answers, rate, flags };
}

/** The worst cards first: most reports, then lowest rate. Cards with nothing wrong are left out. */
export function worstCards(
  rows: readonly CardStatsRow[],
  limit = 50,
): CardHealth[] {
  return rows
    .map(healthOf)
    .filter((h) => h.flags.length > 0)
    .sort(
      (a, b) =>
        b.reports - a.reports ||
        (a.rate ?? 1) - (b.rate ?? 1) ||
        b.answers - a.answers,
    )
    .slice(0, limit);
}
