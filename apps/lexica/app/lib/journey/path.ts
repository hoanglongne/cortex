/**
 * The 30-day path (docs/LEXICA_DIRECTION.md): a branch, a pace, and a day
 * count that only moves on days the Today session is finished. Missing a day
 * moves the path along, nothing is lost. Checkpoints on days 7, 14, 21, and
 * a 30-word test on day 30. Pure functions, unit tested.
 */
import type { DifficultyLevel } from '../../types/vocab';
import type { Journeys, StepCounts } from './steps';

export type Branch = 'cert' | 'talk';

export const BRANCH_LABEL: Record<Branch, string> = { cert: 'Chứng chỉ', talk: 'Giao tiếp' };
export const BRANCH_HINT: Record<Branch, string> = {
    cert: 'Từ học thuật cho IELTS: đọc hiểu, viết, nói Part 1',
    talk: 'Cụm từ đời thường: đi làm, du lịch, nói chuyện với người nước ngoài',
};

export const PATH_DAYS = 30;
export const CHECKPOINTS = [7, 14, 21, 30] as const;
export const PACES = [10, 15] as const;

export interface LearningPath {
    branch: Branch;
    /** New words per day. 0 in maintenance mode (review and reading only). */
    pace: number;
    level: DifficultyLevel;
    /** Local date the path started. */
    startDate: string;
    /** Checkpoint days already shown. */
    seen: number[];
    /** Set when the day-30 test is done. */
    finished?: { date: string; score: number; total: number; counts: StepCounts };
}

/** Days of this path with a finished Today session, oldest first. */
export function pathDays(path: Pick<LearningPath, 'startDate'>, daysDone: readonly string[]): string[] {
    return [...new Set(daysDone)].filter((d) => d >= path.startDate).sort().slice(0, PATH_DAYS);
}

/** "Ngày 12/30": the day being worked on (or just finished today). */
export function currentDay(path: Pick<LearningPath, 'startDate'>, daysDone: readonly string[], today: string): number {
    const days = pathDays(path, daysDone);
    const doneToday = days.includes(today);
    return Math.min(PATH_DAYS, days.length + (doneToday ? 0 : 1));
}

/** The checkpoint to show now: reached and not seen yet. */
export function dueCheckpoint(path: Pick<LearningPath, 'startDate' | 'seen' | 'finished'>, daysDone: readonly string[]): number | null {
    const n = pathDays(path, daysDone).length;
    if (path.finished) return null;
    return CHECKPOINTS.find((c) => n >= c && !path.seen.includes(c)) ?? null;
}

/** What the promise says after `day` days at this pace (Nhớ), and the end goal. */
export function expectedBy(pace: number, day: number): { nho: number; goal: number } {
    return { nho: pace * Math.min(day, PATH_DAYS), goal: pace * PATH_DAYS };
}

/** Each of the 30 days: done, today, or still ahead. */
export function pathCells(path: Pick<LearningPath, 'startDate'>, daysDone: readonly string[], today: string): ('done' | 'today' | 'ahead')[] {
    const days = pathDays(path, daysDone);
    const day = currentDay(path, daysDone, today);
    return Array.from({ length: PATH_DAYS }, (_, i) => (i < days.length ? 'done' : i === day - 1 ? 'today' : 'ahead'));
}

/**
 * Words for the day-30 test: understood since the path started, mixed by a
 * seeded shuffle so a reload gives the same test.
 */
export function finalTestWords(journeys: Journeys, startMs: number, n = 30, seed = 1): string[] {
    const ids = Object.entries(journeys)
        .filter(([, j]) => j.understoodAt >= startMs)
        .map(([id]) => id)
        .sort();
    let x = seed || 1;
    const rand = () => {
        x = (x * 16807) % 2147483647;
        return x / 2147483647;
    };
    for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    return ids.slice(0, n);
}

/** Words most often forgotten, for the checkpoint ("5 từ hay sai nhất"). */
export function mostMissed(progress: Record<string, { wrongCount: number } | undefined>, n = 5): string[] {
    return Object.entries(progress)
        .filter(([, p]) => (p?.wrongCount ?? 0) > 0)
        .sort(([a, x], [b, y]) => (y?.wrongCount ?? 0) - (x?.wrongCount ?? 0) || a.localeCompare(b))
        .slice(0, n)
        .map(([id]) => id);
}

/** The share line for the end of the path: "30 ngày: 300 từ Nhớ, 128 từ Dùng". */
export function finishLine(counts: StepCounts): string {
    return `30 ngày với Lexica: ${counts.nho} từ Nhớ, ${counts.dung} từ Dùng`;
}

const NEXT_LEVEL: Record<DifficultyLevel, DifficultyLevel | null> = {
    beginner: 'intermediate',
    intermediate: 'advanced',
    advanced: 'expert',
    expert: null,
};

export function nextLevel(level: DifficultyLevel): DifficultyLevel | null {
    return NEXT_LEVEL[level];
}
