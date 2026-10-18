/**
 * Lexica classes, shared by the learning app (students) and the teacher app
 * (apps/lexica-teach): the types the class functions return, their calls,
 * the messages for their errors, and the pure rules both apps show the same
 * way (who needs a nudge, a week's progress, a note to parents). The server
 * side is apps/lexica/supabase/migration_classes*.sql: security definer
 * functions only.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

// ─── Types ──────────────────────────────────────────────────────────────

export type Step = 'hieu' | 'nho' | 'gap' | 'dung';
export const STEPS: readonly Step[] = ['hieu', 'nho', 'gap', 'dung'];
export const STEP_LABEL: Record<Step | 'doi', string> = { hieu: 'Hiểu', nho: 'Nhớ', gap: 'Gặp', dung: 'Dùng', doi: 'Đời' };

/** Words that reached each step; `doi` = used in real life; `total` = words counted (assigned ones). */
export type Counts = Partial<Record<Step | 'doi' | 'total', number>>;

export type AssignMode = 'only' | 'mixed';

export interface Assignment {
    id: string;
    title: string;
    card_ids: string[];
    missing_words: string[];
    created_at: string;
    due_on?: string | null;
    mode?: AssignMode;
}

export interface ClassInfo {
    id: string;
    name: string;
    branch: 'cert' | 'talk';
    level: string | null;
    org_id: string | null;
    org?: string | null;
    created_at?: string;
    leaderboard?: boolean;
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

export interface Whoami {
    email: string | null;
    admin: boolean;
    /** May make classes outside any center (independent teachers and system admins). */
    indie: boolean;
    orgs: OrgInfo[];
}

export interface BoardStudent {
    user_id: string;
    name: string;
    joined_at: string;
    note?: string | null;
    counts: Counts;
    assigned: Counts;
    /** Furthest step per assigned word: 1 Hiểu … 4 Dùng, 5 Đời. */
    words?: Record<string, number>;
    streak: number;
    last_active: string | null;
    inactive_days: number | null;
    /** Numbers on the last report at least 7 days ago, or null. */
    week_ago: Counts | null;
    /** First report inside the last 7 days, for students who joined this week. */
    week_first: Counts | null;
    /** Days with a report in the last 30. */
    days?: string[];
}

export interface Board {
    class: { id: string; name: string; code: string; branch: 'cert' | 'talk'; level: string | null; leaderboard?: boolean; org_id?: string | null; org?: string | null; created_at?: string };
    assignments?: Assignment[];
    students: BoardStudent[];
}

export interface OrgOverview {
    id: string;
    name: string;
    seats: number;
    used: number;
    people: { user_id: string; email: string; role: 'admin' | 'teacher'; classes: number }[];
    classes: { id: string; name: string; teacher: string | null; members: number; avg_nho: number | null; avg_dung: number | null; active_week: number }[];
}

export interface AdminOverview {
    orgs: { id: string; name: string; seats: number; used: number; admins: number; teachers: number; classes: number; created_at: string }[];
    indie: { user_id: string; email: string; since: string; classes: number }[];
}

export type InviteKind = 'org_admin' | 'org_teacher' | 'indie';

export interface OpenInvite {
    token: string;
    kind: InviteKind;
    note: string | null;
    expires_at: string;
    org: string | null;
}

export interface LeaderRow {
    name: string;
    dung: number;
    nho: number;
    me: boolean;
}

// ─── Errors ─────────────────────────────────────────────────────────────

const MESSAGES: Record<string, string> = {
    'own class': 'Đây là lớp bạn dạy, không cần vào bằng mã.',
    'not signed in': 'Bạn cần đăng nhập trước.',
    'no such class': 'Không tìm thấy lớp với mã này.',
    'no seats': 'Lớp hoặc trung tâm đã hết chỗ. Báo giáo viên của bạn nhé.',
    'not the teacher': 'Chỉ giáo viên của lớp làm được việc này.',
    'not in this class': 'Bạn không ở trong lớp này.',
    'not in this center': 'Bạn chưa thuộc trung tâm này.',
    'not a teacher': 'Tài khoản này chưa được mở quyền tạo lớp riêng.',
    'not an admin': 'Việc này cần quyền quản lý.',
    'not yourself': 'Bạn không tự gỡ mình được.',
    'invite expired': 'Lời mời này đã được dùng hoặc đã hết hạn. Xin một lời mời mới nhé.',
    'bad invite': 'Lời mời không hợp lệ.',
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

// ─── Calls ──────────────────────────────────────────────────────────────

/** Every class call, on a signed-in Supabase client (null: not configured). */
export function classApi(getClient: () => SupabaseClient | null) {
    async function rpc<T>(name: string, args?: Record<string, unknown>): Promise<T> {
        const client = getClient();
        if (!client) throw new ClassError(MESSAGES['not signed in']);
        const { data, error } = await client.rpc(name, args);
        if (error) throw new ClassError(classMessage(error.message));
        return data as T;
    }
    return {
        whoami: () => rpc<Whoami>('lexica_whoami'),
        myClasses: () => rpc<ClassInfo[]>('lexica_my_classes'),
        // Students
        joinClass: (code: string, displayName: string) =>
            rpc<{ class_id: string; name: string; branch: string; level: string | null }>('lexica_class_join', { p_code: code, p_display_name: displayName }),
        leaveClass: (classId: string) => rpc<{ left: boolean }>('lexica_class_leave', { p_class: classId }),
        leaderboard: (classId: string) => rpc<LeaderRow[]>('lexica_class_leaderboard', { p_class: classId }),
        report: (counts: Counts, streak: number, assigned: Record<string, Counts>, words: Record<string, number>) =>
            rpc<{ classes: number }>('lexica_class_report', { p_counts: counts, p_streak: streak, p_assigned: assigned, p_words: words }),
        // Teachers
        createClass: (name: string, branch: 'cert' | 'talk', level: string | null, orgId: string | null) =>
            rpc<{ id: string; code: string }>('lexica_class_create', { p_name: name, p_branch: branch, p_level: level, p_org: orgId }),
        updateClass: (classId: string, patch: { name?: string; branch?: 'cert' | 'talk'; level?: string; leaderboard?: boolean; archived?: boolean }) =>
            rpc<{ ok: boolean }>('lexica_class_update', {
                p_class: classId,
                p_name: patch.name ?? null,
                p_branch: patch.branch ?? null,
                p_level: patch.level ?? null,
                p_leaderboard: patch.leaderboard ?? null,
                p_archived: patch.archived ?? null,
            }),
        newCode: (classId: string) => rpc<{ code: string }>('lexica_class_new_code', { p_class: classId }),
        board: (classId: string) => rpc<Board>('lexica_class_board', { p_class: classId }),
        assign: (classId: string, a: { title: string; cardIds: string[]; missing: string[]; due: string | null; mode: AssignMode }) =>
            rpc<{ id: string; cards: number; missing: number }>('lexica_class_assign', {
                p_class: classId,
                p_title: a.title,
                p_card_ids: a.cardIds,
                p_missing: a.missing,
                p_due: a.due,
                p_mode: a.mode,
            }),
        updateAssignment: (id: string, patch: { title?: string; due?: string | null; mode?: AssignMode }) =>
            rpc<{ ok: boolean }>('lexica_class_assignment_update', {
                p_assignment: id,
                p_title: patch.title ?? null,
                p_due: patch.due ?? null,
                p_clear_due: patch.due === null,
                p_mode: patch.mode ?? null,
            }),
        unassign: (id: string) => rpc<{ ok: boolean }>('lexica_class_unassign', { p_assignment: id }),
        setNote: (classId: string, userId: string, note: string) => rpc<{ ok: boolean }>('lexica_class_member_update', { p_class: classId, p_user: userId, p_note: note }),
        removeStudent: (classId: string, userId: string) => rpc<{ ok: boolean }>('lexica_class_member_update', { p_class: classId, p_user: userId, p_remove: true }),
        // Centers and invitations
        orgOverview: (orgId: string) => rpc<OrgOverview>('lexica_org_overview', { p_org: orgId }),
        updateOrg: (orgId: string, patch: { name?: string; seats?: number }) => rpc<{ ok: boolean }>('lexica_org_update', { p_org: orgId, p_name: patch.name ?? null, p_seats: patch.seats ?? null }),
        removeMember: (orgId: string, userId: string) => rpc<{ ok: boolean }>('lexica_org_remove_member', { p_org: orgId, p_user: userId }),
        createOrg: (name: string) => rpc<{ id: string }>('lexica_org_create', { p_name: name }),
        adminOverview: () => rpc<AdminOverview>('lexica_admin_overview'),
        revokeIndie: (userId: string) => rpc<{ ok: boolean }>('lexica_indie_revoke', { p_user: userId }),
        createInvite: (kind: InviteKind, orgId: string | null, note?: string) => rpc<{ token: string }>('lexica_invite_create', { p_kind: kind, p_org: orgId, p_note: note ?? null }),
        inviteInfo: (token: string) => rpc<{ valid: boolean; kind?: InviteKind; org?: string | null }>('lexica_invite_info', { p_token: token }),
        acceptInvite: (token: string) => rpc<{ kind: InviteKind; org_id: string | null }>('lexica_invite_accept', { p_token: token }),
        openInvites: (orgId: string | null) => rpc<OpenInvite[]>('lexica_invites_open', { p_org: orgId }),
        revokeInvite: (token: string) => rpc<{ ok: boolean }>('lexica_invite_revoke', { p_token: token }),
    };
}

export type ClassApi = ReturnType<typeof classApi>;

// ─── Rules (unit tested) ────────────────────────────────────────────────

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

const DAY_MS = 86_400_000;
const daysSince = (iso: string, now: number) => Math.floor((now - Date.parse(iso)) / DAY_MS);

/** Where a student is: new (joined, nothing yet), learning, or needs a nudge (more than 3 days quiet). */
export type StudentState = 'new' | 'active' | 'nudge';

export function studentState(s: Pick<BoardStudent, 'inactive_days' | 'joined_at'>, now = Date.now()): StudentState {
    if (s.inactive_days === null) return daysSince(s.joined_at, now) > 3 ? 'nudge' : 'new';
    return s.inactive_days > 3 ? 'nudge' : 'active';
}

export const isSlipping = (s: Pick<BoardStudent, 'inactive_days' | 'joined_at'>, now = Date.now()) => studentState(s, now) === 'nudge';

/** "3 ngày chưa học" or "Hôm nay"; someone who just joined is new, not idle. */
export function activeLabel(inactiveDays: number | null, joinedAt?: string, now = Date.now()): string {
    if (inactiveDays === null) return joinedAt && daysSince(joinedAt, now) <= 3 ? 'Mới vào lớp' : 'Chưa học';
    if (inactiveDays <= 0) return 'Hôm nay';
    if (inactiveDays === 1) return 'Hôm qua';
    return `${inactiveDays} ngày chưa học`;
}

/** Progress over the last 7 days (since joining, for someone new this week). */
export function weekDelta(s: Pick<BoardStudent, 'counts' | 'week_ago' | 'week_first'>): Record<Step, number> {
    const base: Counts = s.week_ago ?? s.week_first ?? s.counts;
    const out = { hieu: 0, nho: 0, gap: 0, dung: 0 };
    for (const step of STEPS) out[step] = Math.max(0, (s.counts[step] ?? 0) - (base[step] ?? 0));
    return out;
}

/** One student's week, as a message a teacher can send to a parent. Praise first. */
export function parentNote(s: Pick<BoardStudent, 'name' | 'counts' | 'week_ago' | 'week_first' | 'streak' | 'assigned'>, className: string): string {
    const d = weekDelta(s);
    const c = s.counts;
    const assigned = s.assigned?.total ? ` Từ của lớp: ${s.assigned.dung ?? 0}/${s.assigned.total} từ đã dùng được.` : '';
    return (
        `${s.name} (${className}) tuần này: +${d.nho} từ nhớ được, +${d.dung} từ đã nói được. ` +
        `Tổng: ${c.nho ?? 0} từ Nhớ, ${c.dung ?? 0} từ Dùng, chuỗi ${s.streak} ngày học.${assigned}`
    );
}

/** How far the class got on one assignment: students who reached at least `step` on every word. */
export function assignmentProgress(a: Pick<Assignment, 'card_ids'>, students: readonly Pick<BoardStudent, 'words'>[]): { started: number; learned: number; used: number; total: number } {
    const ids = a.card_ids;
    const out = { started: 0, learned: 0, used: 0, total: students.length };
    if (ids.length === 0) return out;
    for (const s of students) {
        const steps = ids.map((id) => s.words?.[id] ?? 0);
        if (steps.some((n) => n >= 1)) out.started++;
        if (steps.every((n) => n >= 1)) out.learned++;
        if (steps.every((n) => n >= 4)) out.used++;
    }
    return out;
}

/** Days until a due date (negative = past). */
export function daysUntil(dueOn: string, now = Date.now()): number {
    const due = Date.parse(`${dueOn}T23:59:59`);
    return Math.ceil((due - now) / DAY_MS) - 1;
}

/** Links a teacher shares: the student joins with the class code, in the learning app. */
export function joinLink(lexicaUrl: string, code: string): string {
    return `${lexicaUrl.replace(/\/+$/, '')}/join/${encodeURIComponent(code)}`;
}

export function inviteLink(teachUrl: string, token: string): string {
    return `${teachUrl.replace(/\/+$/, '')}/invite/${encodeURIComponent(token)}`;
}
