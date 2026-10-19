import { describe, expect, it } from 'vitest';
import { browse, fold, OWN_DECK, packsOf, toggleAll, type Filter } from '../app/modules/lexica/browse';
import type { IndexCard } from '../app/modules/lexica/words';

const card = (id: string, word: string, meaning: string, s: Partial<IndexCard> = {}): IndexCard => ({ id, word, meaning, level: 'beginner', branch: 'cert', ...s });
const cards = [
    card('v1', 'ABUNDANT', 'Dư thừa'),
    card('v2', 'DEADLINE', 'Hạn chót', { level: 'intermediate', pack: 'Tuần lương chưa về' }),
    card('g1', 'make sense', 'Hợp lý, hiểu được', { branch: 'talk' }),
    card('t1', 'side hustle', 'Nghề tay trái', { pack: 'Tuần lương chưa về' }),
    card('t2', 'ghosting', 'Lặn mất tăm', { pack: 'Mạng xã hội' }),
];
const all: Filter = { branch: '', level: '', pack: '', q: '' };
const ids = (f: Partial<Filter>) => browse(cards, { ...all, ...f }).map((c) => c.id);

describe('browsing Lexica cards', () => {
    it('filters by branch, level and pack', () => {
        expect(ids({ branch: 'talk' })).toEqual(['g1']);
        expect(ids({ level: 'intermediate' })).toEqual(['v2']);
        expect(ids({ pack: 'Tuần lương chưa về' })).toEqual(['v2', 't1']);
        expect(ids({ pack: OWN_DECK })).toEqual(['v1', 'g1']);
    });

    it('searches words and meanings without Vietnamese marks, word matches first', () => {
        expect(ids({ q: 'hop ly' })).toEqual(['g1']);
        expect(ids({ q: 'Hạn' })).toEqual(['v2']);
        expect(ids({ q: 'd' })[0]).toBe('v2');
        expect(fold(' Đúng ')).toBe('dung');
    });

    it('lists packs with counts, biggest first, within branch and level', () => {
        expect(packsOf(cards, { branch: '', level: '' })).toEqual([
            { name: 'Tuần lương chưa về', count: 2 },
            { name: 'Mạng xã hội', count: 1 },
        ]);
        expect(packsOf(cards, { branch: '', level: 'intermediate' })).toEqual([{ name: 'Tuần lương chưa về', count: 1 }]);
    });

    it('picks a whole list up to the limit, or takes it all out again', () => {
        expect(toggleAll(['a'], ['a', 'b', 'c'], 2)).toEqual(['a', 'b']);
        expect(toggleAll(['x', 'a', 'b'], ['a', 'b'], 10)).toEqual(['x']);
        expect(toggleAll([], [], 10)).toEqual([]);
    });
});
