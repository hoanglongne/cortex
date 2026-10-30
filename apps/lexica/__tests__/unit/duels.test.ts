import { describe, expect, it } from 'vitest';
import { duelGameQuestions, duelKindLabel, duelLine, duelQuestions, duelReview, sortDuels, type DuelListItem, type DuelResult } from '../../app/lib/duels';
import type { BankCard } from '../../app/lib/placement/engine';

const card = (i: number, collocations?: string[]): BankCard => ({ id: `v${i}`, word: `word${i}`, elo: 900 + i * 5, level: 'beginner', translationHint: `nghĩa ${i}`, collocations });
const bank = Array.from({ length: 30 }, (_, i) => card(i + 1, i % 2 ? [`make word${i + 1}`] : undefined));
const seq = (() => {
    let x = 3;
    return () => {
        x = (x * 9301 + 49297) % 233280;
        return x / 233280;
    };
})();

describe('building a duel', () => {
    const known = bank.map((c) => c.id);
    const qs = duelQuestions(known, bank, 8, seq);

    it('makes the number asked, one per word, each with the right answer once among distinct options', () => {
        expect(qs).toHaveLength(8);
        expect(new Set(qs.map((q) => q.card_id)).size).toBe(8);
        for (const q of qs) {
            expect(q.options.length).toBeGreaterThanOrEqual(2);
            expect(new Set(q.options).size).toBe(q.options.length);
            expect(q.answer).toBeGreaterThanOrEqual(0);
            expect(q.answer).toBeLessThan(q.options.length);
            if (q.kind === 'phrase') expect(q.prompt).toContain('___');
        }
        expect(qs.some((q) => q.kind === 'phrase')).toBe(true);
    });

    it('only asks words I know, and fewer when I know fewer', () => {
        expect(duelQuestions(['v1', 'v2', 'v3', 'unknown'], bank, 8, seq).length).toBeLessThanOrEqual(3);
        expect(duelQuestions([], bank, 8, seq)).toEqual([]);
    });
});

describe('duels in the list', () => {
    const base: DuelListItem = { id: 'd', created_at: '2026-10-29T10:00:00Z', expires_at: '2026-10-31T10:00:00Z', mine: false, with_id: 'u', with_name: 'Bình', state: 'open', total: 8, i_finished: false, their_finished: true, my_correct: null, their_correct: null };
    const now = Date.parse('2026-10-30T10:00:00Z');

    it('says where it stands and what to do', () => {
        expect(duelLine(base, now)).toEqual({ text: 'Bình thách bạn · còn 24 giờ', action: 'play', tone: 'warn' });
        expect(duelLine({ ...base, mine: true, i_finished: true, their_finished: false }, now)).toMatchObject({ text: 'Đang chờ Bình · còn 24 giờ', action: 'wait' });
        expect(duelLine({ ...base, state: 'done', i_finished: true, my_correct: 6, their_correct: 5 }, now)).toEqual({ text: 'Bạn thắng: 6–5', action: 'result', tone: 'accent' });
        expect(duelLine({ ...base, state: 'done', i_finished: true, my_correct: 4, their_correct: 7 }, now).text).toBe('Bình thắng: 4–7');
        expect(duelLine({ ...base, state: 'done', i_finished: true, my_correct: 5, their_correct: 5 }, now).text).toBe('Hoà: 5–5');
        expect(duelLine({ ...base, state: 'expired', mine: true, i_finished: true, my_correct: 6 }, now).text).toContain('không kịp');
        expect(duelLine({ ...base, state: 'expired' }, now).action).toBe('none');
    });

    it('lists what waits for me first', () => {
        const a = { ...base, id: 'a', state: 'done' as const, created_at: '2026-10-30T09:00:00Z' };
        const b = { ...base, id: 'b', created_at: '2026-10-28T09:00:00Z' };
        const c = { ...base, id: 'c', i_finished: true, created_at: '2026-10-29T09:00:00Z' };
        expect(sortDuels([a, c, b]).map((d) => d.id)).toEqual(['b', 'c', 'a']);
    });
});

describe('review after a duel', () => {
    it('puts each question into a result the store reviews once, with my answers', () => {
        const r = { id: 'x1', questions: [{ idx: 0, card_id: 'v1', prompt: 'p', options: ['a', 'b'], answer: 0, mine: 0 }, { idx: 1, card_id: 'v2', prompt: 'p', options: ['a', 'b'], answer: 1, mine: 0 }, { idx: 2, prompt: 'p', options: ['a', 'b'], answer: 0 }] } as unknown as DuelResult;
        const res = duelReview(r);
        expect(res.room_id).toBe('duel:x1');
        expect(res.answers).toEqual([{ card_id: 'v1', correct: true, ms: 0 }, { card_id: 'v2', correct: false, ms: 0 }]);
    });

    it('liar and clue duels reuse the solo rounds in the duel shape', () => {
        const words = ['abundant', 'brief', 'cautious', 'dense', 'eager', 'fragile', 'genuine', 'humble'];
        const bank = words.map((w, i) => ({
            id: `c${i}`,
            word: w.toUpperCase(),
            elo: 900,
            level: 'beginner' as const,
            translationHint: `nghĩa ${w}`,
            collocations: [`${w} ${['supply', 'story', 'move', 'crowd', 'look', 'vase', 'smile', 'tone'][i]}`],
            scenario: `Rất ${w.toUpperCase()} hôm nay.`,
        }));
        const known = bank.map((c) => c.id);
        const liar = duelGameQuestions('liar', known, bank, 5);
        expect(liar.length).toBeGreaterThan(0);
        for (const q of liar) expect(q.kind).toBe('liar');
        const clue = duelGameQuestions('clue', known, bank, 5);
        expect(clue.length).toBeGreaterThan(0);
        for (const q of clue) {
            expect(q.kind).toBe('clue');
            expect(q.prompt.split('\n')).toHaveLength(3);
            expect(q.options).toHaveLength(4);
        }
        expect(duelKindLabel('liar')).toMatch(/tráo/);
    });
});
