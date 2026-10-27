/**
 * Giao bài thông minh (docs/TEACH_PLAN.md, T3): what the numbers say to give
 * next, each as one tap. Pure, unit tested.
 * - Words the class has not got hold of: lesson words given a week ago or
 *   more that fewer than half the class remembers (Nhớ) yet.
 * - A review of their own for each student: their lesson words about to be
 *   forgotten (W4 `atRisk`), for students without one this week.
 * - After a class test: each student reviews the words they missed.
 */
import type { Board, TestResults } from '@cortex/classroom';
import { LEXICA, lexicaModule } from '@cortex/classroom-lexica';
import { recentReview } from './forecasts';

const DAY_MS = 86_400_000;
/** A lesson younger than this is still being learned: not "weak" yet. */
export const SETTLE_DAYS = 7;
/** At most this many words in one review. */
export const REVIEW_MAX = 15;
/** A personal review needs at least this many words to be worth a message. */
export const REVIEW_MIN = 3;

export interface PersonalReview {
    userId: string;
    name: string;
    cardIds: string[];
}

const classLessons = (board: Board) => (board.class.apps.includes(LEXICA) ? board.assignments.filter((a) => a.app === LEXICA && !a.for_user) : []);
const ids = (a: Board['assignments'][number]) => lexicaModule.parsePayload(a.kind, a.payload).card_ids;

/** Lesson words (lessons at least a week old) fewer than half of the reporting students remember; the least remembered first. Needs 3 students reporting. */
export function weakClassWords(board: Board, today: string): string[] {
    const cutoff = Date.parse(`${today}T23:59:59`) - SETTLE_DAYS * DAY_MS;
    const words = [...new Set(classLessons(board).filter((a) => Date.parse(a.created_at) <= cutoff).flatMap(ids))];
    const reporting = board.students.map((s) => s.apps[LEXICA]).filter(Boolean).map((a) => lexicaModule.parseMetrics(a!.metrics).words);
    if (reporting.length < 3) return [];
    return words
        .map((id) => ({ id, share: reporting.filter((w) => (w[id] ?? 0) >= 2).length / reporting.length }))
        .filter((x) => x.share < 0.5)
        .sort((a, b) => a.share - b.share)
        .map((x) => x.id)
        .slice(0, REVIEW_MAX * 2);
}

/** Each student's own lesson words about to be forgotten, for those with no personal review this week. */
export function personalReviews(board: Board, today: string): PersonalReview[] {
    const lessonWords = new Set(classLessons(board).flatMap(ids));
    const out: PersonalReview[] = [];
    for (const s of board.students) {
        if (recentReview(board, s.user_id, today)) continue;
        const atRisk = lexicaModule.parseMetrics(s.apps[LEXICA]?.metrics).review?.atRisk ?? [];
        const cardIds = atRisk.filter((id) => lessonWords.has(id)).slice(0, REVIEW_MAX);
        if (cardIds.length >= REVIEW_MIN) out.push({ userId: s.user_id, name: s.name, cardIds });
    }
    return out;
}

/** After a test: each student who handed in and missed words reviews those words (still in the class). */
export function testReviews(results: TestResults, board: Board): PersonalReview[] {
    const inClass = new Set(board.students.map((s) => s.user_id));
    return results.students
        .filter((s) => s.status === 'submitted' && inClass.has(s.user_id) && (s.missed?.length ?? 0) > 0)
        .map((s) => ({ userId: s.user_id, name: s.name, cardIds: [...new Set(s.missed)].slice(0, REVIEW_MAX) }));
}
