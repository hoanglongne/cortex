'use client';

import Link from 'next/link';
import { Flame, LayoutGrid, RotateCcw, UserRound, Users } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { levelDef } from '../lib/levels';

/**
 * Desktop header of the home screen: logo, level chip, streak, then the
 * places to go. Mobile keeps its bottom bar.
 */
export default function HomeHeader({ due, onChangeLevel, onOpenMe }: { due: number; onChangeLevel: () => void; onOpenMe: () => void }) {
    const level = useLexicaStore((s) => s.selectedLevel);
    const streak = useLexicaStore((s) => s.currentStreak);
    return (
        <header className="hidden lg:block shrink-0 border-b border-line">
            <div className="max-w-6xl xl:max-w-7xl mx-auto px-8 h-16 flex items-center gap-3">
                <span className="text-2xl font-bold text-ink tracking-tight mr-2">LEXICA</span>
                <button
                    onClick={onChangeLevel}
                    title="Đổi level"
                    className="h-8 px-3 rounded-lg border border-line bg-surface text-xs font-medium text-ink-2 hover:border-line-strong"
                >
                    {level && level !== 'all' ? `${levelDef(level).label} · ${levelDef(level).cefr}` : 'Tất cả level'}
                </button>
                <span className="h-8 px-3 rounded-lg border border-line bg-surface text-xs font-mono text-ink-2 flex items-center gap-1.5" title="Chuỗi ngày học">
                    <Flame className={`w-3.5 h-3.5 ${streak > 0 ? 'text-warning' : 'text-subtle'}`} />
                    {streak} ngày
                </span>
                <nav className="ml-auto flex items-center gap-1" aria-label="Điều hướng">
                    <NavLink href="/review" icon={<RotateCcw className="w-4 h-4" />} label="Ôn tập" badge={due > 0 ? due : undefined} />
                    <NavLink href="/album" icon={<LayoutGrid className="w-4 h-4" />} label="Album" />
                    <NavLink href="/buddy" icon={<Users className="w-4 h-4" />} label="Buddy" />
                    <button onClick={onOpenMe} className="h-9 px-3 rounded-lg text-sm text-muted hover:text-ink hover:bg-surface flex items-center gap-2">
                        <UserRound className="w-4 h-4" /> Tôi
                    </button>
                </nav>
            </div>
        </header>
    );
}

function NavLink({ href, icon, label, badge }: { href: string; icon: React.ReactNode; label: string; badge?: number }) {
    return (
        <Link href={href} className="h-9 px-3 rounded-lg text-sm text-muted hover:text-ink hover:bg-surface flex items-center gap-2" aria-label={badge ? `${label}: ${badge} từ đến hạn` : label}>
            {icon}
            {label}
            {badge !== undefined && <span className="min-w-5 h-5 px-1 rounded-full bg-warning text-bg text-[11px] font-bold leading-5 text-center">{badge > 99 ? '99+' : badge}</span>}
        </Link>
    );
}
