/**
 * Classes, the student's side in Lexica (docs/CLASSROOM.md): join by code or
 * link, see the lessons the teacher gave, report the numbers. The class
 * system is shared by Cortex apps (@cortex/classroom); what a Lexica lesson
 * is and what Lexica reports is the Lexica module (@cortex/classroom-lexica).
 * Lessons are kept on the device so the Today session deals them first,
 * offline too.
 */
import { classroomApi, type Assignment, type ClassInfo } from '@cortex/classroom';
import { LEXICA, lexicaModule, type Counts, type LexicaReport, type Sounds, type WordsPayload } from '@cortex/classroom-lexica';
import { getSupabaseClient } from './supabase';
import { getCard } from './content/repository';
import { countLived, countSteps, isKnownAlready, stepIndex, stepOf, type Journeys, type WordJourney } from './journey/steps';
import { reviewNumbers, type ReviewLog } from './journey/reviewLog';
import type { UserCardProgress } from './eloAlgorithm';
import { localDate } from './engagement/ghost';

export * from '@cortex/classroom';
export { matchWords, weekDelta, type Counts } from '@cortex/classroom-lexica';

const api = classroomApi(getSupabaseClient);
export const { joinClass, leaveClass, leaderboard } = api;
/** Classes that use Lexica, with their Lexica lessons. */
export const myClasses = () => api.myClasses(LEXICA);

/** A Lexica lesson's words. */
export const lessonOf = (a: Assignment): WordsPayload => lexicaModule.parsePayload(a.kind, a.payload);
const lexicaAssignments = (c: Pick<ClassInfo, 'assignments'>) => c.assignments.filter((a) => a.app === LEXICA);
const lessons = (c: Pick<ClassInfo, 'assignments'>) => lexicaAssignments(c).map(lessonOf);

type Progress = Readonly<Record<string, Pick<UserCardProgress, 'lastReviewedAt'> & Partial<Pick<UserCardProgress, 'nextReviewAt'>> | undefined>>;

/** When each lesson word was first given (ms), across the classes. */
export function givenAt(classes: readonly Pick<ClassInfo, 'assignments'>[]): Map<string, number> {
    const out = new Map<string, number>();
    for (const a of classes.flatMap(lexicaAssignments)) {
        const at = Date.parse(a.created_at) || 0;
        for (const id of lessonOf(a).card_ids) out.set(id, Math.min(out.get(id) ?? at, at));
    }
    return out;
}

/**
 * The learner did something with the word since `since`: learned, recalled
 * (right or wrong), met, said or used it. A word learned on their own before
 * the lesson was given does not count for the lesson until they touch it again.
 */
export function touchedSince(j: WordJourney | undefined, p: Pick<UserCardProgress, 'lastReviewedAt'> | undefined, since: number): boolean {
    if ((p?.lastReviewedAt ?? 0) >= since) return true;
    if (!j) return false;
    if ([j.understoodAt, j.rememberedAt, j.metAt, j.usedAt, j.livedAt].some((t) => (t ?? 0) >= since)) return true;
    const day = localDate(since);
    return j.recalls.some((d) => d > day);
}

/** Journeys of lesson words touched since they were given; the rest count as not started. */
function lessonJourneys(journeys: Journeys, progress: Progress, given: Map<string, number>): Journeys {
    const out: Journeys = {};
    for (const [id, since] of given) if (journeys[id] && touchedSince(journeys[id], progress[id], since)) out[id] = journeys[id];
    return out;
}

/** The four steps over a class's lesson words (counted from when each was given), with how many there are. */
export function assignedCounts(journeys: Journeys, c: Pick<ClassInfo, 'assignments'>, progress: Progress = {}): Counts {
    const given = givenAt([c]);
    return { ...countSteps(lessonJourneys(journeys, progress, given), new Set(given.keys())), total: given.size };
}

/**
 * The furthest step of each lesson word (1 Hiểu … 4 Dùng, 5 used in real
 * life). Words not touched since they were given are left out: joining a
 * class never shows a lesson as done from what was learned before it.
 */
