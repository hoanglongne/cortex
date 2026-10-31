import { describe, expect, it } from 'vitest';
import { canMarkKnown, KNOWN_DAILY_CAP, knownToday, markKnown, unmarkKnown, withoutKnown } from '../../app/lib/journey/known';

const noon = new Date(2026, 4, 10, 12).getTime();
const yesterday = new Date(2026, 4, 9, 12).getTime();

describe('known words', () => {
    it('marks a word once and can take it back', () => {
        let k = markKnown({}, 'a', noon);
        expect(markKnown(k, 'a', noon + 5000)).toBe(k);
        expect(Object.keys(k)).toEqual(['a']);
        k = unmarkKnown(k, 'a');
        expect(k).toEqual({});
        expect(unmarkKnown(k, 'zzz')).toBe(k);
    });

    it('counts only today, and stops at the daily cap', () => {
        let k: Record<string, number> = { old: yesterday };
        expect(knownToday(k, noon)).toBe(0);
        for (let i = 0; i < KNOWN_DAILY_CAP; i++) {
            expect(canMarkKnown(k, noon)).toBe(true);
            k = markKnown(k, `w${i}`, noon);
        }
        expect(knownToday(k, noon)).toBe(KNOWN_DAILY_CAP);
        expect(canMarkKnown(k, noon)).toBe(false);
        // tomorrow the cap is fresh
        expect(canMarkKnown(k, noon + 24 * 3600 * 1000)).toBe(true);
    });

    it('leaves known words out of what is dealt', () => {
        const cards = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
        expect(withoutKnown(cards, { b: noon }).map((c) => c.id)).toEqual(['a', 'c']);
    });
});
