'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Dumbbell, Gamepad2, Home, LayoutGrid, RotateCcw, UserRound, Users } from 'lucide-react';

type TabId = 'home' | 'practice' | 'words' | 'album' | 'me';

const TABS: { id: TabId; href: string; label: string; icon: React.ReactNode }[] = [
    { id: 'home', href: '/', label: 'Hôm nay', icon: <Home className="w-6 h-6" /> },
    { id: 'practice', href: '/practice', label: 'Luyện', icon: <Dumbbell className="w-6 h-6" /> },
    { id: 'words', href: '/learned', label: 'Từ của tôi', icon: <BookOpen className="w-6 h-6" /> },
    { id: 'album', href: '/album', label: 'Album', icon: <LayoutGrid className="w-6 h-6" /> },
    { id: 'me', href: '/me', label: 'Tôi', icon: <UserRound className="w-6 h-6" /> },
];

/**
 * Which tab a page belongs to; null hides the bar. Sessions, tests and
 * set-up flows keep the whole screen (they have their own way out).
 */
export function tabOf(path: string): TabId | null {
    if (path === '/') return 'home';
    if (['/practice', '/play', '/read', '/journal', '/spot', '/speak'].includes(path)) return 'practice';
    if (path === '/learned') return 'words';
    if (path === '/album') return 'album';
    if (['/me', '/stats', '/settings', '/path', '/class', '/buddy', '/guide', '/feedback', '/privacy', '/terms', '/score'].includes(path)) return 'me';
    return null;
}

/** The desktop's links: the phone's five tabs plus the places they lead to. */
const DESK: { href: string; label: string; icon: React.ReactNode; tab: TabId }[] = [
    { href: '/', label: 'Hôm nay', icon: <Home className="w-4 h-4" />, tab: 'home' },
    { href: '/review', label: 'Ôn tập', icon: <RotateCcw className="w-4 h-4" />, tab: 'home' },
    { href: '/practice', label: 'Luyện', icon: <Dumbbell className="w-4 h-4" />, tab: 'practice' },
    { href: '/play', label: 'Chơi', icon: <Gamepad2 className="w-4 h-4" />, tab: 'practice' },
    { href: '/learned', label: 'Từ của tôi', icon: <BookOpen className="w-4 h-4" />, tab: 'words' },
    { href: '/album', label: 'Album', icon: <LayoutGrid className="w-4 h-4" />, tab: 'album' },
    { href: '/buddy', label: 'Buddy', icon: <Users className="w-4 h-4" />, tab: 'me' },
    { href: '/me', label: 'Tôi', icon: <UserRound className="w-4 h-4" />, tab: 'me' },
];

/** Which desktop link is current: the exact page, else the first link of its tab. */
export function deskActive(path: string): string | null {
    const exact = DESK.find((d) => d.href === path || (d.href !== '/' && path.startsWith(`${d.href}/`)));
    if (exact) return exact.href;
    const tab = tabOf(path);
    return tab ? (DESK.find((d) => d.tab === tab)?.href ?? null) : null;
}

/**
 * The desktop's top bar on every main page except Home (which has its own
 * header): the way to Home and to every other place. Games and duels count as
 * main pages here, though the phone keeps them full screen.
 */
export function DesktopNav() {
    const path = usePathname();
    if (path === '/') return null;
    const active = deskActive(path);
    const known = tabOf(path) !== null || path.startsWith('/play/') || path.startsWith('/buddy/');
    if (!known) return null;
    return (
        <header className="hidden lg:block sticky top-0 z-30 shrink-0 border-b border-line bg-bg/95 backdrop-blur-md">
            <div className="max-w-6xl xl:max-w-7xl mx-auto px-8 h-14 flex items-center gap-3">
                <Link href="/" className="text-xl font-bold text-ink tracking-tight mr-4">
                    LEXICA
                </Link>
                <nav className="ml-auto flex items-center gap-1" aria-label="Điều hướng">
                    {DESK.map((d) => (
                        <Link
                            key={d.href}
                            href={d.href}
                            aria-current={active === d.href ? 'page' : undefined}
                            className={`h-9 px-3 rounded-lg text-sm flex items-center gap-2 ${active === d.href ? 'bg-surface text-accent' : 'text-muted hover:text-ink hover:bg-surface'}`}
                        >
                            {d.icon}
                            {d.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
}

/** The phone's bottom bar, on every main page (desktop has the header on Home). */
export default function AppNav() {
    const path = usePathname();
    const active = tabOf(path);
    if (!active) return null;
    return (
        <>
            {/* Room at the end of every page, so the bar never covers the last row */}
            <div aria-hidden className="lg:hidden h-20 shrink-0" />
            <nav aria-label="Điều hướng" className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-bg/95 backdrop-blur-md border-t border-line pb-[env(safe-area-inset-bottom)]">
                <div className="grid grid-cols-5 max-w-md mx-auto">
                    {TABS.map((t) => (
                        <Link
                            key={t.id}
                            href={t.href}
                            aria-current={active === t.id ? 'page' : undefined}
                            className={`flex flex-col items-center justify-center gap-1 h-16 active:scale-95 transition ${active === t.id ? 'text-accent' : 'text-muted hover:text-ink'}`}
                        >
                            {t.icon}
                            <span className="text-[11px] font-medium">{t.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>
        </>
    );
}
