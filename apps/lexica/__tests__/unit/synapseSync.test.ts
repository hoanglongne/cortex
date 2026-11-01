import { describe, expect, it } from 'vitest';
import { cardsFor, phraseWord } from '../../app/lib/synapseSync';

describe('Synapse phrases in Lexica', () => {
    it('reads the phrase from its key', () => {
        expect(phraseWord('___ Speak Up')).toBe('speak up');
        expect(phraseWord('turn down')).toBe('turn down');
    });
    it('finds the cards the deck has, once each, and leaves the rest', () => {
        const deck: Record<string, { id: string }> = { 'speak up': { id: 'v1' }, 'turn down': { id: 'v2' } };
        expect(cardsFor(['___ speak up', '___ speak up', '___ give in', '___ turn down'], (w) => deck[w])).toEqual(['v1', 'v2']);
        expect(cardsFor([], (w) => deck[w])).toEqual([]);
    });
});
