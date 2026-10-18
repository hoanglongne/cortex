/**
 * Classes, the student's side (Claude Doc "Lexica Lớp học — thiết kế"): join
 * by code or link, see what the teacher assigned, report the numbers. Types,
 * calls and shared rules live in @cortex/lexica-classes (the teacher app,
 * apps/lexica-teach, uses the same). The words assigned to a student are
 * kept on the device so the Today session deals them first, offline too.
 */
import { classApi, type Assignment, type ClassInfo, type Counts } from '@cortex/lexica-classes';
import { getSupabaseClient } from './supabase';
import { getCard } from './content/repository';
import { countSteps, stepIndex, stepOf, type Journeys } from './journey/steps';

export * from '@cortex/lexica-classes';

const api = classApi(getSupabaseClient);
export const { myClasses, joinClass, leaveClass, leaderboard } = api;
export const reportProgress = api.report;

/** The four numbers over a class's assigned words, with how many there are. */
export function assignedCounts(journeys: Journeys, assignments: readonly Pick<Assignment, 'card_ids'>[]): Counts {
    const ids = new Set(assignments.flatMap((a) => a.card_ids));
    return { ...countSteps(journeys, ids), total: ids.size };
}

/** The furthest step of each assigned word (1 Hiểu … 4 Dùng, 5 used in real life); words not started are left out. */
export function assignedSteps(journeys: Journeys, assignments: readonly Pick<Assignment, 'card_ids'>[]): Record<string, number> {
    const out: Record<string, number> = {};
    for (const id of new Set(assignments.flatMap((a) => a.card_ids))) {
        const j = journeys[id];
        const n = j?.livedAt ? 5 : stepIndex(stepOf(j));
        if (n > 0) out[id] = n;
    }
    return out;
}

// ─── On-device cache ────────────────────────────────────────────────────

const CLASSES_KEY = 'lexica-classes-v1';

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
        // Private mode: assigned words are just not dealt first.
    }
}

const studentAssignments = () => readCachedClasses().filter((c) => c.role === 'student').flatMap((c) => c.assignments);

/** Assigned words that exist on this device, for the Học stage to deal first. */
export function classWordsToQueue(): string[] {
    return [...new Set(studentAssignments().flatMap((a) => a.card_ids))].filter((id) => getCard(id));
}

/**
 * Assigned words in "only" mode not learned yet: when there are any, the Học
 * stage is these words alone (a lesson the teacher wants learned as is).
 */
export function onlyClassWords(learned: (id: string) => boolean): string[] {
    const ids = studentAssignments()
        .filter((a) => (a.mode ?? 'only') === 'only')
        .flatMap((a) => a.card_ids);
    return [...new Set(ids)].filter((id) => getCard(id) && !learned(id));
}
