'use client';

import { useState } from 'react';
import { Loader2, LogIn, Mail } from 'lucide-react';
import { signInWithEmail, signInWithPassword } from '../lib/auth';

interface AuthGateProps {
    /** Text mô tả tại sao cần đăng nhập */
    reason?: string;
    /** Callback khi đã gửi link (cách cũ) */
    onSent?: () => void;
    /** Trang quay lại sau khi bấm link trong email */
    redirectPath?: string;
}

/**
 * Email + password: one form signs in or creates the account. The email link
 * stays as a fallback for accounts made before passwords existed.
 */
export default function AuthGate({ reason, onSent, redirectPath = '/buddy' }: AuthGateProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    /** Set once sign-in failed: making a new account, the password is typed again. */
    const [repeat, setRepeat] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    const submit = async () => {
        if (!email.includes('@') || password.length < 6 || busy) return;
        setBusy(true);
        setError('');
        const r = await signInWithPassword(email, password, repeat ?? undefined);
        setBusy(false);
        if (r.ok) return; // AuthProvider picks up the session
        if ('isNew' in r) setRepeat('');
        else if ('confirm' in r) setNotice(`Đã tạo tài khoản. Mở email ${email} để xác nhận một lần, rồi đăng nhập lại ở đây.`);
        else setError(r.error);
    };

    const sendLink = async () => {
        if (!email.includes('@')) return setError('Nhập email trước đã.');
        setBusy(true);
        const { error: e } = await signInWithEmail(email, `${window.location.origin}${redirectPath}`);
        setBusy(false);
        if (e) setError(e);
        else {
            setNotice(`Đã gửi link đăng nhập tới ${email}.`);
            onSent?.();
        }
    };

    const input = 'w-full px-4 py-3 bg-surface-2 border border-line-strong rounded-xl text-ink placeholder-muted text-sm focus:outline-none focus:border-accent transition-colors';
    return (
        <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
                e.preventDefault();
                void submit();
            }}
        >
            <div className="flex flex-col items-center gap-2 text-center">
                <LogIn className="w-8 h-8 text-accent" />
                <h3 className="text-base font-bold text-ink">Đăng nhập</h3>
                <p className="text-muted text-sm">{reason ?? 'Lưu tiến độ và kết nối với bạn bè.'} Chưa có tài khoản thì nhập email và mật khẩu mới, app tạo luôn.</p>
            </div>
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" aria-label="Email" className={input} />
            <input type="password" autoComplete={repeat === null ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu (ít nhất 6 ký tự)" aria-label="Mật khẩu" className={input} />
            {repeat !== null && (
                <>
                    <p className="text-sm text-ink-2">Chưa có tài khoản với email và mật khẩu này. Tạo tài khoản mới thì nhập lại mật khẩu. Đã có tài khoản thì kiểm tra lại mật khẩu.</p>
                    <input type="password" autoComplete="new-password" autoFocus value={repeat} onChange={(e) => setRepeat(e.target.value)} placeholder="Nhập lại mật khẩu" aria-label="Nhập lại mật khẩu" className={input} />
                    <p className="text-xs text-muted">
                        Tạo tài khoản là bạn đồng ý với{' '}
                        <a href="/terms" target="_blank" className="underline">Điều khoản</a> và{' '}
                        <a href="/privacy" target="_blank" className="underline">Chính sách riêng tư</a>.
                    </p>
                </>
            )}
            <button type="submit" disabled={busy || !email.includes('@') || password.length < 6 || (repeat !== null && repeat.length < 6)} className="py-3 bg-accent hover:bg-accent-strong disabled:opacity-40 text-on-accent font-bold rounded-xl flex items-center justify-center gap-2">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null} {repeat === null ? 'Tiếp tục' : 'Tạo tài khoản'}
            </button>
            {error && <p className="text-danger text-xs text-center">{error}</p>}
            {notice && <p className="text-accent text-xs text-center">{notice}</p>}
            <button type="button" onClick={() => void sendLink()} className="text-muted text-xs hover:text-ink flex items-center justify-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Tài khoản cũ chưa có mật khẩu? Nhận link đăng nhập
            </button>
        </form>
    );
}
