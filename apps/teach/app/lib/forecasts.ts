/**
 * W4 forecasts on the teacher's pages (docs/TEACH_PLAN.md 2.4): each class's
 * students run through packages/classroom-lexica/forecast.ts, then turned
 * into the "Hôm nay" to-do list, most urgent first. What the teacher marks
 * done stays hidden for a week. Pure, unit tested.
 */
import { LEXICA, classForecast, courseInput, forecastInput, studentForecast, type ClassForecast, type Forecast, type StudentForecast } from '@cortex/classroom-lexica';
import type { Board } from '@cortex/classroom';

/** Verified scores by student id (lexica_class_score_history). */
export type ScoreHistory = Record<string, { score: number; sd: number; at: string }[]>;

export interface StudentForecastRow {
    userId: string;
    name: string;
    forecast: StudentForecast;
}

/** Local "YYYY-MM-DD" of a time. */
export function localDay(t: number): string {
    const d = new Date(t);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** A review given to the student alone in the last week: no second "Giao ôn lại" until Lexica reports again. */
const REVIEW_FRESH_DAYS = 7;

export function recentReview(board: Board, userId: string, today: string) {
    const since = Date.parse(`${today}T00:00:00`) - REVIEW_FRESH_DAYS * 86_400_000;
    return board.assignments.find((a) => a.for_user === userId && a.app === LEXICA && Date.parse(a.created_at) >= since) ?? null;
}

/** Every student's forecasts in a class that uses Lexica; empty otherwise. */
export function boardForecasts(board: Board, history: ScoreHistory, today: string): StudentForecastRow[] {
    if (!board.class.apps.includes(LEXICA)) return [];
    const course = courseInput(board.class.settings[LEXICA]);
    return board.students.map((s) => {
        const forecast = studentForecast(forecastInput(s, history[s.user_id] ?? []), course, today);
        const given = recentReview(board, s.user_id, today);
        if (given) {
            const day = `${Number(given.created_at.slice(8, 10))}/${Number(given.created_at.slice(5, 7))}`;
            forecast.forecasts = forecast.forecasts.map((f) =>
                f.actions.some((a) => a.kind === 'assign_review')
                    ? { ...f, actions: f.actions.filter((a) => a.kind !== 'assign_review'), why: [...f.why, `Đã giao bài “${given.title}” cho em ngày ${day}; chờ em ôn xong.`] }
                    : f,
            );
        }
        return { userId: s.user_id, name: s.name, forecast };
    });
}

export function boardClassForecast(board: Board, rows: readonly StudentForecastRow[]): ClassForecast {
    return classForecast(rows, courseInput(board.class.settings[LEXICA]));
}

/** One line of "Hôm nay": a student, a forecast, what to do. */
export interface ForecastItem {
    /** Stable across days: class, student, kind (marking done hides it a week). */
    key: string;
    classId: string;
    className: string;
    userId: string;
    name: string;
    forecast: Forecast;
}

const RANK = { urgent: 0, watch: 1, good: 2, info: 3 } as const;

/**
 * Forecasts that need the teacher (urgent, watch) and the praise-worthy ones
 * (good), most urgent first, without what was marked done this week.
 */
export function forecastItems(boards: readonly Board[], histories: Record<string, ScoreHistory>, today: string, done: DoneMap, now: number): { todo: ForecastItem[]; good: ForecastItem[] } {
    const all: ForecastItem[] = [];
    for (const b of boards) {
        for (const row of boardForecasts(b, histories[b.class.id] ?? {}, today)) {
            for (const f of row.forecast.forecasts) {
                if (f.urgency === 'info') continue;
                const key = `${b.class.id}:${row.userId}:${f.kind}`;
                if (isDone(done, key, now)) continue;
                all.push({ key, classId: b.class.id, className: b.class.name, userId: row.userId, name: row.name, forecast: f });
            }
        }
    }
    all.sort((a, b) => RANK[a.forecast.urgency] - RANK[b.forecast.urgency] || a.name.localeCompare(b.name, 'vi'));
    return { todo: all.filter((i) => i.forecast.urgency !== 'good'), good: all.filter((i) => i.forecast.urgency === 'good') };
}

/** Students with a dropout forecast: the plain "chưa học hơn 3 ngày" line leaves them out. */
export function dropoutStudents(items: readonly ForecastItem[]): Set<string> {
    return new Set(items.filter((i) => i.forecast.kind === 'dropout').map((i) => `${i.classId}:${i.userId}`));
}

// ─── Marked done ──────────────────────────────────────────────────────────

/** Key → when it was marked done (ms). */
export type DoneMap = Record<string, number>;
export const DONE_DAYS = 7;
const DAY_MS = 86_400_000;

export const isDone = (done: DoneMap, key: string, now: number) => (done[key] ?? -Infinity) > now - DONE_DAYS * DAY_MS;

/** Marks one done and forgets entries older than a week. */
export function markDone(done: DoneMap, key: string, now: number): DoneMap {
    const out: DoneMap = {};
    for (const [k, t] of Object.entries(done)) if (t > now - DONE_DAYS * DAY_MS) out[k] = t;
    out[key] = now;
    return out;
}

/** The review a one-tap "Giao ôn lại" gives: these words only, due in 3 days. */
export function reviewAssignment(cardIds: readonly string[], today: string): { app: string; kind: string; title: string; payload: unknown; due: string } {
    const due = new Date(`${today}T12:00:00`);
    due.setDate(due.getDate() + 3);
    return {
        app: LEXICA,
        kind: 'words',
        title: `Ôn lại ${cardIds.length} từ`,
        payload: { card_ids: [...cardIds], missing_words: [], mode: 'only' },
        due: localDay(due.getTime()),
    };
}
