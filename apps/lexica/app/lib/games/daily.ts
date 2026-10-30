/**
 * The daily game goal: play one round today. A side goal next to the Today
 * session, it never touches the streak. Kept for 14 days. Pure, unit tested.
 */
export const GAME_GOAL = 1;
const KEEP_DAYS = 14;

export type GameLog = Record<string, { plays: number; best: number }>;

export function addPlay(log: GameLog, date: string, score: number): GameLog {
    const day = log[date] ?? { plays: 0, best: 0 };
    const next = { ...log, [date]: { plays: day.plays + 1, best: Math.max(day.best, score) } };
    const keep = Object.keys(next).sort().slice(-KEEP_DAYS);
    return Object.fromEntries(keep.map((d) => [d, next[d]]));
}

export const playsOn = (log: GameLog, date: string): number => log[date]?.plays ?? 0;

export const goalMet = (log: GameLog, date: string): boolean => playsOn(log, date) >= GAME_GOAL;

/** Plays and best score over the 7 days ending `today` (YYYY-MM-DD). */
export function weekSummary(log: GameLog, today: string): { plays: number; best: number; days: number } {
    const [y, m, d] = today.split('-').map(Number);
    const dates = Array.from({ length: 7 }, (_, i) => {
        const t = new Date(y, m - 1, d - i);
        return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    });
    let plays = 0;
    let best = 0;
    let days = 0;
    for (const date of dates) {
        const e = log[date];
        if (!e) continue;
        plays += e.plays;
        best = Math.max(best, e.best);
        days++;
    }
    return { plays, best, days };
}
