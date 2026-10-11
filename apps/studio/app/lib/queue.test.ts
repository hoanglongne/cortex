import { describe, expect, it } from 'vitest';
import { decide, initQueue, skip, undo } from './queue';

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
