import { normalize, similarity } from './validator';

/** Signals whose phrase is this similar to a live trend join it (spec §5.2). */
export const CLUSTER_THRESHOLD = 0.55;
/** A trend stays "live" for clustering this long after its last signal. */
export const LIVE_DAYS = 14;
const HALF_LIFE_DAYS = 5;
const DAY_MS = 86_400_000;

export interface SignalLite {
  id: number;
  source_id: string;
  phrase: string;
  metric: number;
  seen_at: string;
}

export interface TrendLite {
  id: string;
  label: string;
}

/** Drops noise: too short, only digits/punctuation, or blocked people/topics. */
export function isUsefulPhrase(phrase: string): boolean {
  const p = normalize(phrase);
  const words = p.split(' ').filter((w) => /\p{L}/u.test(w));
  return words.length >= 2 && p.length >= 6;
}

/**
 * Assigns each signal to the most similar live trend, or groups it with
 * other new signals into a new trend. Returns the assignment plan; the
 * caller writes it.
 */
export function clusterSignals(
  signals: SignalLite[],
  live: TrendLite[],
): {
  attach: { trendId: string; signalIds: number[] }[];
  create: { label: string; signalIds: number[] }[];
} {
  const attach = new Map<string, number[]>();
  const fresh: { label: string; signalIds: number[] }[] = [];

  for (const s of signals) {
    if (!isUsefulPhrase(s.phrase)) continue;
    let best: { id: string; score: number } | null = null;
    for (const t of live) {
      const score = similarity(t.label, s.phrase);
      if (score >= CLUSTER_THRESHOLD && (!best || score > best.score)) {
        best = { id: t.id, score };
      }
    }
    if (best) {
      attach.set(best.id, [...(attach.get(best.id) ?? []), s.id]);
      continue;
    }
    const group = fresh.find(
      (g) => similarity(g.label, s.phrase) >= CLUSTER_THRESHOLD,
    );
    if (group) group.signalIds.push(s.id);
    else fresh.push({ label: s.phrase, signalIds: [s.id] });
  }

  return {
    attach: [...attach.entries()].map(([trendId, signalIds]) => ({
      trendId,
      signalIds,
    })),
    create: fresh,
  };
}

export interface HotnessInput {
  signals: { source_id: string; metric: number; seen_at: string }[];
  firstSeenAt: string;
  sourceWeights: Record<string, number>;
  /** 0.8..1.2 from card performance of the trend's tags (spec §5.8). */
  feedbackBoost: number;
  now: number;
}

/**
 * hotness = log(1 + signals) × (1 + 0.5 × (sources − 1)) × velocity
 *         × avg(weight × metric) × decay(age) × feedbackBoost      (spec §5.3)
 */
export function hotness(input: HotnessInput): number {
  const { signals, now } = input;
  if (signals.length === 0) return 0;
  const sources = new Set(signals.map((s) => s.source_id)).size;
  const last24 = signals.filter(
    (s) => now - Date.parse(s.seen_at) <= DAY_MS,
  ).length;
  const prev24 = signals.filter((s) => {
    const age = now - Date.parse(s.seen_at);
    return age > DAY_MS && age <= 2 * DAY_MS;
  }).length;
  const velocity = Math.min(3, (last24 + 1) / (prev24 + 1));
  const quality =
    signals.reduce(
      (sum, s) => sum + (input.sourceWeights[s.source_id] ?? 1) * s.metric,
      0,
    ) / signals.length;
  const ageDays = Math.max(0, (now - Date.parse(input.firstSeenAt)) / DAY_MS);
  const decay = Math.pow(0.5, ageDays / HALF_LIFE_DAYS);
  return (
    Math.log(1 + signals.length) *
    (1 + 0.5 * (sources - 1)) *
    velocity *
    quality *
    decay *
    input.feedbackBoost
  );
}
