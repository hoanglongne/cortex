'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import { Home, Inbox, LogOut, Send, Settings2, Sparkles } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { api, ApiError, cached, clearCache, errorText } from '../lib/api';

export interface Section {
    href: string;
    label: string;
    icon: typeof Inbox;
    /** Pages that belong to this section; the first is the section's landing page. */
    tabs: { href: string; label: string; count?: 'pending' | 'unpublished' }[];
}

/** Menu badges: how many to review, how many to publish. */
function summarize(o?: { pending: Record<string, number>; unpublished: Record<string, number> }): Record<string, number> {
    if (!o) return {};
    const sum = (r: Record<string, number>) => Object.values(r).reduce((n, v) => n + v, 0);
    return { pending: sum(o.pending), unpublished: o.unpublished.quotes + o.unpublished.passages + o.unpublished.talk };
}

export const SECTIONS: Section[] = [
    { href: '/', label: 'Hôm nay', icon: Home, tabs: [{ href: '/', label: 'Hôm nay' }] },
    { href: '/review', label: 'Duyệt', icon: Inbox, tabs: [{ href: '/review', label: 'Duyệt', count: 'pending' }] },
    { href: '/create', label: 'Tạo', icon: Sparkles, tabs: [{ href: '/create', label: 'Tạo' }] },
    { href: '/publish', label: 'Xuất bản', icon: Send, tabs: [{ href: '/publish', label: 'Xuất bản', count: 'unpublished' }] },
    {
        href: '/cards',
        label: 'Quản lý',
        icon: Settings2,
        tabs: [
            { href: '/cards', label: 'Thẻ' },
            { href: '/health', label: 'Sức khoẻ thẻ' },
            { href: '/feedback', label: 'Góp ý' },
            { href: '/radar', label: 'Radar' },
            { href: '/trends', label: 'Trend' },
            { href: '/variants', label: 'Câu mẫu' },
            { href: '/quotes', label: 'Ngoài đời' },
            { href: '/passages', label: 'Đọc' },
            { href: '/talk', label: 'Giao tiếp' },
            { href: '/drops', label: 'Drop' },
            { href: '/system', label: 'Hệ thống' },
        ],
    },
];

