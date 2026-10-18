import { beforeEach, describe, expect, it } from 'vitest';
import { parsePassage, parsePassages, splitByWords, wordCount } from '@/app/lib/content/passages';
import { finishLine, finishPassage, passageWith, readPassages, recommendPassages, reviewedToday } from '@/app/lib/engagement/reading';
import { getCard, getPassage, getPassages } from '@/app/lib/content/repository';
import { useLexicaStore } from '@/app/store/lexicaStore';
import type { UserCardProgress } from '@/app/lib/eloAlgorithm';

const known = (id: string, reviewCount = 2): UserCardProgress => ({ cardId: id, state: 'sprout', lastReviewedAt: 0, nextReviewAt: 0, reviewCount, wrongCount: 0, intervalDays: 3, ease: 2.5, streak: 1 });

const raw = {
    id: 'p1',
    level: 'intermediate',
    topic: 'Công việc',
    title: 'Một ngày ở văn phòng',
    text: 'The plan was feasible.\n\nShe made a pragmatic choice.',
    translation: 'Kế hoạch khả thi.\n\nCô ấy chọn thực tế.',
    newWords: ['v004'],
    words: ['v006', 'v004'],
    questions: [{ question: 'Q?', options: ['a', 'b'], answer: 1 }, { question: 'bad', options: ['a'], answer: 0 }],
};

describe('parse passage', () => {
    it('keeps a valid passage and drops bad questions', () => {
        const p = parsePassage(raw)!;
        expect(p.newWords).toEqual(['v004']);
        expect(p.words).toEqual(['v006']); // a new word is not repeated in words
        expect(p.questions).toHaveLength(1);
    });

    it('rejects passages without new words, level or text', () => {
        expect(parsePassage({ ...raw, newWords: [] })).toBeNull();
        expect(parsePassage({ ...raw, level: 'pro' })).toBeNull();
        expect(parsePassage({ ...raw, text: '' })).toBeNull();
    });

    it('reads a published pack and skips duplicates', () => {
        expect(parsePassages({ schema: 1, passages: [raw, raw, { id: 'x' }] }).map((p) => p.id)).toEqual(['p1']);
        expect(parsePassages({ schema: 2, passages: [raw] })).toEqual([]);
    });

    it('marks deck words and their simple forms in the text', () => {
        const segs = splitByWords('Two dilemmas and a feasible plan.', [
            { id: 'v003', word: 'DILEMMA' },
            { id: 'v004', word: 'FEASIBLE' },
        ]);
        expect(segs.filter((s) => s.cardId).map((s) => [s.text, s.cardId])).toEqual([
            ['dilemmas', 'v003'],
            ['feasible', 'v004'],
        ]);
        expect(segs.map((s) => s.text).join('')).toBe('Two dilemmas and a feasible plan.');
        expect(wordCount('One two, three.')).toBe(3);
    });
});

describe('core passages', () => {
    it('ship everyday passages for every level, each using its new words', () => {
        const ps = getPassages().filter((p) => p.kind !== 'dialogue');
        expect(ps.length).toBeGreaterThanOrEqual(10);
        for (const level of ['beginner', 'intermediate', 'advanced', 'expert'] as const) expect(ps.some((p) => p.level === level)).toBe(true);
        const first = getPassage('p_first_day')!;
        expect(first.translation.length).toBeGreaterThan(50);
        for (const p of ps) {
            expect(p.newWords.length).toBeGreaterThanOrEqual(4);
            const found = new Set(splitByWords(p.text, p.newWords.map((id) => ({ id, word: getCard(id)!.word }))).map((s) => s.cardId));
            for (const id of p.newWords) expect(found.has(id), `${p.id} ${id}`).toBe(true);
            expect(wordCount(p.text)).toBeGreaterThanOrEqual(100);
        }
    });
});

describe('reading counts as a light review', () => {
    beforeEach(() => localStorage.clear());
    const p = { id: 'p1', newWords: ['a', 'b'], words: ['c', 'd'] };

    it('reviews the known words, each at most once a day', () => {
        const progress = { a: known('a'), c: known('c'), d: known('d', 0) };
        expect(finishPassage(p, progress, '2026-10-17')).toEqual(['a', 'c']);
        expect([...reviewedToday('2026-10-17')]).toEqual(['a', 'c']);
        // the same day, again: nothing new
        expect(finishPassage(p, progress, '2026-10-17')).toEqual([]);
        // a new day: reviewed again
        expect(finishPassage(p, progress, '2026-10-18')).toEqual(['a', 'c']);
        expect(readPassages().has('p1')).toBe(true);
    });

    it('applies the review through the store (interval grows)', () => {
        useLexicaStore.setState({ cardProgress: { a: known('a') } });
        const before = useLexicaStore.getState().cardProgress.a;
        useLexicaStore.getState().lightReview(['a', 'missing']);
        const after = useLexicaStore.getState().cardProgress.a;
        expect(after.reviewCount).toBe(before.reviewCount + 1);
        expect(after.lastReviewedAt).toBeGreaterThan(0);
        expect(useLexicaStore.getState().cardProgress.missing).toBeUndefined();
    });

    it('says what the reading did', () => {
        expect(finishLine(4, 3)).toBe('Ôn lại 4 từ · Thêm 3 từ mới vào phiên tới');
        expect(finishLine(0, 1)).toBe('Thêm 1 từ mới vào phiên tới');
    });
});

describe('adding words to the session', () => {
    beforeEach(() => useLexicaStore.setState({ cardProgress: {}, queuedCardIds: [], currentDeck: [], selectedLevel: 'expert' }));

    it('queues new words once and deals them first in the next deck', () => {
        const { queueCards } = useLexicaStore.getState();
        expect(queueCards(['v004', 'v004', 'nope'])).toBe(1);
        expect(queueCards(['v004'])).toBe(0);
        useLexicaStore.getState().loadNewDeck();
        const deck = useLexicaStore.getState().currentDeck;
        expect(deck[0]).toMatchObject({ id: 'v004', state: 'seed' }); // a beginner card, dealt despite the expert level
        expect(useLexicaStore.getState().queuedCardIds).toEqual([]);
    });

    it('does not queue words already learned', () => {
        useLexicaStore.setState({ cardProgress: { v004: known('v004') } });
        expect(useLexicaStore.getState().queueCards(['v004'])).toBe(0);
    });
});

describe('choosing a passage', () => {
    const list = [
        { id: 'a', level: 'expert' as const, newWords: ['x'], words: [] },
        { id: 'b', level: 'beginner' as const, newWords: ['y', 'z'], words: [] },
        { id: 'c', level: 'beginner' as const, newWords: ['w'], words: [] },
    ];
    it('suggests the learner level first, unread first, more new words first', () => {
        expect(recommendPassages(list, { level: 'beginner', progress: {}, read: new Set() }).map((p) => p.id)).toEqual(['b', 'c', 'a']);
        expect(recommendPassages(list, { level: 'beginner', progress: {}, read: new Set(['b']) }).map((p) => p.id)).toEqual(['c', 'a', 'b']);
    });

    it('finds a passage with a just-learned word', () => {
        expect(passageWith(list, ['z'])?.id).toBe('b');
        expect(passageWith(list, ['nothing'])).toBeNull();
    });
});
