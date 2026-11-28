import { describe, expect, it } from 'vitest';
import { VOCAB_DATABASE } from '../../app/data/vocabCards';
import { checkCard, checkDeck, wordForms, type CheckableCard } from '../../app/lib/content/cardCheck';

const good: CheckableCard = {
    id: 't1',
    word: 'FEASIBLE',
    ipa: 'ˈfiːzəbl',
    elo: 880,
    level: 'beginner',
    scenario: 'Cả nhóm xem lại kế hoạch làm dự án trong hai tuần, nhưng thấy mục tiêu này không FEASIBLE nếu chỉ có ba người.',
    translationHint: 'Khả thi, có thể thực hiện được',
    collocations: ['feasible plan', 'technically feasible'],
    upgradeModule: {
        simpleSentence: 'This plan is possible to do.',
        targetSlot: 'possible to do',
        academicOptions: [
            { text: 'highly feasible', nuance: 'a', formalityScore: 8 },
            { text: 'viable', nuance: 'b', formalityScore: 9 },
            { text: 'practicable', nuance: 'c', formalityScore: 7 },
        ],
    },
    surgeryModule: { suffix: { text: '-ible', meaning: 'có thể', relatedWords: [{ word: 'visible', meaning: 'có thể thấy' }] } },
};
const rules = (c: CheckableCard) => checkCard(c).map((p) => p.rule);

describe('core deck quality (docs/LEXICA_DECK_AND_TIERS_PLAN.md A1)', () => {
    it('every core card passes the hard checks, and no id is used twice', () => {
        const { problems } = checkDeck(VOCAB_DATABASE as unknown as CheckableCard[]);
        expect(problems).toEqual([]);
    });

    it('accepts a good card', () => {
        expect(checkCard(good)).toEqual([]);
    });

    it('catches what a card must not do', () => {
        expect(rules({ ...good, scenario: good.scenario.replace('FEASIBLE', 'feasible') })).toContain('single_target');
        expect(rules({ ...good, scenario: good.scenario.replace('FEASIBLE', 'POSSIBLE') })).toContain('target_form');
        expect(rules({ ...good, scenario: 'Ngắn quá FEASIBLE.' })).toContain('length');
        expect(rules({ ...good, collocations: ['good plan', 'feasible plan'] })).toContain('collocation_word');
        expect(rules({ ...good, elo: 1400 })).toContain('elo');
        expect(rules({ ...good, upgradeModule: { ...good.upgradeModule!, targetSlot: 'not there' } })).toContain('upgrade_slot');
        expect(rules({ ...good, surgeryModule: { suffix: { text: '-ible', meaning: 'x', relatedWords: [{ word: 'feasible', meaning: 'x' }] } } })).toContain('surgery_related_word');
    });

    it('lets an acronym stand beside the word, and knows word forms', () => {
        expect(rules({ ...good, scenario: `${good.scenario.slice(0, 90)} trên CV.` })).not.toContain('single_target');
        expect(wordForms('plan')).toContain('planned');
        expect(wordForms('study')).toContain('studied');
        expect(wordForms('advocate')).toContain('advocating');
    });
});
