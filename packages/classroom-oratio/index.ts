/**
 * Classroom module: Oratio (docs/CLASSROOM.md). A lesson is an IELTS topic
 * to practise for some sessions, a set of questions, or a goal in sessions
 * and minutes; a student reports how much they spoke and the bands partners
 * gave them. Shared by the learning app (reports, apps/oratio/src/lib/classroom)
 * and the teacher app (screens in apps/teach/app/modules/oratio).
 * SQL: sql/classroom_oratio.sql.
 */
import type { Assignment, BoardStudent, ClassroomModuleCore, StudentApp } from '@cortex/classroom';

export const ORATIO = 'oratio';

export type Part = 1 | 2 | 3;
export type Criterion = 'fluency' | 'vocabulary' | 'grammar' | 'pronunciation';
export const CRITERIA: readonly Criterion[] = ['fluency', 'vocabulary', 'grammar', 'pronunciation'];
export const CRITERION_LABEL: Record<Criterion, string> = { fluency: 'Trôi chảy', vocabulary: 'Từ vựng', grammar: 'Ngữ pháp', pronunciation: 'Phát âm' };

export interface OratioSettings {
    /** The band the class aims for, shown to the teacher next to each student's. */
    target_band: number | null;
}

/** Kind "topic": practise sessions that touch this IELTS topic (one part, or any). */
export interface TopicPayload {
    category: string;
    part: Part | null;
    sessions: number;
}
/** Kind "questions": these questions come up first when the student answers. */
export interface QuestionsPayload {
    question_ids: string[];
}
/** Kind "goal": this many sessions and minutes from the day it was given. */
export interface GoalPayload {
    sessions: number;
    minutes: number;
}
export type OratioPayload = ({ kind: 'topic' } & TopicPayload) | ({ kind: 'questions' } & QuestionsPayload) | ({ kind: 'goal' } & GoalPayload);

export type Bands = Partial<Record<Criterion | 'overall', number>>;

export interface AssignmentDone {
    sessions: number;
    minutes: number;
    /** Kind "questions": how many of them came up. */
    asked: number;
}

export interface OratioMetrics {
    sessions: number;
    minutes: number;
    /** Ratings the averages come from. */
    ratings: number;
    /** Averages of what partners gave (the latest 20 ratings), or null before any. */
    band: Bands | null;
    current_band: number | null;
    target_band: number | null;
    /** Per assignment of this class (the server keeps only its own). */
    progress: Record<string, AssignmentDone>;
}

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const int = (v: unknown, max = 1e9) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(0, Math.round(v))) : 0);
const band = (v: unknown) => (typeof v === 'number' && v >= 1 && v <= 9 ? Math.round(v * 2) / 2 : null);
const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

export const fmtBand = (b: number | null | undefined) => (b == null ? '–' : b.toFixed(1));

/** Sessions and minutes over the last 7 days (since joining, for someone new this week). */
export function weekGain(app: Pick<StudentApp<OratioMetrics>, 'metrics' | 'week_ago' | 'week_first'>): { sessions: number; minutes: number } {
    const base = app.week_ago ?? app.week_first ?? app.metrics;
    return { sessions: Math.max(0, app.metrics.sessions - base.sessions), minutes: Math.max(0, app.metrics.minutes - base.minutes) };
}

/** "Part 2", or "mọi part". */
export const partLabel = (p: Part | null) => (p ? `Part ${p}` : 'mọi part');

/** How far one assignment is for a student, and whether it is done. */
export function assignmentState(a: Pick<Assignment, 'kind'> & { payload: OratioPayload }, done: AssignmentDone | undefined): { started: boolean; done: boolean; line: string } {
    const d = done ?? { sessions: 0, minutes: 0, asked: 0 };
    const p = a.payload;
    if (p.kind === 'topic') return { started: d.sessions > 0, done: d.sessions >= p.sessions, line: `${Math.min(d.sessions, p.sessions)}/${p.sessions} buổi` };
    if (p.kind === 'questions') {
        const n = p.question_ids.length;
        return { started: d.asked > 0, done: n > 0 && d.asked >= n, line: `${Math.min(d.asked, n)}/${n} câu` };
    }
    const okS = d.sessions >= p.sessions;
    const okM = d.minutes >= p.minutes;
    const parts = [p.sessions ? `${Math.min(d.sessions, p.sessions)}/${p.sessions} buổi` : '', p.minutes ? `${Math.min(d.minutes, p.minutes)}/${p.minutes} phút` : ''].filter(Boolean);
    return { started: d.sessions > 0 || d.minutes > 0, done: okS && okM, line: parts.join(' · ') };
}

/** One finished call as the Oratio app sees it. */
export interface Session {
    ended_at: string;
    minutes: number;
    /** Question ids asked in the call. */
    questions: readonly string[];
}

