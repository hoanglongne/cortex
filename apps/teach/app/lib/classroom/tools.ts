/**
 * In-class tools (docs/TEACH_PLAN.md, T1): calling on a student fairly and
 * splitting the class into groups. Pure functions; the page keeps who is
 * absent and who was called.
 */

export interface Person {
    id: string;
    name: string;
    /** Higher is stronger: a verified vocabulary score, else words remembered. null when unknown. */
    strength: number | null;
}

/**
 * Someone to call on, out of those present. With `fair`, those called less
 * this week are more likely (weight 1 / (1 + times called)), so the same
 * hands don't come up again and again.
 */
export function pickOne(people: readonly Person[], called: Record<string, number>, rand: () => number, fair = true): Person | null {
    if (people.length === 0) return null;
    const weights = people.map((p) => (fair ? 1 / (1 + (called[p.id] ?? 0)) : 1));
    const total = weights.reduce((a, b) => a + b, 0);
    let r = rand() * total;
    for (let i = 0; i < people.length; i++) {
        r -= weights[i];
        if (r <= 0) return people[i];
    }
    return people[people.length - 1];
}

export type GroupMode = 'random' | 'mixed' | 'similar';

function shuffle<T>(list: readonly T[], rand: () => number): T[] {
    const out = [...list];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

/** How many groups for groups of about `size`: never a group of one when it can be helped. */
export function groupCount(people: number, size: number): number {
    if (people <= size) return 1;
    return Math.max(1, Math.round(people / size));
}

/**
 * Groups of about `size`:
 * - random;
 * - mixed: each group gets strong and weaker students (sorted by strength,
 *   dealt round the groups like cards, back and forth);
 * - similar: students of close strength together.
 * Unknown strength counts as the class middle. Sizes differ by at most one.
 */
export function makeGroups(people: readonly Person[], size: number, mode: GroupMode, rand: () => number): Person[][] {
    const n = groupCount(people.length, Math.max(2, size));
    const known = people.filter((p) => p.strength !== null).map((p) => p.strength!);
    const middle = known.length ? known.reduce((a, b) => a + b, 0) / known.length : 0;
    const strength = (p: Person) => p.strength ?? middle;
    // Shuffle first so ties fall differently each time.
    const base = shuffle(people, rand);
    if (mode === 'random') {
        const groups: Person[][] = Array.from({ length: n }, () => []);
        base.forEach((p, i) => groups[i % n].push(p));
        return groups;
    }
    const sorted = [...base].sort((a, b) => strength(b) - strength(a));
    if (mode === 'similar') {
        // Consecutive slices of the ranking, sizes as even as possible.
        const groups: Person[][] = [];
        let at = 0;
        for (let g = 0; g < n; g++) {
            const take = Math.floor(people.length / n) + (g < people.length % n ? 1 : 0);
            groups.push(sorted.slice(at, at + take));
            at += take;
        }
        return groups;
    }
    // Mixed: snake draft, 0..n-1 then n-1..0, so every group gets a top and a bottom.
    const groups: Person[][] = Array.from({ length: n }, () => []);
    sorted.forEach((p, i) => {
        const round = Math.floor(i / n);
        const slot = i % n;
        groups[round % 2 === 0 ? slot : n - 1 - slot].push(p);
    });
    return groups;
}

/** The ISO week of a date as "2026-W43": who was called is counted per week. */
export function weekKey(d: Date): string {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const day = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - day);
    const year = t.getUTCFullYear();
    const week = Math.ceil(((t.getTime() - Date.UTC(year, 0, 1)) / 86_400_000 + 1) / 7);
    return `${year}-W${String(week).padStart(2, '0')}`;
}
