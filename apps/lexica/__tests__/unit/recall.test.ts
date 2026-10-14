import { describe, expect, it } from 'vitest';
import { blankWord, buildCheck, checkKind, matchesTyped, pickDistractors, typeHint } from '../../app/lib/engagement/recall';
import type { UserCardProgress } from '../../app/lib/eloAlgorithm';

const card = (id: string, word: string, meaning: string, elo = 1000, level: 'beginner' | 'intermediate' = 'intermediate') =>
    ({ id, word, translationHint: meaning, elo, level });

const POOL = [
    card('a', 'FRUGAL', 'Tiết kiệm'),
    card('b', 'LAVISH', 'Xa hoa', 1010),
    card('c', 'MUNDANE', 'Tầm thường', 990),
    card('d', 'VIVID', 'Sống động', 1200),
    card('e', 'ABUNDANT', 'Dư thừa', 850, 'beginner'),
    card('f', 'COPY', 'Tiết kiệm', 1000), // same meaning as FRUGAL: never offered as a wrong answer
];

const progress = (state: UserCardProgress['state']): UserCardProgress => ({
    cardId: 'a', state, lastReviewedAt: 0, nextReviewAt: 0, reviewCount: 1, wrongCount: 0,
});

const fixed = () => 0.42;

describe('checkKind', () => {
    it('asks for the meaning when they did not peek', () => {
        expect(checkKind(undefined, false)).toBe('meaning');
        expect(checkKind(progress('gold'), false)).toBe('meaning');
    });
    it('hides the word on the retest: pick it for new words, type it after', () => {
        expect(checkKind(undefined, true)).toBe('cloze');
        expect(checkKind(progress('seed'), true)).toBe('cloze');
        expect(checkKind(progress('sprout'), true)).toBe('type');
        expect(checkKind(progress('mastered'), true)).toBe('type');
    });
});

describe('buildCheck', () => {
    it('claiming an unseen word gives four meanings including the answer', () => {
        const c = buildCheck({ card: POOL[0], progress: undefined, pool: POOL, peeked: false, rand: fixed });
        expect(c.kind).toBe('meaning');
        expect(c.isNew).toBe(true);
        expect(c.options).toHaveLength(4);
        expect(c.options).toContain('Tiết kiệm');
        expect(c.options.filter((o) => o === 'Tiết kiệm')).toHaveLength(1);
        expect(c.answer).toBe('Tiết kiệm');
    });

    it('a sprout card not peeked gets three meanings', () => {
        const c = buildCheck({ card: POOL[0], progress: progress('sprout'), pool: POOL, peeked: false, rand: fixed });
        expect(c.options).toHaveLength(3);
    });

    it('a peeked new card comes back as pick-the-word', () => {
        const c = buildCheck({ card: POOL[0], progress: undefined, pool: POOL, peeked: true, rand: fixed });
        expect(c.kind).toBe('cloze');
        expect(c.answer).toBe('FRUGAL');
        expect(c.options).toContain('FRUGAL');
        expect(c.options).toHaveLength(3);
    });

    it('a peeked older card is typed', () => {
        const c = buildCheck({ card: POOL[0], progress: progress('gold'), pool: POOL, peeked: true, rand: fixed });
        expect(c.kind).toBe('type');
        expect(c.options).toEqual([]);
    });
});

describe('pickDistractors', () => {
    it('never offers the answer or the same meaning twice', () => {
        const out = pickDistractors(POOL[0], POOL, 'translationHint', 4, fixed);
        expect(out).not.toContain('Tiết kiệm');
        expect(new Set(out).size).toBe(out.length);
    });

    it('draws from the same level and close difficulty in a full deck', () => {
        const big = [
            POOL[0],
            ...Array.from({ length: 30 }, (_, i) => card(`s${i}`, `SAME${i}`, `Cùng cấp ${i}`, 1000 + i * 5)),
            ...Array.from({ length: 30 }, (_, i) => card(`o${i}`, `OTHER${i}`, `Khác cấp ${i}`, 1000, 'beginner')),
        ];
        const out = pickDistractors(POOL[0], big, 'translationHint', 3, Math.random);
        expect(out.every((o) => o.startsWith('Cùng cấp'))).toBe(true);
    });
});

describe('typed answers', () => {
    it('forgives case and spaces', () => {
        expect(matchesTyped('  Frugal ', 'FRUGAL')).toBe(true);
    });
    it('forgives one typo in longer words only', () => {
        expect(matchesTyped('frugl', 'FRUGAL')).toBe(true);
        expect(matchesTyped('vivd', 'VIVID')).toBe(false);
        expect(matchesTyped('frgl', 'FRUGAL')).toBe(false);
    });
    it('rejects empty input', () => {
        expect(matchesTyped('', 'FRUGAL')).toBe(false);
    });
    it('hints with the first letter', () => {
        expect(typeHint('FRUGAL')).toBe('f _ _ _ _ _');
    });
});

describe('blankWord', () => {
    it('hides every occurrence regardless of case', () => {
        expect(blankWord('Sống FRUGAL lắm, frugal thật', 'FRUGAL')).toBe('Sống _____ lắm, _____ thật');
    });
});
