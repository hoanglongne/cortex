/**
 * "Luyện nói 2 phút": which words to practise, and the list of words that
 * were hard to say (docs/LEXICA_FEEDBACK_TASKS.md T8).
 */
import type { UserCardProgress } from '../eloAlgorithm';
import type { SpeakLevel } from './score';

export const DRILL_SIZE = 5;

/**
 * Up to 5 words: a couple of hard-to-say ones first, then words due for
 * review, then the most recently studied.
 */
export function pickDrillWords(progress: Record<string, UserCardProgress | undefined>, misses: Record<string, number>, now = Date.now(), n = DRILL_SIZE): string[] {
    const known = Object.values(progress).filter((p): p is UserCardProgress => !!p);
    const out: string[] = [];
    const add = (id: string) => {
        if (out.length < n && !out.includes(id) && progress[id]) out.push(id);
    };
    hardToSay(misses).slice(0, 2).forEach((h) => add(h.cardId));
    known.filter((p) => p.nextReviewAt <= now).sort((a, b) => a.nextReviewAt - b.nextReviewAt).forEach((p) => add(p.cardId));
    known.sort((a, b) => b.lastReviewedAt - a.lastReviewedAt).forEach((p) => add(p.cardId));
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
