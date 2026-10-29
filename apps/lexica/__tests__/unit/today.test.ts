import { describe, expect, it } from 'vitest';
import { EXTRA_WORDS, extraNewLeft, learnSize, logFor, newWordsLeft, pickPassage, wordsToRead, pickQuoteWord, pickSpeakWords, planLine, planToday, REVIEW_CAP, reviewIds, stepDelta } from '../../app/lib/journey/today';
import { currentDay, dueCheckpoint, expectedBy, finalTestWords, finishLine, mostMissed, nextLevel, pathCells, pathDays } from '../../app/lib/journey/path';
import { knownAlready, meet, sayClearly, understand, type Journeys } from '../../app/lib/journey/steps';

const zero = { hieu: 0, nho: 0, gap: 0, dung: 0 };

describe('Today plan', () => {
    it('sizes Học with class lessons and extra rounds', () => {
        // an "only" lesson is the whole stage
        expect(learnSize({ newLeft: 10, pending: 3, onlyPending: 3 })).toBe(3);
        expect(learnSize({ newLeft: 0, pending: 4, onlyPending: 4 })).toBe(4);
        // a lesson given after the pace was reached still gets its stage
        expect(learnSize({ newLeft: 0, pending: 30, onlyPending: 0 })).toBe(EXTRA_WORDS);
        expect(learnSize({ newLeft: 8, pending: 2, onlyPending: 0 })).toBe(8);
        // an extra round counts its own words
        expect(extraNewLeft(14, 10)).toBe(EXTRA_WORDS - 4);
        expect(extraNewLeft(30, 10)).toBe(0);
    });

    it('reopens a stage a class lesson arrived after', () => {
        const log = { date: '2026-10-20', done: ['review', 'learn', 'read', 'speak'] as const, start: { hieu: 0, nho: 0, gap: 0, dung: 0 } };
        const base = { log: { ...log, done: [...log.done] }, dueCount: 0, newLeft: 5, canRead: true, speakCount: 3 };
        expect(planToday(base).complete).toBe(true);
        const p = planToday({ ...base, reopen: ['learn'] });
        expect(p.next).toBe('learn');
        expect(p.stages.find((s) => s.stage === 'read')?.status).toBe('done');
    });

    it('counts Học as done once the day\'s words are learned, even if the stage was never closed (#66)', () => {
        const log = { date: '2026-10-20', done: [] as never[], start: { hieu: 0, nho: 0, gap: 0, dung: 0 } };
        // All the pace learned (newLeft 0) but the Học stage never closed, e.g. after a reload
        const p = planToday({ log, dueCount: 0, newLeft: 0, canRead: true, speakCount: 3, learnedThisRound: 10 });
        expect(p.stages.map((s) => s.status)).toEqual(['empty', 'done', 'todo', 'todo']);
        expect(p.next).toBe('read');
        // Nothing learned and nothing left: still "empty"
        expect(planToday({ log, dueCount: 0, newLeft: 0, canRead: true, speakCount: 3, learnedThisRound: 0 }).stages[1].status).toBe('empty');
        // A class lesson that arrived after reopens the stage even though words were learned
        const again = planToday({ log, dueCount: 0, newLeft: 4, canRead: true, speakCount: 3, learnedThisRound: 10, reopen: ['learn'] });
        expect(again.stages[1].status).toBe('todo');
    });

    it('runs the stages in order and skips the empty ones', () => {
        const plan = planToday({ log: null, dueCount: 0, newLeft: 10, canRead: true, speakCount: 3 });
        expect(plan.stages.map((s) => s.status)).toEqual(['empty', 'todo', 'todo', 'todo']);
        expect(plan.next).toBe('learn');
        expect(plan.minutes).toBe(8);
        expect(planLine(plan)).toBe('Còn 3 chặng · ~8 phút');
    });

    it('caps review and is complete when every stage is done or empty', () => {
        const log = { date: '2026-10-17', done: ['review', 'learn'] as const, start: zero };
        const plan = planToday({ log: { ...log, done: [...log.done] }, dueCount: 40, newLeft: 0, canRead: false, speakCount: 0 });
        expect(plan.stages[0].size).toBe(REVIEW_CAP);
        expect(plan.complete).toBe(true);
        expect(plan.next).toBeNull();
        expect(planLine(plan)).toBe('Xong hôm nay');
    });

    it("uses only today's log", () => {
        const log = { date: '2026-10-16', done: [], start: zero };
        expect(logFor(log, '2026-10-17')).toBeNull();
        expect(logFor(log, '2026-10-16')).toBe(log);
    });

    it('new words: the pace minus words learned today, 5 the very first time', () => {
        expect(newWordsLeft({ pace: 10, learnedToday: 3, firstSession: false })).toBe(7);
        expect(newWordsLeft({ pace: 15, learnedToday: 20, firstSession: false })).toBe(0);
        expect(newWordsLeft({ pace: 10, learnedToday: 0, firstSession: true })).toBe(5);
        expect(reviewIds(Array.from({ length: 20 }, (_, i) => `v${i}`))).toHaveLength(REVIEW_CAP);
    });

    it('reads the passage with the most remembered words not met yet', () => {
        const journeys: Journeys = { a: understand(undefined, 1), b: knownAlready(undefined, 1), c: meet(knownAlready(undefined, 1), 2)! };
        const passages = [
            { id: 'p1', newWords: ['a'], words: [] },
            { id: 'p2', newWords: ['b'], words: ['c'] },
            { id: 'p3', newWords: ['x'], words: [] },
        ];
        expect(pickPassage(passages, journeys, new Set())?.passage.id).toBe('p2');
        expect(pickPassage(passages, journeys, new Set(['p2']))?.passage.id).toBe('p1');
        expect(pickPassage([passages[2]], journeys, new Set())).toBeNull();
        // A preferred kind wins over a slightly better match.
        expect(pickPassage(passages, journeys, new Set(), { prefer: (p) => p.id === 'p1' })?.passage.id).toBe('p1');
    });

    it("counts today's words most, and matches two cards of the same word", () => {
        const journeys: Journeys = { v442: understand(undefined, 1), x: understand(undefined, 1), y: knownAlready(undefined, 1) };
        const wordOf = (id: string) => ({ v416: 'believe', v442: 'believe', x: 'boring', y: 'quality', z: 'honest' })[id];
        const passages = [
            { id: 'rain', newWords: ['v416', 'x'], words: [] },
            { id: 'market', newWords: ['y'], words: ['z'] },
        ];
        const pick = pickPassage(passages, journeys, new Set(), { today: ['v442', 'x'], wordOf })!;
        expect(pick).toMatchObject({ today: 2, known: 2 });
        expect(pick.passage.id).toBe('rain');
        expect(wordsToRead(journeys, ['v442', 'x'], wordOf)).toEqual(['v442', 'x', 'y']);
        expect(wordsToRead({ ...journeys, x: meet(knownAlready(undefined, 1), 2)! }, ['x'], wordOf)).toEqual(['y']);
        expect(pickQuoteWord(journeys, (id) => id === 'y')).toBe('y');
    });

    it('speaks words met but not said, then words learned today', () => {
        const journeys: Journeys = {
            met: meet(knownAlready(undefined, 1), 2)!,
            said: sayClearly(meet(knownAlready(undefined, 1), 2)!, 3)!,
            fresh: understand(undefined, 5),
        };
        expect(pickSpeakWords(journeys, ['fresh'])).toEqual(['met', 'fresh']);
        expect(stepDelta({ hieu: 5, nho: 2, gap: 1, dung: 0 }, { hieu: 3, nho: 2, gap: 2, dung: 0 })).toEqual({ hieu: 2, nho: 0, gap: 0, dung: 0 });
    });
});

