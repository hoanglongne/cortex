'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Flame, Ghost, LayoutGrid, Sparkles, Users } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { useEconomy } from '../lib/engagement/economy';
import { getRival } from '../lib/engagement/ghost';
import { buildSets, setProgress } from '../lib/engagement/collection';
import { getAllCards, getCurrentDrop, useContentVersion } from '../lib/content/repository';

/**
 * The game layer on Home (docs/LEXICA_DIRECTION.md, "Bố cục"): streak,
 * wallet, the next Album set and yesterday's run, kept but behind learning.
 * A compact strip at the end of the phone screen, a narrow column on desktop.
 */
export default function Motivation({ variant }: { variant: 'strip' | 'column' }) {
    const version = useContentVersion();
    const streak = useLexicaStore((s) => s.currentStreak);
    const cardProgress = useLexicaStore((s) => s.cardProgress);
    const wallet = useEconomy((s) => s.state?.wallet ?? null);
    const [rival] = useState(() => (typeof window === 'undefined' ? null : getRival()));
    const nextSet = useMemo(() => {
        void version;
        const drop = getCurrentDrop();
        let best: { label: string; owned: number; total: number } | null = null;
        for (const set of buildSets(getAllCards(), drop ? { [drop.id]: drop.title } : {})) {
            const p = setProgress(set, cardProgress);
            if (p.complete) continue;
            if (!best || p.total - p.owned < best.total - best.owned) best = { label: set.label, owned: p.owned, total: p.total };
        }
        return best;
    }, [version, cardProgress]);

    if (variant === 'strip') {
        return (
            <section data-testid="motivation-strip" aria-label="Động lực" className="w-full rounded-2xl bg-surface-2/40 border border-line/60 px-4 py-3 flex items-center gap-4 overflow-x-auto text-xs text-muted">
                <span className="flex items-center gap-1 shrink-0">
                    <Flame className={`w-3.5 h-3.5 ${streak > 0 ? 'text-warning' : 'text-subtle'}`} /> {streak} ngày
                </span>
                {wallet && (
                    <span className="flex items-center gap-1 shrink-0">
                        <Sparkles className="w-3.5 h-3.5" /> {wallet.dust} Bụi
                    </span>
                )}
                {nextSet && (
                    <Link href="/album" className="flex items-center gap-1 shrink-0 hover:text-ink">
                        <LayoutGrid className="w-3.5 h-3.5" /> Album {nextSet.owned}/{nextSet.total}
                    </Link>
                )}
                {rival && (
                    <span className="flex items-center gap-1 shrink-0">
                        <Ghost className="w-3.5 h-3.5" /> {rival.short}: {rival.run.score}đ
                    </span>
                )}
                <Link href="/buddy" className="flex items-center gap-1 shrink-0 hover:text-ink">
                    <Users className="w-3.5 h-3.5" /> Buddy
                </Link>
            </section>
        );
    }

    return (
        <aside data-testid="motivation-column" aria-label="Động lực" className="hidden lg:flex flex-col gap-3 rounded-2xl bg-surface-2/40 border border-line/60 p-4 text-sm text-muted self-start">
            <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">Động lực</p>
            <p className="flex items-center gap-2">
                <Flame className={`w-4 h-4 ${streak > 0 ? 'text-warning' : 'text-subtle'}`} /> Chuỗi {streak} ngày
            </p>
            {wallet && (
                <Link href="/album" className="flex items-center gap-2 hover:text-ink">
                    <Sparkles className="w-4 h-4" /> {wallet.dust} Bụi · {wallet.boxes} Hộp
                </Link>
            )}
            {nextSet && (
                <Link href="/album" className="block hover:text-ink">
                    <span className="flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4" /> Album: bộ {nextSet.label}
                    </span>
                    <span className="mt-1.5 block h-1 rounded-full bg-surface-3 overflow-hidden">
                        <span className="block h-full bg-ink-2/60 rounded-full" style={{ width: `${Math.round((nextSet.owned / nextSet.total) * 100)}%` }} />
                    </span>
                    <span className="mt-1 block text-xs">{nextSet.owned}/{nextSet.total} thẻ</span>
                </Link>
            )}
            {rival && (
                <p className="flex items-center gap-2">
                    <Ghost className="w-4 h-4" /> Bạn {rival.label}: {rival.run.score} điểm ôn
                </p>
            )}
            <Link href="/buddy" className="flex items-center gap-2 hover:text-ink">
                <Users className="w-4 h-4" /> Học cùng bạn (Buddy)
            </Link>
        </aside>
    );
}
