import { describe, expect, it } from 'vitest';
import { getAllCards } from '../../app/lib/content/repository';
import { blankPhrase, estimate, FAKE_WORDS, ieltsRange, isDone, know, MAX_ITEMS, nextItem, result, retake, type Answer, type BankCard, type Response } from '../../app/lib/placement/engine';

const bank: BankCard[] = getAllCards().filter((c) => (c.branch ?? 'cert') === 'cert');

/** A seeded random, so runs repeat. */
function seeded(seed: number) {
    let s = seed;
    return () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
}

/** A simulated learner at `ability`: knows by the model, guesses a fourth of the rest, says "không biết" sometimes. */
function take(ability: number, seed: number, overclaim = false): Response[] {
    const rand = seeded(seed);
    const responses: Response[] = [];
    while (!isDone(responses)) {
        const item = nextItem(bank, responses, rand);
        if (!item) break;
        let answer: Answer;
        if (item.cardId === null) answer = overclaim || rand() < 0.15 ? 'wrong' : 'right';
        else if (rand() < know(ability, item.difficulty!)) answer = 'right';
        else answer = rand() < 0.3 ? 'skip' : rand() < item.guess ? 'right' : 'wrong';
        responses.push({ item, answer });
    }
    return responses;
}

describe('adaptive vocabulary test', () => {
    it('lands near the true level for learners across the scale', () => {
        for (const ability of [850, 1000, 1150, 1300, 1450]) {
            const errors = [1, 2, 3, 4, 5, 6].map((seed) => Math.abs(result(take(ability, seed * 97)).score - ability));
            const mean = errors.reduce((a, b) => a + b, 0) / errors.length;
            expect(mean, `ability ${ability}`).toBeLessThan(110);
        }
    });

    it('stops between 15 and 30 questions and never asks a card twice', () => {
        for (const seed of [3, 7, 11]) {
            const r = take(1100, seed);
            const scored = r.filter((x) => x.item.cardId !== null);
            expect(scored.length).toBeGreaterThanOrEqual(15);
            expect(scored.length).toBeLessThanOrEqual(MAX_ITEMS);
            const ids = scored.map((x) => x.item.cardId);
            expect(new Set(ids).size).toBe(ids.length);
        }
    });

    it('builds sound questions: four different options, the answer among them', () => {
        const rand = seeded(5);
        const responses: Response[] = [];
        for (let i = 0; i < 40; i++) {
            const item = nextItem(bank, responses, rand)!;
            expect(new Set(item.options).size).toBe(item.options.length);
            expect(item.answer).toBeGreaterThanOrEqual(0);
            if (item.kind === 'phrase') expect(item.prompt).toContain('___');
            if (item.cardId === null) expect(FAKE_WORDS).toContain(item.prompt);
            responses.push({ item, answer: 'right' });
        }
        // The right option is not always in the same place.
        expect(new Set(responses.filter((r) => r.item.kind !== 'real').map((r) => r.item.answer)).size).toBeGreaterThan(1);
    });

    it('asks listening questions only when sound is on: one word, spoken, among the options', () => {
        const rand = seeded(8);
        const withSound: Response[] = [];
        for (let i = 0; i < 24; i++) withSound.push({ item: nextItem(bank, withSound, rand, 1000, true)!, answer: 'right' });
        const listen = withSound.filter((r) => r.item.kind === 'listen');
        expect(listen.length).toBeGreaterThan(4);
        for (const r of listen) {
            expect(r.item.prompt).not.toContain(' ');
            expect(r.item.options[r.item.answer]).toBe(r.item.prompt);
        }
        const quiet: Response[] = [];
        for (let i = 0; i < 24; i++) quiet.push({ item: nextItem(bank, quiet, rand)!, answer: 'right' });
        expect(quiet.some((r) => r.item.kind === 'listen')).toBe(false);
    });

    it('reports made-up words called real', () => {
        expect(result(take(1100, 9, true)).fakes.yes).toBeGreaterThan(0);
    });

    it('is not moved by "không biết" as much as by wrong guesses', () => {
        const item = nextItem(bank, [], seeded(1))!;
        const scoredItem = item.difficulty === null ? { ...item, difficulty: 1000 } : item;
        const skip = estimate(Array.from({ length: 5 }, () => ({ item: scoredItem, answer: 'skip' as const }))).score;
        const wrong = estimate(Array.from({ length: 5 }, () => ({ item: scoredItem, answer: 'wrong' as const }))).score;
        expect(Math.abs(skip - wrong)).toBeLessThan(200);
        expect(skip).toBeLessThan(1000);
    });

    it('blanks the word in a phrase, and gives an IELTS range, never one number', () => {
        expect(blankPhrase({ id: 'x', word: 'ABUNDANT', elo: 900, level: 'beginner', translationHint: 'x', collocations: ['abundant supply'] })).toBe('___ supply');
        expect(ieltsRange(1150, 40)).toMatch(/^\d\.\d–\d\.\d$/);
        const [lo, hi] = ieltsRange(1150, 40).split('–').map(Number);
        expect(hi).toBeGreaterThan(lo);
    });
});

describe('re-takes', () => {
    const day = 86_400_000;
    const last = { at: 0, score: 1000, sd: 50, level: 'intermediate' as const, reviewsAt: 50 };
    it('lets the first test count, then waits 14 days and 100 reviews', () => {
        expect(retake([], 0, 0).ok).toBe(true);
        expect(retake([last], 200, 10 * day)).toMatchObject({ ok: false, daysLeft: 4, reviewsLeft: 0 });
        expect(retake([last], 100, 20 * day)).toMatchObject({ ok: false, daysLeft: 0, reviewsLeft: 50 });
        expect(retake([last], 150, 14 * day).ok).toBe(true);
    });
});
