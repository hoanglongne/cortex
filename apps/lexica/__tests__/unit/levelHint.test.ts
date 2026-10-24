import { describe, expect, it } from 'vitest';
import { levelHint } from '../../app/lib/journey/levelHint';
import type { UserCardProgress } from '../../app/lib/eloAlgorithm';

const now = Date.UTC(2026, 9, 24);
const card = (i: number, reviewCount: number, wrongCount: number, daysAgo = 1): UserCardProgress => ({
    cardId: `c${i}`,
    state: 'sprout',
    lastReviewedAt: now - daysAgo * 86_400_000,
    nextReviewAt: now,
    reviewCount,
    wrongCount,
});
const many = (n: number, r: number, w: number, daysAgo?: number) => Object.fromEntries(Array.from({ length: n }, (_, i) => [`c${i}`, card(i, r, w, daysAgo)]));

describe('levelHint', () => {
    it('says nothing with too few answers', () => {
        expect(levelHint(many(5, 4, 0), now)).toBeNull();
    });
    it('suggests a harder level when almost every recall is right', () => {
        expect(levelHint(many(20, 4, 0), now)).toMatchObject({ kind: 'up', recalls: 60 });
    });
    it('suggests an easier pace when most recalls are wrong', () => {
        expect(levelHint(many(20, 2, 2), now)?.kind).toBe('down');
    });
    it('stays quiet in between', () => {
        expect(levelHint(many(20, 3, 1), now)).toBeNull();
    });
    it('does not count the first learned swipe or old reviews', () => {
        expect(levelHint(many(60, 1, 0), now)).toBeNull();
        expect(levelHint(many(20, 4, 0, 30), now)).toBeNull();
    });
});
