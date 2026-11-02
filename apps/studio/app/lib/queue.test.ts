import { describe, expect, it } from 'vitest';
import { decide, initQueue, skip, undo, restore } from './queue';

const item = (id: string, word: string, trend = 't1') => ({ id, word, trend_id: trend });

describe('review queue', () => {
    const start = initQueue([item('a', 'frugal'), item('b', 'frugal'), item('c', 'deficit'), item('d', 'frugal', 't2')]);

    it('moves sibling sentences of an approved word to the back', () => {
        const s = decide(start, 'a', 'approve');
        expect(s.items.map(i => i.id)).toEqual(['c', 'd', 'b']);
    });

    it('keeps order on reject', () => {
        const s = decide(start, 'a', 'reject');
        expect(s.items.map(i => i.id)).toEqual(['b', 'c', 'd']);
    });

    it('skips to the end', () => {
        expect(skip(start, 'a').items.map(i => i.id)).toEqual(['b', 'c', 'd', 'a']);
    });

    it('undoes the last decision', () => {
        const s = decide(decide(start, 'a', 'approve'), 'c', 'reject');
        const u = undo(s)!;
        expect(u.item.id).toBe('c');
        expect(u.state.items[0].id).toBe('c');
        expect(undo(u.state)!.item.id).toBe('a');
        expect(undo(initQueue([]))).toBeNull();
    });
});

describe('restore', () => {
    it('puts a failed decision back on top and drops it from history', () => {
        const a = { id: 'a', trend_id: null, word: 'x' };
        const b = { id: 'b', trend_id: null, word: 'y' };
        const decided = decide(initQueue([a, b]), 'a', 'approve');
        expect(decided.items.map(i => i.id)).toEqual(['b']);
        const back = restore(decided, a);
        expect(back.items.map(i => i.id)).toEqual(['a', 'b']);
        expect(back.history).toEqual([]);
        expect(restore(back, a)).toBe(back);
    });
});
