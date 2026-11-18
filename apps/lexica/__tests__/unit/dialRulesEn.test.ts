import { describe, expect, it } from 'vitest';
import { compileRules, findHits } from '../../app/lib/dial/match';
import { DIAL_RULES_EN } from '../../app/lib/dial/rulesEn';
import { VOCAB_DATABASE } from '../../app/data/vocabCards';

const IDX = compileRules(DIAL_RULES_EN);
const words = (t: string) => findHits(t, IDX).map((h) => h.en);

describe('English → English rules (#165)', () => {
    it('every rule points at the card with that word', () => {
        const byId = new Map(VOCAB_DATABASE.map((c) => [c.id, c.word.toLowerCase()]));
        expect(DIAL_RULES_EN.filter((r) => byId.get(r.cardId) !== r.en)).toEqual([]);
    });

    it('swaps plain phrases in context', () => {
        expect(words('We need to get rid of the old system and work together on the new one.')).toEqual(['eliminate', 'collaborate']);
        expect(words('The data is related to income.')).toEqual(['relevant']);
        expect(words('We do not have enough money.')).toEqual(['sufficient']);
    });

    it('leaves risky uses alone', () => {
        expect(words('It is good enough for now.')).toEqual([]);
        expect(words('I cannot keep up with the news.')).toEqual([]);
        expect(words('They are related.')).toEqual([]);
    });
});
