'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BookOpen, ChevronRight, Compass, Mic, PenLine, Plus, RotateCcw, ScanSearch, Swords, TrendingUp } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { getProgressStats } from '../lib/eloAlgorithm';
import { hardWords } from '../lib/engagement/hard';
import { getCurrentDrop, useContentVersion } from '../lib/content/repository';

const DAY_MS = 86_400_000;

/**
 * "Luyện": every single practice, grouped by what it does for a word: keep it
 * (review), use it (read, speak, write), add more, meet it outside the app.
 * Quiet rows; the accent stays on Today.
 */
export default function MoreList({ onLearnMore }: { onLearnMore: () => void }) {
    useContentVersion();
    const cardProgress = useLexicaStore((s) => s.cardProgress);
    const loadNewDeck = useLexicaStore((s) => s.loadNewDeck);
    const [now] = useState(() => Date.now());
    const due = getProgressStats(cardProgress).dueToday;
    const hard = hardWords(cardProgress).length;
    const drop = getCurrentDrop(now);
    const dropFresh = drop ? drop.cards.filter((c) => !cardProgress[c.id]).length : 0;

    return (
        <div className="w-full space-y-5">
            <Group title="Giữ từ đã học" sub="Ôn đúng lúc sắp quên">
                <Row href="/review" icon={<RotateCcw className="w-4 h-4" />} title="Ôn tập" hint={due > 0 ? `${due} từ đến hạn` : 'Không có từ đến hạn'} badge={due > 0 ? due : undefined} />
                {hard > 0 && <Row href="/review?hard=1" icon={<Swords className="w-4 h-4" />} title="Từ khó" hint={`${hard} từ hay quên`} />}
            </Group>

            <section aria-label="Luyện kỹ năng">
                <GroupHead title="Dùng từ" sub="Đọc, nói, viết với từ của bạn" />
                <div className="grid grid-cols-3 gap-2">
                    <Tile href="/read" icon={<BookOpen className="w-5 h-5" />} title="Đọc" hint="Đoạn ngắn" />
                    <Tile href="/speak" icon={<Mic className="w-5 h-5" />} title="Nói" hint="Nghe và nói" />
                    <Tile href="/journal" icon={<PenLine className="w-5 h-5" />} title="Viết" hint="Câu của bạn" />
                </div>
            </section>

            <Group title="Thêm từ mới" sub="Khi đã xong phiên hôm nay">
                <Row href="/today?more=1" icon={<Plus className="w-4 h-4" />} title="Học thêm" hint="10 từ mới, kèm một bài đọc và luyện nói" />
                {drop && dropFresh > 0 && (
                    <Row
                        onClick={() => {
                            loadNewDeck();
                            onLearnMore();
                        }}
                        icon={<TrendingUp className="w-4 h-4" />}
                        title={`Drop: ${drop.title}`}
                        hint={`${dropFresh} thẻ mới${drop.expiresAt ? ` · còn ${Math.max(0, Math.ceil((Date.parse(drop.expiresAt) - now) / DAY_MS))} ngày` : ''}`}
                    />
                )}
            </Group>

            <Group title="Ngoài đời" sub="Gặp lại từ ngoài app">
                <Row href="/spot" icon={<ScanSearch className="w-4 h-4" />} title="Bắt gặp" hint="Săn từ của tuần, dán đoạn đọc được, xem bộ sưu tập" />
            </Group>

            <Link href="/guide" className="flex items-center justify-center gap-1.5 text-sm text-muted hover:text-ink">
                <Compass className="w-4 h-4" /> Lexica có gì, dùng gì khi nào
            </Link>
        </div>
    );
}

function GroupHead({ title, sub }: { title: string; sub: string }) {
    return (
        <div className="mb-2 flex items-baseline justify-between gap-2">
            <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">{title}</p>
            <p className="text-xs text-subtle truncate">{sub}</p>
        </div>
    );
}

function Group({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
    return (
        <section aria-label={title}>
            <GroupHead title={title} sub={sub} />
            <div className="rounded-2xl border border-line bg-surface divide-y divide-line">{children}</div>
        </section>
    );
}

function Tile({ href, icon, title, hint }: { href: string; icon: React.ReactNode; title: string; hint: string }) {
    return (
        <Link href={href} className="rounded-2xl border border-line bg-surface p-3 flex flex-col items-center gap-1.5 text-center hover:border-line-strong transition-colors">
            <span className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-muted">{icon}</span>
            <span className="text-sm font-medium text-ink">{title}</span>
            <span className="text-[11px] text-muted leading-tight">{hint}</span>
        </Link>
    );
}

function Row({ href, onClick, icon, title, hint, badge }: { href?: string; onClick?: () => void; icon: React.ReactNode; title: string; hint: string; badge?: number }) {
    const body = (
        <>
            <span className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-muted shrink-0">{icon}</span>
            <span className="flex-1 min-w-0 text-left">
                <span className="block text-sm font-medium text-ink">{title}</span>
                <span className="block text-xs text-muted truncate">{hint}</span>
            </span>
            {badge !== undefined && <span className="min-w-5 h-5 px-1 rounded-full bg-warning text-bg text-[11px] font-bold leading-5 text-center">{badge > 99 ? '99+' : badge}</span>}
            <ChevronRight className="w-4 h-4 text-subtle shrink-0" />
        </>
    );
    const cls = 'w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-2/50 first:rounded-t-2xl last:rounded-b-2xl transition-colors';
    if (href) return <Link href={href} className={cls}>{body}</Link>;
    return <button type="button" onClick={onClick} className={cls}>{body}</button>;
}
