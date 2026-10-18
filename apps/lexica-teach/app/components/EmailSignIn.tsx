'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { Button, ErrorNote, inputClass } from './ui';

/** Magic link, same account as Lexica: no password. Comes back to `back` on this site. */
export default function EmailSignIn({ back }: { back: string }) {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const send = async () => {
        const supabase = getSupabase();
        if (!supabase) return setError('Chưa cấu hình Supabase.');
        setBusy(true);
        setError('');
        const { error: e } = await supabase.auth.signInWithOtp({
            email: email.trim().toLowerCase(),
            options: { emailRedirectTo: `${window.location.origin}${back}` },
        });
        setBusy(false);
        if (e) setError(e.message);
        else setSent(true);
    };

    if (sent) {
        return (
            <p className="rounded-xl bg-accent-soft px-4 py-3 text-sm text-accent-strong">
                Đã gửi link đăng nhập tới <b>{email}</b>. Mở email trên máy này và bấm vào link nhé.
            </p>
        );
    }
    return (
        <form
            className="space-y-3"
            onSubmit={(e) => {
                e.preventDefault();
                void send();
            }}
        >
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email bạn dùng với Lexica" aria-label="Email" className={inputClass} />
            <Button type="submit" disabled={busy || !email.includes('@')} className="w-full">
                <Mail className="h-4 w-4" /> {busy ? 'Đang gửi…' : 'Gửi link đăng nhập'}
            </Button>
            <ErrorNote error={error} />
        </form>
    );
}
