/**
 * Classroom module: Synapse (docs/CLASSROOM.md, docs/SYNAPSE_PLAN.md S4). A
 * lesson is a story mission to clear (with a due date) or a review mission
 * ("Ôn bằng truyện"); a student reports how many missions they played and
 * cleared, how many phrases are solid and which they keep missing. Numbers and
 * phrase names only: nothing a student wrote. Shared by the learning app
 * (apps/synapse) and the teacher app (screens in apps/teach/app/modules/synapse).
 * SQL: sql/classroom_synapse.sql.
 */
import type { Assignment, BoardStudent, ClassroomModuleCore, StudentApp } from '@cortex/classroom';

export const SYNAPSE = 'synapse';

export type EndingTier = 'gold' | 'silver' | 'bronze' | 'fail';
export const TIERS: readonly EndingTier[] = ['gold', 'silver', 'bronze', 'fail'];
export const TIER_LABEL: Record<EndingTier, string> = { gold: 'Trọn vẹn', silver: 'Vượt qua', bronze: 'Sát nút', fail: 'Dở dang' };

export type SynapseSettings = Record<string, never>;

/** Kind "mission": clear this written mission. Kind "review": play a review mission. */
export type SynapsePayload = { kind: 'mission'; lore_id: string; mission_id: string; name: string } | { kind: 'review' };

/** How one assignment went for a student. */
export interface AssignmentDone {
    done: boolean;
    /** The best ending so far. */
    best: EndingTier | null;
    tries: number;
}

export interface SynapseMetrics {
    /** Missions finished (cleared or out of lives). */
    runs: number;
    /** Different missions cleared. */
    cleared: number;
    /** Phrases right three times in a row. */
    solid: number;
    /** Phrases the student keeps missing, worst first (at most 5). */
    weak: string[];
    progress: Record<string, AssignmentDone>;
}

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const int = (v: unknown, max = 1e6) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(0, Math.round(v))) : 0);
const tier = (v: unknown): EndingTier | null => (TIERS.includes(v as EndingTier) ? (v as EndingTier) : null);
const str = (v: unknown, max = 80) => (typeof v === 'string' ? v.slice(0, max) : '');

/** A phrase key as the teacher reads it ("___ speak up" → "speak up"). */
export const phraseName = (key: string) => key.replace(/^_{3}\s*/, '').trim();

/** The better of two endings (gold best, then silver, bronze, fail); null counts as none. */
export function betterTier(a: EndingTier | null, b: EndingTier | null): EndingTier | null {
    if (!a) return b;
    if (!b) return a;
    return TIERS.indexOf(a) <= TIERS.indexOf(b) ? a : b;
}

/** A mission was finished: updates how an assignment stands. `review` assignments finish with any cleared review; `mission` ones with that mission cleared. */
export function applyRun(prev: AssignmentDone | undefined, ending: EndingTier): AssignmentDone {
    const p = prev ?? { done: false, best: null, tries: 0 };
    return { done: p.done || ending !== 'fail', best: betterTier(p.best, ending), tries: p.tries + 1 };
}

/** Does a finished run count for this assignment? Only a run after it was given. */
export function counts(a: Pick<Assignment, 'kind' | 'payload' | 'created_at'>, run: { mission_id: string; at: string; review: boolean }): boolean {
    if (run.at < a.created_at) return false;
    const p = synapseModule.parsePayload(a.kind, a.payload);
    return p.kind === 'review' ? run.review : !run.review && p.mission_id === run.mission_id;
}

/** Runs gained in the last 7 days. */
export function weekRuns(app: Pick<StudentApp<SynapseMetrics>, 'metrics' | 'week_ago' | 'week_first'>): number {
    const base = app.week_ago ?? app.week_first ?? app.metrics;
    return Math.max(0, app.metrics.runs - base.runs);
}

/** The phrases most students in a class keep missing, with how many. Counts only. */
export function classWeak(students: readonly BoardStudent[], top = 8): { phrase: string; students: number }[] {
    const count = new Map<string, number>();
    for (const s of students) {
        const raw = s.apps[SYNAPSE];
        if (!raw) continue;
        for (const k of synapseModule.parseMetrics(raw.metrics).weak) count.set(phraseName(k), (count.get(phraseName(k)) ?? 0) + 1);
    }
    return [...count.entries()].map(([phrase, students]) => ({ phrase, students })).sort((a, b) => b.students - a.students || a.phrase.localeCompare(b.phrase)).slice(0, top);
}

export const synapseModule: ClassroomModuleCore<SynapseSettings, SynapsePayload, SynapseMetrics> = {
    id: SYNAPSE,
    name: 'Synapse',
    tagline: 'Truyện cụm động từ: chọn đường, thấy hậu quả, nhớ cụm',
    kinds: { mission: 'Nhiệm vụ truyện', review: 'Ôn bằng truyện' },
    parseSettings() {
        return {};
    },
    parsePayload(kind, raw) {
        const o = obj(raw);
        if (kind === 'review') return { kind: 'review' };
        return { kind: 'mission', lore_id: str(o.lore_id, 40), mission_id: str(o.mission_id, 40), name: str(o.name) };
    },
    parseMetrics(raw) {
        const o = obj(raw);
        const progress: Record<string, AssignmentDone> = {};
        for (const [k, v] of Object.entries(obj(o.progress))) {
            const x = obj(v);
            progress[k] = { done: x.done === true, best: tier(x.best), tries: int(x.tries, 1000) };
        }
        return {
            runs: int(o.runs),
            cleared: int(o.cleared, 1000),
            solid: int(o.solid, 5000),
            weak: Array.isArray(o.weak) ? o.weak.filter((x): x is string => typeof x === 'string').slice(0, 5).map((x) => x.slice(0, 80)) : [],
            progress,
        };
    },
    assignmentProgress(a, students) {
        const out = { started: 0, done: 0, total: students.length };
        for (const s of students) {
            const d = this.parseMetrics(s.apps[SYNAPSE]?.metrics).progress[a.id];
            if (d && d.tries > 0) out.started++;
            if (d?.done) out.done++;
        }
        return out;
    },
    praise(app) {
        const n = weekRuns(app);
        return n >= 3 ? { why: `${n} nhiệm vụ truyện tuần này`, score: 40 + n } : null;
    },
    parentLine(app) {
        const n = weekRuns(app);
        if (!n && !app.metrics.solid) return null;
        return `Synapse: ${n} nhiệm vụ truyện tuần này, ${app.metrics.solid} cụm đã vững.`;
    },
};
