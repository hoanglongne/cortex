/**
 * Classes, the student's side in Lexica (docs/CLASSROOM.md): join by code or
 * link, see the lessons the teacher gave, report the numbers. The class
 * system is shared by Cortex apps (@cortex/classroom); what a Lexica lesson
 * is and what Lexica reports is the Lexica module (@cortex/classroom-lexica).
 * Lessons are kept on the device so the Today session deals them first,
 * offline too.
 */
import { classroomApi, type Assignment, type ClassInfo } from '@cortex/classroom';
import { LEXICA, lexicaModule, type Counts, type LexicaReport, type WordsPayload } from '@cortex/classroom-lexica';
import { getSupabaseClient } from './supabase';
import { getCard } from './content/repository';
import { countLived, countSteps, isKnownAlready, stepIndex, stepOf, type Journeys } from './journey/steps';

export * from '@cortex/classroom';
export { matchWords, weekDelta, type Counts } from '@cortex/classroom-lexica';

const api = classroomApi(getSupabaseClient);
export const { joinClass, leaveClass, leaderboard } = api;
/** Classes that use Lexica, with their Lexica lessons. */
export const myClasses = () => api.myClasses(LEXICA);

/** A Lexica lesson's words. */
export const lessonOf = (a: Assignment): WordsPayload => lexicaModule.parsePayload(a.kind, a.payload);
const lessons = (c: Pick<ClassInfo, 'assignments'>) => c.assignments.filter((a) => a.app === LEXICA).map(lessonOf);

/** The four steps over a class's lesson words, with how many there are. */
export function assignedCounts(journeys: Journeys, c: Pick<ClassInfo, 'assignments'>): Counts {
    const ids = new Set(lessons(c).flatMap((l) => l.card_ids));
    return { ...countSteps(journeys, ids), total: ids.size };
}

/** The furthest step of each lesson word (1 Hiểu … 4 Dùng, 5 used in real life); words not started are left out. */
export function assignedSteps(journeys: Journeys, classes: readonly Pick<ClassInfo, 'assignments'>[]): Record<string, number> {
    const out: Record<string, number> = {};
    for (const id of new Set(classes.flatMap((c) => lessons(c).flatMap((l) => l.card_ids)))) {
        const j = journeys[id];
        const n = j?.livedAt ? 5 : stepIndex(stepOf(j));
        if (n > 0) out[id] = n;
    }
    return out;
}

/** What Lexica reports to every class it is in; the server keeps each class's part. */
export function lexicaReport(journeys: Journeys, classes: readonly ClassInfo[]): LexicaReport {
    const learned = Object.fromEntries(Object.entries(journeys).filter(([, j]) => !isKnownAlready(j)));
    return {
        // Steps reached by learning; words known beforehand are counted apart
        counts: { ...countSteps(learned), doi: countLived(journeys), known: Object.keys(journeys).length - Object.keys(learned).length },
        assigned: Object.fromEntries(classes.map((c) => [c.id, assignedCounts(journeys, c)])),
        words: assignedSteps(journeys, classes),
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
