'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BookOpen, ChevronRight, Mic, PenLine, Plus, RotateCcw, ScanSearch, Swords, TrendingUp } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { getProgressStats } from '../lib/eloAlgorithm';
import { hardWords } from '../lib/engagement/hard';
import { getCurrentDrop, useContentVersion } from '../lib/content/repository';

const DAY_MS = 86_400_000;

/**
 * "Luyện thêm": every single practice, for after today's session or for a
 * learner who wants just one thing. Quiet rows; the accent stays on Today.
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
        <section aria-label="Luyện thêm" className="w-full">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-subtle">Luyện thêm</p>
            <div className="rounded-2xl border border-line bg-surface divide-y divide-line">
                <Row href="/review" icon={<RotateCcw className="w-4 h-4" />} title="Ôn tập" hint={due > 0 ? `${due} từ đến hạn` : 'Không có từ đến hạn'} badge={due > 0 ? due : undefined} />
                <Row onClick={onLearnMore} icon={<Plus className="w-4 h-4" />} title="Học thêm từ mới" hint="10 thẻ, ngoài mục tiêu hôm nay" />
                <Row href="/read" icon={<BookOpen className="w-4 h-4" />} title="Đọc" hint="Đoạn văn ngắn có từ của bạn" />
                <Row href="/speak" icon={<Mic className="w-4 h-4" />} title="Luyện nói" hint="Nghe, nói, xem máy nghe được gì" />
                <Row href="/journal" icon={<PenLine className="w-4 h-4" />} title="Một câu hôm nay" hint="Viết về ngày của bạn bằng từ vừa học" />
                <Row href="/spot" icon={<ScanSearch className="w-4 h-4" />} title="Bắt gặp" hint="Dán đoạn bạn đọc được ngoài đời, tìm từ đã học" />
                {hard > 0 && <Row href="/review?hard=1" icon={<Swords className="w-4 h-4" />} title="Từ khó" hint={`${hard} từ hay quên`} />}
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
            </div>
        </section>
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
