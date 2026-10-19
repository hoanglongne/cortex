import { beforeEach, describe, expect, it } from 'vitest';
import { useLexicaStore } from '../../app/store/lexicaStore';
import { wordsFromAnswers } from '../../app/lib/oratioSync';
import { getCard } from '../../app/lib/content/repository';
import { stepOf } from '../../app/lib/journey/steps';

beforeEach(() => {
    localStorage.clear();
    useLexicaStore.setState({ cardProgress: {}, learnedWords: new Set(), journeys: {}, stepHistory: {}, currentDeck: [], speakMisses: {} });
});

describe('Oratio → Lexica', () => {
    it('collects distinct lower-case words and skips junk', () => {
        expect(wordsFromAnswers([{ lexica_words: ['Mitigate', ' robust '] }, { lexica_words: ['mitigate', 4, ''] }, { lexica_words: null }, {}])).toEqual([
            'mitigate',
            'robust',
        ]);
    });

    it('moves an understood word to Dùng, ignores unknown or not-yet-understood words', () => {
        const card = getCard('v001')!;
        const s = () => useLexicaStore.getState();
        // Reached Gặp: understood, remembered and met
        useLexicaStore.setState({ journeys: { v001: { understoodAt: 1, recalls: [], rememberedAt: 2, metAt: 3 } } });
        s().markSaidInOratio([card.word.toUpperCase(), 'no-such-word-xyz']);
        expect(stepOf(s().journeys.v001)).toBe('dung');
        expect(Object.keys(s().journeys)).toEqual(['v001']);
    });
});
