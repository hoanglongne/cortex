/**
 * FSRS-4.5 memory model (issue #143), pure. A memory has a stability S (days
 * until recall probability falls to 90%) and a difficulty D (1–10).
 * Formulas and default weights follow the published FSRS-4.5 scheduler;
 * the weights are the library defaults, not fitted to Lexica learners yet.
 */
export const FSRS_WEIGHTS = [
    0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474, 0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755,
] as const;

const DECAY = -0.5;
const FACTOR = 19 / 81;
const DAY_MS = 86_400_000;

/** 1 again, 2 hard, 3 good, 4 easy. */
export type Rating = 1 | 2 | 3 | 4;

export interface Memory {
    /** Stability in days. */
    s: number;
    /** Difficulty 1–10. */
    d: number;
    /** Last review (ms). */
    last: number;
    reps: number;
    lapses: number;
}

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
const w = FSRS_WEIGHTS;

/** Probability of recall after `days`. */
export function retrievability(m: Pick<Memory, 's' | 'last'>, now: number): number {
    const days = Math.max(0, (now - m.last) / DAY_MS);
    return Math.pow(1 + (FACTOR * days) / m.s, DECAY);
}

/** Days until recall probability falls to `retention`. */
export function intervalDays(s: number, retention = 0.9): number {
    return (s / FACTOR) * (Math.pow(retention, 1 / DECAY) - 1);
}

const initD = (r: Rating) => clamp(w[4] - (r - 3) * w[5], 1, 10);

export function firstReview(r: Rating, now: number): Memory {
    return { s: w[r - 1], d: initD(r), last: now, reps: 1, lapses: r === 1 ? 1 : 0 };
}

export function review(m: Memory, r: Rating, now: number): Memory {
    const R = retrievability(m, now);
    const dNext = clamp(w[7] * initD(4) + (1 - w[7]) * (m.d - w[6] * (r - 3)), 1, 10);
    let s: number;
    if (r === 1) {
        s = w[11] * Math.pow(m.d, -w[12]) * (Math.pow(m.s + 1, w[13]) - 1) * Math.exp(w[14] * (1 - R));
        s = Math.min(s, m.s);
    } else {
        const hard = r === 2 ? w[15] : 1;
        const easy = r === 4 ? w[16] : 1;
        s = m.s * (Math.exp(w[8]) * (11 - m.d) * Math.pow(m.s, -w[9]) * (Math.exp(w[10] * (1 - R)) - 1) * hard * easy + 1);
    }
    return { s: Math.max(0.1, s), d: dNext, last: now, reps: m.reps + 1, lapses: m.lapses + (r === 1 ? 1 : 0) };
}
