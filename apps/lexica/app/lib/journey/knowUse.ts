/**
 * Khoảng cách Biết – Dùng in Lexica (issue #137), pure. A word is "used" once
 * it was said clearly, in Lexica or in an Oratio answer (journeys.usedAt).
 */
import type { Journeys } from './steps';

export interface KnowUseCount { learned: number; used: number; unused: string[] }

export function knowUseCount(learnedIds: Iterable<string>, journeys: Journeys, wordOf: (id: string) => string | undefined): KnowUseCount {
    // Count each word once, even when it has several cards.
    const words = new Map<string, { ids: string[]; used: boolean }>();
    for (const id of learnedIds) {
        const w = wordOf(id)?.toLowerCase();
        if (!w) continue;
        const e = words.get(w) ?? { ids: [], used: false };
        e.ids.push(id);
        e.used ||= Boolean(journeys[id]?.usedAt);
        words.set(w, e);
    }
    const unused = [...words.values()].filter((e) => !e.used).map((e) => e.ids[0]);
    return { learned: words.size, used: words.size - unused.length, unused };
}

/** Review order: words never said come first, otherwise the given order is kept. */
export function unsaidFirst(ids: string[], journeys: Journeys): string[] {
    const never = ids.filter((id) => !journeys[id]?.usedAt);
    const said = ids.filter((id) => journeys[id]?.usedAt);
    return [...never, ...said];
}
