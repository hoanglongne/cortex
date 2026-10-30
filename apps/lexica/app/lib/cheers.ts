/**
 * The group's week and cheers between buddies (docs: issue #70, direction A;
 * supabase/migration_buddy_cheers.sql). The group goal is counted from days
 * each person reached their daily goal (daily_activity.goal_met), so it needs
 * no new data: every member should reach their goal on 5 of the last 7 days.
 * Pure parts unit tested.
 */
import { getSupabaseClient } from './supabase';
import type { DailyActivity } from './buddy';

export type CheerKind = 'fire' | 'clap' | 'muscle';
export const CHEER_KINDS: readonly CheerKind[] = ['fire', 'clap', 'muscle'];
export const CHEER_LABEL: Record<CheerKind, string> = { fire: 'Cháy', clap: 'Giỏi', muscle: 'Cố lên' };

export interface CheersToday {
    received: { from_id: string; from_name: string | null; kind: CheerKind }[];
    /** Buddy id → the cheer I sent today. */
    sent: Record<string, CheerKind>;
}

async function rpc<T>(name: string, args?: Record<string, unknown>): Promise<T> {
    const client = getSupabaseClient();
    if (!client) throw new Error('Cần đăng nhập và có mạng.');
    const { data, error } = await client.rpc(name, args);
    if (error) throw new Error(error.message.includes('not buddies') ? 'Chỉ cổ vũ được bạn học của mình.' : error.message);
    return data as T;
}

export const cheerSend = (to: string, kind: CheerKind) => rpc<{ ok: boolean }>('cheer_send', { p_to: to, p_kind: kind });
export const cheersToday = () => rpc<CheersToday>('cheers_today');

/** Days (of 7) each member should reach their goal. */
export const TEAM_DAYS = 5;

export interface TeamMember {
    id: string;
    name: string;
    /** Days of the week they reached the goal. */
    days: number;
    /** Did today (counted from `forceToday` for me). */
    today: boolean;
}

export interface TeamWeek {
    members: TeamMember[];
    /** Goal days reached, each member at most TEAM_DAYS. */
    done: number;
    goal: number;
    /** 0..1 */
    share: number;
    reached: boolean;
    /** Members with no goal day this week: the ones to cheer. */
    quiet: TeamMember[];
}

/**
 * The group's week from each member's activity. `days` are the 7 dates
 * (oldest first); `forceToday`: I reached today's goal on this device, even
 * if the server does not know yet.
 */
export function teamWeek(people: readonly { id: string; name: string }[], week: Record<string, Record<string, DailyActivity>>, days: readonly string[], me: string, forceToday = false): TeamWeek {
    const today = days[days.length - 1];
    const members = people.map((p) => {
        const acts = week[p.id] ?? {};
        const met = days.filter((d) => acts[d]?.goal_met || (p.id === me && d === today && forceToday));
        return { id: p.id, name: p.name, days: met.length, today: met.includes(today) };
    });
    const goal = members.length * TEAM_DAYS;
    const done = members.reduce((n, m) => n + Math.min(m.days, TEAM_DAYS), 0);
    return { members, done, goal, share: goal ? Math.min(1, done / goal) : 0, reached: goal > 0 && done >= goal, quiet: members.filter((m) => m.id !== me && m.days === 0) };
}

/** One line under the ring. */
export function teamLine(t: TeamWeek): string {
    if (t.members.length < 2) return 'Thêm một người bạn để lập nhóm.';
    if (t.reached) return 'Cả nhóm đạt mục tiêu tuần này. Giỏi lắm!';
    const left = t.goal - t.done;
    if (t.quiet.length > 0) return `Còn ${left} ngày nữa. ${t.quiet.map((m) => m.name).join(', ')} chưa có ngày nào: cổ vũ bạn ấy nhé.`;
    return `Còn ${left} ngày nữa để cả nhóm đạt mục tiêu.`;
}
