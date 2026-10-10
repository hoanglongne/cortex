'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import { Inbox, LogOut, Flame, Layers, Package, Activity } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { api, ApiError, errorText } from '../lib/api';

const NAV = [
    { href: '/', label: 'Duyệt', icon: Inbox },
    { href: '/trends', label: 'Trend', icon: Flame },
    { href: '/cards', label: 'Thẻ', icon: Layers },
    { href: '/drops', label: 'Drop', icon: Package },
    { href: '/system', label: 'Hệ thống', icon: Activity },
];

type Access = 'checking' | 'editor' | 'denied' | 'error';

export default function Shell({ children }: { children: React.ReactNode }) {
    const supabase = getSupabase();
    const pathname = usePathname();
    const [session, setSession] = useState<Session | null | undefined>(undefined);
    const [access, setAccess] = useState<Access>('checking');
    const [accessError, setAccessError] = useState('');

    useEffect(() => {
        if (!supabase) return;
        supabase.auth.getSession().then(({ data }) => setSession(data.session));
        const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
        return () => data.subscription.unsubscribe();
    }, [supabase]);

    const userId = session?.user.id;
    useEffect(() => {
        if (!userId) return;
        let cancelled = false;
        api('/me')
            .then(() => !cancelled && setAccess('editor'))
            .catch((err: unknown) => {
                if (cancelled) return;
                setAccess(err instanceof ApiError && err.status === 403 ? 'denied' : 'error');
                setAccessError(errorText(err));
            });
        return () => {
            cancelled = true;
        };
    }, [userId]);

    if (!supabase) {
        return <Centered title="Thiếu cấu hình">Đặt NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY (xem .env.example).</Centered>;
    }
    if (session === undefined) return <Centered title="Lexica Studio">Đang tải…</Centered>;
    if (!session) return <SignIn />;
    if (access === 'checking') return <Centered title="Lexica Studio">Đang kiểm tra quyền…</Centered>;
    if (access !== 'editor') {
        return (
            <Centered title={access === 'denied' ? 'Chưa có quyền biên tập' : 'Không kết nối được API'}>
                {access === 'denied' ? (
                    <>
                        <p>Tài khoản {session.user.email} chưa nằm trong danh sách editor. Chạy trong Supabase SQL Editor:</p>
                        <pre className="mt-3 p-3 rounded-xl bg-surface-2 font-mono text-xs text-ink-2 whitespace-pre-wrap">
                            {`insert into studio_editors (user_id)\nselect id from auth.users where email = '${session.user.email}';`}
                        </pre>
                    </>
                ) : (
                    <p>{accessError}</p>
                )}
                <button onClick={() => supabase.auth.signOut()} className="mt-4 text-sm text-muted hover:text-ink">
                    Đăng xuất
                </button>
            </Centered>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-20 border-b border-line bg-bg/95 backdrop-blur-sm">
                <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-1">
                    <span className="font-bold mr-4">
                        Lexica <span className="text-accent">Studio</span>
                    </span>
                    <nav className="flex gap-1 overflow-x-auto">
                        {NAV.map(({ href, label, icon: Icon }) => {
                            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`flex items-center gap-1.5 px-3 h-9 rounded-xl text-sm font-medium transition-colors ${
                                        active ? 'bg-accent/10 text-accent' : 'text-muted hover:text-ink hover:bg-surface-2'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>
                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="ml-auto w-9 h-9 rounded-xl flex items-center justify-center text-muted hover:text-ink hover:bg-surface-2"
                        aria-label="Đăng xuất"
                        title={session.user.email ?? ''}
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>
            <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6">{children}</main>
        </div>
    );
}

function Centered({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-3xl bg-surface border border-line p-6 text-sm text-ink-2">
                <h1 className="text-xl font-bold text-ink mb-3">{title}</h1>
                {children}
            </div>
        </div>
    );
}

function SignIn() {
    const [email, setEmail] = useState('');
    const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
    const [error, setError] = useState('');

    const send = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = getSupabase();
        if (!supabase) return;
        setState('sending');
        setError('');
        const { error } = await supabase.auth.signInWithOtp({
            email: email.trim().toLowerCase(),
            options: { emailRedirectTo: window.location.origin, shouldCreateUser: false },
        });
        if (error) {
            setError(error.message);
            setState('idle');
        } else {
            setState('sent');
        }
    };

    return (
        <Centered title="Lexica Studio">
            {state === 'sent' ? (
                <p>Đã gửi link đăng nhập tới {email}. Mở email trên máy này để vào Studio.</p>
            ) : (
                <form onSubmit={send} className="flex flex-col gap-3">
                    <label className="flex flex-col gap-1.5">
                        <span className="font-mono text-[11px] uppercase text-subtle">Email editor</span>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="h-12 rounded-xl bg-surface-2 border border-line-strong px-3.5 text-ink placeholder-subtle focus:border-accent outline-none"
                            placeholder="email@example.com"
                        />
                    </label>
                    {error && <p className="text-danger">{error}</p>}
                    <button
                        disabled={state === 'sending'}
                        className="h-12 rounded-xl bg-accent text-on-accent font-bold hover:bg-accent-strong disabled:opacity-40"
                    >
                        {state === 'sending' ? 'Đang gửi…' : 'Gửi link đăng nhập'}
                    </button>
                </form>
            )}
        </Centered>
    );
}
