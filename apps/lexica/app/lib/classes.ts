/**
 * Classes from English centers (docs/LEXICA_DIRECTION.md, "Trung tâm"): a
 * teacher makes a class, shares its code and assigns words by lesson; the
 * students' app reports their four numbers. The server side is
 * supabase/migration_classes.sql (security definer functions only). The
 * words assigned to a student are kept on the device so the Today session
 * deals them first, offline too.
 */
import { getSupabaseClient } from './supabase';
import { getCard } from './content/repository';
import { countSteps, STEPS, type Journeys, type StepCounts } from './journey/steps';

// ─── Types ──────────────────────────────────────────────────────────────

export interface Assignment {
    id: string;
    title: string;
    card_ids: string[];
    missing_words: string[];
    created_at: string;
}

export interface ClassInfo {
    id: string;
    name: string;
    branch: 'cert' | 'talk';
    level: string | null;
    org_id: string | null;
    role: 'teacher' | 'student';
    /** Only for the teacher. */
    code: string | null;
    members: number;
    assignments: Assignment[];
}

export interface OrgInfo {
    id: string;
    name: string;
    role: 'admin' | 'teacher';
    seats: number;
}

export type Counts = Partial<StepCounts> & { total?: number };

export interface BoardStudent {
    user_id: string;
    name: string;
    joined_at: string;
    counts: Counts;
    assigned: Counts;
    streak: number;
    last_active: string | null;
    inactive_days: number | null;
    /** Numbers on the last report at least 7 days ago, or null. */
    week_ago: Counts | null;
    /** First report inside the last 7 days, for students who joined this week. */
    week_first: Counts | null;
}

export interface Board {
    class: { id: string; name: string; code: string; branch: string; level: string | null };
    students: BoardStudent[];
}

export interface OrgOverview {
    id: string;
    name: string;
    seats: number;
    used: number;
    teachers: number;
    classes: { id: string; name: string; members: number; avg_nho: number | null; avg_dung: number | null; active_week: number }[];
}

// ─── Server calls ───────────────────────────────────────────────────────

const MESSAGES: Record<string, string> = {
    'own class': 'Đây là lớp bạn dạy, không cần vào bằng mã.',
    'not signed in': 'Bạn cần đăng nhập trước.',
    'no such class': 'Không tìm thấy lớp với mã này.',
    'no seats': 'Lớp hoặc trung tâm đã hết chỗ. Báo giáo viên của bạn nhé.',
    'not the teacher': 'Chỉ giáo viên của lớp làm được việc này.',
    'not in this class': 'Bạn không ở trong lớp này.',
    'not in this center': 'Bạn chưa thuộc trung tâm này.',
    'not an admin': 'Chỉ quản lý trung tâm làm được việc này.',
    'no such user': 'Chưa có tài khoản Lexica nào với email này. Nhờ giáo viên đăng nhập Lexica một lần trước.',
    'no words': 'Chưa có từ nào để giao.',
};

export class ClassError extends Error {}

export function classMessage(raw: string): string {
    const key = Object.keys(MESSAGES).find((k) => raw.includes(k));
    if (key) return MESSAGES[key];
    if (/fetch|network/i.test(raw)) return 'Không kết nối được. Thử lại khi có mạng.';
    if (/check constraint|violates/i.test(raw)) return 'Tên quá ngắn hoặc quá dài.';
    return raw;
}

async function rpc<T>(name: string, args?: Record<string, unknown>): Promise<T> {
    const client = getSupabaseClient();
    if (!client) throw new ClassError(MESSAGES['not signed in']);
    const { data, error } = await client.rpc(name, args);
    if (error) throw new ClassError(classMessage(error.message));
    return data as T;
}

export const myClasses = () => rpc<ClassInfo[]>('lexica_my_classes');
export const myOrgs = () => rpc<OrgInfo[]>('lexica_my_orgs');
export const createClass = (name: string, branch: 'cert' | 'talk', level: string | null, orgId: string | null) =>
    rpc<{ id: string; code: string }>('lexica_class_create', { p_name: name, p_branch: branch, p_level: level, p_org: orgId });
export const joinClass = (code: string, displayName: string) =>
    rpc<{ class_id: string; name: string; branch: string; level: string | null }>('lexica_class_join', { p_code: code, p_display_name: displayName });
export const leaveClass = (classId: string) => rpc<{ left: boolean }>('lexica_class_leave', { p_class: classId });
export const classBoard = (classId: string) => rpc<Board>('lexica_class_board', { p_class: classId });
export const leaderboard = (classId: string) => rpc<{ name: string; dung: number; nho: number; me: boolean }[]>('lexica_class_leaderboard', { p_class: classId });
export const assignWords = (classId: string, title: string, cardIds: string[], missing: string[]) =>
    rpc<{ id: string; cards: number; missing: number }>('lexica_class_assign', { p_class: classId, p_title: title, p_card_ids: cardIds, p_missing: missing });
