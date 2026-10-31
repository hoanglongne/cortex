import { getSupabaseClient } from './supabase';
import { localDate } from './engagement/ghost';

export interface DailyActivity {
    user_id: string;
    date: string; // 'YYYY-MM-DD'
    words_swiped: number;
    words_learned_today: number;
    daily_goal: number;
    goal_met: boolean;
    streak: number;
}

export interface BuddyPair {
    id: string;
    user_a_id: string;
    user_b_id: string;
    duo_streak: number;
    last_duo_date: string | null;
    target_words: number;
    created_at: string;
    user_a?: { id: string; nickname: string; elo_rating: number };
    user_b?: { id: string; nickname: string; elo_rating: number };
}

export interface BuddyInfo {
    id: string;
    nickname: string;
    pairId: string;
    duoStreak: number;
    targetWords: number;
    today: DailyActivity | null; // bạn bè học gì hôm nay
}

export const MAX_BUDDIES = 5;

// ── Helpers ─────────────────────────────────────────────

/** The learner's own calendar day: a day starts at midnight where they are, not in UTC. */
function todayDate(): string {
    return localDate();
}

/** The local dates of the last `n` days, oldest first. */
export function lastDays(n: number, now = Date.now()): string[] {
    return Array.from({ length: n }, (_, i) => localDate(now - (n - 1 - i) * 86_400_000));
}

function generateCode(len = 6): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ── Daily Activity ───────────────────────────────────────

/** Lưu hoạt động hôm nay lên Supabase (upsert theo user_id + date) */
export async function upsertDailyActivity(data: Omit<DailyActivity, 'date'>): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    await supabase
        .from('daily_activity')
        .upsert({ ...data, date: todayDate() }, { onConflict: 'user_id,date' });
}

// ── Buddy Invites ────────────────────────────────────────

/** Tạo invite code 6 ký tự, trả về code */
export async function createInviteCode(userId: string): Promise<string | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    // Thử tối đa 5 lần nếu trùng code
    for (let i = 0; i < 5; i++) {
        const code = generateCode();
        const { error } = await supabase
            .from('buddy_invites')
            .insert({ code, from_user_id: userId });
        if (!error) return code;
    }
    return null;
}

/** Chấp nhận invite — tạo buddy pair, đánh dấu invite là accepted */
export async function acceptInvite(
    code: string,
    acceptorId: string,
): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase chưa cấu hình' };

    // Lấy invite
    const { data: invite, error: fetchErr } = await supabase
        .from('buddy_invites')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('accepted', false)
        .gt('expires_at', new Date().toISOString())
        .single();

    if (fetchErr || !invite) return { success: false, error: 'Mã không hợp lệ hoặc đã hết hạn' };
    if (invite.from_user_id === acceptorId) return { success: false, error: 'Không thể kết bạn với chính mình' };

    // Kiểm tra đã là buddy chưa
    const { data: existing } = await supabase
        .from('buddy_pairs')
        .select('id')
        .or(`and(user_a_id.eq.${invite.from_user_id},user_b_id.eq.${acceptorId}),and(user_a_id.eq.${acceptorId},user_b_id.eq.${invite.from_user_id})`)
        .single();

    if (existing) return { success: false, error: 'Hai bạn đã là Study Buddy rồi!' };

    // Tạo pair + đánh dấu invite accepted
    const [{ error: pairErr }] = await Promise.all([
        supabase.from('buddy_pairs').insert({
            user_a_id: invite.from_user_id,
            user_b_id: acceptorId,
        }),
        supabase.from('buddy_invites').update({ accepted: true }).eq('code', code.toUpperCase()),
    ]);

    if (pairErr) return { success: false, error: pairErr.message.includes('blocked') ? 'Không kết bạn được với người này.' : 'Lỗi khi kết nối. Thử lại nhé.' };
    return { success: true };
}

// ── Buddies List ─────────────────────────────────────────

