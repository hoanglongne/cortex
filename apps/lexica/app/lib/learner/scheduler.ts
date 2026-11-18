/**
 * FSRS stage F2 (docs/LEXICA_FSRS_MIGRATION_PLAN.md), built but OFF:
 * FSRS_ROLLOUT is 0, so every learner stays on SM-2 until F0 shows FSRS
 * predicts better. When on for a learner, FSRS sets a word's next review
 * after a graded recognition answer; SM-2 keeps updating its own fields
 * (ease, intervalDays) underneath, so switching back restores its dates.
 */
import { intervalDays, type Memory } from './fsrs';

/** Share of learners (0–100) scheduled by FSRS. Raise only after F0 passes (see the plan). */
export const FSRS_ROLLOUT = 0;
/** Recall probability FSRS aims for at the review (F4 makes it a setting). */
export const TARGET_RETENTION = 0.9;
/** In the first two weeks after switching, a gap may grow at most this much per review. */
export const SWITCH_STRETCH = 1.5;
export const SWITCH_SOFT_DAYS = 14;
const DAY_MS = 86_400_000;
const MAX_DAYS = 180;

/** A stable 0–99 bucket from the learner's random seed. */
export function bucket(seed: string | undefined): number {
    let h = 0;
    for (const ch of seed ?? '') h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return h % 100;
}

/** Whether FSRS schedules this learner. */
export function usesFsrs(seed: string | undefined, rollout = FSRS_ROLLOUT): boolean {
    return seed !== undefined && bucket(seed) < rollout;
}

/**
 * When the word is next due under FSRS, after a review at `now`.
 * - Takes the nearer of the FSRS date and the SM-2 date, so no word drifts
 *   away from review because of the switch.
 * - In the first two weeks after switching, the gap grows at most ×1.5
 *   over the previous gap.
 */
export function fsrsDueAt(
    mem: Memory,
    now: number,
    opts: { sm2DueAt: number; prevGapDays: number; switchedAt: number; retention?: number },
): number {
    let days = Math.min(MAX_DAYS, Math.max(1, Math.round(intervalDays(mem.s, opts.retention ?? TARGET_RETENTION))));
    if (now - opts.switchedAt < SWITCH_SOFT_DAYS * DAY_MS && opts.prevGapDays > 0) {
        days = Math.min(days, Math.max(1, Math.round(opts.prevGapDays * SWITCH_STRETCH)));
    }
    return Math.min(now + days * DAY_MS, opts.sm2DueAt);
}

/** The SM-2 date from its own fields, for switching a learner back. */
export function sm2DueAt(p: { lastReviewedAt: number; intervalDays?: number; nextReviewAt: number }): number {
    return p.intervalDays === undefined ? p.nextReviewAt : p.lastReviewedAt + p.intervalDays * DAY_MS;
}
