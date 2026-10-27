/**
 * After a class quiz (Đấu trường, docs/TEACH_PLAN.md 4.1): a word the student
 * got wrong goes back into their review now; a word they got right quickly
 * (within 60% of the time) counts as remembering it, like a right answer in
 * review; a right but slow answer changes nothing. A wrong word they never
 * learned in Lexica joins today's new cards. Each room is applied once.
 * Pure, unit tested.
 */
import type { ArenaResult } from '@cortex/classroom';

/** Share of the question's time under which a right answer counts as remembered. */
export const FAST_SHARE = 0.6;
/** Rooms remembered as applied (the server keeps 14 days of results). */
export const APPLIED_KEEP = 100;

export interface ArenaReview {
    /** Rooms to mark as applied. */
    rooms: string[];
    /** Known words answered wrong: review again now. */
    again: string[];
    /** Known words answered right, quickly: a right recall. */
    recalled: string[];
    /** Words not learned yet, answered wrong: today's new cards. */
    queue: string[];
}

export function arenaReview(results: readonly ArenaResult[], applied: readonly string[], known: (cardId: string) => boolean): ArenaReview {
    const fresh = results.filter((r) => !applied.includes(r.room_id));
    const wrong = new Set<string>();
    const fast = new Set<string>();
    for (const r of fresh) {
        for (const a of r.answers) {
            if (!a.card_id) continue;
            if (!a.correct) wrong.add(a.card_id);
            else if (a.ms <= r.seconds * 1000 * FAST_SHARE) fast.add(a.card_id);
        }
    }
    // Wrong anywhere wins over right elsewhere
    const recalled = [...fast].filter((id) => !wrong.has(id) && known(id));
    return {
        rooms: fresh.map((r) => r.room_id),
        again: [...wrong].filter(known),
        recalled,
        queue: [...wrong].filter((id) => !known(id)),
    };
}
