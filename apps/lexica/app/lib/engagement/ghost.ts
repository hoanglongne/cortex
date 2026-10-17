/**
 * "Đấu với chính mình hôm qua" (docs/LEXICA_ENGAGEMENT_SPEC.md §4). The best
 * review session of each day is kept on this device and replayed tomorrow as
 * a ghost. No server, no friends needed.
 */

export interface GhostRun {
    date: string; // YYYY-MM-DD, local time
    score: number;
    correct: number;
    total: number;
    durationMs: number;
    bestPot: number;
    /** [ms since start, 1 = correct / 0 = wrong], capped to keep storage small. */
    timeline: [number, 0 | 1][];
}

interface GhostStore {
    runs: Record<string, GhostRun>;
    wins: string[]; // dates the learner beat the previous day's best
}

const KEY = 'lexica-ghost-v1';
const KEEP_DAYS = 7;
const MAX_TIMELINE = 120;
export const WIN_STREAK_GOAL = 3;

export function localDate(ts = Date.now()): string {
    const d = new Date(ts);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function previousDate(date: string): string {
    const [y, m, d] = date.split('-').map(Number);
    return localDate(new Date(y, m - 1, d - 1, 12).getTime());
}

function read(): GhostStore {
    try {
        const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null;
        const parsed = raw ? (JSON.parse(raw) as Partial<GhostStore>) : {};
        return { runs: parsed.runs ?? {}, wins: parsed.wins ?? [] };
    } catch {
        return { runs: {}, wins: [] };
    }
}

function write(store: GhostStore) {
    try {
        localStorage.setItem(KEY, JSON.stringify(store));
    } catch {
        // Private mode or full storage: the ghost is a nice-to-have.
    }
}

const WEEKDAY = ['Chủ nhật', 'thứ Hai', 'thứ Ba', 'thứ Tư', 'thứ Năm', 'thứ Sáu', 'thứ Bảy'];

export interface Rival {
    run: GhostRun;
    date: string;
    /** "hôm qua" or "hôm thứ Ba", to put after "Bạn" / "Hơn bạn". */
    label: string;
    /** "Hôm qua" or "Thứ Ba", for the live line. */
    short: string;
}

function rivalIn(runs: Record<string, GhostRun>, today: string): Rival | null {
    let d = today;
    for (let i = 1; i <= KEEP_DAYS; i++) {
        d = previousDate(d);
        const run = runs[d];
        if (!run) continue;
        if (i === 1) return { run, date: d, label: 'hôm qua', short: 'Hôm qua' };
        const [y, m, day] = d.split('-').map(Number);
        const name = WEEKDAY[new Date(y, m - 1, day, 12).getDay()];
        return { run, date: d, label: `hôm ${name}`, short: name.charAt(0).toUpperCase() + name.slice(1) };
    }
    return null;
}

/**
 * Who to race: yesterday's best session, or else the most recent one in the
 * last 7 days ("Bạn hôm thứ Ba"). Null when there is none.
 */
export function getRival(today = localDate()): Rival | null {
    return rivalIn(read().runs, today);
}

/** Yesterday's best session, if there was one. */
export function getGhost(today = localDate()): GhostRun | null {
    return read().runs[previousDate(today)] ?? null;
}

/** How many questions the ghost had answered correctly by `elapsedMs`. */
export function ghostCorrectAt(run: GhostRun, elapsedMs: number): number {
    let n = 0;
    for (const [t, ok] of run.timeline) {
        if (t > elapsedMs) break;
        n += ok;
    }
    return n;
}

export interface GhostResult {
    beat: boolean | null; // null: no ghost to race
    scoreDiff: number;
    correctDiff: number;
    timeDiffMs: number;
    winStreak: number;
    /** True the moment the streak reaches the goal (reward hook). */
    streakReached: boolean;
}

function winStreakEnding(wins: string[], date: string): number {
    const set = new Set(wins);
    let n = 0;
    for (let d = date; set.has(d); d = previousDate(d)) n++;
    return n;
}

/** Saves the session (keeping the day's best) and compares it with yesterday. */
export function recordRun(run: Omit<GhostRun, 'timeline'> & { timeline: [number, 0 | 1][] }): GhostResult {
    const store = read();
    // Same rival as the live line: yesterday, else the latest run this week.
    const ghost = rivalIn(store.runs, run.date)?.run ?? null;
    const prevBest = store.runs[run.date];
    const trimmed = { ...run, timeline: run.timeline.slice(0, MAX_TIMELINE) };
    if (!prevBest || run.score > prevBest.score || (run.score === prevBest.score && run.correct > prevBest.correct)) {
        store.runs[run.date] = trimmed;
    }

    const beat = ghost ? run.score > ghost.score || (run.score === ghost.score && run.correct > ghost.correct) : null;
    const before = winStreakEnding(store.wins, run.date);
    if (beat && !store.wins.includes(run.date)) store.wins.push(run.date);
    const after = winStreakEnding(store.wins, run.date);

    const cutoff = (() => {
        let d = run.date;
        for (let i = 0; i < KEEP_DAYS; i++) d = previousDate(d);
        return d;
    })();
    for (const date of Object.keys(store.runs)) if (date < cutoff) delete store.runs[date];
    store.wins = store.wins.filter((d) => d >= cutoff);
    write(store);

    return {
        beat,
        scoreDiff: ghost ? run.score - ghost.score : 0,
        correctDiff: ghost ? run.correct - ghost.correct : 0,
        timeDiffMs: ghost ? ghost.durationMs - run.durationMs : 0,
        winStreak: after,
        streakReached: before < WIN_STREAK_GOAL && after >= WIN_STREAK_GOAL,
    };
}
