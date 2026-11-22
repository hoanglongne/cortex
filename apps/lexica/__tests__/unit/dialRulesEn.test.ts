import { describe, expect, it } from 'vitest';
import { compileRules, findHits, takesAn } from '../../app/lib/dial/match';
import { DIAL_RULES_EN } from '../../app/lib/dial/rulesEn';
import { VOCAB_DATABASE } from '../../app/data/vocabCards';

const IDX = compileRules(DIAL_RULES_EN);
const words = (t: string) => findHits(t, IDX).map((h) => h.en);

describe('English → English rules (#165)', () => {
    it('every rule points at the card with that word, in some form', () => {
        const byId = new Map(VOCAB_DATABASE.map((c) => [c.id, c.word.toLowerCase()]));
        // "eliminated", "a dearth of" and "focus on" all hold the stem of the card word.
        const stem = (w: string) => w.replace(/(ing|ed|es|s|e|y)$/, '');
        expect(DIAL_RULES_EN.filter((r) => !r.en.includes(stem(byId.get(r.cardId) ?? '\0')))).toEqual([]);
    });

    it('swaps plain phrases in context', () => {
        expect(words('We need to get rid of the old system and work together on the new one.')).toEqual(['eliminate', 'collaborate']);
        expect(words('We do not have enough money.')).toEqual(['sufficient']);
        expect(words('It was a huge problem for the company.')).toEqual(['massive']);
        expect(words('She had a chance to speak.')).toEqual(['an opportunity to']);
        expect(words('It is clear that he lied.')).toEqual(['evident']);
    });

    it('replaces a verb with the same form of the academic word', () => {
        expect(words('They got rid of the old system.')).toEqual(['eliminated']);
        expect(words('He is getting rid of it.')).toEqual(['eliminating']);
        expect(words('Planners point out the risks and pointed out others.')).toEqual(['highlight', 'highlighted']);
        expect(words('It is used in schools.')).toEqual(['utilized']);
    });

    it('keeps "a" and "an" right', () => {
        // "a surprising result" would become "a unexpected result".
        expect(words('This is a surprising result.')).toEqual([]);
        // "an enormous problem" would become "an massive problem".
        expect(words('It was an enormous problem.')).toEqual([]);
        expect(words('It was an enormous problem and a huge one.')).toEqual(['massive']);
        expect(words('The result was surprising.')).toEqual(['unexpected']);
        expect(takesAn('unexpected')).toBe(true);
        expect(takesAn('unique')).toBe(false);
        expect(takesAn('hour')).toBe(true);
    });

    it('joins words with a bare hyphen', () => {
        expect(words('They hired hard-working people.')).toEqual(['assiduous']);
        expect(words('The advantage was short-lived.')).toEqual(['fleeting']);
    });

    it('leaves risky uses alone (found by reading real text)', () => {
        expect(words('It is good enough for now.')).toEqual([]);
        expect(words('I cannot keep up with the news.')).toEqual([]);
        expect(words('They are related.')).toEqual([]);
        expect(words('He is confident enough that it works.')).toEqual([]);
        expect(words('The two faced off in the final.')).toEqual([]);
        expect(words('He had no grumbles about it.')).toEqual([]);
        expect(words('I know what I think about the plan.')).toEqual([]);
        expect(words('They collected five points out of six.')).toEqual([]);
        expect(words('He was pointed out by the crowd.')).toEqual([]);
        expect(words('He was worried by the noise.')).toEqual([]);
        expect(words('The special effects were great.')).toEqual([]);
        expect(words('We want to be clear that we agree.')).toEqual([]);
        expect(words('What do you think about the plan?')).toEqual([]);
        expect(words('We need to think about the plan.')).toEqual(['contemplate']);
        expect(words('I used to live there.')).toEqual([]);
        expect(words('He explained that it was late.')).toEqual([]);
        expect(words('Protests were widespread.')).toEqual(['prevalent']);
        expect(words('Widespread protests followed.')).toEqual([]);
        expect(words('A dramatic effect on trade.')).toEqual(['impact']);
        expect(words('She could barely hear him.')).toEqual(['hardly']);
        expect(words('She barely escaped with her life.')).toEqual([]);
        expect(words('The harsh conditions of the camp.')).toEqual([]);
        expect(words('A cool idea to handle the rocks.')).toEqual([]);
    });
});
