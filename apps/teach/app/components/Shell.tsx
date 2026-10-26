'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BarChart3, Building2, CalendarCheck, GraduationCap, KeyRound, LogOut, ShieldCheck, Users } from 'lucide-react';
import { hasAccess, useSession } from '../lib/session';
import { setPassword } from '../lib/auth';
import ThemeToggle from './ThemeToggle';

/**
 * Every signed-in page: a fixed sidebar of five places (Hôm nay first), a top
 * bar on phones, and the gate: no session → sign in; no role → "contact us".
 */
export default function Shell({ children }: { children: React.ReactNode }) {
    const { loading, session, me, signOut } = useSession();
    const router = useRouter();
    const path = usePathname();

    useEffect(() => {
        if (!loading && !session) router.replace(`/login?next=${encodeURIComponent(path)}`);
    }, [loading, session, router, path]);

    if (loading || !session) return <div className="min-h-screen bg-bg" />;
    if (!hasAccess(me)) return <NoAccess email={me?.email ?? session.user.email ?? ''} onSignOut={() => void signOut()} />;

    const orgAdmin = me!.orgs.some((o) => o.role === 'admin') || me!.admin;
    const nav = [
        { href: '/', label: 'Hôm nay', icon: CalendarCheck },
        { href: '/classes', label: 'Lớp của tôi', icon: GraduationCap },
        { href: '/students', label: 'Học viên', icon: Users },
        { href: '/reports', label: 'Báo cáo', icon: BarChart3 },
        ...(orgAdmin && me!.orgs.length > 0 ? [{ href: '/center', label: 'Trung tâm', icon: Building2 }] : []),
        ...(me!.admin ? [{ href: '/admin', label: 'Quản trị', icon: ShieldCheck }] : []),
    ];
    const active = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));

    return (
        <div className="min-h-screen bg-bg lg:flex">
            <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:flex lg:flex-col">
                <Link href="/" className="px-8 pb-8 pt-10">
                    <p className="font-serif text-xl font-semibold text-ink">Cortex cho lớp</p>
                    <p className="mt-0.5 text-[13px] text-muted">{me!.orgs[0]?.name ?? (me!.admin ? 'Quản trị Lexica' : 'Giáo viên độc lập')}</p>
                </Link>
                <nav className="flex-1 space-y-1.5 px-5" aria-label="Điều hướng">
                    {nav.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`flex h-11 items-center gap-3 rounded-[10px] px-3.5 text-[15px] transition-colors ${active(href) ? 'bg-surface font-semibold text-ink shadow-[var(--shadow-card)]' : 'text-ink-2 hover:bg-surface/60'}`}
                        >
                            <Icon className={`h-[18px] w-[18px] ${active(href) ? 'text-accent' : 'text-muted'}`} /> {label}
                        </Link>
                    ))}
                </nav>
                <div className="space-y-1 px-8 py-8">
                    <p className="truncate text-xs text-muted" title={me!.email ?? ''}>
                        {me!.email}
                    </p>
                    <button onClick={() => void signOut()} className="mt-1 flex items-center gap-1.5 text-sm text-muted hover:text-ink">
                        <LogOut className="h-4 w-4" /> Đăng xuất
                    </button>
                    <SetPassword />
                    <ThemeToggle />
                </div>
            </aside>
            <div className="sticky top-0 z-30 flex gap-1.5 overflow-x-auto bg-bg/95 px-4 py-3 backdrop-blur lg:hidden">
                {nav.map(({ href, label }) => (
                    <Link key={href} href={href} className={`flex h-10 shrink-0 items-center whitespace-nowrap rounded-[10px] px-3.5 text-[15px] ${active(href) ? 'bg-surface font-semibold text-ink shadow-[var(--shadow-card)]' : 'text-ink-2'}`}>
                        {label}
                    </Link>
                ))}
            </div>
            <main className="min-w-0 flex-1 px-5 pb-16 pt-6 sm:px-10 lg:px-14 lg:pt-12">
                <div className="mx-auto max-w-6xl">{children}</div>
            </main>
        </div>
    );
}

function NoAccess({ email, onSignOut }: { email: string; onSignOut: () => void }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-bg px-4">
            <div className="max-w-md rounded-[var(--radius-card)] bg-surface p-8 text-center shadow-[var(--shadow-card)]">
                <p className="font-serif text-2xl font-semibold text-ink">Trang này dành cho giáo viên và trung tâm</p>
                <p className="mt-2 text-sm text-muted">
                    Tài khoản <b className="text-ink-2">{email}</b> chưa có lời mời. Nếu trung tâm của bạn dùng Lexica, nhờ quản lý gửi link mời; nếu muốn đưa Lexica vào lớp của mình, hãy liên hệ đội Lexica.
                </p>
                <button onClick={onSignOut} className="mt-5 text-sm text-accent hover:underline">
                    Đăng nhập bằng tài khoản khác
                </button>
            </div>
        </div>
    );
}

/** For accounts made with an email link: set a password once. */
function SetPassword() {
    const [open, setOpen] = useState(false);
    const [pw, setPw] = useState('');
    const [again, setAgain] = useState('');
    const [msg, setMsg] = useState('');
    if (!open) {
        return (
            <button onClick={() => setOpen(true)} className="mt-1 flex items-center gap-1.5 text-sm text-muted hover:text-ink">
                <KeyRound className="h-4 w-4" /> Đặt mật khẩu
            </button>
        );
    }
    return (
        <form
            className="mt-2 space-y-1.5"
            onSubmit={async (e) => {
                e.preventDefault();
                if (again !== pw) return setMsg('Hai mật khẩu chưa khớp.');
                const error = await setPassword(pw);
                setMsg(error ?? 'Đã lưu mật khẩu.');
                if (!error) {
                    setPw('');
                    setAgain('');
                }
            }}
        >
            <input type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Mật khẩu mới" aria-label="Mật khẩu mới" className="w-full rounded-lg border border-line-strong bg-surface px-2 py-1.5 text-sm" />
            <input type="password" autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} placeholder="Nhập lại mật khẩu" aria-label="Nhập lại mật khẩu mới" className="w-full rounded-lg border border-line-strong bg-surface px-2 py-1.5 text-sm" />
            <button type="submit" disabled={pw.length < 6 || again.length < 6} className="text-sm font-medium text-accent disabled:opacity-40">
                Lưu mật khẩu
            </button>
            {msg && <p className="text-xs text-muted">{msg}</p>}
        </form>
    );
}
