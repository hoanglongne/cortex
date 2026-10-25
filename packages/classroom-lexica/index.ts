/**
 * Classroom module: Lexica (docs/CLASSROOM.md). A lesson is a list of words;
 * a student reports how far their words got in the four steps (Hiểu, Nhớ,
 * Gặp, Dùng) and how many they used in real life (Đời). Shared by the
 * learning app (reports) and the teacher app (screens in
 * apps/teach/app/modules/lexica). SQL: sql/classroom_lexica.sql.
 */
import type { Assignment, BoardStudent, ClassroomModuleCore, StudentApp } from '@cortex/classroom';
import type { CourseInput, StudentInput } from './forecast';

export const LEXICA = 'lexica';

export type Step = 'hieu' | 'nho' | 'gap' | 'dung';
export const STEPS: readonly Step[] = ['hieu', 'nho', 'gap', 'dung'];
export const STEP_LABEL: Record<Step | 'doi', string> = { hieu: 'Hiểu', nho: 'Nhớ', gap: 'Gặp', dung: 'Dùng', doi: 'Đời' };

/** Words that reached each step; `doi` = used in real life; `total` = words counted (assigned ones); `known` = marked "biết rồi" without learning, not in the steps. */
export type Counts = Partial<Record<Step | 'doi' | 'total' | 'known', number>>;

export interface LexicaSettings {
    branch: 'cert' | 'talk';
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
    /** When the course ends ("YYYY-MM-DD"): the score forecast looks that far (forecast.ts). */
    ends_on: string | null;
    /** The verified vocabulary score the class aims for by then. */
    target_score: number | null;
}

/** The score scale's bounds for a class target (Lexica's ELO_FLOOR..ELO_CEIL, rounded). */
export const TARGET_MIN = 400;
export const TARGET_MAX = 1800;

export type WordsMode = 'only' | 'mixed';

/** Kind "words": a lesson. */
export interface WordsPayload {
    card_ids: string[];
    missing_words: string[];
    mode: WordsMode;
}

/**
 * The sound groups Vietnamese learners miss most (docs/LEXICA_PRONUNCIATION_DESIGN.md, 5.4),
 * shared by Lexica's pronunciation feedback, the class report and the SQL that cleans it.
 */
export const SOUND_KINDS = ['final_consonant', 'final_voicing', 'th', 'cluster', 'ending', 'long_short', 'ch_j', 'final_ng', 'final_l', 'initial_z', 'ae_e'] as const;
export type SoundKind = (typeof SOUND_KINDS)[number];

export const SOUND_LABEL: Record<SoundKind, string> = {
    final_consonant: 'Mất phụ âm cuối',
    final_voicing: 'Phụ âm cuối',
    th: 'Âm /θ ð/ (th)',
    cluster: 'Cụm phụ âm',
    ending: 'Đuôi -s, -ed',
    long_short: 'Nguyên âm dài, ngắn',
    ch_j: 'Âm /ʃ tʃ dʒ/',
    final_ng: 'Âm /ŋ/ cuối',
    final_l: 'Âm /l/ cuối, /r/',
    initial_z: 'Âm /z/',
    ae_e: 'Nguyên âm /æ/, /e/',
};

/** Per sound group over the last 14 days: [times the learner said a word with that sound, times the app heard it off]. */
export type Sounds = Partial<Record<SoundKind, [number, number]>>;

/**
 * The learner's review schedule (W4 forecasts, docs/TEACH_PLAN.md 2.1),
 * numbers only: words overdue now, words due in the next 7 days, recalls in
 * the last 14 days as [right, total], and the class's assigned words overdue
 * by more than AT_RISK_DAYS (card ids; the server keeps each class's own).
 */
export interface Review {
    overdue: number;
    due7: number;
    recall14: [number, number];
    atRisk: string[];
}

/** An assigned word overdue by more than this many days is "at risk" of being forgotten. */
export const AT_RISK_DAYS = 3;

export interface LexicaMetrics {
    counts: Counts;
    /** The four steps over this class's assigned words, with how many there are. */
    assigned: Counts;
    /** Furthest step per assigned word: 1 Hiểu … 4 Dùng, 5 Đời. */
    words: Record<string, number>;
    sounds: Sounds;
    /** Missing in reports from Lexica versions before the forecasts. */
    review?: Review;
}

