import { describe, expect, it } from 'vitest';
import { hardInterval, hardWords, isHard, mnemonic } from '../../app/lib/engagement/hard';
import { getDueCards, updateCardProgress, type UserCardProgress } from '../../app/lib/eloAlgorithm';
import { newSession, recordSwipe } from '../../app/lib/engagement/session';

const DAY = 24 * 60 * 60 * 1000;

const p = (cardId: string, wrongCount: number, reviewCount: number, state: UserCardProgress['state'] = 'seed', nextReviewAt = 0): UserCardProgress => ({
    cardId, state, wrongCount, reviewCount, lastReviewedAt: 0, nextReviewAt,
});

describe('isHard', () => {
    it('three misses make a word hard', () => {
        expect(isHard(p('a', 3, 5))).toBe(true);
    });
    it('two misses count when they outnumber the right answers', () => {
        expect(isHard(p('a', 2, 1))).toBe(true);
        expect(isHard(p('a', 2, 2))).toBe(false);
    });
    it('one miss, unseen and mastered words are not hard', () => {
        expect(isHard(p('a', 1, 0))).toBe(false);
        expect(isHard(undefined)).toBe(false);
        expect(isHard(p('a', 5, 9, 'mastered'))).toBe(false);
    });
});

describe('hardWords', () => {
    it('lists the most-missed first', () => {
        const list = hardWords({ a: p('a', 3, 3), b: p('b', 5, 1), c: p('c', 1, 4) });
        expect(list.map((x) => x.cardId)).toEqual(['b', 'a']);
    });
});

describe('scheduling', () => {
    it('halves the wait for hard words but never under a day', () => {
        expect(hardInterval(7 * DAY)).toBe(3.5 * DAY);
        expect(hardInterval(DAY)).toBe(DAY);
    });

    it('a hard word recalled comes back sooner than a normal one', () => {
        const settled = { ease: 2.5, intervalDays: 10, streak: 3 };
        const normal = updateCardProgress({ ...p('a', 0, 1, 'sprout'), ...settled }, 'a', 'right');
        const hard = updateCardProgress({ ...p('b', 3, 1, 'sprout'), ...settled }, 'b', 'right');
        expect(normal.state).toBe('gold');
        expect(hard.state).toBe('gold');
        expect(hard.nextReviewAt - hard.lastReviewedAt).toBeLessThan(normal.nextReviewAt - normal.lastReviewedAt);
    });

    it('due hard words come first', () => {
        const due = getDueCards({ a: p('a', 0, 1, 'sprout', 1), b: p('b', 4, 1, 'seed', 5), c: p('c', 0, 1, 'seed', 2) });
        expect(due.map((x) => x.cardId)).toEqual(['b', 'a', 'c']);
    });
});

describe('mnemonic', () => {
    it('joins the word parts', () => {
        expect(mnemonic({
            surgeryModule: { prefix: { text: 'ab-', meaning: 'rời đi' }, root: { text: 'und-', meaning: 'sóng' }, suffix: { text: '-ant', meaning: 'tính từ' } },
        })).toBe('ab- rời đi · und- sóng · -ant tính từ');
    });
    it('needs at least two parts', () => {
        expect(mnemonic({ surgeryModule: { root: { text: 'und-', meaning: 'sóng' } } })).toBeNull();
        expect(mnemonic({})).toBeNull();
    });
});

describe('session', () => {
    it('records hard words recalled as beaten', () => {
        const before = p('a', 3, 1);
        const s = recordSwipe(newSession(0), { cardId: 'a', known: true, before, after: p('a', 3, 2, 'sprout') });
        expect(s.hardBeaten).toEqual(['a']);
        const missed = recordSwipe(newSession(0), { cardId: 'a', known: false, before });
        expect(missed.hardBeaten).toEqual([]);
    });
});
