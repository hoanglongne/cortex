/**
 * "Luyện nói" on the projector (docs/TEACH_PLAN.md, T5): IELTS-like timing
 * for each part, the next question without repeats, and speaking pairs.
 * Pure, unit tested.
 */
import type { Person } from './classroom/tools';

export type SpeakPart = 1 | 2 | 3;

/** Seconds to prepare and to speak: Part 1 a short answer, Part 2 a minute to note then two to talk, Part 3 a longer answer. */
export const PART_TIMES: Record<SpeakPart, { prep: number; talk: number }> = {
    1: { prep: 0, talk: 30 },
    2: { prep: 60, talk: 120 },
    3: { prep: 0, talk: 60 },
};

export interface SpeakingClock {
    phase: 'prep' | 'talk' | 'done';
    /** Milliseconds left in this phase. */
    left: number;
    /** The phase's full length. */
    total: number;
}

/** Where a turn is after `elapsed` ms of running time. */
export function speakingClock(part: SpeakPart, elapsed: number): SpeakingClock {
    const { prep, talk } = PART_TIMES[part];
    const e = Math.max(0, elapsed);
    if (e < prep * 1000) return { phase: 'prep', left: prep * 1000 - e, total: prep * 1000 };
    const t = e - prep * 1000;
    if (t < talk * 1000) return { phase: 'talk', left: talk * 1000 - t, total: talk * 1000 };
    return { phase: 'done', left: 0, total: talk * 1000 };
}

/** "1:05" */
export const mmss = (ms: number) => {
    const s = Math.ceil(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export interface QuestionFilter {
    part: SpeakPart;
    /** A topic, or any. */
    category: string | null;
    /** Only these (an Oratio assignment's questions), when given. */
    ids?: readonly string[] | null;
}

/** A question of the part (and topic) not shown yet this lesson; when all were shown, any of them again. */
export function pickQuestion<Q extends { id: string; part: number; category: string }>(all: readonly Q[], f: QuestionFilter, seen: readonly string[], rand: () => number): Q | null {
    const fit = all.filter((q) => q.part === f.part && (!f.category || q.category === f.category) && (!f.ids || f.ids.includes(q.id)));
    if (fit.length === 0) return null;
    const fresh = fit.filter((q) => !seen.includes(q.id));
    const pool = fresh.length ? fresh : fit;
    return pool[Math.floor(rand() * pool.length)];
}

/**
 * Pairs for speaking practice: the strongest with the weakest, and so on
 * inwards; an odd one out joins the last pair as a three. The first in each
 * pair speaks first, the other rates with the descriptors; then they swap.
 * Unknown strength counts as the class middle; ties fall differently each time.
 */
export function speakingPairs(people: readonly Person[], rand: () => number): Person[][] {
    if (people.length < 2) return people.length ? [[...people]] : [];
    const known = people.filter((p) => p.strength !== null).map((p) => p.strength!);
    const middle = known.length ? known.reduce((a, b) => a + b, 0) / known.length : 0;
    const shuffled = [...people];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const sorted = shuffled.sort((a, b) => (b.strength ?? middle) - (a.strength ?? middle));
    const pairs: Person[][] = [];
    for (let i = 0; i < Math.floor(sorted.length / 2); i++) pairs.push([sorted[i], sorted[sorted.length - 1 - i]]);
    if (sorted.length % 2) pairs[pairs.length - 1].push(sorted[Math.floor(sorted.length / 2)]);
    return pairs;
}
