'use client';

import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { setPassword } from '../lib/auth';

/** For accounts made with an email link: set a password once, then sign in without email. */
export default function SetPassword() {
    const [open, setOpen] = useState(false);
    const [pw, setPw] = useState('');
    const [again, setAgain] = useState('');
    const [msg, setMsg] = useState('');
    if (!open) {
        return (
            <button onClick={() => setOpen(true)} className="text-xs text-muted hover:text-ink flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" /> Đặt mật khẩu
            </button>
        );
    }
    return (
        <form
            className="flex flex-wrap gap-2"
            onSubmit={async (e) => {
                e.preventDefault();
                if (again !== pw) return setMsg('Hai mật khẩu chưa khớp.');
                const { error } = await setPassword(pw);
                setMsg(error ?? 'Đã đặt mật khẩu. Lần sau đăng nhập bằng email và mật khẩu này.');
                if (!error) {
                    setPw('');
                    setAgain('');
                }
            }}
        >
            <input type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Mật khẩu mới" aria-label="Mật khẩu mới" className="flex-1 px-3 py-2 bg-surface-2 border border-line-strong rounded-lg text-sm text-ink" />
            <input type="password" autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} placeholder="Nhập lại" aria-label="Nhập lại mật khẩu mới" className="flex-1 px-3 py-2 bg-surface-2 border border-line-strong rounded-lg text-sm text-ink" />
            <button type="submit" disabled={pw.length < 6 || again.length < 6} className="px-3 rounded-lg bg-accent text-on-accent text-sm font-bold disabled:opacity-40">
                Lưu
            </button>
            {msg && <p className="basis-full text-xs text-muted">{msg}</p>}
        </form>
    );
}
