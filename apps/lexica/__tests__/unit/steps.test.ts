import { describe, expect, it } from 'vitest';
import {
    countReachedOn,
    countSteps,
    countsLine,
    journeysFromProgress,
    knownAlready,
    meet,
    recall,
    recallsMakeNho,
    stepOf,
    understand,
    sayClearly,
    wordsAt,
    type Journeys,
} from '../../app/lib/journey/steps';
import type { UserCardProgress } from '../../app/lib/eloAlgorithm';

const T0 = Date.parse('2026-10-01T09:00:00Z');
const day = (n: number) => `2026-10-${String(1 + n).padStart(2, '0')}`;
const at = (n: number) => T0 + n * 86_400_000;
const toDate = (ts: number) => new Date(ts).toISOString().slice(0, 10);

describe('word steps', () => {
    it('starts at Hiểu and needs two recalls 3 days apart for Nhớ', () => {
        let j = understand(undefined, at(0));
        expect(stepOf(j)).toBe('hieu');
        j = recall(j, true, day(1), at(1));
        j = recall(j, true, day(2), at(2));
        expect(stepOf(j)).toBe('hieu');
        j = recall(j, true, day(4), at(4));
        expect(stepOf(j)).toBe('nho');
        expect(j.rememberedAt).toBe(at(4));
    });

    it('counts the same day once', () => {
        expect(recallsMakeNho([day(0), day(0)])).toBe(false);
        expect(recallsMakeNho([day(0), day(3)])).toBe(true);
        const j = recall(recall(understand(undefined, at(0)), true, day(0), at(0)), true, day(0), at(0));
        expect(j.recalls).toEqual([day(0)]);
    });

    it('a wrong recall takes Nhớ away but keeps Gặp and Dùng', () => {
        let j = knownAlready(undefined, at(0));
        j = meet(j, at(1))!;
        j = sayClearly(j, at(2))!;
        expect(stepOf(j)).toBe('dung');
        j = recall(j, false, day(3), at(3));
        expect(stepOf(j)).toBe('hieu');
        expect(j.metAt).toBe(at(1));
        j = recall(j, true, day(4), at(4));
        j = recall(j, true, day(8), at(8));
        expect(stepOf(j)).toBe('dung');
    });

    it('never skips a step: Gặp shows only after Nhớ', () => {
        const j = meet(understand(undefined, at(0)), at(1))!;
        expect(stepOf(j)).toBe('hieu');
        expect(meet(undefined, at(1))).toBeUndefined();
        expect(sayClearly(undefined, at(1))).toBeUndefined();
    });

    it('counts words that reached each step, and the ones reached on a day', () => {
        const journeys: Journeys = {
            a: understand(undefined, at(0)),
            b: knownAlready(undefined, at(0)),
            c: meet(knownAlready(undefined, at(0)), at(2))!,
            d: sayClearly(meet(knownAlready(undefined, at(0)), at(1))!, at(2))!,
        };
        expect(countSteps(journeys)).toEqual({ hieu: 4, nho: 3, gap: 2, dung: 1 });
        expect(countSteps(journeys, new Set(['a', 'd']))).toEqual({ hieu: 2, nho: 1, gap: 1, dung: 1 });
        expect(countReachedOn(journeys, day(2), toDate)).toEqual({ hieu: 0, nho: 0, gap: 1, dung: 1 });
        expect(countsLine(countSteps(journeys))).toBe('4 Hiểu · 3 Nhớ · 2 Gặp · 1 Dùng');
        expect(wordsAt(journeys, 'gap')).toEqual(['c']);
    });

    it('starts journeys from older SRS progress', () => {
        const p = (state: UserCardProgress['state'], extra: Partial<UserCardProgress> = {}): UserCardProgress => ({
            cardId: 'x',
            state,
            lastReviewedAt: at(0),
            nextReviewAt: at(1),
            reviewCount: 1,
            wrongCount: 0,
            ...extra,
        });
        const out = journeysFromProgress(
            {
                seen: p('seed', { reviewCount: 0 }),
                learned: p('seed'),
                gold: p('gold'),
                spaced: p('sprout', { intervalDays: 6, streak: 2 }),
            },
            ['learned'],
        );
        expect(Object.keys(out).sort()).toEqual(['gold', 'learned', 'spaced']);
        expect(stepOf(out.learned)).toBe('hieu');
        expect(stepOf(out.gold)).toBe('nho');
        expect(stepOf(out.spaced)).toBe('nho');
    });
});
