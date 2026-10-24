/**
 * When to suggest another level (docs/FEEDBACK_PLAN.md, Đợt 11): from how
 * often the learner recalls words right in review, not from swipes. Only a
 * suggestion on Home; the learner decides on /level-select.
 */
import type { UserCardProgress } from '../eloAlgorithm';

export type LevelHint = { kind: 'up' | 'down'; rate: number; recalls: number };

const DAY_MS = 86_400_000;
/** Look at words reviewed in this window. */
export const HINT_WINDOW_DAYS = 14;
/** Enough answers to say anything. */
export const HINT_MIN_RECALLS = 40;
export const HINT_UP = 0.85;
export const HINT_DOWN = 0.5;

/**
 * Right / all recalls over words reviewed in the last two weeks. A word's
 * first "learned" swipe is counted as a right answer in reviewCount, so it
 * is left out: only answers after the first one count.
 */
export function levelHint(progress: Record<string, UserCardProgress>, now: number): LevelHint | null {
    let right = 0;
    let wrong = 0;
    for (const p of Object.values(progress)) {
        if (now - p.lastReviewedAt > HINT_WINDOW_DAYS * DAY_MS) continue;
        right += Math.max(0, p.reviewCount - 1);
        wrong += p.wrongCount;
    }
    const recalls = right + wrong;
    if (recalls < HINT_MIN_RECALLS) return null;
    const rate = right / recalls;
    if (rate >= HINT_UP) return { kind: 'up', rate, recalls };
    if (rate < HINT_DOWN) return { kind: 'down', rate, recalls };
    return null;
}
