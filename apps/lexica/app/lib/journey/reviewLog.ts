/**
 * The review numbers a class sees (docs/TEACH_PLAN.md, 2.1): how many words
 * are overdue, how many fall due this week, how often the learner recalls a
 * word right, and which of the class's words are slipping. Numbers and card
 * ids only, never what the learner wrote. Pure, unit tested.
 */
import { AT_RISK_DAYS, type Review } from '@cortex/classroom-lexica';
import { shiftDay } from '../pronunciation/soundLog';
import type { UserCardProgress } from '../eloAlgorithm';
import { isKnownAlready, type Journeys } from './steps';

/** Per local day ("2026-10-21"): [right recalls, all recalls] of words seen before. */
export type ReviewLog = Record<string, [number, number]>;

export const REVIEW_KEEP_DAYS = 30;
const DAY_MS = 86_400_000;

/** The log with one recall added; days older than REVIEW_KEEP_DAYS are dropped. */
export function addRecall(log: ReviewLog, day: string, right: boolean): ReviewLog {
    const oldest = shiftDay(day, -(REVIEW_KEEP_DAYS - 1));
    const out: ReviewLog = {};
    for (const [d, pair] of Object.entries(log)) if (d >= oldest) out[d] = pair;
    const [r, t] = out[day] ?? [0, 0];
    out[day] = [r + (right ? 1 : 0), t + 1];
    return out;
}

/** [right, all] over the `days` days ending `day` (included). */
export function recallTotals(log: ReviewLog, day: string, days = 14): [number, number] {
    const from = shiftDay(day, -(days - 1));
    let right = 0;
    let all = 0;
    for (const [d, [r, t]] of Object.entries(log)) {
        if (d < from || d > day) continue;
        right += r;
        all += t;
    }
    return [right, all];
}

type Schedule = Readonly<Record<string, Pick<UserCardProgress, 'nextReviewAt'> | undefined>>;

/**
 * Overdue and due-this-week words (words known before learning are not on a
 * schedule that matters), and the class's lesson words overdue by more than
 * AT_RISK_DAYS: the teacher can give those back as a review in one tap.
 */
export function reviewNumbers(progress: Schedule, journeys: Journeys, lessonWords: ReadonlySet<string>, log: ReviewLog, today: string, now: number): Review {
    let overdue = 0;
    let due7 = 0;
    const atRisk: [string, number][] = [];
    for (const [id, p] of Object.entries(progress)) {
        if (!p || (journeys[id] && isKnownAlready(journeys[id]))) continue;
        if (p.nextReviewAt <= now) {
            overdue++;
            if (lessonWords.has(id) && now - p.nextReviewAt > AT_RISK_DAYS * DAY_MS) atRisk.push([id, p.nextReviewAt]);
        } else if (p.nextReviewAt <= now + 7 * DAY_MS) due7++;
    }
    return {
        overdue,
        due7,
        recall14: recallTotals(log, today),
        atRisk: atRisk
            // Longest overdue first
            .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))
            .slice(0, 200)
            .map(([id]) => id),
    };
}
