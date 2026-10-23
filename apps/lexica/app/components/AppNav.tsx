'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Dumbbell, Home, LayoutGrid, UserRound } from 'lucide-react';

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
    if (['/practice', '/read', '/journal', '/spot', '/speak'].includes(path)) return 'practice';
    if (path === '/learned') return 'words';
    if (path === '/album') return 'album';
    if (['/me', '/stats', '/settings', '/path', '/class', '/buddy', '/guide', '/feedback', '/privacy', '/terms'].includes(path)) return 'me';
    return null;
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