export const unassign = (assignmentId: string) => rpc<{ ok: boolean }>('lexica_class_unassign', { p_assignment: assignmentId });
export const createOrg = (name: string) => rpc<{ id: string }>('lexica_org_create', { p_name: name });
export const addTeacher = (orgId: string, email: string) => rpc<{ ok: boolean }>('lexica_org_add_teacher', { p_org: orgId, p_email: email });
export const orgOverview = (orgId: string) => rpc<OrgOverview>('lexica_org_overview', { p_org: orgId });
export const reportProgress = (counts: StepCounts, streak: number, assigned: Record<string, Counts>) =>
    rpc<{ classes: number }>('lexica_class_report', { p_counts: counts, p_streak: streak, p_assigned: assigned });

// ─── Pure helpers (unit tested) ─────────────────────────────────────────

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

/** The four numbers over a class's assigned words, with how many there are. */
export function assignedCounts(journeys: Journeys, assignments: readonly Pick<Assignment, 'card_ids'>[]): Counts {
    const ids = new Set(assignments.flatMap((a) => a.card_ids));
    return { ...countSteps(journeys, ids), total: ids.size };
}

/** What moved in the last week; students who joined this week count from their first report. */
export function weekDelta(s: Pick<BoardStudent, 'counts' | 'week_ago' | 'week_first'>): StepCounts {
    const base: Counts = s.week_ago ?? s.week_first ?? s.counts;
    const out = { hieu: 0, nho: 0, gap: 0, dung: 0 };
    for (const step of STEPS) out[step] = Math.max(0, (s.counts[step] ?? 0) - (base[step] ?? 0));
    return out;
}

const DAY_MS = 86_400_000;
const daysSince = (iso: string, now: number) => Math.floor((now - Date.parse(iso)) / DAY_MS);

/** "3 ngày chưa học" or "Hôm nay" for the board; someone who just joined is new, not idle. */
export function activeLabel(inactiveDays: number | null, joinedAt?: string, now = Date.now()): string {
    if (inactiveDays === null) return joinedAt && daysSince(joinedAt, now) <= 3 ? 'Mới vào lớp' : 'Chưa học';
    if (inactiveDays <= 0) return 'Hôm nay';
    if (inactiveDays === 1) return 'Hôm qua';
    return `${inactiveDays} ngày chưa học`;
}

/** Students to nudge: more than 3 days since they last learned, or since they joined without learning. */
export const isSlipping = (s: Pick<BoardStudent, 'inactive_days' | 'joined_at'>, now = Date.now()) =>
    s.inactive_days === null ? daysSince(s.joined_at, now) > 3 : s.inactive_days > 3;

/** One student's week, as a message a teacher can send to a parent. */
export function parentNote(s: Pick<BoardStudent, 'name' | 'counts' | 'week_ago' | 'week_first' | 'streak' | 'assigned'>, className: string): string {
    const d = weekDelta(s);
    const c = s.counts;
    const assigned = s.assigned?.total ? ` Từ của lớp: ${s.assigned.dung ?? 0}/${s.assigned.total} từ đã dùng được.` : '';
    return (
        `${s.name} (${className}) tuần này: +${d.nho} từ nhớ được, +${d.dung} từ đã nói được. ` +
        `Tổng: ${c.nho ?? 0} từ Nhớ, ${c.dung ?? 0} từ Dùng, chuỗi ${s.streak} ngày học.${assigned}`
    );
}

// ─── On-device cache ────────────────────────────────────────────────────

const ASSIGNED_KEY = 'lexica-class-words-v1';
const CLASSES_KEY = 'lexica-classes-v1';

export function readAssignedWords(): string[] {
    try {
        const raw = JSON.parse(localStorage.getItem(ASSIGNED_KEY) ?? '[]') as unknown;
        return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : [];
    } catch {
        return [];
    }
}

export function writeAssignedWords(ids: string[]) {
    try {
        localStorage.setItem(ASSIGNED_KEY, JSON.stringify([...new Set(ids)].slice(0, 500)));
    } catch {
        // Private mode: assigned words are just not dealt first.
    }
}

/** Assigned words that exist on this device, for the Học stage to deal first. */
export function classWordsToQueue(): string[] {
    return readAssignedWords().filter((id) => getCard(id));
}

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
        // ignore
    }
    writeAssignedWords(list.filter((c) => c.role === 'student').flatMap((c) => c.assignments.flatMap((a) => a.card_ids)));
}
