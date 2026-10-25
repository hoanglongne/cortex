/**
 * What the classroom functions return (sql/classroom_core.sql). App-specific
 * parts (settings, assignment payloads, metrics) are `unknown` here; each
 * module parses its own (see module.ts).
 */

/** A registered app id: 'lexica', 'oratio'… (cortex_apps). */
export type AppId = string;

export interface AppInfo {
    id: AppId;
    name: string;
}

export interface Assignment<Payload = unknown> {
    id: string;
    app: AppId;
    kind: string;
    title: string;
    payload: Payload;
    due_on: string | null;
    created_at: string;
    /** Given to one student only ("Giao ôn lại"); null or missing for the whole class. */
    for_user?: string | null;
}

export interface ClassInfo {
    id: string;
    name: string;
    apps: AppId[];
    /** Each app's own settings, by app id. */
    settings: Record<AppId, unknown>;
    org_id: string | null;
    org: string | null;
    created_at: string;
    leaderboard: boolean;
    leaderboard_app: AppId | null;
    role: 'teacher' | 'student';
    /** Only for the teacher. */
    code: string | null;
    members: number;
    assignments: Assignment[];
}

/** One app's numbers for one student: now, a week ago, and the first report this week. */
export interface StudentApp<Metrics = unknown> {
    metrics: Metrics;
    last_active: string | null;
    week_ago: Metrics | null;
    week_first: Metrics | null;
}

export interface BoardStudent {
    user_id: string;
    name: string;
    joined_at: string;
    note: string | null;
    /** Longest current streak across the class's apps. */
    streak: number;
    last_active: string | null;
    inactive_days: number | null;
    /** Days with any report in the last 30. */
    days: string[];
    apps: Record<AppId, StudentApp>;
}

export interface Board {
    class: {
        id: string;
        name: string;
        code: string;
        apps: AppId[];
        settings: Record<AppId, unknown>;
        leaderboard: boolean;
        leaderboard_app: AppId | null;
        org_id: string | null;
        org: string | null;
        created_at: string;
    };
    assignments: Assignment[];
    students: BoardStudent[];
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
    /** Apps that take part in classes. */
    apps: AppInfo[];
}

export interface OrgOverview {
    id: string;
    name: string;
    seats: number;
    used: number;
    people: { user_id: string; email: string; role: 'admin' | 'teacher'; classes: number }[];
    classes: { id: string; name: string; apps: AppId[]; teacher: string | null; members: number; active_week: number; at_risk?: number }[];
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
    score: number;
    me: boolean;
}
