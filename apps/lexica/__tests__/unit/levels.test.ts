import { describe, expect, it } from 'vitest';
import { VOCAB_DATABASE } from '@/app/data/vocabCards';
import { getDeckCards } from '@/app/lib/content/repository';
import { deckSize, eloRangeText, LEVELS, levelForElo, levelStats, scalePosition, suggestedLevel } from '@/app/lib/levels';

describe('levels', () => {
    it('counts words per level from the deck, each card once', () => {
        const unique = new Map(VOCAB_DATABASE.map((c) => [c.id, c]));
        const cert = getDeckCards().filter((c) => (c.branch ?? 'cert') === 'cert');
        const stats = levelStats(cert, {});
        for (const l of LEVELS) {
            const expected = [...unique.values()].filter((c) => c.level === l.id).length;
            expect(stats[l.id].total).toBe(expected);
            expect(stats[l.id].total).toBeGreaterThan(0);
            expect(stats[l.id].samples).toHaveLength(3);
        }
        const sum = LEVELS.reduce((n, l) => n + stats[l.id].total, 0);
        expect(sum).toBe(deckSize(cert));
    });

    it('counts a card as remembered once it was reviewed', () => {
        const cards = [
            { id: 'a', word: 'A', elo: 850, level: 'beginner' as const },
            { id: 'b', word: 'B', elo: 860, level: 'beginner' as const },
        ];
        const progress = { a: { cardId: 'a', state: 'seed' as const, lastReviewedAt: 0, nextReviewAt: 0, reviewCount: 1, wrongCount: 0 } };
        expect(levelStats(cards, progress).beginner).toMatchObject({ total: 2, remembered: 1 });
    });

    it('uses one set of ELO bands for the test and the picker', () => {
        expect(levelForElo(800)).toBe('beginner');
        expect(levelForElo(949)).toBe('beginner');
        expect(levelForElo(950)).toBe('intermediate');
        expect(levelForElo(1149)).toBe('intermediate');
        expect(levelForElo(1150)).toBe('advanced');
        expect(levelForElo(1350)).toBe('expert');
        expect(levelForElo(2000)).toBe('expert');
        // contiguous bands, no gaps or overlaps
        for (let i = 1; i < LEVELS.length; i++) expect(LEVELS[i].eloMin).toBe(LEVELS[i - 1].eloMax);
        expect(eloRangeText(LEVELS[1])).toBe('ELO 950–1150');
        expect(eloRangeText(LEVELS[3])).toBe('ELO 1350+');
    });

    it('suggests from the test until the learner has swiped enough', () => {
        expect(suggestedLevel({ elo: 1200, swipes: 3, tested: 'beginner' })).toBe('beginner');
        expect(suggestedLevel({ elo: 1200, swipes: 40, tested: 'beginner' })).toBe('advanced');
        expect(suggestedLevel({ elo: 1000, swipes: 0, tested: null })).toBe('intermediate');
    });

    it('places ELO on the scale', () => {
        expect(scalePosition(800)).toBe(0);
        expect(scalePosition(1500)).toBe(1);
        expect(scalePosition(2000)).toBe(1);
    });
});