/** Lấy danh sách buddies kèm hoạt động hôm nay */
export async function getMyBuddies(userId: string): Promise<BuddyInfo[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    const { data: pairs } = await supabase
        .from('buddy_pairs')
        .select('*')
        .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`);

    if (!pairs || pairs.length === 0) return [];

    const buddyIds = pairs.map((p: BuddyPair) => (p.user_a_id === userId ? p.user_b_id : p.user_a_id));

    // Get profiles and activities in parallel
    const [profilesRes, activityRes] = await Promise.all([
        // Other people's profiles are readable only through this view (no email)
        supabase.from('public_profiles')
            .select('id, nickname')
            .or(buddyIds.map(id => `id.eq.${id}`).join(',')),
        supabase
            .from('daily_activity')
            .select('*')
            .in('user_id', buddyIds)
            .eq('date', todayDate())
    ]);

    const profiles: Record<string, { nickname: string }> = {};
    for (const p of (profilesRes.data ?? [])) {
        profiles[p.id] = { nickname: p.nickname };
    }

    const activities: Record<string, DailyActivity> = {};
    for (const a of (activityRes.data ?? [])) activities[a.user_id] = a;

    const result = pairs.map((pair: BuddyPair) => {
        const buddyId = pair.user_a_id === userId ? pair.user_b_id : pair.user_a_id;
        return {
            id: buddyId,
            nickname: profiles[buddyId]?.nickname ?? 'Unknown',
            pairId: pair.id,
            duoStreak: pair.duo_streak,
            targetWords: pair.target_words,
            today: activities[buddyId] ?? null,
        };
    });
    return result;
}

/** Cập nhật duo streak sau khi check cả hai đạt goal hôm qua */
export async function checkAndUpdateDuoStreak(pairId: string, userAId: string, userBId: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const todayStr = todayDate();

    // Check today's activities first
    const { data: todayActs } = await supabase
        .from('daily_activity')
        .select('user_id, goal_met')
        .in('user_id', [userAId, userBId])
        .eq('date', todayStr);

    // Only proceed if both have met goals today
    if (!todayActs || todayActs.length < 2 || !todayActs.every(a => a.goal_met)) {
        return;
    }

    // Get current pair data
    const { data: pair } = await supabase.from('buddy_pairs').select('duo_streak, last_duo_date').eq('id', pairId).single();
    if (!pair) return;

    // Skip if already updated today
    if (pair.last_duo_date === todayStr) return;

    // Update streak count and set today as last update date
    await supabase.from('buddy_pairs').update({
        duo_streak: pair.duo_streak + 1,
        last_duo_date: todayStr,
    }).eq('id', pairId);
}

/** Xóa buddy pair */
export async function removeBuddy(pairId: string): Promise<void> {
    const supabase = getSupabaseClient();
    await supabase?.from('buddy_pairs').delete().eq('id', pairId);
}

/** Each person's activity on each of the last `days` days: { userId: { date: activity } }. */
export async function getWeek(userIds: string[], days = 7): Promise<Record<string, Record<string, DailyActivity>>> {
    const supabase = getSupabaseClient();
    const out: Record<string, Record<string, DailyActivity>> = {};
    if (!supabase || userIds.length === 0) return out;
    const dates = lastDays(days);
    const { data } = await supabase.from('daily_activity').select('*').in('user_id', userIds).gte('date', dates[0]).lte('date', dates[dates.length - 1]);
    for (const a of (data ?? []) as DailyActivity[]) (out[a.user_id] ??= {})[a.date] = a;
    return out;
}

/** Days studied and words learned over the week, best first: a friendly ranking of the learner and their buddies. */
export function weekRanking(people: { id: string; name: string }[], week: Record<string, Record<string, DailyActivity>>): { id: string; name: string; days: number; words: number }[] {
    return people
        .map((p) => {
            const acts = Object.values(week[p.id] ?? {});
            return { ...p, days: acts.filter((a) => a.words_swiped > 0 || a.goal_met).length, words: acts.reduce((n, a) => n + (a.words_learned_today ?? 0), 0) };
        })
        .sort((a, b) => b.days - a.days || b.words - a.words || a.name.localeCompare(b.name, 'vi'));
}

/** A link that opens Buddy with the invite code ready to accept. */
export const inviteLink = (code: string, origin: string) => `${origin}/buddy?code=${encodeURIComponent(code)}`;

/** A friendly nudge for a buddy who has not studied today. */
export const nudgeText = (name: string, origin: string) => `${name} ơi, hôm nay mình học Lexica rồi, còn bạn? Vào giữ chuỗi đôi nhé: ${origin}`;
