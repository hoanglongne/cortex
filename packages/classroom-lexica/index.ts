/**
 * Classroom module: Lexica (docs/CLASSROOM.md). A lesson is a list of words;
 * a student reports how far their words got in the four steps (Hiểu, Nhớ,
 * Gặp, Dùng) and how many they used in real life (Đời). Shared by the
 * learning app (reports) and the teacher app (screens in
 * apps/teach/app/modules/lexica). SQL: sql/classroom_lexica.sql.
 */
import type { Assignment, BoardStudent, ClassroomModuleCore, StudentApp } from '@cortex/classroom';

export const LEXICA = 'lexica';

export type Step = 'hieu' | 'nho' | 'gap' | 'dung';
export const STEPS: readonly Step[] = ['hieu', 'nho', 'gap', 'dung'];
export const STEP_LABEL: Record<Step | 'doi', string> = { hieu: 'Hiểu', nho: 'Nhớ', gap: 'Gặp', dung: 'Dùng', doi: 'Đời' };

/** Words that reached each step; `doi` = used in real life; `total` = words counted (assigned ones). */
export type Counts = Partial<Record<Step | 'doi' | 'total', number>>;

export interface LexicaSettings {
    branch: 'cert' | 'talk';
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
}

export type WordsMode = 'only' | 'mixed';

/** Kind "words": a lesson. */
export interface WordsPayload {
    card_ids: string[];
    missing_words: string[];
    mode: WordsMode;
}

export interface LexicaMetrics {
    counts: Counts;
    /** The four steps over this class's assigned words, with how many there are. */
    assigned: Counts;
    /** Furthest step per assigned word: 1 Hiểu … 4 Dùng, 5 Đời. */
    words: Record<string, number>;
}

/** What the learning app sends (the server keeps each class's part of `assigned` and `words`). */
export interface LexicaReport {
    counts: Counts;
    assigned: Record<string, Counts>;
    words: Record<string, number>;
}

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
const counts = (v: unknown): Counts => {
    const o = obj(v);
    const out: Counts = {};
    for (const k of ['hieu', 'nho', 'gap', 'dung', 'doi', 'total'] as const) if (k in o) out[k] = num(o[k]);
    return out;
};

/** Progress over the last 7 days (since joining, for someone new this week). */
export function weekDelta(app: Pick<StudentApp<LexicaMetrics>, 'metrics' | 'week_ago' | 'week_first'>): Record<Step, number> {
    const now = app.metrics.counts;
    const base = (app.week_ago ?? app.week_first ?? app.metrics).counts;
    const out = { hieu: 0, nho: 0, gap: 0, dung: 0 };
    for (const step of STEPS) out[step] = Math.max(0, (now[step] ?? 0) - (base[step] ?? 0));
    return out;
}

/**
 * A teacher's word list (one per line, or comma separated) matched to cards:
 * the ids Lexica has and the words it has no card for yet.
 */
export function matchWords(text: string, lookup: (word: string) => { id: string } | undefined): { cardIds: string[]; missing: string[] } {
    const words = [...new Set(text.split(/[\n,;]+/).map((w) => w.trim().toLowerCase().replace(/\s+/g, ' ')).filter(Boolean))];
    const cardIds: string[] = [];
    const missing: string[] = [];
    for (const w of words) {
        const card = lookup(w);
        if (card && !cardIds.includes(card.id)) cardIds.push(card.id);
        else if (!card) missing.push(w);
    }
    return { cardIds, missing };
}

const wordsOf = (s: BoardStudent) => obj(obj(s.apps[LEXICA]?.metrics).words) as Record<string, number>;

export const lexicaModule: ClassroomModuleCore<LexicaSettings, WordsPayload, LexicaMetrics> = {
    id: LEXICA,
    name: 'Lexica',
    tagline: 'Từ vựng: từ câu chêm tới câu của mình (IELTS hoặc Giao tiếp)',
    kinds: { words: 'Bài từ vựng' },
    parseSettings(raw) {
        const o = obj(raw);
        const level = ['beginner', 'intermediate', 'advanced', 'expert'].includes(o.level as string) ? (o.level as LexicaSettings['level']) : null;
        return { branch: o.branch === 'talk' ? 'talk' : 'cert', level };
    },
    parsePayload(_kind, raw) {
        const o = obj(raw);
        return { card_ids: strings(o.card_ids), missing_words: strings(o.missing_words), mode: o.mode === 'mixed' ? 'mixed' : 'only' };
    },
    parseMetrics(raw) {
        const o = obj(raw);
        const words: Record<string, number> = {};
        for (const [k, v] of Object.entries(obj(o.words))) words[k] = num(v);
        return { counts: counts(o.counts), assigned: counts(o.assigned), words };
    },
    /** Started: any word begun. Done: every word at Hiểu or further. Deep: every word said aloud (Dùng). */
    assignmentProgress(a: Assignment<WordsPayload>, students) {
        const ids = a.payload.card_ids;
        const out = { started: 0, done: 0, deep: 0, total: students.length };
        if (ids.length === 0) return out;
        for (const s of students) {
            const words = wordsOf(s);
            const steps = ids.map((id) => num(words[id]));
            if (steps.some((n) => n >= 1)) out.started++;
            if (steps.every((n) => n >= 1)) out.done++;
            if (steps.every((n) => n >= 4)) out.deep++;
        }
        return out;
    },
    praise(app) {
        const d = weekDelta(app);
        if (d.dung >= 3) return { why: `+${d.dung} từ Dùng tuần này`, score: 100 + d.dung };
        if (d.nho >= 10) return { why: `+${d.nho} từ Nhớ tuần này`, score: d.nho / 2 };
        return null;
    },
    /** Words a teacher gave that have no card yet: Studio is writing them. */
    needs(board) {
        const words = board.assignments.filter((a) => a.app === LEXICA).reduce((n, a) => n + strings(obj(a.payload).missing_words).length, 0);
        return words > 0 ? [{ classId: board.class.id, className: board.class.name, text: `${words} từ bạn giao chưa có thẻ, Studio đang viết`, tab: 'assignments' as const }] : [];
    },
    parentLine(app) {
        const d = weekDelta(app);
        const c = app.metrics.counts;
        const assigned = app.metrics.assigned.total ? ` Từ của lớp: ${app.metrics.assigned.dung ?? 0}/${app.metrics.assigned.total} từ đã nói được.` : '';
        return `Từ vựng: +${d.nho} từ nhớ được, +${d.dung} từ đã nói được tuần này; tổng ${c.nho ?? 0} từ Nhớ, ${c.dung ?? 0} từ Dùng.${assigned}`;
    },
};

/** Words a student can use (Dùng), read back from a leaderboard score (classroom_lexica_rank: dung × 100000 + nho). */
export const dungFromScore = (score: number) => Math.floor(score / 100000);
