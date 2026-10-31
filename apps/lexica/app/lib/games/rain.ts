/**
 * "Mưa từ": meanings fall from the top; the player types the English word to
 * clear them before they reach the bottom. Faster as words are cleared.
 * Pure state functions, unit tested; the screen runs the clock and draws.
 */
import { shuffle, type GameCard, type Rand } from './rounds';

export const LANES = 4;
export const LIVES = 3;
/** Words cleared per speed-up. */
export const LEVEL_EVERY = 4;

export interface Drop {
    id: number;
    cardId: string;
    word: string;
    meaning: string;
    lane: number;
    /** 0 at the top, 1 at the bottom (a miss). */
    y: number;
}

export interface Rain {
    drops: Drop[];
    queue: GameCard[];
    nextId: number;
    /** Ms until the next drop appears. */
    spawnIn: number;
    lives: number;
    cleared: string[];
    missed: string[];
    combo: number;
    best: number;
    score: number;
}

/** Words fit to type: letters only, 3–10 long. */
export const typable = (c: GameCard) => /^[a-z]+$/i.test(c.word.trim()) && c.word.trim().length >= 3 && c.word.trim().length <= 10;

export function newRain(cards: readonly GameCard[], rand: Rand = Math.random): Rain {
    return { drops: [], queue: shuffle(cards.filter(typable), rand), nextId: 1, spawnIn: 600, lives: LIVES, cleared: [], missed: [], combo: 0, best: 0, score: 0 };
}

export const level = (r: Rain) => 1 + Math.floor(r.cleared.length / LEVEL_EVERY);
/** Fraction of the screen a drop falls per second. */
export const speed = (r: Rain) => 0.09 + 0.018 * (level(r) - 1);
const gap = (r: Rain) => Math.max(1100, 2600 - 220 * (level(r) - 1));

export const isOver = (r: Rain) => r.lives <= 0 || (r.queue.length === 0 && r.drops.length === 0);

/** Moves the clock on by `ms`: drops fall, new ones appear, the ones that land cost a life. */
export function tick(r: Rain, ms: number, rand: Rand = Math.random): Rain {
    if (isOver(r)) return r;
    let { queue, nextId, spawnIn, lives, combo } = r;
    const missed = [...r.missed];
    const fall = speed(r) * (ms / 1000);
    const drops: Drop[] = [];
    for (const d of r.drops) {
        const y = d.y + fall;
        if (y >= 1) {
            lives -= 1;
            combo = 0;
            missed.push(d.cardId);
        } else drops.push({ ...d, y });
    }
    spawnIn -= ms;
    while (spawnIn <= 0 && queue.length > 0 && drops.length < 5) {
        const [card, ...rest] = queue;
        queue = rest;
        const used = new Set(drops.filter((d) => d.y < 0.25).map((d) => d.lane));
        const free = Array.from({ length: LANES }, (_, i) => i).filter((i) => !used.has(i));
        const lane = free.length ? free[Math.floor(rand() * free.length)] : Math.floor(rand() * LANES);
        drops.push({ id: nextId++, cardId: card.id, word: card.word.trim().toLowerCase(), meaning: card.translationHint, lane, y: 0 });
        spawnIn += gap({ ...r, drops });
    }
    if (spawnIn <= 0) spawnIn = 400;
    return { ...r, drops, queue, nextId, spawnIn, lives, combo, missed };
}

/** The drop the typed letters lead to: the lowest one whose word starts with them. */
export function target(r: Rain, typed: string): Drop | null {
    const t = typed.trim().toLowerCase();
    if (!t) return null;
    return [...r.drops].filter((d) => d.word.startsWith(t)).sort((a, b) => b.y - a.y)[0] ?? null;
}

/** Typed text that spells a falling word clears it; the score grows with length, chain and height. */
export function submit(r: Rain, typed: string): { rain: Rain; hit: Drop | null } {
    const t = typed.trim().toLowerCase();
    const hit = [...r.drops].filter((d) => d.word === t).sort((a, b) => b.y - a.y)[0] ?? null;
    if (!hit) return { rain: r, hit: null };
    const combo = r.combo + 1;
    const points = hit.word.length * 10 + Math.min(combo, 10) * 5 + Math.round((1 - hit.y) * 20);
    return {
        hit,
        rain: { ...r, drops: r.drops.filter((d) => d.id !== hit.id), cleared: [...r.cleared, hit.cardId], combo, best: Math.max(r.best, combo), score: r.score + points },
    };
}
