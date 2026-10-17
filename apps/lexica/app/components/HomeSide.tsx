'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BookOpen, ChevronRight, LayoutGrid, RotateCcw, Swords, TrendingUp } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { getProgressStats } from '../lib/eloAlgorithm';
import { hardWords } from '../lib/engagement/hard';
import { buildSets, setProgress } from '../lib/engagement/collection';
import { getAllCards, getCurrentDrop, getPassages, useContentVersion } from '../lib/content/repository';
import { readPassages, recommendPassages, unknownIn } from '../lib/engagement/reading';

const DAY_MS = 86_400_000;

/**
 * The desktop side column of the home screen (docs/LEXICA_FEEDBACK_TASKS.md
 * T5): what else is waiting, as quiet cards. The one accent button stays in
 * the "Hôm nay" card.
 */
export default function HomeSide({ onStartDrop }: { onStartDrop: () => void }) {
    const version = useContentVersion();
    const cardProgress = useLexicaStore((s) => s.cardProgress);
    const loadNewDeck = useLexicaStore((s) => s.loadNewDeck);
    const [now] = useState(() => Date.now());
    const level = useLexicaStore((s) => s.selectedLevel);
    const [read] = useState(() => (typeof window === 'undefined' ? new Set<string>() : readPassages()));
    const passage = useMemo(() => {
        void version;
        return recommendPassages(getPassages(), { level, progress: cardProgress, read })[0] ?? null;
    }, [version, level, cardProgress, read]);

    const due = getProgressStats(cardProgress).dueToday;
    const hard = hardWords(cardProgress).length;
    const drop = getCurrentDrop(now);
    const dropKey = drop ? `${drop.id}\n${drop.title}` : '';
    const nextSet = useMemo(() => {
        void version;
        const [id, title] = dropKey.split('\n');
        const sets = buildSets(getAllCards(), id ? { [id]: title } : {});
        let best: { label: string; owned: number; total: number } | null = null;
        for (const set of sets) {
            const p = setProgress(set, cardProgress);
            if (p.complete) continue;
            const missing = p.total - p.owned;
            if (!best || missing < best.total - best.owned) best = { label: set.label, owned: p.owned, total: p.total };
        }
        return best;
    }, [version, cardProgress, dropKey]);

    return (
        <aside className="hidden lg:flex flex-col gap-3" aria-label="Việc khác">
            <SideCard
                href="/review"
                icon={<RotateCcw className="w-4 h-4" />}
                label="Đến hạn ôn"
                title={due > 0 ? `${due} từ đến hạn` : 'Không có từ đến hạn'}
                hint={due > 0 ? 'Ôn bây giờ để nhớ lâu hơn' : 'Từ bạn học hôm nay sẽ quay lại sau'}
                tone={due > 0 ? 'warning' : undefined}
            />
            <SideCard
                href="/review?hard=1"
                icon={<Swords className="w-4 h-4" />}
                label="Từ khó"
                title={hard > 0 ? `${hard} từ hay quên` : 'Chưa có từ khó'}
                hint={hard > 0 ? 'Luyện riêng những từ bạn quên nhiều lần' : 'Từ nào quên 3 lần sẽ hiện ở đây'}
                disabled={hard === 0}
            />
            {passage && (
                <SideCard
                    href={`/read/${passage.id}`}
                    icon={<BookOpen className="w-4 h-4" />}
                    label="Đọc 2 phút"
                    title={passage.title}
                    hint={`${unknownIn(passage, cardProgress).length} từ mới · ${passage.topic}`}
                />
            )}
            {nextSet && (
                <SideCard
                    href="/album"
                    icon={<LayoutGrid className="w-4 h-4" />}
                    label="Album tiếp theo"
                    title={`Còn ${nextSet.total - nextSet.owned} từ đủ bộ ${nextSet.label}`}
                    progress={nextSet.owned / nextSet.total}
                    hint={`${nextSet.owned}/${nextSet.total} thẻ`}
                />
            )}
            {drop && (() => {
                const fresh = drop.cards.filter((c) => !cardProgress[c.id]).length;
                const daysLeft = drop.expiresAt ? Math.max(0, Math.ceil((Date.parse(drop.expiresAt) - now) / DAY_MS)) : null;
                return (
                    <SideCard
                        onClick={() => {
                            if (fresh > 0) loadNewDeck();
                            onStartDrop();
                        }}
                        icon={<TrendingUp className="w-4 h-4" />}
                        label="Drop tuần này"
                        title={drop.title}
                        hint={`${fresh > 0 ? `${fresh} thẻ mới` : 'Đã học hết'}${daysLeft !== null ? ` · còn ${daysLeft} ngày` : ''}`}
                    />
                );
            })()}
        </aside>
    );
}

function SideCard({
    href,
    onClick,
    icon,
    label,
    title,
    hint,
    progress,
    tone,
    disabled,
}: {
    href?: string;
    onClick?: () => void;
    icon: React.ReactNode;
    label: string;
    title: string;
    hint?: string;
    progress?: number;
    tone?: 'warning';
    disabled?: boolean;
}) {
    const body = (
        <>
            <span className={`w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center shrink-0 ${tone === 'warning' ? 'text-warning' : 'text-muted'}`}>{icon}</span>
            <span className="flex-1 min-w-0">
                <span className="block font-mono text-[11px] uppercase tracking-wider text-subtle">{label}</span>
                <span className="block mt-0.5 font-medium text-ink truncate">{title}</span>
                {progress !== undefined && (
                    <span className="block mt-2 h-1 rounded-full bg-surface-3 overflow-hidden">
                        <span className="block h-full bg-ink-2 rounded-full" style={{ width: `${Math.round(progress * 100)}%` }} />
                    </span>
                )}
                {hint && <span className="block mt-1 text-xs text-muted">{hint}</span>}
            </span>
            {!disabled && <ChevronRight className="w-4 h-4 text-subtle shrink-0" />}
        </>
    );
    const cls = `w-full flex items-start gap-3 rounded-2xl bg-surface border border-line p-4 text-left transition-colors ${disabled ? 'opacity-70' : 'hover:border-line-strong'}`;
    if (href && !disabled) return <Link href={href} className={cls}>{body}</Link>;
    if (onClick) return <button type="button" onClick={onClick} className={cls}>{body}</button>;
    return <div className={cls}>{body}</div>;
}