export function assignedSteps(journeys: Journeys, classes: readonly Pick<ClassInfo, 'assignments'>[], progress: Progress = {}): Record<string, number> {
    const out: Record<string, number> = {};
    for (const [id, j] of Object.entries(lessonJourneys(journeys, progress, givenAt(classes)))) {
        const n = j.livedAt ? 5 : stepIndex(stepOf(j));
        if (n > 0) out[id] = n;
    }
    return out;
}

/** What Lexica reports to every class it is in; the server keeps each class's part. */
export function lexicaReport(journeys: Journeys, classes: readonly ClassInfo[], progress: Progress = {}, sounds: Sounds = {}, reviewLog: ReviewLog = {}, now = Date.now()): LexicaReport {
    const learned = Object.fromEntries(Object.entries(journeys).filter(([, j]) => !isKnownAlready(j)));
    const schedule = Object.fromEntries(Object.entries(progress).flatMap(([id, p]) => (p && typeof p.nextReviewAt === 'number' ? [[id, { nextReviewAt: p.nextReviewAt }]] : [])));
    return {
        // Steps reached by learning; words known beforehand are counted apart
        counts: { ...countSteps(learned), doi: countLived(journeys), known: Object.keys(journeys).length - Object.keys(learned).length },
        assigned: Object.fromEntries(classes.map((c) => [c.id, assignedCounts(journeys, c, progress)])),
        words: assignedSteps(journeys, classes, progress),
        // Per sound group, 14 days of tries and misses (lib/pronunciation/soundLog.ts): numbers only.
        sounds,
        // The review schedule and recall rate, for the teacher's forecasts (lib/journey/reviewLog.ts).
        review: reviewNumbers(schedule, journeys, new Set(givenAt(classes).keys()), reviewLog, localDate(now), now),
    };
}

export const reportProgress = (report: LexicaReport, streak: number) => api.report(LEXICA, report, streak);

// ─── On-device cache ────────────────────────────────────────────────────

const CLASSES_KEY = 'lexica-classes-v2';

export function readCachedClasses(): ClassInfo[] {
    try {
        const raw = JSON.parse(localStorage.getItem(CLASSES_KEY) ?? '[]') as unknown;
        return Array.isArray(raw) ? (raw as ClassInfo[]) : [];
    } catch {
        return [];
    }
}

export function cacheClasses(list: ClassInfo[]) {
    try {
        localStorage.setItem(CLASSES_KEY, JSON.stringify(list));
    } catch {
        // Private mode: lesson words are just not dealt first.
    }
}

const studentLessons = () => readCachedClasses().filter((c) => c.role === 'student').flatMap(lessons);

/** Lesson words that exist on this device, for the Học stage to deal first. */
export function classWordsToQueue(): string[] {
    return [...new Set(studentLessons().flatMap((l) => l.card_ids))].filter((id) => getCard(id));
}

/** Lesson words the learner has never been dealt: the Học stage deals them. */
export function newClassWords(progress: Progress): string[] {
    return classWordsToQueue().filter((id) => !progress[id]);
}

/**
 * Lesson words the learner already had before the lesson and has not touched
 * since: the Ôn stage brings them back once, so the lesson counts for real.
 */
export function classWordsToRefresh(journeys: Journeys, progress: Progress): string[] {
    const given = givenAt(readCachedClasses().filter((c) => c.role === 'student'));
    return [...given].filter(([id, since]) => (journeys[id] || progress[id]) && getCard(id) && !touchedSince(journeys[id], progress[id], since)).map(([id]) => id);
}

/**
 * Lesson words in "only" mode not learned yet: when there are any, the Học
 * stage is these words alone (a lesson the teacher wants learned as is).
 */
export function onlyClassWords(learned: (id: string) => boolean): string[] {
    const ids = studentLessons()
        .filter((l) => l.mode === 'only')
        .flatMap((l) => l.card_ids);
    return [...new Set(ids)].filter((id) => getCard(id) && !learned(id));
}
