import { beforeEach, describe, expect, it } from 'vitest';
import {
    activeLabel,
    assignedCounts,
    cacheClasses,
    classMessage,
    classWordsToQueue,
    isSlipping,
    matchWords,
    parentNote,
    readCachedClasses,
    weekDelta,
    type ClassInfo,
} from '../../app/lib/classes';
import { getCardByWord } from '../../app/lib/content/repository';
import { knownAlready, meet, sayClearly, understand } from '../../app/lib/journey/steps';

const cls = (role: ClassInfo['role'], ids: string[]): ClassInfo => ({
    id: role,
    name: 'IELTS tối',
    branch: 'cert',
    level: 'intermediate',
    org_id: null,
    role,
    code: role === 'teacher' ? 'ABC234' : null,
    members: 3,
    assignments: [{ id: 'a1', title: 'Unit 1', card_ids: ids, missing_words: [], created_at: 'x' }],
});

beforeEach(() => localStorage.clear());

describe('classes', () => {
    it('matches a pasted word list to cards, phrases included', () => {
        const r = matchWords('Abundant\nfeasible, dilemma;\n  running   late \nserendipity\nabundant', getCardByWord);
        expect(r.cardIds).toEqual(['v001', 'v004', 'v003', 'g002']);
        expect(r.missing).toEqual(['serendipity']);
    });

    it('counts steps over the assigned words only', () => {
        const journeys = {
            v001: sayClearly(meet(knownAlready(undefined, 1), 2)!, 3)!,
            v002: understand(undefined, 1),
            v999: knownAlready(undefined, 1),
        };
        expect(assignedCounts(journeys, [{ card_ids: ['v001', 'v002'] }, { card_ids: ['v002', 'v003'] }])).toEqual({ hieu: 2, nho: 1, gap: 1, dung: 1, total: 3 });
    });

    it('shows the week against the report a week ago, or the first report this week', () => {
        const counts = { hieu: 50, nho: 30, gap: 10, dung: 6 };
        expect(weekDelta({ counts, week_ago: { hieu: 40, nho: 25, gap: 8, dung: 6 }, week_first: null })).toEqual({ hieu: 10, nho: 5, gap: 2, dung: 0 });
        expect(weekDelta({ counts, week_ago: null, week_first: { hieu: 45, nho: 30, gap: 9, dung: 2 } })).toEqual({ hieu: 5, nho: 0, gap: 1, dung: 4 });
        expect(weekDelta({ counts: {}, week_ago: null, week_first: null })).toEqual({ hieu: 0, nho: 0, gap: 0, dung: 0 });
    });

    it('writes a note a teacher can send to parents', () => {
        const note = parentNote(
            { name: 'Lan', counts: { nho: 30, dung: 6 }, week_ago: { nho: 25, dung: 4 }, week_first: null, streak: 5, assigned: { dung: 2, total: 10 } },
            'IELTS tối',
        );
        expect(note).toBe('Lan (IELTS tối) tuần này: +5 từ nhớ được, +2 từ đã nói được. Tổng: 30 từ Nhớ, 6 từ Dùng, chuỗi 5 ngày học. Từ của lớp: 2/10 từ đã dùng được.');
    });

    it('flags students who stopped, in plain words', () => {
        expect(activeLabel(null)).toBe('Chưa học');
        expect(activeLabel(0)).toBe('Hôm nay');
        expect(activeLabel(1)).toBe('Hôm qua');
        expect(activeLabel(5)).toBe('5 ngày chưa học');
        const now = Date.parse('2026-10-18T12:00:00Z');
        const joined = (days: number) => new Date(now - days * 86_400_000).toISOString();
        expect(isSlipping({ inactive_days: 3, joined_at: joined(10) }, now)).toBe(false);
        expect(isSlipping({ inactive_days: 4, joined_at: joined(10) }, now)).toBe(true);
        // Just joined, nothing learned yet: new, not idle.
        expect(isSlipping({ inactive_days: null, joined_at: joined(0.02) }, now)).toBe(false);
        expect(activeLabel(null, joined(0.02), now)).toBe('Mới vào lớp');
        expect(isSlipping({ inactive_days: null, joined_at: joined(5) }, now)).toBe(true);
    });

    it("keeps a student's assigned words on the device, not a teacher's", () => {
        cacheClasses([cls('student', ['v010', 'v011', 'nope']), cls('teacher', ['v020'])]);
        expect(readCachedClasses()).toHaveLength(2);
        expect(classWordsToQueue()).toEqual(['v010', 'v011']);
    });

    it('says database errors in Vietnamese', () => {
        expect(classMessage('no such class')).toBe('Không tìm thấy lớp với mã này.');
        expect(classMessage('ERROR: no seats')).toContain('hết chỗ');
        expect(classMessage('Failed to fetch')).toContain('mạng');
    });
});

describe('Classes v2: modes, steps per word, states', async () => {
    const lib = await import('../../app/lib/classes');
    const { live } = await import('../../app/lib/journey/steps');

    it('learns only the "only" lessons first, mixed ones are just dealt first', () => {
        const only = { ...cls('student', ['v010', 'v011']), id: 'a' };
        only.assignments = [{ ...only.assignments[0], mode: 'only' }];
        const mixed = { ...cls('student', ['v020']), id: 'b' };
        mixed.assignments = [{ ...mixed.assignments[0], mode: 'mixed' }];
        cacheClasses([only, mixed]);
        expect(lib.onlyClassWords((id) => id === 'v011')).toEqual(['v010']);
        expect(classWordsToQueue()).toEqual(['v010', 'v011', 'v020']);
    });

    it('reports the step of each assigned word, 5 when used in real life', () => {
        const journeys = { v010: understand(undefined, 1), v011: live(sayClearly(meet(knownAlready(undefined, 1), 2)!, 3)!, 4)! };
        expect(lib.assignedSteps(journeys, [{ card_ids: ['v010', 'v011', 'v012'] }])).toEqual({ v010: 1, v011: 5 });
    });

    it('a class sees how far each lesson got, and who is new', () => {
        const students: { words: Record<string, number> }[] = [{ words: { a: 4, b: 4 } }, { words: { a: 1 } }, { words: {} }];
        expect(lib.assignmentProgress({ card_ids: ['a', 'b'] }, students)).toEqual({ started: 2, learned: 1, used: 1, total: 3 });
        const now = Date.parse('2026-10-18T12:00:00Z');
        expect(lib.studentState({ inactive_days: null, joined_at: '2026-10-18T10:00:00Z' }, now)).toBe('new');
        expect(lib.studentState({ inactive_days: 1, joined_at: '2026-10-01T10:00:00Z' }, now)).toBe('active');
        expect(lib.studentState({ inactive_days: 5, joined_at: '2026-10-01T10:00:00Z' }, now)).toBe('nudge');
        expect(lib.daysUntil('2026-10-20', Date.parse('2026-10-18T09:00:00'))).toBe(2);
        expect(lib.daysUntil('2026-10-18', Date.parse('2026-10-18T09:00:00'))).toBe(0);
        expect(lib.joinLink('https://lexica.app/', 'ABC234')).toBe('https://lexica.app/join/ABC234');
    });
});
