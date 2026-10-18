import type { SupabaseClient } from '@supabase/supabase-js';
import { classMessage } from './rules';
import type { AdminOverview, AppId, Assignment, Board, ClassInfo, InviteKind, LeaderRow, OpenInvite, OrgOverview, Whoami } from './types';

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
