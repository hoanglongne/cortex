import { describe, expect, it } from 'vitest';
import { listenFirst, planUseKinds, shadowable, useKindsFor } from '../../app/lib/pronunciation/variety';

const facts = (hasQuote: boolean, hasScenario: boolean, hasMine: boolean) => ({ hasQuote, hasScenario, hasMine });

describe('speaking drill variety', () => {
    it('offers only what a card has, phrase always', () => {
        expect(useKindsFor(facts(false, false, false))).toEqual(['phrase']);
        expect(useKindsFor(facts(true, true, true))).toEqual(['phrase', 'shadow', 'translate', 'mine']);
    });

    it('never gives two words in a row the same kind when there is a choice', () => {
        for (let seed = 1; seed < 40; seed++) {
            const plan = planUseKinds(Array.from({ length: 8 }, () => facts(true, true, false)), seed);
            for (let i = 1; i < plan.length; i++) expect(plan[i]).not.toBe(plan[i - 1]);
            expect(new Set(plan).size).toBe(3);
        }
    });

    it('falls back to the phrase, and keeps quotes short', () => {
        expect(planUseKinds([facts(false, false, false), facts(false, false, false)], 7)).toEqual(['phrase', 'phrase']);
        expect(shadowable('I always keep in mind what my teacher said.')).toBe(true);
        expect(shadowable(Array(30).fill('word').join(' '))).toBe(false);
        expect([0, 1, 2, 3, 4, 5].filter((i) => listenFirst(i, 0))).toEqual([2, 5]);
    });
});
