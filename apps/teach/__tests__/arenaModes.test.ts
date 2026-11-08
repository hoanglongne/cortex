import { describe, expect, it } from 'vitest';
import { ARENA_MODES } from '@cortex/classroom';

describe('arena modes', () => {
    it('lists the four ways to play, each with a plain hint', () => {
        expect(ARENA_MODES.map((m) => m.id)).toEqual(['classic', 'team', 'survival', 'progress']);
        for (const m of ARENA_MODES) {
            expect(m.label.length).toBeGreaterThan(2);
            expect(m.hint.length).toBeGreaterThan(20);
        }
    });
});
