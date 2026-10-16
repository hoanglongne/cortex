import { describe, expect, it } from 'vitest';
import {
    afterSave,
    afterSkip,
    canOffer,
    checkWritten,
    DEFAULT_PROMPT,
    displaySentence,
    insertWord,
    pickCandidate,
    sentenceOptions,
    SNOOZE_MS,
    type MySentence,
} from '../../app/lib/engagement/mySentence';
import type { ContentCard } from '../../app/lib/content/pack';

const card = (id: string, over: Partial<ContentCard> = {}): ContentCard => ({
    id,
    word: 'SUBTLE',
    elo: 1000,
    level: 'intermediate',
    scenario: 'Quán đổi công thức rất SUBTLE.',
    translationHint: 'Tinh tế',
    ...over,
});

const mine = (text: string): MySentence => ({ text, kind: 'written', at: 1 });

describe('offer backoff', () => {
    it('offers by default, never when turned off', () => {
        expect(canOffer(DEFAULT_PROMPT, 0)).toBe(true);
        expect(canOffer({ ...DEFAULT_PROMPT, off: true }, 0)).toBe(false);
    });

    it('snoozes for three days after two skips in a row, and saving resets the count', () => {
        const once = afterSkip(DEFAULT_PROMPT, 1000);
        expect(once).toMatchObject({ skips: 1, snoozeUntil: 0 });
        expect(canOffer(once, 1000)).toBe(true);
        const twice = afterSkip(once, 1000);
        expect(twice).toMatchObject({ skips: 0, snoozeUntil: 1000 + SNOOZE_MS });
        expect(canOffer(twice, 1000 + SNOOZE_MS - 1)).toBe(false);
        expect(canOffer(twice, 1000 + SNOOZE_MS)).toBe(true);
        expect(afterSave(once).skips).toBe(0);
    });
});

describe('sentenceOptions', () => {
    it('lists the card sentence first, then distinct archetype ones that keep the word', () => {
        const c = card('v1', {
            scenarios: { casual: 'Quán đổi công thức rất SUBTLE.', tech: 'Bug này SUBTLE lắm.', business: 'Không có từ.', student: 'Thầy chấm rất SUBTLE.' },
        });
        expect(sentenceOptions(c)).toEqual(['Quán đổi công thức rất SUBTLE.', 'Bug này SUBTLE lắm.', 'Thầy chấm rất SUBTLE.']);
        expect(sentenceOptions(card('v2'))).toHaveLength(1);
    });
});

describe('pickCandidate', () => {
    const cards: Record<string, ContentCard> = {
        a: card('a'),
        b: card('b', { scenarios: { tech: 'Bug này SUBTLE lắm.' } }),
        c: card('c'),
    };
    const get = (id: string) => cards[id];

    it('prefers a word with sentences to pick from, then the latest one', () => {
        expect(pickCandidate(['a', 'b', 'c'], {}, get)).toBe('b');
        expect(pickCandidate(['a', 'c'], {}, get)).toBe('c');
    });

    it('skips words that already have the learner sentence, and unknown cards', () => {
        expect(pickCandidate(['b', 'zz'], { b: mine('x SUBTLE') }, get)).toBeNull();
        expect(pickCandidate([], {}, get)).toBeNull();
    });
});

describe('checkWritten', () => {
    it('only needs the word and a few words around it', () => {
        expect(checkWritten('  Mẹ nấu  canh rất SUBTLE  ', 'SUBTLE')).toEqual({ ok: true, text: 'Mẹ nấu canh rất SUBTLE' });
        expect(checkWritten('mẹ nấu canh rất subtle', 'SUBTLE').ok).toBe(true);
        expect(checkWritten('Mẹ nấu canh rất ngon', 'SUBTLE')).toEqual({ ok: false, reason: 'no_word' });
        expect(checkWritten('SUBTLE !!', 'SUBTLE')).toEqual({ ok: false, reason: 'too_short' });
        expect(checkWritten(`SUBTLE ${'a'.repeat(170)}`, 'SUBTLE')).toEqual({ ok: false, reason: 'too_long' });
    });

    it('inserts the word in capitals', () => {
        expect(insertWord('Mẹ nấu canh rất', 'subtle')).toBe('Mẹ nấu canh rất SUBTLE ');
        expect(insertWord('', 'subtle')).toBe('SUBTLE ');
    });
});

describe('displaySentence', () => {
    it('uses the learner sentence when it still has the word', () => {
        expect(displaySentence({ word: 'SUBTLE' }, mine('Mẹ nấu canh SUBTLE'), 'gốc')).toEqual({ text: 'Mẹ nấu canh SUBTLE', mine: true });
        expect(displaySentence({ word: 'SUBTLE' }, mine('không có từ'), 'gốc')).toEqual({ text: 'gốc', mine: false });
        expect(displaySentence({ word: 'SUBTLE' }, undefined, 'gốc')).toEqual({ text: 'gốc', mine: false });
    });
});
