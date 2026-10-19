import { getSupabase } from './supabase';

/**
 * `confirm`: account made, the email has to be confirmed first.
 * `isNew`: no account signed in with that password; the form asks for the
 * password again before making one, so a typo can't become an account's password.
 */
export type PasswordResult = { ok: true } | { ok: false; error: string } | { ok: false; confirm: true } | { ok: false; isNew: true };

const pwError = (m: string) => (m.includes('Password') ? 'Mật khẩu cần ít nhất 6 ký tự.' : m);

/**
 * Email + password, the same account as Lexica: signs in, or creates the
 * account when the email is new. No email is sent when "Confirm email" is
 * off in Supabase Auth.
 */
export async function signInWithPassword(email: string, password: string, repeated?: string): Promise<PasswordResult> {
    const supabase = getSupabase();
    if (!supabase) return { ok: false, error: 'Chưa cấu hình Supabase.' };
    const clean = email.trim().toLowerCase();
    const signIn = await supabase.auth.signInWithPassword({ email: clean, password });
    if (!signIn.error) return { ok: true };
    if (!/invalid login credentials/i.test(signIn.error.message)) return { ok: false, error: signIn.error.message };
    // A new account (or a wrong password): the password is typed twice before an account is made with it.
    if (repeated === undefined) return { ok: false, isNew: true };
    if (repeated !== password) return { ok: false, error: 'Hai mật khẩu chưa khớp.' };
    const signUp = await supabase.auth.signUp({ email: clean, password });
    if (signUp.error) return { ok: false, error: pwError(signUp.error.message) };
    // An existing email comes back with no identities: wrong password (or none set yet).
    if (signUp.data.user && signUp.data.user.identities?.length === 0) {
        return { ok: false, error: 'Sai mật khẩu. Tài khoản cũ chưa có mật khẩu thì dùng "Nhận link đăng nhập" một lần, rồi đặt mật khẩu.' };
    }
    return signUp.data.session ? { ok: true } : { ok: false, confirm: true };
}

export async function setPassword(password: string): Promise<string | null> {
    const supabase = getSupabase();
    if (!supabase) return 'Chưa cấu hình Supabase.';
    const { error } = await supabase.auth.updateUser({ password });
    return error ? pwError(error.message) : null;
}
