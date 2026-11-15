/**
 * Núm vặn and the review schedule (docs/LEXICA_WOW_PLAN.md §2.4–2.5).
 * Which words to show first: those due (or due within a day), then the other
 * learned words. Pure.
 */
const DAY = 24 * 60 * 60 * 1000;

export function dialPriority(progress: Record<string, { nextReviewAt: number }> | undefined, now = Date.now()): Set<string> {
    const due: string[] = [];
    const rest: string[] = [];
    for (const [id, p] of Object.entries(progress ?? {})) (p.nextReviewAt <= now + DAY ? due : rest).push(id);
    return new Set([...due, ...rest]);
}

/** Due words before other learned words: pickHits takes priority cards first, in this order. */
export function dialRank(progress: Record<string, { nextReviewAt: number }> | undefined, now = Date.now()): Map<string, number> {
    const rank = new Map<string, number>();
    for (const [id, p] of Object.entries(progress ?? {})) rank.set(id, p.nextReviewAt <= now + DAY ? 0 : 1);
    return rank;
}
