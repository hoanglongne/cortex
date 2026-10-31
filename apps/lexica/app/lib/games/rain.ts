/**
 * "Mưa từ": meanings fall from the top; the player types the English word to
 * clear them before they reach the ground. Slow and short to begin with, quicker
 * as words are cleared; a golden word now and then helps. Pure state functions,
 * unit tested; the screen runs the clock and draws.
 */
import { shuffle, type GameCard, type Rand } from './rounds';

export const LANES = 4;
export const LIVES = 5;
/** Words cleared per speed-up. */
export const LEVEL_EVERY = 4;
/** Every this many words, one is golden. */
export const GOLD_EVERY = 7;
/** A miss slows the rain for a while, so one slip does not snowball. */
export const MISS_RELIEF_MS = 5000;
export const SLOW_MS = 8000;

export type Effect = 'heart' | 'slow' | 'clear';

export interface Drop {
    id: number;
    cardId: string;
    word: string;
    meaning: string;
    lane: number;
    /** 0 at the top, 1 at the bottom (a miss). */
    y: number;
    /** Typing it gives a helping hand. */
    gold?: boolean;
}

export interface Rain {
    drops: Drop[];
    queue: GameCard[];
    nextId: number;
    spawned: number;
    /** Ms until the next drop appears. */
    spawnIn: number;
    /** Ms the rain stays slow (after a miss, or a golden slow-down). */
    slowMs: number;
    lives: number;
    /** No hearts to lose: for getting used to it. */
    practice: boolean;
    cleared: string[];
    missed: string[];
    combo: number;
    best: number;
    score: number;
}

/** Words fit to type: letters only, 3–10 long. */
export const typable = (c: GameCard) => /^[a-z]+$/i.test(c.word.trim()) && c.word.trim().length >= 3 && c.word.trim().length <= 10;

export function newRain(cards: readonly GameCard[], rand: Rand = Math.random, practice = false): Rain {
    return { drops: [], queue: shuffle(cards.filter(typable), rand), nextId: 1, spawned: 0, spawnIn: 2500, slowMs: 0, lives: LIVES, practice, cleared: [], missed: [], combo: 0, best: 0, score: 0 };
}

export const level = (r: Rain) => 1 + Math.floor(r.cleared.length / LEVEL_EVERY);
/** Most words in the air at once: three to begin with, never more than five. */
export const maxDrops = (r: Rain) => Math.min(5, 2 + level(r));
/** Longest word dealt: short ones first. */
export const maxLen = (r: Rain) => Math.min(10, 4 + level(r));
/** Fraction of the screen a drop falls per second. */
export function speed(r: Rain): number {
    const base = 0.055 + 0.012 * (level(r) - 1);
    // A good chain quickens it a little; relief after a miss slows it
    return base * (1 + Math.min(0.2, r.combo * 0.02)) * (r.slowMs > 0 ? 0.6 : 1);
}
const gap = (r: Rain) => Math.max(1500, 3200 - 250 * (level(r) - 1));

export const isOver = (r: Rain) => (!r.practice && r.lives <= 0) || (r.queue.length === 0 && r.drops.length === 0);

/** Moves the clock on by `ms`: drops fall, new ones appear, the ones that land cost a heart (unless practising). */
export function tick(r: Rain, ms: number, rand: Rand = Math.random): Rain {
    if (isOver(r)) return r;
    let { queue, nextId, spawnIn, lives, combo, spawned, slowMs } = r;
    const missed = [...r.missed];
    const fall = speed(r) * (ms / 1000);
    slowMs = Math.max(0, slowMs - ms);
    const drops: Drop[] = [];
    for (const d of r.drops) {
        const y = d.y + fall;
        if (y >= 1) {
            if (!r.practice) lives -= 1;
            combo = 0;
            slowMs = Math.max(slowMs, MISS_RELIEF_MS);
            if (!d.gold) missed.push(d.cardId);
        } else drops.push({ ...d, y });
    }
    spawnIn -= ms;
    while (spawnIn <= 0 && queue.length > 0 && drops.length < maxDrops({ ...r, drops })) {
        // The first word that is short enough for this level, else the next one
        const at = Math.max(0, queue.findIndex((c) => c.word.trim().length <= maxLen(r)));
        const card = queue[at];
        queue = [...queue.slice(0, at), ...queue.slice(at + 1)];
        const used = new Set(drops.filter((d) => d.y < 0.25).map((d) => d.lane));
        const free = Array.from({ length: LANES }, (_, i) => i).filter((i) => !used.has(i));
        const lane = free.length ? free[Math.floor(rand() * free.length)] : Math.floor(rand() * LANES);
        spawned += 1;
        drops.push({ id: nextId++, cardId: card.id, word: card.word.trim().toLowerCase(), meaning: card.translationHint, lane, y: 0, gold: spawned % GOLD_EVERY === 0 });
        spawnIn += gap({ ...r, drops });
    }
    if (spawnIn <= 0) spawnIn = 400;
    return { ...r, drops, queue, nextId, spawned, spawnIn, lives, combo, missed, slowMs };
}

/** The drop the typed letters lead to: the lowest one whose word starts with them. */
export function target(r: Rain, typed: string): Drop | null {
    const t = typed.trim().toLowerCase();
    if (!t) return null;
    return [...r.drops].filter((d) => d.word.startsWith(t)).sort((a, b) => b.y - a.y)[0] ?? null;
}

/** Which help a golden word gives: by its number, so it varies and is not random on a replay. */
export const effectOf = (d: Drop): Effect => (['heart', 'slow', 'clear'] as const)[d.id % 3];

/** Typed text that spells a falling word clears it; the score grows with length, chain and height. A golden one also helps. */
export function submit(r: Rain, typed: string): { rain: Rain; hit: Drop | null; effect: Effect | null } {
    const t = typed.trim().toLowerCase();
    const hit = [...r.drops].filter((d) => d.word === t).sort((a, b) => b.y - a.y)[0] ?? null;
    if (!hit) return { rain: r, hit: null, effect: null };
    const combo = r.combo + 1;
    const points = hit.word.length * 10 + Math.min(combo, 10) * 5 + Math.round((1 - hit.y) * 20) + (hit.gold ? 30 : 0);
    let next: Rain = { ...r, drops: r.drops.filter((d) => d.id !== hit.id), cleared: [...r.cleared, hit.cardId], combo, best: Math.max(r.best, combo), score: r.score + points };
    const effect = hit.gold ? effectOf(hit) : null;
    if (effect === 'heart') next = { ...next, lives: Math.min(LIVES, next.lives + 1) };
    if (effect === 'slow') next = { ...next, slowMs: SLOW_MS };
    if (effect === 'clear') {
        const gone = next.drops.filter((d) => !d.gold || d.id !== hit.id);
        next = { ...next, drops: [], cleared: [...next.cleared, ...gone.map((d) => d.cardId)], score: next.score + gone.reduce((s, d) => s + d.word.length * 5, 0) };
    }
    return { rain: next, hit, effect };
}
