import { getSupabaseClient } from './supabase';
import type { Session, User } from '@supabase/supabase-js';

export type { Session, User };

export interface Profile {
    id: string;
    nickname: string;
    created_at: string;
}

/** Gửi magic link về email */
export async function signInWithEmail(email: string, redirectTo: string): Promise<{ error: string | null }> {
    const supabase = getSupabaseClient();
    if (!supabase) return { error: 'Supabase chưa được cấu hình' };

    const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo: redirectTo },
    });

    return { error: error?.message ?? null };
}

/**
 * `confirm`: account made, the email has to be confirmed first.
 * `isNew`: no account signed in with that password; the form asks for the
 * password again before making one, so a typo can't become an account's password.
 */
export type PasswordResult = { ok: true } | { ok: false; error: string } | { ok: false; confirm: true } | { ok: false; isNew: true };

/**
 * Email + password: signs in, or creates the account when the email is new.
 * No email is sent (with "Confirm email" off in Supabase Auth); with it on,
 * a new account gets one confirmation email.
 */
export async function signInWithPassword(email: string, password: string, repeated?: string): Promise<PasswordResult> {
    const supabase = getSupabaseClient();
    if (!supabase) return { ok: false, error: 'Supabase chưa được cấu hình' };
    const clean = email.trim().toLowerCase();
    const signIn = await supabase.auth.signInWithPassword({ email: clean, password });
    if (!signIn.error) return { ok: true };
    if (!/invalid login credentials/i.test(signIn.error.message)) return { ok: false, error: signIn.error.message };
    // A new account (or a wrong password): the password is typed twice before an account is made with it.
    if (repeated === undefined) return { ok: false, isNew: true };
    if (repeated !== password) return { ok: false, error: 'Hai mật khẩu chưa khớp.' };
    const signUp = await supabase.auth.signUp({ email: clean, password });
    if (signUp.error) return { ok: false, error: signUp.error.message.includes('Password') ? 'Mật khẩu cần ít nhất 6 ký tự.' : signUp.error.message };
    // An existing email comes back with no identities: the password was wrong (or never set).
    if (signUp.data.user && signUp.data.user.identities?.length === 0) {
        return { ok: false, error: 'Sai mật khẩu. Tài khoản cũ chưa có mật khẩu thì dùng "Nhận link đăng nhập" một lần, rồi đặt mật khẩu.' };
    }
    return signUp.data.session ? { ok: true } : { ok: false, confirm: true };
}

/** Sets or changes the password of the signed-in account. */
export async function setPassword(password: string): Promise<{ error: string | null }> {
    const supabase = getSupabaseClient();
    if (!supabase) return { error: 'Supabase chưa được cấu hình' };
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error ? (error.message.includes('Password') ? 'Mật khẩu cần ít nhất 6 ký tự.' : error.message) : null };
}

/** Đăng xuất */
export async function signOut(): Promise<void> {
    const supabase = getSupabaseClient();
    await supabase?.auth.signOut();
}

/** Lấy session hiện tại */
export async function getSession(): Promise<Session | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
}

/** Lấy user hiện tại */
export async function getCurrentUser(): Promise<User | null> {
    const session = await getSession();
    return session?.user ?? null;
}

/** Lấy profile từ Supabase */
export async function getProfile(userId: string): Promise<Profile | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    return data as Profile | null;
}

/** Tạo profile lần đầu sau khi đăng nhập */
export async function upsertProfile(userId: string, nickname: string): Promise<Profile | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const clean = nickname.trim() || 'Anonymous';

    // Thử UPDATE trước (tránh dùng on_conflict gây lỗi PostgREST cache)
    const { data: updated, error: updateErr } = await supabase
        .from('profiles')
        .update({ nickname: clean })
        .eq('id', userId)
        .select('*')
        .single();
    if (!updateErr && updated) return updated as Profile;

    // Nếu row chưa tồn tại → INSERT
    const { data: inserted } = await supabase
        .from('profiles')
        .insert({ id: userId, nickname: clean })
        .select('*')
        .single();
    return inserted as Profile | null;
}
