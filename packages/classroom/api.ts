import type { SupabaseClient } from '@supabase/supabase-js';
import { classMessage } from './rules';
import type { AdminOverview, AppId, Assignment, Board, ClassInfo, InviteKind, LeaderRow, OpenInvite, OrgOverview, Whoami } from './types';
import type { ClassParents, ParentView, ReportContent, WeekMetrics } from './parents';
import type { AttendanceByClass, Mark, Session, Slot } from './attendance';
import type { ArenaHost, ArenaMode, ArenaPlayerView, ArenaQuestionInput, ArenaResult, ArenaRoomOpen, ArenaState } from './arena';

export class ClassError extends Error {}

/** Every classroom call (sql/classroom_core.sql), on a signed-in Supabase client (null: not configured). */
export function classroomApi(getClient: () => SupabaseClient | null) {
    async function rpc<T>(name: string, args?: Record<string, unknown>): Promise<T> {
        const client = getClient();
        if (!client) throw new ClassError(classMessage('not signed in'));
        const { data, error } = await client.rpc(name, args);
        if (error) throw new ClassError(classMessage(error.message));
        return data as T;
    }
    return {
        whoami: () => rpc<Whoami>('classroom_whoami'),
        /** Classes this person teaches or is in; with `app`, only those using it (a learning app asks for its own). */
        myClasses: (app?: AppId) => rpc<ClassInfo[]>('classroom_my_classes', { p_app: app ?? null }),

        // Students
        joinClass: (code: string, displayName: string) => rpc<{ class_id: string; name: string; apps: AppId[] }>('classroom_class_join', { p_code: code, p_display_name: displayName }),
        leaveClass: (classId: string) => rpc<{ left: boolean }>('classroom_class_leave', { p_class: classId }),
        leaderboard: (classId: string) => rpc<LeaderRow[]>('classroom_class_leaderboard', { p_class: classId }),
        /** A learning app's own numbers, sent to every class that uses it; the module cleans them per class. */
        report: (app: AppId, metrics: unknown, streak: number) => rpc<{ classes: number }>('classroom_report', { p_app: app, p_metrics: metrics, p_streak: streak }),

        // Teachers
        createClass: (name: string, apps: AppId[], settings: Record<AppId, unknown>, orgId: string | null) =>
            rpc<{ id: string; code: string }>('classroom_class_create', { p_name: name, p_apps: apps, p_settings: settings, p_org: orgId }),
        updateClass: (classId: string, patch: { name?: string; apps?: AppId[]; settings?: Record<AppId, unknown>; leaderboard?: boolean; leaderboardApp?: AppId; archived?: boolean }) =>
            rpc<{ ok: boolean }>('classroom_class_update', {
                p_class: classId,
                p_name: patch.name ?? null,
                p_apps: patch.apps ?? null,
                p_settings: patch.settings ?? null,
                p_leaderboard: patch.leaderboard ?? null,
                p_leaderboard_app: patch.leaderboardApp ?? null,
                p_archived: patch.archived ?? null,
            }),
        newCode: (classId: string) => rpc<{ code: string }>('classroom_class_new_code', { p_class: classId }),
        board: (classId: string) => rpc<Board>('classroom_class_board', { p_class: classId }),
        assign: (classId: string, a: { app: AppId; kind: string; title: string; payload: unknown; due: string | null }) =>
            rpc<{ id: string; payload: unknown }>('classroom_assign', { p_class: classId, p_app: a.app, p_kind: a.kind, p_title: a.title, p_payload: a.payload, p_due: a.due }),
        /** Work for one student of the class only (W4 "Giao ôn lại"). */
        assignTo: (classId: string, userId: string, a: { app: AppId; kind: string; title: string; payload: unknown; due: string | null }) =>
            rpc<{ id: string; payload: unknown }>('classroom_assign_to', { p_class: classId, p_user: userId, p_app: a.app, p_kind: a.kind, p_title: a.title, p_payload: a.payload, p_due: a.due }),
        updateAssignment: (id: string, patch: { title?: string; due?: string | null; payload?: Partial<Assignment['payload'] & object> }) =>
            rpc<{ ok: boolean }>('classroom_assignment_update', {
                p_assignment: id,
                p_title: patch.title ?? null,
                p_due: patch.due ?? null,
                p_clear_due: patch.due === null,
                p_payload: patch.payload ?? null,
            }),
        unassign: (id: string) => rpc<{ ok: boolean }>('classroom_unassign', { p_assignment: id }),
        setNote: (classId: string, userId: string, note: string) => rpc<{ ok: boolean }>('classroom_member_update', { p_class: classId, p_user: userId, p_note: note }),
        removeStudent: (classId: string, userId: string) => rpc<{ ok: boolean }>('classroom_member_update', { p_class: classId, p_user: userId, p_remove: true }),

        // Parents (sql/classroom_parents.sql)
        parents: (classId: string, week: string) => rpc<ClassParents>('classroom_parents', { p_class: classId, p_week: week }),
        setParentPin: (classId: string, on: boolean) => rpc<{ ok: boolean }>('classroom_parent_pin_set', { p_class: classId, p_on: on }),
        /** A new parent link (the old one stops working); `pin` only when the class uses PINs, shown this once. */
        newParentLink: (classId: string, userId: string) => rpc<{ code: string; pin?: string }>('classroom_parent_link_new', { p_class: classId, p_user: userId }),
        revokeParentLink: (classId: string, userId: string) => rpc<{ ok: boolean }>('classroom_parent_link_revoke', { p_class: classId, p_user: userId }),
        weekMetrics: (classId: string, week: string) => rpc<WeekMetrics>('classroom_week_metrics', { p_class: classId, p_week: week }),
        approveReport: (classId: string, userId: string, week: string, content: ReportContent) =>
            rpc<{ ok: boolean; content: ReportContent }>('classroom_report_approve', { p_class: classId, p_user: userId, p_week: week, p_content: content }),
        /** No account needed: the parent page. */
        parentView: (code: string, pin?: string) => rpc<ParentView>('parent_view', { p_code: code, p_pin: pin ?? null }),

        // Sessions and attendance (sql/classroom_attendance.sql)
        setSchedule: (classId: string, schedule: Slot[]) => rpc<{ schedule: Slot[] }>('classroom_schedule_set', { p_class: classId, p_schedule: schedule }),
        /** The timetable and sessions between two days, for each class this person teaches. */
        attendance: (classIds: string[], from: string, to: string) => rpc<AttendanceByClass>('classroom_attendance', { p_classes: classIds, p_from: from, p_to: to }),
        /** Take the roll for a day; a null mark clears it. `topic` when given ('' clears it). */
        markAttendance: (classId: string, date: string, marks: Record<string, Mark | null>, topic?: string) =>
            rpc<Session>('classroom_attendance_mark', { p_class: classId, p_date: date, p_marks: marks, p_topic: topic ?? null }),
        /** A day's topic, or cancel it (its marks are dropped). */
        setSession: (classId: string, date: string, patch: { topic?: string; cancelled?: boolean }) =>
            rpc<Session>('classroom_session_set', { p_class: classId, p_date: date, p_topic: patch.topic ?? null, p_cancelled: patch.cancelled ?? null }),

        // Arena (sql/classroom_arena.sql): the teacher's screen drives, students answer
        arenaOpen: (classId: string, seconds: number, questions: ArenaQuestionInput[], opts: { hideNames?: boolean; mode?: ArenaMode; teams?: number } = {}) =>
            rpc<{ id: string; code: string }>('arena_open', {
                p_class: classId,
                p_seconds: seconds,
                p_questions: questions,
                p_hide_names: opts.hideNames ?? true,
                p_mode: opts.mode ?? 'classic',
                p_teams: opts.mode === 'team' ? (opts.teams ?? 2) : 0,
            }),
        /** Team mode, in the lobby: who plays in which team (1..N). */
        arenaTeamsSet: (roomId: string, teams: Record<string, number>) => rpc<{ ok: boolean }>('arena_teams_set', { p_room: roomId, p_teams: teams }),
        arenaNext: (roomId: string) => rpc<{ state: ArenaState; q_index?: number }>('arena_next', { p_room: roomId }),
        arenaLock: (roomId: string) => rpc<{ state: ArenaState }>('arena_lock', { p_room: roomId }),
        arenaFinish: (roomId: string) => rpc<{ state: ArenaState }>('arena_finish', { p_room: roomId }),
        arenaHost: (roomId: string) => rpc<ArenaHost>('arena_host_state', { p_room: roomId }),
        arenaOpenRooms: () => rpc<ArenaRoomOpen[]>('arena_open_rooms'),
        arenaJoin: (code: string) => rpc<{ id: string }>('arena_join', { p_code: code }),
        arenaState: (roomId: string) => rpc<ArenaPlayerView>('arena_state', { p_room: roomId }),
        arenaAnswer: (roomId: string, idx: number, choice: number) => rpc<{ received: boolean }>('arena_answer', { p_room: roomId, p_idx: idx, p_choice: choice }),
        /** This student's answers in rooms finished in the last 14 days. */
        arenaMyResults: () => rpc<ArenaResult[]>('arena_my_results'),

        // Centers and invitations
        orgOverview: (orgId: string) => rpc<OrgOverview>('classroom_org_overview', { p_org: orgId }),
        updateOrg: (orgId: string, patch: { name?: string; seats?: number }) => rpc<{ ok: boolean }>('classroom_org_update', { p_org: orgId, p_name: patch.name ?? null, p_seats: patch.seats ?? null }),
        removeMember: (orgId: string, userId: string) => rpc<{ ok: boolean }>('classroom_org_remove_member', { p_org: orgId, p_user: userId }),
        createOrg: (name: string) => rpc<{ id: string }>('classroom_org_create', { p_name: name }),
        adminOverview: () => rpc<AdminOverview>('classroom_admin_overview'),
        revokeIndie: (userId: string) => rpc<{ ok: boolean }>('classroom_indie_revoke', { p_user: userId }),
        createInvite: (kind: InviteKind, orgId: string | null, note?: string) => rpc<{ token: string }>('classroom_invite_create', { p_kind: kind, p_org: orgId, p_note: note ?? null }),
        inviteInfo: (token: string) => rpc<{ valid: boolean; kind?: InviteKind; org?: string | null }>('classroom_invite_info', { p_token: token }),
        acceptInvite: (token: string) => rpc<{ kind: InviteKind; org_id: string | null }>('classroom_invite_accept', { p_token: token }),
        openInvites: (orgId: string | null) => rpc<OpenInvite[]>('classroom_invites_open', { p_org: orgId }),
        revokeInvite: (token: string) => rpc<{ ok: boolean }>('classroom_invite_revoke', { p_token: token }),
    };
}

export type ClassroomApi = ReturnType<typeof classroomApi>;
