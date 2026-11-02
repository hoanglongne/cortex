import { describe, expect, it } from 'vitest';
import { bulkSummary, runBulk } from './bulk';

describe('runBulk', () => {
    it('does every id, a few at a time, and keeps going after a failure', async () => {
        let running = 0;
        let peak = 0;
        const r = await runBulk(['a', 'b', 'c', 'd', 'e'], async (id) => {
            running++;
            peak = Math.max(peak, running);
            await new Promise((res) => setTimeout(res, 5));
            running--;
            if (id === 'c') throw new Error('boom');
        }, undefined, 2);
        expect(peak).toBe(2);
        expect(r.done.sort()).toEqual(['a', 'b', 'd', 'e']);
        expect(r.failed).toEqual([{ id: 'c', error: 'boom' }]);
    });
    it('reports progress up to the total', async () => {
        const seen: number[] = [];
        await runBulk(['a', 'b', 'c'], async () => {}, (n) => seen.push(n), 1);
        expect(seen).toEqual([1, 2, 3]);
    });
    it('handles an empty list', async () => {
        expect(await runBulk([], async () => {})).toEqual({ done: [], failed: [] });
    });
});

describe('bulkSummary', () => {
    it('mentions failures', () => {
        expect(bulkSummary('duyệt', { done: ['a'], failed: [] })).toBe('Đã duyệt 1.');
        expect(bulkSummary('loại', { done: ['a'], failed: [{ id: 'b', error: 'x' }] })).toBe('Đã loại 1, lỗi 1 (x).');
    });
});
