import type { Board } from '@cortex/classroom';

/** Students learning on each of the last `n` days (oldest first), any app. */
export function activityByDay(board: Board, n = 7, now = Date.now()): { date: string; count: number }[] {
    const out: { date: string; count: number }[] = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(now - i * 86_400_000);
        const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        out.push({ date, count: board.students.filter((s) => s.days.includes(date)).length });
    }
    return out;
}
