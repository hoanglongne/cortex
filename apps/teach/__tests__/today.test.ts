import { describe, expect, it } from 'vitest';
import type { Board, BoardStudent } from '@cortex/classroom';
import { greeting, needs, praise, summaryLine } from '../app/lib/today';
import { moduleFor } from '../app/modules';

const now = Date.parse('2026-10-19T09:00:00');
const lexica = (metrics: object, week_ago: object | null = null) => ({ lexica: { metrics, last_active: null, week_ago, week_first: null } });
const student = (name: string, s: Partial<BoardStudent>): BoardStudent => ({
    user_id: name,
    name,
    joined_at: '2026-10-01T00:00:00Z',
    note: null,
    streak: 0,
    last_active: null,
    inactive_days: 0,
    days: [],
    apps: {},
    ...s,
});
const board = (students: BoardStudent[], due?: string, missing: string[] = []): Board =>
    ({
        class: { id: 'c1', name: 'IELTS tối', code: 'ABC234', apps: ['lexica'], settings: { lexica: { branch: 'cert' } }, leaderboard: false, leaderboard_app: 'lexica' },
        assignments: [{ id: 'a1', app: 'lexica', kind: 'words', title: 'Unit 4', payload: { card_ids: ['v1', 'v2'], missing_words: missing, mode: 'only' }, created_at: '', due_on: due ?? null }],
        students,
    }) as unknown as Board;

describe('Hôm nay', () => {
    it('puts work due soon first, then students to nudge, then what modules raise', () => {
        const b = board(
            [
                student('Lan', { apps: lexica({ words: { v1: 4, v2: 4 } }) }),
                student('Minh', { inactive_days: 5 }),
                student('Hoa', { inactive_days: null, joined_at: '2026-10-19T08:00:00Z' }),
            ],
            '2026-10-20',
            ['serendipity'],
        );
        const n = needs([b], moduleFor, now);
        expect(n.map((x) => x.kind)).toEqual(['due', 'nudge', 'module']);
        expect(n[0]).toMatchObject({ days: 1, notDone: 2, total: 3 });
        // Hoa just joined: new, not someone to nudge.
        expect(n[1]).toMatchObject({ names: ['Minh'] });
        expect(needs([board([student('Lan', {})], '2026-11-30')], moduleFor, now)).toEqual([]);
    });

    it('praises progress, not points', () => {
        const b = board([
            student('Lan', { apps: lexica({ counts: { dung: 20 } }, { counts: { dung: 12 } }), last_active: '2026-10-18' }),
            student('Minh', { streak: 9, last_active: '2026-10-18' }),
            student('Hoa', { apps: lexica({ counts: { dung: 1 } }, { counts: { dung: 0 } }), last_active: '2026-10-18' }),
        ]);
        expect(praise([b], moduleFor).map((p) => [p.name, p.why])).toEqual([
            ['Lan', '+8 từ Dùng tuần này'],
            ['Minh', 'chuỗi 9 ngày học'],
        ]);
        expect(summaryLine([b])).toMatch(/^1 lớp · 3 học viên/);
        expect(greeting(8)).toBe('Chào buổi sáng');
        expect(greeting(20)).toBe('Chào buổi tối');
    });
});
