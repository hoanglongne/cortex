import { describe, expect, it } from 'vitest';
import type { Board, BoardStudent } from '@cortex/lexica-classes';
import { greeting, needs, praise, summaryLine } from '../app/lib/today';

const now = Date.parse('2026-10-19T09:00:00');
const student = (name: string, s: Partial<BoardStudent>): BoardStudent => ({
    user_id: name,
    name,
    joined_at: '2026-10-01T00:00:00Z',
    counts: {},
    assigned: {},
    streak: 0,
    last_active: null,
    inactive_days: 0,
    week_ago: null,
    week_first: null,
    ...s,
});
const board = (students: BoardStudent[], due?: string, missing: string[] = []): Board => ({
    class: { id: 'c1', name: 'IELTS tối', code: 'ABC234', branch: 'cert', level: null },
    assignments: [{ id: 'a1', title: 'Unit 4', card_ids: ['v1', 'v2'], missing_words: missing, created_at: '', due_on: due ?? null, mode: 'only' }],
    students,
});

describe('Hôm nay', () => {
    it('puts lessons due soon first, then students to nudge, then words being written', () => {
        const b = board(
            [
                student('Lan', { words: { v1: 4, v2: 4 } }),
                student('Minh', { inactive_days: 5 }),
                student('Hoa', { inactive_days: null, joined_at: '2026-10-19T08:00:00Z' }),
            ],
            '2026-10-20',
            ['serendipity'],
        );
        const n = needs([b], now);
        expect(n.map((x) => x.kind)).toEqual(['due', 'nudge', 'missing']);
        expect(n[0]).toMatchObject({ days: 1, notLearned: 2, total: 3 });
        // Hoa just joined: new, not someone to nudge.
        expect(n[1]).toMatchObject({ names: ['Minh'] });
        expect(needs([board([student('Lan', {})], '2026-11-30')], now)).toEqual([]);
    });

    it('praises progress, not points', () => {
        const b = board([
            student('Lan', { counts: { dung: 20 }, week_ago: { dung: 12 } }),
            student('Minh', { streak: 9 }),
            student('Hoa', { counts: { dung: 1 }, week_ago: { dung: 0 } }),
        ]);
        expect(praise([b]).map((p) => [p.name, p.why])).toEqual([
            ['Lan', '+8 từ Dùng tuần này'],
            ['Minh', 'chuỗi 9 ngày học'],
        ]);
        expect(summaryLine([b])).toBe('1 lớp · 3 học viên · 3 em học trong 7 ngày qua');
        expect(greeting(8)).toBe('Chào buổi sáng');
        expect(greeting(20)).toBe('Chào buổi tối');
    });
});
