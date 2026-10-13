/**
 * "Liều hay Dừng" (docs/LEXICA_ENGAGEMENT_SPEC.md §3). Review only: every
 * question is a word the learner already studied.
 *
 * Each correct answer adds points to the pot at the current multiplier and
 * climbs one step. After a correct answer the learner banks the pot (Chốt)
 * or keeps going with a harder word (Liều). A wrong answer empties the pot;
 * banked points are never lost.
 */

export const LADDER = [1, 1.5, 2, 3, 5] as const;
export const BASE_POINTS = 10;

export interface RiskState {
    banked: number;
    pot: number;
    step: number;
    bestPot: number;
}

export const initialRisk = (): RiskState => ({ banked: 0, pot: 0, step: 0, bestPot: 0 });

export const multiplier = (state: RiskState) => LADDER[Math.min(state.step, LADDER.length - 1)];

/** `shielded`: a wrong answer on a word with a shield keeps the pot. */
export function answer(state: RiskState, correct: boolean, shielded = false): RiskState {
    if (correct) {
        const pot = state.pot + Math.round(BASE_POINTS * multiplier(state));
        return {
            ...state,
            pot,
            step: Math.min(state.step + 1, LADDER.length - 1),
            bestPot: Math.max(state.bestPot, pot),
        };
    }
    if (shielded) return state;
    return { ...state, pot: 0, step: 0 };
}

/** Chốt: the pot moves to the banked score and a new pot starts at x1. */
export function bank(state: RiskState): RiskState {
    return { ...state, banked: state.banked + state.pot, pot: 0, step: 0 };
}

/** Score if the session ended now (leaving or running out = auto-bank). */
export const total = (state: RiskState) => state.banked + state.pot;

/**
 * Index of the next question. After Liều, the easiest word that is harder
 * than the last one (or the hardest left); otherwise keep the order.
 */
export function pickNext(remaining: { elo: number }[], lastElo: number, risky: boolean): number {
    if (remaining.length === 0) return -1;
    if (!risky) return 0;
    let harder = -1;
    let hardest = 0;
    remaining.forEach((q, i) => {
        if (q.elo > lastElo && (harder === -1 || q.elo < remaining[harder].elo)) harder = i;
        if (q.elo > remaining[hardest].elo) hardest = i;
    });
    return harder === -1 ? hardest : harder;
}
