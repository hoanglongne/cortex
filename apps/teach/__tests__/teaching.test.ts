import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({
    myClasses: vi.fn(),
    board: vi.fn(),
}));
vi.mock('../app/lib/supabase', () => ({ api }));

import { clearTeaching, FRESH_MS, isFresh, loadBoard, loadTeaching } from '../app/lib/teaching';

const board = (id: string, name = id) => ({ class: { id, name }, assignments: [], students: [] });

beforeEach(() => {
    clearTeaching();
    api.myClasses.mockReset().mockResolvedValue([
        { id: 'a', role: 'teacher' },
        { id: 'b', role: 'teacher' },
        { id: 'c', role: 'student' },
    ]);
    api.board.mockReset().mockImplementation(async (id: string) => board(id));
});

describe('teaching cache', () => {
    it('asks once however many pages load at the same time', async () => {
        await Promise.all([loadTeaching(), loadTeaching(), loadTeaching()]);
        expect(api.myClasses).toHaveBeenCalledTimes(1);
        expect(api.board.mock.calls.map((c) => c[0])).toEqual(['a', 'b']);
    });

    it('shares one board request between the class page and its student page', async () => {
        await Promise.all([loadBoard('a'), loadBoard('a')]);
        expect(api.board).toHaveBeenCalledTimes(1);
    });

    it('lets a failed board request be tried again', async () => {
        api.board.mockRejectedValueOnce(new Error('offline'));
        await expect(loadBoard('a')).rejects.toThrow('offline');
        await expect(loadBoard('a')).resolves.toMatchObject({ class: { id: 'a' } });
    });

    it('treats data as fresh for FRESH_MS', () => {
        expect(isFresh(1000, 1000 + FRESH_MS - 1)).toBe(true);
        expect(isFresh(1000, 1000 + FRESH_MS)).toBe(false);
    });
});