/** What the learning app sends (the server keeps each class's part of `assigned` and `words`). */
export interface LexicaReport {
    counts: Counts;
    assigned: Record<string, Counts>;
    words: Record<string, number>;
    sounds: Sounds;
    review: Review;
}

/** Only known groups, whole numbers 0–10 000, misses never above tries (as the SQL keeps them). */
export function parseSounds(v: unknown): Sounds {
    const out: Sounds = {};
    for (const [k, pair] of Object.entries(obj(v))) {
        if (!(SOUND_KINDS as readonly string[]).includes(k) || !Array.isArray(pair) || pair.length !== 2) continue;
        const tries = Math.min(10000, Math.max(0, Math.round(num(pair[0]))));
        const misses = Math.min(tries, Math.max(0, Math.round(num(pair[1]))));
        out[k as SoundKind] = [tries, misses];
    }
    return out;
}

/** A learner "often misses" a group: at least 5 tries and more than 40% heard off (the rule Lexica's practice suggestion uses). */
export const oftenMissed = ([tries, misses]: [number, number]) => tries >= 5 && misses / tries > 0.4;

/** The class's top groups: how many students often miss each, then total misses. */
export function classSounds(board: { students: readonly BoardStudent[] }, top = 3): { kind: SoundKind; students: number; misses: number }[] {
    const out = SOUND_KINDS.map((kind) => {
        let students = 0;
        let misses = 0;
        for (const s of board.students) {
            const pair = parseSounds(obj(s.apps[LEXICA]?.metrics).sounds)[kind];
            if (!pair) continue;
            misses += pair[1];
            if (oftenMissed(pair)) students++;
        }
        return { kind, students, misses };
    });
    return out
        .filter((x) => x.students > 0)
        .sort((a, b) => b.students - a.students || b.misses - a.misses)
        .slice(0, top);
}

/** As the SQL keeps it: whole numbers 0–100 000, right never above total, at most 200 ids; null when absent. */
export function parseReview(v: unknown): Review | null {
    if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
    const o = v as Record<string, unknown>;
    const n = (x: unknown) => Math.min(100000, Math.max(0, Math.round(num(x))));
    const pair = Array.isArray(o.recall14) && o.recall14.length === 2 ? o.recall14 : [0, 0];
    const total = n(pair[1]);
    return {
        overdue: n(o.overdue),
        due7: n(o.due7),
        recall14: [Math.min(total, n(pair[0])), total],
        atRisk: [...new Set(strings(o.atRisk))].slice(0, 200),
    };
}

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
const counts = (v: unknown): Counts => {
    const o = obj(v);
    const out: Counts = {};
    for (const k of ['hieu', 'nho', 'gap', 'dung', 'doi', 'total', 'known'] as const) if (k in o) out[k] = num(o[k]);
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
        const ends = typeof o.ends_on === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(o.ends_on) ? o.ends_on : null;
        const target = typeof o.target_score === 'number' && o.target_score >= TARGET_MIN && o.target_score <= TARGET_MAX ? Math.round(o.target_score) : null;
        return { branch: o.branch === 'talk' ? 'talk' : 'cert', level, ends_on: ends, target_score: target };
    },
    parsePayload(_kind, raw) {
        const o = obj(raw);
        return { card_ids: strings(o.card_ids), missing_words: strings(o.missing_words), mode: o.mode === 'mixed' ? 'mixed' : 'only' };
    },
    parseMetrics(raw) {
        const o = obj(raw);
        const words: Record<string, number> = {};
        for (const [k, v] of Object.entries(obj(o.words))) words[k] = num(v);
        const review = parseReview(o.review);
        return { counts: counts(o.counts), assigned: counts(o.assigned), words, sounds: parseSounds(o.sounds), ...(review ? { review } : {}) };
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

/** One student's forecast input (forecast.ts) from the class board and their verified scores. */
export function forecastInput(s: BoardStudent, scores: readonly { score: number; sd: number; at: string }[] = []): StudentInput {
    const raw = obj(obj(s.apps[LEXICA]?.metrics).review);
    return { name: s.name, joinedAt: s.joined_at, days: s.days ?? [], review: parseReview(Object.keys(raw).length ? raw : null), scores };
}

/** The course settings the forecasts read, from the class's Lexica settings. */
export function courseInput(settings: unknown): CourseInput {
    const p = lexicaModule.parseSettings(settings);
    return { endsOn: p.ends_on, targetScore: p.target_score };
}

export * from './ielts';
export * from './forecast';