const isActive = (href: string, pathname: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

type Access = 'checking' | 'editor' | 'denied' | 'error';

export default function Shell({ children }: { children: React.ReactNode }) {
    const supabase = getSupabase();
    const pathname = usePathname();
    const [session, setSession] = useState<Session | null | undefined>(undefined);
    const [access, setAccess] = useState<Access>('checking');
    const [accessError, setAccessError] = useState('');
    const [counts, setCounts] = useState<Record<string, number>>(() => summarize(cached<{ pending: Record<string, number>; unpublished: Record<string, number> }>('/overview')));

    useEffect(() => {
        if (!supabase) return;
        supabase.auth.getSession().then(({ data }) => setSession(data.session));
        const { data } = supabase.auth.onAuthStateChange((_e, s) => {
            if (!s) clearCache();
            setSession(s);
        });
        return () => data.subscription.unsubscribe();
    }, [supabase]);

    const userId = session?.user.id;
    useEffect(() => {
        if (!userId) return;
        let cancelled = false;
        // An editor confirmed on this device opens at once; /me re-checks in the background.
        const key = `studio-editor:${userId}`;
        try {
            if (localStorage.getItem(key) === '1') setAccess('editor');
        } catch {
            // Storage blocked: fall back to waiting for /me.
        }
        api('/me')
            .then(() => {
                if (cancelled) return;
                setAccess('editor');
                try {
                    localStorage.setItem(key, '1');
                } catch {
                    // Ignore.
                }
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                try {
                    localStorage.removeItem(key);
                } catch {
                    // Ignore.
                }
                setAccess(err instanceof ApiError && err.status === 403 ? 'denied' : 'error');
                setAccessError(errorText(err));
            });
        return () => {
            cancelled = true;
        };
    }, [userId]);

    useEffect(() => {
        if (access !== 'editor') return;
        // Refresh the badges whenever the page changes (a review may have emptied a list).
        api<{ pending: Record<string, number>; unpublished: Record<string, number> }>('/overview')
            .then(o => setCounts(summarize(o)))
            .catch(() => undefined);
    }, [access, pathname]);

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
                        {SECTIONS.map(({ href, label, icon: Icon, tabs }) => {
                            const active = tabs.some(t => isActive(t.href, pathname));
                            const badge = tabs.reduce((n, t) => n + (t.count ? (counts[t.count] ?? 0) : 0), 0);
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
                                    {badge > 0 && <span className="font-mono text-[11px] px-1.5 rounded-full bg-accent text-on-accent">{badge}</span>}
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
            <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6">
                <SubTabs pathname={pathname} counts={counts} />
                {children}
            </main>
        </div>
    );
}

function SubTabs({ pathname, counts }: { pathname: string; counts: Record<string, number> }) {
    const section = SECTIONS.find(sec => sec.tabs.some(t => isActive(t.href, pathname)));
    if (!section || section.tabs.length < 2) return null;
    return (
        <div className="flex gap-1.5 overflow-x-auto mb-5">
            {section.tabs.map(t => {
                const n = t.count ? (counts[t.count] ?? 0) : 0;
                const active = isActive(t.href, pathname);
                return (
                    <Link
                        key={t.href}
                        href={t.href}
                        className={`flex items-center gap-1.5 px-3 h-8 rounded-full text-sm whitespace-nowrap border transition-colors ${
                            active ? 'bg-ink text-bg border-ink' : 'border-line text-muted hover:text-ink hover:bg-surface-2'
                        }`}
                    >
                        {t.label}
                        {n > 0 && <span className="font-mono text-[11px] opacity-70">{n}</span>}
                    </Link>
                );
            })}
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

/** Supabase error messages, in Vietnamese where the cause is known. */
function authMessage(message: string): string {
    const m = message.toLowerCase();
    if (m.includes('rate limit')) {
        return 'Supabase đã chạm giới hạn gửi email (email mặc định của Supabase chỉ gửi được vài thư mỗi giờ cho cả project). Đăng nhập bằng mật khẩu, hoặc đợi khoảng 1 giờ.';
    }
    if (m.includes('invalid login credentials')) return 'Sai email hoặc mật khẩu.';
    if (m.includes('expired') || m.includes('invalid')) return 'Link đăng nhập đã hết hạn hoặc đã được dùng. Mỗi link chỉ dùng được một lần.';
    return message;
}

/** Reads an auth error Supabase left in the URL after a magic-link redirect (pure: no URL changes). */
function readRedirectError(): string {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    const hash = new URLSearchParams(url.hash.replace(/^#/, ''));
    const description = url.searchParams.get('error_description') ?? hash.get('error_description');
    // A ?code= still present after load means this browser could not exchange it
    // (link opened in another browser, or already used).
    const leftoverCode = url.searchParams.get('code');
    if (!description && !leftoverCode) return '';
    if (description) return authMessage(description.replace(/\+/g, ' '));
    return 'Link đăng nhập không dùng được trên trình duyệt này (cần mở trên đúng trình duyệt đã bấm gửi link) hoặc đã được dùng rồi.';
}

function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [state, setState] = useState<'idle' | 'busy' | 'sent'>('idle');
    const [error, setError] = useState(readRedirectError);

    // Drop the spent ?code= / error params so a reload doesn't show the error again.
    useEffect(() => {
        if (window.location.search || window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
        }
    }, []);

    const signInWithPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = getSupabase();
        if (!supabase) return;
        setState('busy');
        setError('');
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
        if (error) setError(authMessage(error.message));
        setState('idle');
    };

    const sendLink = async () => {
        const supabase = getSupabase();
        if (!supabase || !email.trim()) {
            setError('Nhập email trước.');
            return;
        }
        setState('busy');
        setError('');
        const { error } = await supabase.auth.signInWithOtp({
            email: email.trim().toLowerCase(),
            options: { emailRedirectTo: window.location.origin, shouldCreateUser: false },
        });
        if (error) {
            setError(authMessage(error.message));
            setState('idle');
        } else {
            setState('sent');
        }
    };

    const field =
        'h-12 rounded-xl bg-surface-2 border border-line-strong px-3.5 text-ink placeholder-subtle focus:border-accent outline-none';

    return (
        <Centered title="Lexica Studio">
            {state === 'sent' ? (
                <p>
                    Đã gửi link đăng nhập tới {email}. Mở link trên <b>chính trình duyệt này</b> (link chỉ dùng được một lần, ở nơi đã yêu cầu).
                </p>
            ) : (
                <form onSubmit={signInWithPassword} className="flex flex-col gap-3">
                    <label className="flex flex-col gap-1.5">
                        <span className="font-mono text-[11px] uppercase text-subtle">Email editor</span>
                        <input type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} className={field} placeholder="email@example.com" />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <span className="font-mono text-[11px] uppercase text-subtle">Mật khẩu</span>
                        <input type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className={field} />
                    </label>
                    {error && <p className="text-danger">{error}</p>}
                    <button
                        disabled={state === 'busy'}
                        className="h-12 rounded-xl bg-accent text-on-accent font-bold hover:bg-accent-strong disabled:opacity-40"
                    >
                        {state === 'busy' ? 'Đang đăng nhập…' : 'Đăng nhập'}
                    </button>
                    <button
                        type="button"
                        onClick={() => void sendLink()}
                        disabled={state === 'busy'}
                        className="text-sm text-muted hover:text-ink disabled:opacity-40"
                    >
                        Chưa có mật khẩu? Gửi link đăng nhập qua email
                    </button>
                </form>
            )}
        </Centered>
    );
}
