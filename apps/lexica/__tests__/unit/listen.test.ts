import { describe, expect, it } from 'vitest';
import { checkDictation, dictationPoints, dictationRounds, fillOk, fillRounds, gotWord, linkedRounds, LINKED, paceRate } from '../../app/lib/games/listen';
import type { GameCard } from '../../app/lib/games/rounds';

const card = (id: string, word: string): GameCard => ({ id, word, translationHint: 'x', scenario: '' } as unknown as GameCard);
const seq = () => {
    let i = 0;
    return () => ((i++ * 0.37) % 1);
};

describe('listening', () => {
    it('dictation: one sentence per word, short ones only', () => {
        const cards = [card('a', 'plan'), card('b', 'rely')];
        const sentences = ['We plan to leave early on Saturday morning.', 'You can rely on her to be on time today.', 'This one is not about any of the words at all really.'];
        const r = dictationRounds(cards, sentences, 5, seq());
        expect(r.map((x) => x.cardId).sort()).toEqual(['a', 'b']);
        expect(r.every((x) => x.sentence.length <= 110)).toBe(true);
        expect(dictationRounds(cards, ['x'.repeat(130) + ' plan'], 2, seq())).toHaveLength(0);
        // Vietnamese lines and speaker labels are not read
        expect(dictationRounds(cards, ['Cô Ngọc: Thầy Phong, we plan to leave soon.', 'Ms Lan: we plan to leave early today.'], 2, seq())).toHaveLength(0);
        expect(dictationRounds(cards, ['\u201D We plan to leave early on Saturday morning.'], 1, seq())[0].sentence).toBe('We plan to leave early on Saturday morning.');
    });

    it('dictation check: marks the words missed and keeps the rest in place', () => {
        const s = "We plan to leave early, don't we?";
        const full = checkDictation(s, "we plan to leave early don't we");
        expect(full.accuracy).toBe(1);
        expect(full.words.every((w) => w.ok)).toBe(true);
        const slip = checkDictation(s, 'we plan to live early dont we');
        expect(slip.words.filter((w) => !w.ok).map((w) => w.text)).toEqual(['leave', "don't"]);
        expect(slip.extra).toEqual(['live', 'dont']);
        expect(slip.accuracy).toBeCloseTo(5 / 7, 2);
        // one dropped word does not shift the rest
        const dropped = checkDictation(s, 'we plan leave early');
        expect(dropped.words.filter((w) => !w.ok).map((w) => w.text)).toEqual(['to', "don't", 'we?']);
        expect(checkDictation(s, '').accuracy).toBe(0);
    });

    it('dictation: my word counts with an ending; points rise with pace and fall with replays', () => {
        const c = checkDictation('She plans the trip well.', 'she plans the trip well');
        expect(gotWord(c, 'plan')).toBe(true);
        expect(gotWord(checkDictation('She plans the trip well.', 'she the trip well'), 'plan')).toBe(false);
        expect(dictationPoints(1, 0.8, 1)).toBe(20);
        expect(dictationPoints(1, 1.2, 1)).toBe(30);
        expect(dictationPoints(1, 1, 5)).toBe(19);
        expect(dictationPoints(0, 1, 1)).toBe(0);
        expect(paceRate(1)).toBe(0.9);
    });

    const text = 'The new manager decided to postpone the meeting until Friday. Everyone agreed it was a sensible decision. She promised to send a short summary tomorrow.';
    it('fill: 3 to 4 blanks, my words first, the answers fit the text', () => {
        const cards = [card('p', 'postpone'), card('s', 'sensible')];
        const r = fillRounds(cards, [text], 2, seq());
        expect(r.length).toBeGreaterThan(0);
        for (const round of r) {
            expect(round.answers.length).toBeGreaterThanOrEqual(3);
            expect(round.answers.length).toBeLessThanOrEqual(4);
            const rebuilt = round.parts.map((p) => ('text' in p ? p.text : round.answers[p.blank])).join('');
            expect(rebuilt).toBe(round.spoken);
            expect(round.cardIds.some((id) => id)).toBe(true);
        }
        expect(fillRounds(cards, ['Too short.'], 2, seq())).toHaveLength(0);
        expect(fillOk(' Postpone ', 'postpone')).toBe(true);
        expect(fillOk('postponed', 'postpone')).toBe(false);
    });

    it('fill: a dialogue label is not read or blanked', () => {
        const d = 'A: I need to postpone our lunch because I have a meeting.\nB: That is fine, we can meet tomorrow instead of today.';
        const r = fillRounds([card('p', 'postpone')], [d], 1, seq());
        expect(r[0]?.spoken ?? '').not.toMatch(/^A:/);
    });

    it('linked speech: the right line is among the options, sound-alikes have two', () => {
        const rounds = linkedRounds(15, seq());
        expect(rounds).toHaveLength(LINKED.length);
        for (const r of rounds) {
            const full = LINKED.find((i) => i.said === r.said)!;
            expect(r.options[r.answer]).toBe(full.full);
            expect(r.options.length).toBe(r.twin ? 2 : 3);
            expect(new Set(r.options).size).toBe(r.options.length);
        }
    });
});
