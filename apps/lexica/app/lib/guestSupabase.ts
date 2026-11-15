import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { classroomApi } from '@cortex/classroom';

/**
 * The guest session of the Đấu trường: a person without an account enters a
 * code and a name and plays one room. It is an anonymous Supabase user kept in
 * a client of its own (its own storage key), so the rest of Lexica never sees
 * it: no profile, no sync, no backup, nothing of the learner's is tied to it.
 */
let guest: SupabaseClient | null = null;

export function getGuestClient(): SupabaseClient | null {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    guest ??= createClient(url, key, { auth: { storageKey: 'lexica-guest-auth', persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
    return guest;
}

/** The guest session, started when there is none. Returns an error in Vietnamese, or null. */
export async function startGuestSession(): Promise<string | null> {
    const client = getGuestClient();
    if (!client) return 'Chưa kết nối được máy chủ. Thử lại sau nhé.';
    const { data } = await client.auth.getSession();
    if (data.session) return null;
    const { error } = await client.auth.signInAnonymously();
    if (!error) return null;
    return /anonymous/i.test(error.message) ? 'Phòng khách chưa được bật trên máy chủ. Báo giáo viên.' : 'Chưa vào được. Thử lại sau nhé.';
}

export const guestApi = classroomApi(getGuestClient);
