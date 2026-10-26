import { describe, expect, it } from 'vitest';
import type { Board, BoardStudent } from '@cortex/classroom';
import { boardForecasts, DONE_DAYS, dropoutStudents, forecastItems, isDone, markDone, reviewAssignment } from '../app/lib/forecasts';

const NOW = Date.UTC(2026, 9, 25, 5);
const TODAY = '2026-10-25';
const ago = (n: number) => new Date(Date.UTC(2026, 9, 25 - n)).toISOString().slice(0, 10);

const student = (id: string, name: string, review: object | null, days: string[]): BoardStudent => ({
    user_id: id,
    name,
    joined_at: `${ago(40)}T00:00:00Z`,
    note: null,
    streak: 0,
    last_active: null,
    inactive_days: null,
    days,
    apps: review ? { lexica: { metrics: { counts: {}, review }, last_active: null, week_ago: null, week_first: null } } : {},
});

const steady = [0, 1, 2, 3, 7, 8, 9, 10, 14, 15, 16, 21, 22, 23].map(ago);
const board = (apps = ['lexica']): Board => ({
    class: { id: 'c1', name: 'Lớp A', code: 'X', apps, settings: {}, leaderboard: false, leaderboard_app: null, org_id: null, org: null, created_at: '' },
    assignments: [],
    students: [
        student('u1', 'An', { overdue: 30, due7: 0, recall14: [0, 0], atRisk: ['v1'] }, steady),
        student('u2', 'Bình', { overdue: 0, due7: 0, recall14: [48, 50], atRisk: [] }, steady),
        student('u3', 'Chi', { overdue: 6, due7: 0, recall14: [0, 0], atRisk: [] }, [ago(8)]),
    ],
});

describe('the Hôm nay list from forecasts', () => {
    it('lists urgent first, keeps praise apart, skips classes without Lexica', () => {
        const { todo, good } = forecastItems([board()], {}, TODAY, {}, NOW);
        expect(todo.map((i) => `${i.name}:${i.forecast.kind}:${i.forecast.urgency}`)).toEqual(['An:forget:urgent', 'Chi:dropout:urgent', 'Chi:forget:watch']);
        expect(good.map((i) => i.name)).toEqual(['Bình']);
        expect(dropoutStudents(todo)).toEqual(new Set(['c1:u3']));
        expect(boardForecasts(board(['oratio']), {}, TODAY)).toEqual([]);
    });

    it('hides what was marked done for a week', () => {
        const done = markDone({ old: NOW - 9 * 86_400_000 }, 'c1:u1:forget', NOW);
        expect(done).toEqual({ 'c1:u1:forget': NOW });
        expect(forecastItems([board()], {}, TODAY, done, NOW).todo.map((i) => i.key)).not.toContain('c1:u1:forget');
        expect(isDone(done, 'c1:u1:forget', NOW + (DONE_DAYS - 1) * 86_400_000)).toBe(true);
        expect(isDone(done, 'c1:u1:forget', NOW + DONE_DAYS * 86_400_000)).toBe(false);
    });

    it('offers no second review while one given this week is open', () => {
        const b = board();
        b.assignments = [{ id: 'a', app: 'lexica', kind: 'words', title: 'Ôn lại 1 từ', payload: {}, due_on: null, created_at: '2026-10-24T10:00:00Z', for_user: 'u1' }];
        const f = boardForecasts(b, {}, TODAY).find((r) => r.userId === 'u1')!.forecast.forecasts.find((x) => x.kind === 'forget')!;
        expect(f.actions.map((a) => a.kind)).toEqual(['message']);
        expect(f.why.at(-1)).toBe('Đã giao bài “Ôn lại 1 từ” cho em ngày 24/10; chờ em ôn xong.');
    });

    it('gives a review of exactly the words at risk, due in 3 days', () => {
        expect(reviewAssignment(['v1', 'v2'], TODAY)).toEqual({
            app: 'lexica',
            kind: 'words',
            title: 'Ôn lại 2 từ',
            payload: { card_ids: ['v1', 'v2'], missing_words: [], mode: 'only' },
            due: '2026-10-28',
        });
    });
});
