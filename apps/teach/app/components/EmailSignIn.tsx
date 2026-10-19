'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { signInWithPassword } from '../lib/auth';
import { Button, ErrorNote, inputClass } from './ui';

/**
 * Email + password, same account as Lexica; a new email makes the account.
 * The email link stays as a fallback for accounts that have no password yet.
 */
export default function EmailSignIn({ back }: { back: string }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    /** Set once sign-in failed: making a new account, the password is typed again. */
    const [repeat, setRepeat] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    const submit = async () => {
        setBusy(true);
        setError('');
        const r = await signInWithPassword(email, password, repeat ?? undefined);
        setBusy(false);
        if (r.ok) return; // the session provider picks it up
        if ('isNew' in r) setRepeat('');
        else if ('confirm' in r) setNotice(`Đã tạo tài khoản. Mở email ${email} để xác nhận một lần, rồi đăng nhập lại.`);
        else setError(r.error);
    };

    const sendLink = async () => {
        const supabase = getSupabase();
        if (!supabase || !email.includes('@')) return setError('Nhập email trước đã.');
        setBusy(true);
        const { error: e } = await supabase.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { emailRedirectTo: `${window.location.origin}${back}` } });
        setBusy(false);
        if (e) setError(e.message);
        else setNotice(`Đã gửi link đăng nhập tới ${email}. Vào được rồi thì đặt mật khẩu ở góc dưới thanh bên.`);
    };

    return (
        <form
            className="space-y-3"
            onSubmit={(e) => {
                e.preventDefault();
                void submit();
            }}
        >
            <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email bạn dùng với Lexica" aria-label="Email" className={inputClass} />
            <input type="password" autoComplete={repeat === null ? 'current-password' : 'new-password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu (ít nhất 6 ký tự)" aria-label="Mật khẩu" className={inputClass} />
            {repeat !== null && (
                <>
                    <p className="text-sm text-ink-2">Chưa có tài khoản với email và mật khẩu này. Tạo tài khoản mới thì nhập lại mật khẩu. Đã có tài khoản thì kiểm tra lại mật khẩu.</p>
                    <input type="password" autoComplete="new-password" autoFocus required value={repeat} onChange={(e) => setRepeat(e.target.value)} placeholder="Nhập lại mật khẩu" aria-label="Nhập lại mật khẩu" className={inputClass} />
                </>
            )}
            <Button type="submit" disabled={busy || !email.includes('@') || password.length < 6 || (repeat !== null && repeat.length < 6)} className="w-full">
                {busy ? 'Đang vào…' : repeat === null ? 'Đăng nhập' : 'Tạo tài khoản'}
            </Button>
            <p className="text-xs text-muted">Chưa có tài khoản? Nhập email và mật khẩu mới, tài khoản được tạo luôn.</p>
            <ErrorNote error={error} />
            {notice && <p className="rounded-xl bg-accent-soft px-3 py-2 text-sm text-accent-strong">{notice}</p>}
            <button type="button" onClick={() => void sendLink()} className="flex items-center gap-1.5 text-left text-xs text-muted hover:text-ink">
                <Mail className="h-3.5 w-3.5" /> Tài khoản cũ chưa có mật khẩu? Nhận link đăng nhập
            </button>
        </form>
    );
}
