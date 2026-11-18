/**
 * The F0 gate (docs/LEXICA_FSRS_MIGRATION_PLAN.md): from the weekly
 * `learner_model_week` events, does FSRS predict better than SM-2 for
 * enough learners to start F2?
 *
 * Pass when: ≥ 50 learners with ≥ 30 scored answers each, FSRS has the lower
 * mean log loss for ≥ 70% of them, and the 95% bootstrap interval of the
 * mean per-learner difference (SM-2 − FSRS) is above 0.
 */
export interface WeekEvent { learner: string; n: number; ll_fsrs: number; ll_sm2: number }

export interface GateResult {
    learners: number;
    fsrsWins: number;
    winShare: number;
    meanGain: number;
    ci: [number, number];
    pass: boolean;
}

export const MIN_LEARNERS = 50;
export const MIN_ANSWERS = 30;
export const MIN_WIN_SHARE = 0.7;

/** Per-learner mean log loss gain (SM-2 − FSRS; positive = FSRS better), for learners with enough answers. */
export function gains(events: readonly WeekEvent[]): number[] {
    const by = new Map<string, { n: number; f: number; s: number }>();
    for (const e of events) {
        const t = by.get(e.learner) ?? { n: 0, f: 0, s: 0 };
        t.n += e.n;
        t.f += e.ll_fsrs;
        t.s += e.ll_sm2;
        by.set(e.learner, t);
    }
    return [...by.values()].filter((t) => t.n >= MIN_ANSWERS).map((t) => (t.s - t.f) / t.n);
}

/** A small seeded random, so the interval is the same on every run. */
function rng(seed: number) {
    let x = seed >>> 0 || 1;
    return () => {
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        return (x >>> 0) / 2 ** 32;
    };
}

export function gate(events: readonly WeekEvent[], rounds = 2000): GateResult {
    const g = gains(events);
    const n = g.length;
    const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / (a.length || 1);
    const rand = rng(42);
    const means: number[] = [];
    for (let r = 0; r < rounds && n > 0; r++) means.push(mean(Array.from({ length: n }, () => g[Math.floor(rand() * n)])));
    means.sort((a, b) => a - b);
    const ci: [number, number] = n ? [means[Math.floor(rounds * 0.025)], means[Math.floor(rounds * 0.975)]] : [0, 0];
    const fsrsWins = g.filter((x) => x > 0).length;
    const winShare = n ? fsrsWins / n : 0;
    return {
        learners: n,
        fsrsWins,
        winShare,
        meanGain: mean(g),
        ci,
        pass: n >= MIN_LEARNERS && winShare >= MIN_WIN_SHARE && ci[0] > 0,
    };
}
