import { describe, expect, it } from 'vitest';
import { knowUseCount, unsaidFirst } from '../../app/lib/journey/knowUse';
import type { Journeys } from '../../app/lib/journey/steps';

const j = (usedAt?: number, oratioAt?: number) => ({ understoodAt: 1, recalls: [], ...(usedAt ? { usedAt } : {}), ...(oratioAt ? { oratioAt } : {}) });

describe('Biết – Dùng in Lexica', () => {
    const journeys: Journeys = { a1: j(5, 5), a2: j(), b: j(), c: j(9) };
    const word = (id: string) => ({ a1: 'feasible', a2: 'FEASIBLE', b: 'crucial', c: 'vague' } as Record<string, string>)[id];

    it('counts words once across their cards', () => {
        expect(knowUseCount(['a1', 'a2', 'b', 'c', 'zz'], journeys, word)).toEqual({ learned: 3, used: 2, unused: ['b'], inOratio: 1 });
    });

    it('puts never-said words first, keeping order otherwise', () => {
        expect(unsaidFirst(['c', 'b', 'a1', 'a2'], journeys)).toEqual(['b', 'a2', 'c', 'a1']);
    });
});
