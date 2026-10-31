import { describe, expect, it } from 'vitest';
import { botReply, check, isWord, limitsAt, makeDict, wordScore } from '../../app/lib/games/chain';

const dict = makeDict('apple elephant tiger rabbit tree plan happy xylophone', 'the eagle table elbow yellow wolf fish hand dog gate ear');

describe('Nối chuỗi', () => {
    it('knows real words, with plain inflections, and refuses nonsense', () => {
        expect(isWord('Apple', dict)).toBe(true);
        expect(isWord('plans', dict)).toBe(true);
        expect(isWord('planned', dict)).toBe(true);
        expect(isWord('planning', dict)).toBe(true);
        expect(isWord('happily', dict)).toBe(true);
        expect(isWord('zzxq', dict)).toBe(false);
        expect(isWord('ab', dict)).toBe(false);
        expect(isWord('two words', dict)).toBe(false);
        expect(isWord('learnword', dict, new Set(['learnword']))).toBe(true);
    });

    it('checks the first letter, repeats and spelling, in that order', () => {
        const used = new Set(['apple']);
        expect(check('apple', 'elephant', used, dict)).toBe('ok');
        expect(check('apple', 'tiger', used, dict)).toBe('start');
        expect(check('tiger', 'rabbit', new Set(['rabbit']), dict)).toBe('used');
        expect(check('apple', 'ezzzz', used, dict)).toBe('nonword');
    });

    it('the computer answers with a common word that fits and was not used', () => {
        const used = new Set(['eagle']);
        const w = botReply('apple', used, dict, () => 0.1)!;
        expect(w[0]).toBe('e');
        expect(used.has(w)).toBe(false);
        expect(botReply('apple', new Set(['eagle', 'elbow']), dict)).toBeNull();
        expect(botReply('zzz', used, dict)).toBeNull();
    });

    it('scores longer words more and learnt ones much more', () => {
        expect(wordScore('elephant', false)).toBeGreaterThan(wordScore('tree', false));
        expect(wordScore('tree', true)).toBeGreaterThan(wordScore('tree', false));
    });

    it('conditions join at fixed turns and stack, and a word that breaks them is refused', () => {
        expect(limitsAt(5).minLen).toBe(3);
        expect(limitsAt(6)).toMatchObject({ minLen: 4, fresh: expect.any(String) });
        expect(limitsAt(7).fresh).toBeUndefined();
        const l = limitsAt(18, 'r');
        expect(l).toMatchObject({ minLen: 5, maxLen: 8, has: 'r' });
        const d = makeDict('tree tea tried', 'tree');
        expect(check('cat', 'tea', new Set(), d, undefined, limitsAt(6))).toBe('rule');
        expect(check('cat', 'tree', new Set(), d, undefined, limitsAt(6))).toBe('ok');
        expect(check('cat', 'tried', new Set(), d, undefined, limitsAt(18, 'x'))).toBe('rule');
    });
});
