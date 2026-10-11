import type { Lifecycle } from './studio.types';

/** Aggregated learner events for one card (studio_card_metrics). */
export interface CardMetrics {
  card_id: string;
  impressions: number;
  reveals: number;
  known: number;
  unknown: number;
  shares: number;
  reports: number;
  review_correct: number;
  review_wrong: number;
}

export const THRESHOLDS = {
  promoteImpressions: 200,
  promoteShareRate: 0.02,
  promoteReviewAccuracy: 0.6,
  minReviews: 20,
  hardMinSwipes: 300,
  hardUnknownRate: 0.85,
  reportsToHide: 3,
};

export function shareRate(m: CardMetrics): number {
  return m.impressions > 0 ? m.shares / m.impressions : 0;
}

export function reviewAccuracy(m: CardMetrics): number | null {
  const n = m.review_correct + m.review_wrong;
  return n >= THRESHOLDS.minReviews ? m.review_correct / n : null;
}

export interface LifecycleDecision {
  cardId: string;
  lifecycle?: Lifecycle;
  addFlags: string[];
}

/**
 * Daily lifecycle rules (spec §5.8):
 * - well-liked or well-remembered trend cards become evergreen
 * - trend cards whose drop ended are retired (learners keep them)
 * - 3+ reports hide a card and flag it for an editor
 * - cards almost nobody knows get flagged as too hard / unclear
 */
export function decideLifecycle(
  card: {
    id: string;
    lifecycle: Lifecycle;
    flags: string[];
    dropExpired: boolean;
  },
  m: CardMetrics | undefined,
): LifecycleDecision | null {
  const addFlags: string[] = [];
  let lifecycle: Lifecycle | undefined;

  if (m && m.reports >= THRESHOLDS.reportsToHide) {
    if (card.lifecycle !== 'retired') lifecycle = 'retired';
    addFlags.push('reported');
  } else if (card.lifecycle === 'trend') {
    const acc = m ? reviewAccuracy(m) : null;
    const liked =
      !!m &&
      m.impressions >= THRESHOLDS.promoteImpressions &&
      (shareRate(m) >= THRESHOLDS.promoteShareRate ||
        (acc !== null && acc >= THRESHOLDS.promoteReviewAccuracy));
    if (liked) lifecycle = 'evergreen';
    else if (card.dropExpired) lifecycle = 'retired';
  }

  if (m) {
    const swipes = m.known + m.unknown;
    if (
      swipes >= THRESHOLDS.hardMinSwipes &&
      m.unknown / swipes > THRESHOLDS.hardUnknownRate
    ) {
      addFlags.push('too_hard');
    }
  }

  const newFlags = addFlags.filter((f) => !card.flags.includes(f));
  if (!lifecycle && newFlags.length === 0) return null;
  return {
    cardId: card.id,
    ...(lifecycle ? { lifecycle } : {}),
    addFlags: newFlags,
  };
}

/**
 * Tag performance vs. the average card over the last 30 days, clamped to
 * 0.8..1.2, so trends similar to ones learners liked rank higher.
 */
export function feedbackBoosts(
  cards: { tags: string[]; metrics: CardMetrics }[],
): Record<string, number> {
  const score = (m: CardMetrics) =>
    shareRate(m) * 10 + (reviewAccuracy(m) ?? 0.5);
  const rated = cards.filter((c) => c.metrics.impressions >= 50);
  if (rated.length === 0) return {};
  const avg = rated.reduce((s, c) => s + score(c.metrics), 0) / rated.length;
  if (avg <= 0) return {};
  const byTag = new Map<string, number[]>();
  for (const c of rated) {
    for (const t of c.tags) {
      byTag.set(t, [...(byTag.get(t) ?? []), score(c.metrics)]);
    }
  }
  const out: Record<string, number> = {};
  for (const [tag, scores] of byTag) {
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    out[tag] = Math.min(1.2, Math.max(0.8, mean / avg));
  }
  return out;
}

export function boostFor(
  tags: string[],
  boosts: Record<string, number>,
): number {
  const known = tags.map((t) => boosts[t]).filter((b) => b !== undefined);
  return known.length ? known.reduce((a, b) => a + b, 0) / known.length : 1;
}
