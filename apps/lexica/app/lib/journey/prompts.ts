/**
 * Questions for "Một câu hôm nay" (app/data/journalPrompts.ts): drawn at
 * random from the chosen depth, from the topic of the word being used when
 * the bank has one (a card about the office gets an office question), so
 * the answer can hold the word. Pure, unit tested.
 */
import type { TopicId } from '../engagement/collection';

export type Depth = 1 | 2 | 3;

export const DEPTH_LABEL: Record<Depth, string> = { 1: 'Nhẹ', 2: 'Vừa', 3: 'Sâu' };

export interface JournalPrompt {
    id: string;
    topic: TopicId;
    depth: Depth;
    text: string;
}

/**
 * A question of `depth`, from `topic` first, never one in `exclude` while
 * others remain (so "Đổi câu" always changes it). `rand` in [0, 1).
 */
export function pickPrompt(bank: readonly JournalPrompt[], o: { topic: TopicId; depth: Depth; exclude?: readonly string[]; rand: number }): JournalPrompt | null {
    const seen = new Set(o.exclude ?? []);
    const atDepth = bank.filter((p) => p.depth === o.depth);
    const pools = [atDepth.filter((p) => p.topic === o.topic), atDepth.filter((p) => p.topic === 'life'), atDepth];
    for (const pool of pools) {
        const fresh = pool.filter((p) => !seen.has(p.id));
        if (fresh.length) return fresh[Math.min(fresh.length - 1, Math.floor(o.rand * fresh.length))];
    }
    // Every question seen: start the round again.
    const pool = pools.find((p) => p.length) ?? [];
    return pool.length ? pool[Math.min(pool.length - 1, Math.floor(o.rand * pool.length))] : null;
}