describe('30-day path', () => {
    const path = { startDate: '2026-10-01', seen: [] as number[] };

    it('counts only finished days of this path; missed days do not count', () => {
        const done = ['2026-09-30', '2026-10-01', '2026-10-03', '2026-10-03', '2026-10-07'];
        expect(pathDays(path, done)).toEqual(['2026-10-01', '2026-10-03', '2026-10-07']);
        expect(currentDay(path, done, '2026-10-08')).toBe(4);
        expect(currentDay(path, done, '2026-10-07')).toBe(3);
        const cells = pathCells(path, done, '2026-10-08');
        expect(cells.slice(0, 5)).toEqual(['done', 'done', 'done', 'today', 'ahead']);
        expect(cells).toHaveLength(30);
    });

    it('shows each checkpoint once, the first one reached', () => {
        const seven = Array.from({ length: 7 }, (_, i) => `2026-10-${String(i + 1).padStart(2, '0')}`);
        expect(dueCheckpoint(path, seven.slice(0, 6))).toBeNull();
        expect(dueCheckpoint(path, seven)).toBe(7);
        expect(dueCheckpoint({ ...path, seen: [7] }, seven)).toBeNull();
        expect(dueCheckpoint({ ...path, finished: { date: 'x', score: 1, total: 1, counts: zero } }, seven)).toBeNull();
    });

    it('sets the promise from the pace', () => {
        expect(expectedBy(10, 7)).toEqual({ nho: 70, goal: 300 });
        expect(expectedBy(15, 40)).toEqual({ nho: 450, goal: 450 });
        expect(finishLine({ hieu: 320, nho: 300, gap: 140, dung: 128 })).toBe('30 ngày với Lexica: 300 từ Nhớ, 128 từ Dùng');
        expect(nextLevel('beginner')).toBe('intermediate');
        expect(nextLevel('expert')).toBeNull();
    });

    it('tests words understood since the start, the same ones on reload', () => {
        const journeys: Journeys = Object.fromEntries(Array.from({ length: 40 }, (_, i) => [`v${i}`, understand(undefined, i < 5 ? 1 : 1000)]));
        const a = finalTestWords(journeys, 500, 30, 7);
        expect(a).toHaveLength(30);
        expect(a.every((id) => Number(id.slice(1)) >= 5)).toBe(true);
        expect(finalTestWords(journeys, 500, 30, 7)).toEqual(a);
        expect(mostMissed({ a: { wrongCount: 1 }, b: { wrongCount: 3 }, c: { wrongCount: 0 } })).toEqual(['b', 'a']);
    });
});
