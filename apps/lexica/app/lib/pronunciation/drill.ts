/**
 * "Luyện nói 2 phút": which words to practise, and the list of words that
 * were hard to say (docs/LEXICA_FEEDBACK_TASKS.md T8). Speaking does not move
 * the SRS dates, so the practice remembers when each word was last spoken.
 */
import type { UserCardProgress } from '../eloAlgorithm';
import type { SpeakLevel } from './score';

export const DRILL_SIZE = 5;

const DAY_MS = 86_400_000;
/** Words practised this recently wait unless nothing else is left. */
const REST_DAYS = 3;

/** A stable shuffle key: the same seed gives the same order, another seed another one. */
const shuffleKey = (id: string, seed: number) => {
    let h = seed * 2654435761;
    for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 2246822519);
    return h >>> 0;
};

/**
 * Up to 5 words, different from one practice to the next:
 * - up to 2 hard-to-say words not practised today;
 * - then words not said clearly yet and not practised for a few days,
 *   due ones first, the rest in an order that changes with `seed`;
 * - words practised in the last days only when nothing else is left.
 */
export function pickDrillWords(
    progress: Record<string, UserCardProgress | undefined>,
    misses: Record<string, number>,
    now = Date.now(),
    n = DRILL_SIZE,
    opts: { spokenAt?: Record<string, number>; said?: (cardId: string) => boolean; seed?: number } = {},
): string[] {
    const spokenAt = opts.spokenAt ?? {};
    const startOfDay = new Date(now).setHours(0, 0, 0, 0);
    const out: string[] = [];
    const add = (id: string) => {
        if (out.length < n && !out.includes(id) && progress[id]) out.push(id);
    };
    hardToSay(misses)
        .filter((h) => spokenAt[h.cardId] === undefined || spokenAt[h.cardId] < startOfDay)
        .slice(0, 2)
        .forEach((h) => add(h.cardId));
    const known = Object.values(progress).filter((p): p is UserCardProgress => !!p);
    const rested = (id: string) => now - (spokenAt[id] ?? 0) >= REST_DAYS * DAY_MS;
    const rank = (p: UserCardProgress) => [rested(p.cardId) ? 0 : 1, opts.said?.(p.cardId) ? 1 : 0, p.nextReviewAt <= now ? 0 : 1];
    known
        .map((p) => ({ p, r: rank(p), due: p.nextReviewAt, k: shuffleKey(p.cardId, opts.seed ?? 0) }))
        .sort((a, b) => a.r[0] - b.r[0] || a.r[1] - b.r[1] || a.r[2] - b.r[2] || (a.r[2] === 0 ? a.due - b.due : a.k - b.k))
        .forEach(({ p }) => add(p.cardId));
    return out;
}

/** Words said "Chưa rõ" at least once, most misses first. */
export function hardToSay(misses: Record<string, number>): { cardId: string; misses: number }[] {
    return Object.entries(misses)
        .filter(([, m]) => m > 0)
        .map(([cardId, m]) => ({ cardId, misses: m }))
        .sort((a, b) => b.misses - a.misses || a.cardId.localeCompare(b.cardId));
}

/** "Chưa rõ" adds a miss; "Rõ" takes one off, so a word leaves the list once it is said well. */
export function applySpeakResult(misses: Record<string, number>, cardId: string, level: SpeakLevel): Record<string, number> {
    const next = { ...misses };
    if (level === 'unclear') next[cardId] = (next[cardId] ?? 0) + 1;
    else if (level === 'clear' && next[cardId]) {
        next[cardId] -= 1;
        if (next[cardId] <= 0) delete next[cardId];
    }
    return next;
}
