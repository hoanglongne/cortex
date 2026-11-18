import { describe, expect, it } from 'vitest';
import { wordSounds } from '../../app/lib/pronunciation/wordSounds';

describe('wordSounds (#157)', () => {
    it('lines letters up with sounds', () => {
        const s = wordSounds('think', ['TH', 'IH1', 'NG', 'K'])!;
        expect(s.map((x) => x.letters).join('')).toBe('think');
        expect(s[0]).toMatchObject({ letters: 'th', phone: 'TH', ipa: 'θ' });
        expect(s.map((x) => x.phone)).toEqual(['TH', 'IH', 'NG', 'K']);
    });

    it('returns null without phones', () => {
        expect(wordSounds('think', null)).toBeNull();
        expect(wordSounds('think', [])).toBeNull();
    });
});
