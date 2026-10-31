import { describe, expect, it } from 'vitest';
import { lookalikes, clozeRounds, sentencesOf, upgradeRounds, blitzRounds, chainOk, chainReplies, detectivePoints, detectiveRounds, ruledOut, gameReview, liarRounds, listenRounds, maskWord, matchBoard, spellOk, spellRounds, type GameCard } from '../../app/lib/games/rounds';

const WORDS = ['abundant', 'brief', 'cautious', 'dense', 'eager', 'fragile', 'genuine', 'humble'];
const bank: GameCard[] = WORDS.map((w, i) => ({
    id: `c${i}`,
    word: w.toUpperCase(),
    translationHint: `nghĩa của ${w}`,
    collocations: [`${w} ${['supply', 'story', 'move', 'crowd', 'look', 'vase', 'smile', 'tone'][i]}`, `very ${w}`],
    scenario: `Hôm nay mọi thứ rất ${w.toUpperCase()} và dễ thấy.`,
}));
const seq = (): (() => number) => {
    let i = 0;
    return () => ((i = (i * 7 + 3) % 11) + 1) / 12;
};

describe('games', () => {
    it('hides the word, whatever its case or ending', () => {
        expect(maskWord('Rất ABUNDANT ở đây', 'abundant')).toBe('Rất ___ ở đây');
        expect(maskWord('no match', 'abundant')).toBeNull();
        expect(maskWord(undefined, 'a')).toBeNull();
    });

    it('blitz: four options with the right one at answer', () => {
        const r = blitzRounds(bank, bank, 6, seq());
        expect(r).toHaveLength(6);
        for (const q of r) {
            expect(q.options).toHaveLength(4);
            expect(new Set(q.options).size).toBe(4);
            const card = bank.find((c) => c.id === q.cardId)!;
            expect(q.options[q.answer]).toBe(card.word);
        }
    });

    it('detective: every clue rules out at least one option, the meaning closes the case, no clue is a sentence with a blank', () => {
        const r = detectiveRounds(bank, bank, 4, seq());
        expect(r.length).toBeGreaterThan(0);
        for (const q of r) {
            const card = bank.find((c) => c.id === q.cardId)!;
            expect(q.clues!.length).toBeGreaterThanOrEqual(2);
            expect(q.clues![q.clues!.length - 1]).toBe(`Nghĩa: ${card.translationHint}`);
            expect(q.cuts).toHaveLength(q.clues!.length);
            for (const cut of q.cuts!) {
                expect(cut.length).toBeGreaterThan(0);
                expect(cut).not.toContain(q.answer);
            }
            // The meaning rules out all three others
            expect(q.cuts![q.cuts!.length - 1]).toHaveLength(3);
            for (const c of q.clues!) expect(c).not.toContain('___');
        }
        const q = r[0];
        expect(ruledOut(q.cuts, 0).size).toBe(0);
        expect(ruledOut(q.cuts, q.clues!.length).size).toBe(3);
        expect(detectivePoints(1, true, 4)).toBe(3);
        expect(detectivePoints(4, true, 4)).toBe(1);
        expect(detectivePoints(2, false, 4)).toBe(0);
    });

    it('liar: exactly one phrase is fake and it is the answer', () => {
        const r = liarRounds(bank, bank, 4, seq());
        expect(r.length).toBeGreaterThan(0);
        const real = new Set(bank.flatMap((c) => c.collocations!));
        for (const q of r) {
            expect(q.options).toHaveLength(4);
            const fakes = q.options.filter((o) => !real.has(o));
            expect(fakes).toHaveLength(1);
            expect(q.options[q.answer]).toBe(fakes[0]);
        }
    });

    it('listen says the word and offers it', () => {
        const q = listenRounds(bank, bank, 1, seq())[0];
        expect(q.options[q.answer]).toBe(q.say);
    });

    it('spell masks all but the first letter', () => {
        const s = spellRounds(bank, 1, seq())[0];
        expect(s.mask.replace(/ /g, '')).toBe(s.word[0].toUpperCase() + '_'.repeat(s.word.length - 1));
        expect(spellOk(' ' + s.word.toUpperCase(), s.word)).toBe(true);
        expect(spellOk('abc', s.word)).toBe(false);
    });

    it('match: each pair appears as a word and a meaning', () => {
        const b = matchBoard(bank, 6, seq());
        expect(b).toHaveLength(12);
        for (const t of b) expect(b.filter((x) => x.pair === t.pair).map((x) => x.kind).sort()).toEqual(['meaning', 'word']);
    });

    it('chain: next word starts with the last letter, used words are skipped', () => {
        expect(chainOk('apple', 'eager')).toBe(true);
        expect(chainOk('apple', 'brief')).toBe(false);
        expect(chainReplies('apple', ['eager', 'egg', 'dense'], new Set(['eager']))).toEqual(['egg']);
    });

    it('review: wrong comes again, right counts once, unknown words are left out', () => {
        const r = gameReview(
            [
                { cardId: 'a', correct: true },
                { cardId: 'a', correct: false },
                { cardId: 'b', correct: true },
                { cardId: 'x', correct: false },
            ],
            (id) => id !== 'x',
        );
        expect(r).toEqual({ again: ['a'], recalled: ['b'] });
    });

    it('cloze: blanks one of my words in a real sentence, endings included', () => {
        const sentences = sentencesOf(['The weather was ABUNDANT this year and everyone enjoyed it. A: skip this line here please ok. He was cautious about every little step he took.']);
        expect(sentences).toHaveLength(2);
        const r = clozeRounds(bank, bank, sentences, 5, seq());
        expect(r.length).toBe(2);
        for (const q of r) {
            expect(q.prompt).toContain('_____');
            expect(q.options[q.answer]).toBe(bank.find((c) => c.id === q.cardId)!.word);
        }
    });

    it('upgrade: the answer is the single most formal option; unclear cards are skipped', () => {
        const mk = (id: string, scores: number[]): GameCard => ({
            ...bank[0],
            id,
            upgradeModule: { simpleSentence: 'There is a very big amount of food.', targetSlot: 'very big amount', academicOptions: scores.map((f, i) => ({ text: `opt${i}`, nuance: '', formalityScore: f })) },
        });
        const r = upgradeRounds([mk('a', [7, 9, 8]), mk('b', [9, 9, 5])], 5, seq());
        expect(r).toHaveLength(1);
        expect(r[0].options[r[0].answer]).toBe('opt1');
        expect(r[0].prompt).toContain('[very big amount]');
    });

    it('lookalikes: wrong options share the first letter and about the length of the right word', () => {
        const big: GameCard[] = [
            'ample', 'avid', 'alert', 'adept', 'acute', 'apt', 'bold', 'brisk', 'calm', 'dense', 'eager', 'fair', 'grim', 'hardy', 'ideal', 'jolly',
        ].map((w, i) => ({ id: `b${i}`, word: w.toUpperCase(), translationHint: `nghĩa ${w}` }));
        const right = big[2]; // ALERT
        const wrong = lookalikes(right, big, 3, seq());
        expect(wrong).toHaveLength(3);
        for (const w of wrong) {
            expect(w[0]).toBe('A');
            expect(Math.abs(w.length - right.word.length)).toBeLessThanOrEqual(1);
        }
        expect(wrong).not.toContain('ALERT');
        // when too few look alike, the rest still come from the bank
        expect(lookalikes(big[6], big, 3, seq())).toHaveLength(3);
    });

});