/**
 * What a student did towards one assignment: the calls since it was given;
 * for a topic, only calls that asked a question of that topic (and part).
 */
export function progressOf(
    a: Pick<Assignment, 'kind' | 'payload' | 'created_at'>,
    sessions: readonly Session[],
    question: (id: string) => { part: number; category: string } | undefined,
): AssignmentDone {
    const p = oratioModule.parsePayload(a.kind, a.payload);
    const since = sessions.filter((s) => s.ended_at >= a.created_at);
    if (p.kind === 'topic') {
        const hit = since.filter((s) => s.questions.some((id) => {
            const q = question(id);
            return q && q.category === p.category && (p.part === null || q.part === p.part);
        }));
        return { sessions: hit.length, minutes: hit.reduce((n, s) => n + s.minutes, 0), asked: 0 };
    }
    const seen = new Set(since.flatMap((s) => s.questions));
    const asked = p.kind === 'questions' ? p.question_ids.filter((id) => seen.has(id)).length : 0;
    return { sessions: since.length, minutes: since.reduce((n, s) => n + s.minutes, 0), asked };
}

const appOf = (s: BoardStudent) => s.apps[ORATIO];

export const oratioModule: ClassroomModuleCore<OratioSettings, OratioPayload, OratioMetrics> = {
    id: ORATIO,
    name: 'Oratio',
    tagline: 'Nói: thi thử IELTS Speaking với bạn luyện, chấm chéo 4 tiêu chí',
    kinds: { topic: 'Luyện theo chủ đề', questions: 'Bộ câu hỏi', goal: 'Chỉ tiêu buổi/phút' },
    parseSettings(raw) {
        const b = band(obj(raw).target_band);
        return { target_band: b !== null && b >= 4 ? b : null };
    },
    parsePayload(kind, raw) {
        const o = obj(raw);
        if (kind === 'questions') return { kind, question_ids: strings(o.question_ids) };
        if (kind === 'goal') return { kind, sessions: int(o.sessions, 50), minutes: int(o.minutes, 1000) };
        const part = o.part === 1 || o.part === 2 || o.part === 3 ? o.part : null;
        return { kind: 'topic', category: typeof o.category === 'string' ? o.category : '', part, sessions: int(o.sessions, 20) || 1 };
    },
    parseMetrics(raw) {
        const o = obj(raw);
        const b = obj(o.band);
        const bands: Bands = {};
        for (const k of [...CRITERIA, 'overall'] as const) {
            const v = band(b[k]);
            if (v !== null) bands[k] = v;
        }
        const progress: Record<string, AssignmentDone> = {};
        for (const [k, v] of Object.entries(obj(o.progress))) {
            const x = obj(v);
            progress[k] = { sessions: int(x.sessions), minutes: int(x.minutes), asked: int(x.asked) };
        }
        return {
            sessions: int(o.sessions),
            minutes: int(o.minutes),
            ratings: int(o.ratings),
            band: Object.keys(bands).length ? bands : null,
            current_band: band(o.current_band),
            target_band: band(o.target_band),
            progress,
        };
    },
    assignmentProgress(a, students) {
        const out = { started: 0, done: 0, total: students.length };
        for (const s of students) {
            const st = assignmentState(a, this.parseMetrics(appOf(s)?.metrics).progress[a.id]);
            if (st.started) out.started++;
            if (st.done) out.done++;
        }
        return out;
    },
    praise(app) {
        const g = weekGain(app);
        if (g.minutes >= 30) return { why: `${g.minutes} phút nói tuần này`, score: 60 + g.minutes / 2 };
        if (g.sessions >= 3) return { why: `${g.sessions} buổi nói tuần này`, score: 50 + g.sessions };
        return null;
    },
    parentLine(app) {
        const g = weekGain(app);
        const b = app.metrics.band?.overall;
        if (!g.sessions && !b) return null;
        return `Nói: ${g.sessions} buổi, ${g.minutes} phút tuần này${b ? `; bạn luyện chấm gần đây khoảng band ${fmtBand(b)}` : ''}.`;
    },
};

export * from './descriptors';

/** A finished week in Oratio for the parents' report: sessions and minutes spoken (null: no report at all). `first`: no report before the week, so these are totals so far. */
export function oratioWeek(end: unknown, start: unknown): { sessions: number; minutes: number; first: boolean } | null {
    if (!end) return null;
    const e = oratioModule.parseMetrics(end);
    if (!start) return { sessions: e.sessions, minutes: e.minutes, first: true };
    const s = oratioModule.parseMetrics(start);
    return { sessions: Math.max(0, e.sessions - s.sessions), minutes: Math.max(0, e.minutes - s.minutes), first: false };
}
