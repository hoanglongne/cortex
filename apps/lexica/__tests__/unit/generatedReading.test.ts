import { describe, expect, it } from 'vitest';
import { coversWords, wordsIn } from '../../app/lib/content/generated';

const words = ['abundant', 'dilemma', 'convenient', 'coerce', 'encourage'].map((w, i) => ({ id: `c${i}`, word: w }));

describe('generated reading coverage', () => {
    it('finds the words with endings', () => {
        expect(wordsIn('He was encouraged. A dilemma, but convenient.', words).sort()).toEqual(['c1', 'c2', 'c4']);
    });

    it('accepts a text that holds enough of the words', () => {
        expect(coversWords('Fruit is abundant. It is a dilemma, so we encourage you. Convenient too.', words)).toBe(true);
    });

    it('rejects the text of the bug: none of the words', () => {
        expect(coversWords('Minh, are you coming to Dalat? Come on, it is a good opportunity to gather.', words)).toBe(false);
    });

    it('accepts any text when no words were asked', () => {
        expect(coversWords('anything', [])).toBe(true);
    });
});
