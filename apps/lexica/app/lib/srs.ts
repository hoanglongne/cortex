/**
 * Per-word review schedule (a small SM-2): every word keeps its own ease and
 * interval, so words you recall easily drift out to weeks and months while
 * the shaky ones stay close. Replaces the fixed 1/3/7/14-day ladder.
 *
 * Quality of a right answer:
 * - hard: recalled only after seeing the meaning (the deck's retest)
 * - good: recalled
 * - easy: recalled fast (review answered with most of the timer left)
 * Pure, unit tested.
 */

export type Quality = 'hard' | 'good' | 'easy';

export const DAY_MS = 24 * 60 * 60 * 1000;
export const DEFAULT_EASE = 2.5;
const MIN_EASE = 1.3;
const MAX_EASE = 3.0;
export const MAX_INTERVAL_DAYS = 180;

export interface Schedule {
    ease: number;
    /** Days until the next review. */
    intervalDays: number;
    /** Right answers in a row. */
    streak: number;
}

/** The fields a card's progress carries; older saves lack the optional ones. */
export interface ScheduleFields {
    lastReviewedAt: number;
    nextReviewAt: number;
    reviewCount: number;
    ease?: number;
    intervalDays?: number;
    streak?: number;
}

/** A card's schedule, reconstructing it for progress saved before per-word scheduling. */
export function currentSchedule(p: ScheduleFields | undefined): Schedule {
    if (!p) return { ease: DEFAULT_EASE, intervalDays: 0, streak: 0 };
    const intervalDays = p.intervalDays ?? Math.max(0, Math.round((p.nextReviewAt - p.lastReviewedAt) / DAY_MS));
    const streak = p.streak ?? (intervalDays >= 3 ? 2 : p.reviewCount > 0 && intervalDays >= 1 ? 1 : 0);
    return { ease: p.ease ?? DEFAULT_EASE, intervalDays, streak };
}

/** The schedule after one answer. */
export function nextSchedule(prev: Schedule, correct: boolean, quality: Quality = 'good'): Schedule {
    if (!correct) {
        return { ease: clamp(prev.ease - 0.2, MIN_EASE, MAX_EASE), intervalDays: 1, streak: 0 };
    }
    const ease = clamp(prev.ease + (quality === 'easy' ? 0.15 : quality === 'hard' ? -0.15 : 0), MIN_EASE, MAX_EASE);
    const streak = prev.streak + 1;
    let intervalDays: number;
    if (streak === 1) {
        intervalDays = quality === 'easy' ? 2 : 1;
    } else if (streak === 2) {
        intervalDays = quality === 'hard' ? 2 : quality === 'easy' ? 4 : 3;
    } else {
        const factor = quality === 'hard' ? 1.2 : quality === 'easy' ? ease * 1.3 : ease;
        intervalDays = Math.max(prev.intervalDays + 1, Math.round(prev.intervalDays * factor));
    }
    return { ease, intervalDays: Math.min(intervalDays, MAX_INTERVAL_DAYS), streak };
}

/** "mai", "3 ngày", "2 tuần", "3 tháng". */
export function formatInterval(days: number): string {
    if (days <= 1) return 'mai';
    if (days < 14) return `${days} ngày`;
    if (days < 60) return `${Math.round(days / 7)} tuần`;
    return `${Math.round(days / 30)} tháng`;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(n * 100) / 100));
