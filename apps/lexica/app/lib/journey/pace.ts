/**
 * Free choice of the daily pace, the 30-day preview and the nudge to lower it
 * when the learner keeps falling short. Pure functions, unit tested.
 */
import type { StepCounts } from './steps';

export const PACE_MIN = 3;
export const PACE_MAX = 40;
/** Quick picks next to the slider. */
export const PACE_PRESETS = [5, 10, 15, 20, 30] as const;
/** Look at this many past days when judging whether the pace fits. */
export const NUDGE_WINDOW = 7;
/** A day counts as "short" below this share of the pace. */
const SHORT_SHARE = 0.8;
/** How many short days in the window trigger the nudge. */
const SHORT_DAYS = 4;

export function clampPace(n: number): number {
    return Math.min(PACE_MAX, Math.max(PACE_MIN, Math.round(Number.isFinite(n) ? n : PACE_MIN)));
}

/** Rough minutes for a full session at this pace (10 → 10, 15 → 13). */
export function sessionMinutes(pace: number): number {
    return Math.round(4 + pace * 0.6);
}

/** Cumulative new words on each of the 30 days at this pace. */
export function projection(pace: number, days = 30): number[] {
    return Array.from({ length: days }, (_, i) => pace * (i + 1));
}

/** The local date `n` days before `date` (YYYY-MM-DD). */
function shift(date: string, n: number): string {
    const [y, m, d] = date.split('-').map(Number);
    const t = new Date(y, m - 1, d - n);
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

/**
 * New words per day for the window ending the day before `today`, oldest first.
 * Taken from how the Hiểu count grew between snapshots; a day with no snapshot
 * and no growth counts as 0. Null for days before the first snapshot.
 */
export function dailyNewWords(history: Record<string, StepCounts>, today: string, days = NUDGE_WINDOW): (number | null)[] {
    const dates = Object.keys(history).sort();
    if (!dates.length) return Array.from({ length: days }, () => null);
    const first = dates[0];
    const hieuAt = (date: string): number => {
        let last = 0;
        for (const d of dates) {
            if (d <= date) last = history[d].hieu;
            else break;
        }
        return last;
    };
    return Array.from({ length: days }, (_, i) => {
        const date = shift(today, days - i);
        if (date < first) return null;
        return Math.max(0, hieuAt(date) - hieuAt(shift(date, 1)));
    });
}

export interface PaceNudge {
    /** Average new words per day over the window. */
    average: number;
    /** The pace we suggest. */
    suggested: number;
    shortDays: number;
}

/**
 * Suggest a lower pace when at least 4 of the last 7 days were under 80% of the
 * target. The suggestion is the average, rounded up, never below the minimum
 * and never above the current pace. Null when the pace fits or there is too
 * little history (fewer than 5 known days).
 */
export function paceNudge(pace: number, history: Record<string, StepCounts>, today: string): PaceNudge | null {
    if (pace <= PACE_MIN) return null;
    const known = dailyNewWords(history, today).filter((n): n is number => n !== null);
    if (known.length < 5) return null;
    const shortDays = known.filter((n) => n < pace * SHORT_SHARE).length;
    if (shortDays < SHORT_DAYS) return null;
    const average = known.reduce((a, b) => a + b, 0) / known.length;
    const suggested = Math.max(PACE_MIN, Math.ceil(average));
    if (suggested >= pace) return null;
    return { average: Math.round(average * 10) / 10, suggested, shortDays };
}

/** True while the last answer to the suggestion is under a week old. */
export function nudgeQuiet(answeredAt: string | null, today: string): boolean {
    return Boolean(answeredAt) && answeredAt! > shift(today, NUDGE_WINDOW);
}
