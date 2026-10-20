/**
 * Statistics from what the learner really did (app/stats): every action on
 * a word counts for its day (learning, a recall, reading, speaking, a word
 * met outside), the four steps over time, and what is due next. Pure, unit
 * tested.
 */
import { localDate } from './engagement/ghost';
import { STEPS, type Journeys, type StepCounts, type WordStep } from './journey/steps';
import type { UserCardProgress } from './eloAlgorithm';

export interface Activity {
    journeys: Journeys;
    studyHistory: Record<string, { swipes: number }>;
    daysDone: readonly string[];
    sightings: readonly { at: number }[];
    spokenAt: Record<string, number>;
    mySentences: Record<string, { at: number }>;
}

/** Actions per local date: words swiped or reviewed, steps reached, recalls, sentences, words met outside or spoken. */
export function actionsByDay(a: Activity): Map<string, number> {
    const out = new Map<string, number>();
    const add = (date: string, n = 1) => out.set(date, (out.get(date) ?? 0) + n);
    for (const [date, h] of Object.entries(a.studyHistory)) if (h.swipes > 0) add(date, h.swipes);
    for (const j of Object.values(a.journeys)) {
        for (const t of [j.metAt, j.usedAt, j.livedAt]) if (t) add(localDate(t));
    }
    for (const s of a.sightings) add(localDate(s.at));
    for (const t of Object.values(a.spokenAt)) add(localDate(t));
    for (const s of Object.values(a.mySentences)) add(localDate(s.at));
    // A finished Today session is a day of study even if nothing above was logged that day.
    for (const d of a.daysDone) if (!out.has(d)) add(d);
    return out;
}

/** The local date `n` days before `date`. */
export function daysBefore(date: string, n: number): string {
    const [y, m, d] = date.split('-').map(Number);
    return localDate(new Date(y, m - 1, d - n, 12).getTime());
}

export interface Window {
    days: number;
    activeDays: number;
    reached: StepCounts;
}

/** Words that reached each step within [from, to] (local dates, inclusive). */
export function reachedBetween(journeys: Journeys, from: string, to: string): StepCounts {
    const out: StepCounts = { hieu: 0, nho: 0, gap: 0, dung: 0 };
    const at: Record<WordStep, (j: Journeys[string]) => number | undefined> = {
        hieu: (j) => j.understoodAt,
        nho: (j) => j.rememberedAt,
        gap: (j) => j.metAt,
        dung: (j) => j.usedAt,
    };
    for (const j of Object.values(journeys)) {
        for (const step of STEPS) {
            const t = at[step](j);
            if (!t) continue;
            const d = localDate(t);
            if (d >= from && d <= to) out[step]++;
        }
    }
    return out;
}

/** The last 7 days and the 7 before them, for "this week vs last week". */
export function weeks(journeys: Journeys, actions: Map<string, number>, today: string): { now: Window; before: Window } {
    const win = (end: string): Window => {
        const start = daysBefore(end, 6);
        let activeDays = 0;
        for (let i = 0; i < 7; i++) if ((actions.get(daysBefore(end, i)) ?? 0) > 0) activeDays++;
        return { days: 7, activeDays, reached: reachedBetween(journeys, start, end) };
    };
    return { now: win(today), before: win(daysBefore(today, 7)) };
}

/** `weeks` columns of 7 days ending today (Monday first), oldest column first; future days are null. */
export function calendar(actions: Map<string, number>, today: string, weeksBack = 12): ({ date: string; n: number } | null)[][] {
    const [y, m, d] = today.split('-').map(Number);
    const dow = (new Date(y, m - 1, d, 12).getDay() + 6) % 7; // 0 = Monday
    const lastMonday = daysBefore(today, dow);
    const cols: ({ date: string; n: number } | null)[][] = [];
    for (let w = weeksBack - 1; w >= 0; w--) {
        const monday = daysBefore(lastMonday, w * 7);
        const col = [];
        for (let i = 0; i < 7; i++) {
            const date = daysBefore(monday, -i);
            col.push(date > today ? null : { date, n: actions.get(date) ?? 0 });
        }
        cols.push(col);
    }
    return cols;
}

/** 0 none, then 1–4 by quartiles of the learner's own active days, so the scale fits them. */
export function intensity(n: number, all: readonly number[]): 0 | 1 | 2 | 3 | 4 {
    if (n <= 0) return 0;
    const active = all.filter((x) => x > 0).sort((a, b) => a - b);
    if (active.length < 4) return 2;
    const q = (p: number) => active[Math.min(active.length - 1, Math.floor(p * active.length))];
    return n <= q(0.25) ? 1 : n <= q(0.5) ? 2 : n <= q(0.75) ? 3 : 4;
}

/** Each step's count on each of the last `days` days, from the end-of-day snapshots (gaps carry the last value). */
export function stepSeries(history: Record<string, StepCounts>, current: StepCounts, today: string, days = 30): { date: string; counts: StepCounts }[] {
    const dates = Object.keys(history).sort();
    const out: { date: string; counts: StepCounts }[] = [];
    let last: StepCounts = { hieu: 0, nho: 0, gap: 0, dung: 0 };
    let k = 0;
    for (let i = days - 1; i >= 0; i--) {
        const date = daysBefore(today, i);
        while (k < dates.length && dates[k] <= date) last = history[dates[k++]];
        out.push({ date, counts: date === today ? current : last });
    }
    return out;
}

/** Reviews due on each of the next `days` days (today includes overdue ones). */
export function dueForecast(progress: Record<string, Pick<UserCardProgress, 'nextReviewAt'>>, now: number, days = 7): { date: string; n: number }[] {
    const today = localDate(now);
    const out = Array.from({ length: days }, (_, i) => ({ date: daysBefore(today, -i), n: 0 }));
    for (const p of Object.values(progress)) {
        const d = p.nextReviewAt <= now ? today : localDate(p.nextReviewAt);
        const slot = out.find((o) => o.date === d);
        if (slot) slot.n++;
    }
    return out;
}

export const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
