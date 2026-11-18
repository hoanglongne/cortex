import { describe, expect, it } from 'vitest';
import { todaysPicks } from '../../app/lib/games/picks';

describe('todaysPicks (#146)', () => {
    it('gives three different games, stable within a day and changing across days', () => {
        const a = todaysPicks('2026-11-18', 'cert', 0);
        expect(a).toHaveLength(3);
        expect(new Set(a.map((p) => p.id)).size).toBe(3);
        expect(todaysPicks('2026-11-18', 'cert', 0)).toEqual(a);
        expect(todaysPicks('2026-11-19', 'cert', 0)[0].id).not.toBe(a[0].id);
    });

    it('fits the branch and uses a fast game when many words are due', () => {
        expect(['cloze', 'upgrade', 'fill', 'dictate']).toContain(todaysPicks('2026-11-18', 'cert', 0)[1].id);
        expect(['linked', 'listen', 'dictate', 'chain']).toContain(todaysPicks('2026-11-18', 'talk', 0)[1].id);
        const busy = todaysPicks('2026-11-18', null, 25);
        expect(['blitz', 'match']).toContain(busy[2].id);
        expect(busy[2].why).toMatch(/25 từ/);
    });
});
