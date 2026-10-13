'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Leaf, Lock, Sparkles, Sprout, Trophy, Volume2 } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { getAllCards, getCard, getCurrentDrop, useContentVersion } from '../lib/content/repository';
import { buildSets, seasonOpen, setProgress, type CollectionSet } from '../lib/engagement/collection';
import { AudioService } from '../lib/audio/AudioService';
import type { UserCardProgress } from '../lib/eloAlgorithm';

const STATE_ICON = { seed: Sprout, sprout: Leaf, gold: Sparkles, mastered: Trophy } as const;
const STATE_LABEL = { seed: 'Mầm non', sprout: 'Đang nhớ', gold: 'Thuộc tốt', mastered: 'Thành thạo' } as const;
const STATE_STYLE = {
    seed: 'border-line-strong bg-surface text-muted',
    sprout: 'border-accent/30 bg-accent/5 text-ink',
    gold: 'border-accent/60 bg-accent/10 text-ink',
    mastered: 'border-warning/60 bg-warning/10 text-ink',
} as const;

function daysLeft(iso?: string): number | null {
    if (!iso) return null;
    return Math.max(0, Math.ceil((Date.parse(iso) - Date.now()) / 86_400_000));
}

export default function AlbumPage() {
    const version = useContentVersion();
    const cardProgress = useLexicaStore((s) => s.cardProgress);
    const [openId, setOpenId] = useState<string | null>(null);
    const [selected, setSelected] = useState<string | null>(null);

    const sets = useMemo(() => {
        void version;
        const drop = getCurrentDrop();
        return buildSets(getAllCards(), drop ? { [drop.id]: drop.title } : {});
    }, [version]);

    const totals = useMemo(() => {
        const all = sets.reduce((n, s) => n + s.cardIds.length, 0);
        let owned = 0;
        let complete = 0;
        for (const set of sets) {
            const p = setProgress(set, cardProgress);
            owned += p.owned;
            if (p.complete) complete++;
        }
        return { all, owned, complete };
    }, [sets, cardProgress]);

    return (
        <div className="min-h-screen bg-bg px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <Link href="/learned" className="inline-flex items-center gap-2 text-muted hover:text-accent transition-colors text-sm">
                        ← Từ đã học
                    </Link>
                    <p className="text-ink font-bold">Album</p>
                    <div className="w-16" />
                </div>

                <div className="rounded-2xl border border-line bg-surface p-5 mb-6">
                    <p className="text-muted text-sm">Mỗi từ bạn học là một thẻ. Nhớ càng chắc, thẻ càng lên hạng.</p>
                    <div className="mt-4 grid grid-cols-3 gap-3 font-mono">
                        <Stat label="Thẻ" value={`${totals.owned}/${totals.all}`} />
                        <Stat label="Bộ đủ" value={`${totals.complete}/${sets.length}`} />
                        <Stat label="Hoàn thành" value={`${totals.all ? Math.round((totals.owned / totals.all) * 100) : 0}%`} />
                    </div>
                </div>

                <div className="space-y-3">
                    {sets.map((set) => (
                        <SetRow
                            key={set.id}
                            set={set}
                            progress={cardProgress}
                            open={openId === set.id}
                            onToggle={() => setOpenId(openId === set.id ? null : set.id)}
                            onSelect={setSelected}
                        />
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {selected && <CardSheet cardId={selected} progress={cardProgress[selected]} onClose={() => setSelected(null)} />}
            </AnimatePresence>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[10px] uppercase text-subtle">{label}</p>
            <p className="text-xl text-ink">{value}</p>
        </div>
    );
}

function SetRow({
    set,
    progress,
    open,
    onToggle,
    onSelect,
}: {
    set: CollectionSet;
    progress: Record<string, UserCardProgress>;
    open: boolean;
    onToggle: () => void;
    onSelect: (id: string) => void;
}) {
    const p = setProgress(set, progress);
    const pct = p.total ? (p.owned / p.total) * 100 : 0;
    const isSeason = set.kind === 'season';
    const live = seasonOpen(set);
    const left = daysLeft(set.expiresAt);

    return (
        <div className={`rounded-2xl border bg-surface ${p.complete ? 'border-accent/50' : 'border-line'}`}>
            <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 text-left">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="font-bold text-ink truncate">{set.label}</p>
                        {isSeason && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${live ? 'bg-accent/10 text-accent' : 'bg-surface-2 text-subtle'}`}>
                                {live ? (left !== null ? `còn ${left} ngày` : 'mùa này') : 'đã đóng'}
                            </span>
                        )}
                        {p.complete && <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-accent text-on-accent">Đủ bộ</span>}
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-surface-3 overflow-hidden">
                        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                </div>
                <span className="font-mono text-sm text-muted shrink-0">
                    {p.owned}/{p.total}
                </span>
                <ChevronDown className={`w-4 h-4 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="px-4 pb-4 grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {set.cardIds.map((id) => {
                        const cp = progress[id];
                        if (!cp) {
                            return (
                                <div
                                    key={id}
                                    className="aspect-[3/4] rounded-xl border border-dashed border-line-strong flex items-center justify-center text-subtle"
                                    aria-label="Thẻ chưa có"
                                >
                                    {isSeason && !live ? <Lock className="w-4 h-4" /> : <span className="font-mono text-xs">?</span>}
                                </div>
                            );
                        }
                        const card = getCard(id);
                        const Icon = STATE_ICON[cp.state];
                        return (
                            <button
                                key={id}
                                onClick={() => onSelect(id)}
                                className={`aspect-[3/4] rounded-xl border p-2 flex flex-col justify-between text-left transition-transform active:scale-95 ${STATE_STYLE[cp.state]}`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold tracking-wide break-all leading-tight">{card?.word ?? id}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function CardSheet({ cardId, progress, onClose }: { cardId: string; progress?: UserCardProgress; onClose: () => void }) {
    const card = getCard(cardId);
    if (!card || !progress) return null;
    const Icon = STATE_ICON[progress.state];
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-md rounded-2xl border border-line bg-surface p-5"
            >
                <div className="flex items-center gap-2 mb-1">
                    <p className="text-2xl font-bold text-accent tracking-wide">{card.word}</p>
                    <button onClick={() => void AudioService.play(cardId, 'word')} className="p-1.5 rounded-lg bg-accent/10 text-accent" aria-label="Nghe">
                        <Volume2 className="w-4 h-4" />
                    </button>
                </div>
                {card.ipa && <p className="text-muted text-sm font-mono mb-2">/{card.ipa}/</p>}
                <p className="text-ink-2 text-sm mb-3">{card.translationHint}</p>
                <p className="text-muted text-sm italic leading-relaxed border-t border-line pt-3">&ldquo;{card.scenario}&rdquo;</p>
                <div className="mt-4 flex items-center gap-2 font-mono text-xs text-muted">
                    <Icon className="w-3.5 h-3.5" /> {STATE_LABEL[progress.state]} · ôn đúng {progress.reviewCount} · sai {progress.wrongCount}
                </div>
                <button onClick={onClose} className="mt-4 w-full py-2.5 rounded-xl border border-line text-sm text-ink-2">
                    Đóng
                </button>
            </motion.div>
        </div>
    );
}
