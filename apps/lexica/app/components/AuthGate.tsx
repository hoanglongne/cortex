'use client';

import { useState } from 'react';
import { Mail, Loader2, CheckCircle, LogIn } from 'lucide-react';
import { signInWithEmail } from '../lib/auth';

interface AuthGateProps {
    /** Text mô tả tại sao cần đăng nhập */
    reason?: string;
    /** Callback khi user đã đăng nhập (auth state change xử lý tự động qua AuthProvider) */
    onSent?: () => void;
    /** Trang quay lại sau khi bấm link trong email */
    redirectPath?: string;
}

export default function AuthGate({ reason, onSent, redirectPath = '/buddy' }: AuthGateProps) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async () => {
        if (!email.trim() || status === 'sending') return;
        setStatus('sending');
        const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}${redirectPath}` : '';
        const { error } = await signInWithEmail(email, redirectTo);
        if (error) {
            setErrorMsg(error);
            setStatus('error');
        } else {
            setStatus('sent');
            onSent?.();
        }
    };

    if (status === 'sent') {
        return (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
                <CheckCircle className="w-12 h-12 text-accent" />
                <h3 className="text-lg font-bold text-ink">Kiểm tra email của bạn!</h3>
                <p className="text-muted text-sm max-w-xs">
                    Chúng tôi đã gửi link đăng nhập tới <span className="text-accent">{email}</span>.
                    Click vào link để tiếp tục.
                </p>
                <p className="text-muted text-xs">Không tìm thấy? Kiểm tra thư mục spam.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-2 text-center">
                <LogIn className="w-8 h-8 text-accent" />
                <h3 className="text-base font-bold text-ink">Lưu tài khoản</h3>
                <p className="text-muted text-sm">
                    {reason ?? 'Nhập email để lưu tiến độ và kết nối với bạn bè. Không cần mật khẩu.'}
                </p>
            </div>

            <div className="flex gap-2">
                <input
                    type="email"
                    autoFocus
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder="email@example.com"
                    className="flex-1 px-4 py-3 bg-surface-2 border border-line-strong rounded-xl text-ink placeholder-muted text-sm focus:outline-none focus:border-accent transition-colors"
                />
                <button
                    onClick={handleSubmit}
                    disabled={!email.trim() || status === 'sending'}
                    className="px-4 py-3 bg-accent hover:bg-accent-strong disabled:opacity-40 text-on-accent rounded-xl transition-all flex items-center gap-2"
                >
                    {status === 'sending'
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Mail className="w-4 h-4" />}
                </button>
            </div>

            {status === 'error' && (
                <p className="text-danger text-xs text-center">{errorMsg}</p>
            )}

            <p className="text-muted text-xs text-center">
                Chỉ dùng để xác thực. Không spam, không mật khẩu.
            </p>
        </div>
    );
}
