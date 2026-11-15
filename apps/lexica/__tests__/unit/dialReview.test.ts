import { describe, expect, it } from 'vitest';
import { dialRank } from '../../app/lib/dial/review';
import { pickHits } from '../../app/lib/dial/level';
import type { DialHit } from '../../app/lib/dial/match';

const hit = (cardId: string): DialHit => ({ cardId, en: cardId, vi: cardId, start: 0, end: 1 });
const DAY = 86_400_000;

describe('dial and the review schedule', () => {
    it('ranks due words before other learned words', () => {
        const now = 10 * DAY;
        const r = dialRank({ a: { nextReviewAt: now - 1 }, b: { nextReviewAt: now + 5 * DAY } }, now);
        expect(r.get('a')).toBe(0);
        expect(r.get('b')).toBe(1);
        expect(r.has('c')).toBe(false);
    });

    it('shows ranked words first, in rank order', () => {
        const hits = [hit('x'), hit('learned'), hit('y'), hit('due')];
        const rank = new Map([['due', 0], ['learned', 1]]);
        expect([...pickHits(hits, 25, rank)]).toEqual([3]);
        expect([...pickHits(hits, 50, rank)].sort()).toEqual([1, 3]);
        expect(pickHits(hits, 100, rank).size).toBe(4);
        expect(pickHits(hits, 0, rank).size).toBe(0);
    });
});

describe('dialTap', () => {
    it('makes a learned word due now and queues a new one', async () => {
        const { useLexicaStore } = await import('../../app/store/lexicaStore');
        const later = Date.now() + 5 * DAY;
        useLexicaStore.setState({
            cardProgress: { v004: { cardId: 'v004', nextReviewAt: later, lastReviewedAt: 0, reviewCount: 1 } as never },
            queuedCardIds: [],
            currentDeck: [],
        });
        expect(useLexicaStore.getState().dialTap('v004')).toBe('due');
        expect(useLexicaStore.getState().cardProgress.v004.nextReviewAt).toBeLessThanOrEqual(Date.now());
        expect(useLexicaStore.getState().dialTap('v004')).toBe('none');
        expect(useLexicaStore.getState().dialTap('v005')).toBe('queued');
        expect(useLexicaStore.getState().queuedCardIds).toContain('v005');
    });
});
