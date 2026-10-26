import { describe, expect, it } from 'vitest';
import { groupCount, makeGroups, pickOne, weekKey, type Person } from '../app/lib/classroom/tools';

function seeded(seed: number) {
    let s = seed;
    return () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
}
const people: Person[] = Array.from({ length: 13 }, (_, i) => ({ id: `s${i}`, name: `Em ${i}`, strength: i === 5 ? null : 800 + i * 50 }));

describe('calling on a student', () => {
    it('favours those called less this week', () => {
        const rand = seeded(3);
        const called = { s0: 5, s1: 5 };
        const two = people.slice(0, 3);
        const counts: Record<string, number> = {};
        for (let i = 0; i < 2000; i++) {
            const p = pickOne(two, called, rand)!;
            counts[p.id] = (counts[p.id] ?? 0) + 1;
        }
        expect(counts.s2).toBeGreaterThan(counts.s0 * 3);
    });
    it('returns nobody when nobody is there', () => {
        expect(pickOne([], {}, Math.random)).toBeNull();
    });
});

describe('groups', () => {
    it('keeps everyone once, in groups that differ by at most one', () => {
        for (const mode of ['random', 'mixed', 'similar'] as const) {
            const groups = makeGroups(people, 4, mode, seeded(7));
            expect(groups.flat().map((p) => p.id).sort()).toEqual(people.map((p) => p.id).sort());
            const sizes = groups.map((g) => g.length);
            expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
            expect(groups.length).toBe(groupCount(13, 4));
        }
    });
    it('mixes strong and weaker students in "mixed", keeps close ones together in "similar"', () => {
        const avg = (g: Person[]) => g.reduce((n, p) => n + (p.strength ?? 1100), 0) / g.length;
        const mixed = makeGroups(people, 4, 'mixed', seeded(2)).map(avg);
        const similar = makeGroups(people, 4, 'similar', seeded(2)).map(avg);
        const spread = (xs: number[]) => Math.max(...xs) - Math.min(...xs);
        expect(spread(mixed)).toBeLessThan(spread(similar) / 3);
    });
    it('never leaves a group of one when it can be helped', () => {
        expect(groupCount(5, 4)).toBe(1);
        expect(groupCount(9, 4)).toBe(2);
    });
});

it('counts weeks the ISO way', () => {
    expect(weekKey(new Date(2026, 9, 25))).toBe('2026-W43');
    expect(weekKey(new Date(2027, 0, 1))).toBe('2026-W53');
});
