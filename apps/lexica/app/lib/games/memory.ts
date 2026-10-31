/**
 * "Ghép" as a memory game: twelve cards face down (six words and their
 * meanings, mixed), turn two to find a pair. A run of matches builds a combo;
 * a miss turns both back and costs a little. Pure, unit tested.
 */
import type { MatchTile } from './rounds';

export interface Memory {
    tiles: MatchTile[];
    /** Keys of the cards turned now (0 to 2). */
    open: string[];
    /** Pairs found, by card id. */
    found: string[];
    /** Pairs that were ever mixed up: they go back to review. */
    slipped: string[];
    flips: number;
    combo: number;
    best: number;
    score: number;
}

export const MATCH_POINTS = 20;
export const MISS_COST = 3;

export const newMemory = (tiles: MatchTile[]): Memory => ({ tiles, open: [], found: [], slipped: [], flips: 0, combo: 0, best: 0, score: 0 });

export const pairCount = (m: Memory) => new Set(m.tiles.map((t) => t.pair)).size;
export const finished = (m: Memory) => m.found.length === pairCount(m);
/** Two cards are turned and do not match: the screen shows them, then calls `turnBack`. */
export const pending = (m: Memory) => m.open.length === 2;

export type Turn = 'first' | 'match' | 'miss' | 'ignored';

/** Turn a card. A second card either completes a pair or is a miss (left open until `turnBack`). */
export function turn(m: Memory, key: string): { memory: Memory; result: Turn } {
    const tile = m.tiles.find((t) => t.key === key);
    if (!tile || m.found.includes(tile.pair) || m.open.includes(key) || pending(m)) return { memory: m, result: 'ignored' };
    if (m.open.length === 0) return { memory: { ...m, open: [key], flips: m.flips + 1 }, result: 'first' };
    const first = m.tiles.find((t) => t.key === m.open[0])!;
    const flips = m.flips + 1;
    if (first.pair === tile.pair && first.kind !== tile.kind) {
        const combo = m.combo + 1;
        const gain = MATCH_POINTS + (combo - 1) * 5;
        return { memory: { ...m, open: [], found: [...m.found, tile.pair], flips, combo, best: Math.max(m.best, combo), score: m.score + gain }, result: 'match' };
    }
    // A miss: both pairs involved are marked, the combo ends
    const slipped = [...new Set([...m.slipped, first.pair, tile.pair])];
    return { memory: { ...m, open: [...m.open, key], flips, combo: 0, slipped, score: Math.max(0, m.score - MISS_COST) }, result: 'miss' };
}

/** After a miss: the two cards turn face down again. */
export const turnBack = (m: Memory): Memory => (pending(m) ? { ...m, open: [] } : m);

/** Time bonus when the board is finished: quick boards earn up to 60 more. */
export const timeBonus = (seconds: number): number => Math.max(0, Math.round(60 - seconds));
