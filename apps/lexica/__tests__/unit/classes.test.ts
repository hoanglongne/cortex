import { beforeEach, describe, expect, it } from 'vitest';
import { lexicaModule, matchWords, weekDelta } from '@cortex/classroom-lexica';
import { studentApp, type BoardStudent } from '@cortex/classroom';
import {
    activeLabel,
    assignedCounts,
    assignedSteps,
    cacheClasses,
    classMessage,
    classWordsToQueue,
    daysUntil,
    isSlipping,
    joinLink,
    lexicaReport,
    onlyClassWords,
    readCachedClasses,
    studentState,
    type Assignment,
    type ClassInfo,
} from '../../app/lib/classes';
import { getCardByWord } from '../../app/lib/content/repository';
import { knownAlready, live, meet, sayClearly, understand } from '../../app/lib/journey/steps';

const lesson = (ids: string[], mode: 'only' | 'mixed' = 'only', app = 'lexica'): Assignment => ({
    id: `a-${ids.join('-')}`,
    app,
    kind: 'words',
    title: 'Unit 1',
    payload: { card_ids: ids, missing_words: [], mode },
    due_on: null,
    created_at: 'x',
});
const cls = (role: ClassInfo['role'], assignments: Assignment[], id: string = role): ClassInfo => ({
    id,
    name: 'IELTS tối',
    apps: ['lexica'],
    settings: { lexica: { branch: 'cert' } },
    org_id: null,
    org: null,
    created_at: 'x',
    leaderboard: false,
    leaderboard_app: 'lexica',
    role,
    code: role === 'teacher' ? 'ABC234' : null,
    members: 3,
    assignments,
});
const student = (apps: BoardStudent['apps']): BoardStudent => ({ user_id: 'u', name: 'Lan', joined_at: 'x', note: null, streak: 0, last_active: null, inactive_days: 0, days: [], apps });

beforeEach(() => localStorage.clear());

describe('Lexica in classes', () => {
    it('matches a pasted word list to cards, phrases included', () => {
        const r = matchWords('Abundant\nfeasible, dilemma;\n  running   late \nserendipity\nabundant', getCardByWord);
        expect(r.cardIds).toEqual(['v001', 'v004', 'v003', 'g002']);
        expect(r.missing).toEqual(['serendipity']);
    });

    it('reports steps over the lesson words of each class, and each word', () => {
        const journeys = {
            v001: sayClearly(meet(knownAlready(undefined, 1), 2)!, 3)!,
            v002: live(understand(undefined, 1), 4)!,
            v999: knownAlready(undefined, 1),
        };
        const a = cls('student', [lesson(['v001', 'v002']), lesson(['v002', 'v003'])], 'c1');
        const other = cls('student', [lesson(['x'], 'only', 'oratio')], 'c2');
        expect(assignedCounts(journeys, a)).toEqual({ hieu: 2, nho: 1, gap: 1, dung: 1, total: 3 });
        expect(assignedCounts(journeys, other)).toEqual({ hieu: 0, nho: 0, gap: 0, dung: 0, total: 0 });
        expect(assignedSteps(journeys, [a])).toEqual({ v001: 4, v002: 5 });
        const r = lexicaReport(journeys, [a, other]);
        expect(r.counts).toMatchObject({ hieu: 3, doi: 1 });
        expect(Object.keys(r.assigned)).toEqual(['c1', 'c2']);
    });

    it('learns "only" lessons alone, deals mixed ones first, ignores other apps', () => {
        cacheClasses([cls('student', [lesson(['v010', 'v011']), lesson(['v020'], 'mixed'), lesson(['v030'], 'only', 'oratio')]), cls('teacher', [lesson(['v040'])])]);
        expect(readCachedClasses()).toHaveLength(2);
        expect(onlyClassWords((id) => id === 'v011')).toEqual(['v010']);
        expect(classWordsToQueue()).toEqual(['v010', 'v011', 'v020']);
    });

    it('the module: progress per lesson, praise, parent line; bad data reads as zeros', () => {
        const withWords = (words: Record<string, number>) => student({ lexica: { metrics: { counts: {}, assigned: {}, words }, last_active: null, week_ago: null, week_first: null } });
        const a = { ...lesson(['a', 'b']), payload: lexicaModule.parsePayload('words', { card_ids: ['a', 'b'], mode: 'x' }) };
        expect(a.payload.mode).toBe('only');
        expect(lexicaModule.assignmentProgress(a, [withWords({ a: 4, b: 4 }), withWords({ a: 1 }), student({})])).toEqual({ started: 2, done: 1, deep: 1, total: 3 });
        const s = student({ lexica: { metrics: { counts: { nho: 30, dung: 6 }, assigned: { dung: 2, total: 10 } }, last_active: null, week_ago: { counts: { nho: 25, dung: 2 } }, week_first: null } });
        const app = studentApp(lexicaModule, s)!;
        expect(weekDelta(app)).toEqual({ hieu: 0, nho: 5, gap: 0, dung: 4 });
        expect(lexicaModule.praise(app)).toEqual({ why: '+4 từ Dùng tuần này', score: 104 });
        expect(lexicaModule.parentLine(app)).toBe('Từ vựng: +5 từ nhớ được, +4 từ đã nói được tuần này; tổng 30 từ Nhớ, 6 từ Dùng. Từ của lớp: 2/10 từ đã nói được.');
        expect(lexicaModule.parseMetrics('garbage')).toEqual({ counts: {}, assigned: {}, words: {} });
        expect(lexicaModule.parseSettings({ branch: 'talk', level: 'nope' })).toEqual({ branch: 'talk', level: null });
    });
});

describe('classroom rules', () => {
    it('flags students who stopped, never the ones who just joined', () => {
        const now = Date.parse('2026-10-18T12:00:00Z');
        const joined = (days: number) => new Date(now - days * 86_400_000).toISOString();
        expect(activeLabel(0)).toBe('Hôm nay');
        expect(activeLabel(5)).toBe('5 ngày chưa học');
        expect(activeLabel(null, joined(0.02), now)).toBe('Mới vào lớp');
        expect(isSlipping({ inactive_days: 4, joined_at: joined(10) }, now)).toBe(true);
        expect(studentState({ inactive_days: null, joined_at: joined(0.02) }, now)).toBe('new');
        expect(studentState({ inactive_days: null, joined_at: joined(5) }, now)).toBe('nudge');
        expect(daysUntil('2026-10-20', Date.parse('2026-10-18T09:00:00'))).toBe(2);
        expect(joinLink('https://lexica.app/', 'ABC234')).toBe('https://lexica.app/join/ABC234');
        expect(classMessage('ERROR: no seats')).toMatch(/hết chỗ/);
        expect(classMessage('app not in class')).toMatch(/chưa bật/);
    });
});
