'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Sprout, Leaf, Sparkles, Trophy, Target, Check, RotateCcw } from 'lucide-react';
import type { DifficultyLevel } from '../types/vocab';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useLexicaStore } from '../store/lexicaStore';
import { getDeckCards, useContentVersion } from '../lib/content/repository';
import { deckSize, eloRangeText, LEVELS, levelStats, scalePosition, suggestedLevel, ELO_CEIL, ELO_FLOOR } from '../lib/levels';

interface LevelSelectorProps {
    onSelect: (level: DifficultyLevel | 'all') => void;
    currentLevel: DifficultyLevel | 'all' | null;
}

const ICON: Record<DifficultyLevel, React.ComponentType<{ className?: string }>> = {
    beginner: Sprout,
    intermediate: Leaf,
    advanced: Sparkles,
    expert: Trophy,
};

/**
 * /level-select: one card per level with its CEFR equivalent, ELO band, word
 * count, how many the learner already remembers and three sample words. All
 * numbers come from lib/levels.ts and the deck itself.
 */
export default function LevelSelector({ onSelect, currentLevel }: LevelSelectorProps) {
    const { buttonPress } = useSoundEffects();
    const cardProgress = useLexicaStore((s) => s.cardProgress);
    const elo = useLexicaStore((s) => s.userStats.currentElo);
    const swipes = useLexicaStore((s) => s.userStats.totalSwipes);
    const tested = useLexicaStore((s) => s.recommendedLevel);
    const testScore = useLexicaStore((s) => (s.placements.length > 0 ? s.userStats.currentElo : s.testScore));
    const version = useContentVersion();
    const branch = useLexicaStore((s) => s.path?.branch ?? 'cert');

    const { stats, total } = useMemo(() => {
        void version; // recount when remote packs load
        // Counts for the learner's branch (docs/LEXICA_DIRECTION.md).
        const cards = getDeckCards().filter((c) => (c.branch ?? 'cert') === branch);
        return { stats: levelStats(cards, cardProgress), total: deckSize(cards) };
    }, [cardProgress, version, branch]);
    const suggested = suggestedLevel({ elo, swipes, tested });

    const pick = (level: DifficultyLevel | 'all') => {
        buttonPress();
        onSelect(level);
    };

    return (
        <div className="w-full max-w-5xl mx-auto px-4 pt-20 md:pt-24 pb-10 space-y-6">
            <header className="space-y-1">
                <h1 className="text-3xl md:text-4xl font-semibold text-ink tracking-tight">Chọn độ khó</h1>
                <p className="text-muted text-sm">Đổi lúc nào cũng được. Khi bạn nhớ từ quá dễ hoặc quá khó, trang chủ sẽ gợi ý đổi level.</p>
            </header>

            <EloScale elo={elo} tested={testScore !== null} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {LEVELS.map((l) => {
                    const s = stats[l.id];
                    const Icon = ICON[l.id];
                    const selected = currentLevel === l.id;
                    const pct = s.total > 0 ? Math.round((s.remembered / s.total) * 100) : 0;
                    return (
                        <button
                            key={l.id}
                            onClick={() => pick(l.id)}
                            aria-pressed={selected}
                            data-testid={`level-${l.id}`}
                            className={`relative text-left rounded-2xl bg-surface border p-5 transition-colors hover:border-line-strong ${selected ? 'border-accent' : 'border-line'}`}
                        >
                            {selected && (
                                <span className="absolute top-4 right-4 w-6 h-6 rounded-full bg-accent text-on-accent flex items-center justify-center" aria-label="Đang chọn">
                                    <Check className="w-3.5 h-3.5" />
                                </span>
                            )}
                            <div className="flex items-center gap-2">
                                <Icon className={`w-5 h-5 ${selected ? 'text-accent' : 'text-muted'}`} />
                                <span className="font-mono text-[11px] text-subtle">{l.cefr}</span>
                                {suggested === l.id && (
                                    <span className="rounded-md bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">Đề xuất</span>
                                )}
                            </div>
                            <p className="mt-3 text-xl font-semibold text-ink">{l.label}</p>
                            <p className="mt-1 text-sm text-muted min-h-10">{l.description}</p>
                            <p className="mt-3 font-mono text-[11px] text-subtle">
                                {eloRangeText(l)} · {s.total} từ · {l.band}
                            </p>
                            <div className="mt-3">
                                <div className="flex justify-between font-mono text-[11px] text-muted">
                                    <span>Đã nhớ</span>
                                    <span>
                                        <span className="text-ink">{s.remembered}</span>/{s.total}
                                    </span>
                                </div>
                                <div className="mt-1 h-1 rounded-full bg-surface-3 overflow-hidden">
                                    <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                            <p className="mt-3 text-sm text-ink-2">
                                {s.samples.map((w, i) => (
                                    <span key={w}>
                                        {i > 0 && <span className="text-subtle"> · </span>}
                                        {w}
                                    </span>
                                ))}
                            </p>
                        </button>
                    );
                })}
            </div>

            <button
                onClick={() => pick('all')}
                aria-pressed={currentLevel === 'all'}
                data-testid="level-all"
                className={`relative w-full flex items-center gap-3 rounded-2xl bg-surface border px-5 py-4 text-left transition-colors hover:border-line-strong ${currentLevel === 'all' ? 'border-accent' : 'border-line'}`}
            >
                <Target className={`w-5 h-5 shrink-0 ${currentLevel === 'all' ? 'text-accent' : 'text-muted'}`} />
                <span className="flex-1">
                    <span className="block text-ink font-semibold">Tất cả</span>
                    <span className="block text-sm text-muted">Trộn cả {total} từ, độ khó tự theo ELO của bạn</span>
                </span>
                {currentLevel === 'all' && (
                    <span className="w-6 h-6 rounded-full bg-accent text-on-accent flex items-center justify-center" aria-label="Đang chọn">
                        <Check className="w-3.5 h-3.5" />
                    </span>
                )}
            </button>
        </div>
    );
}

/** The ELO scale with the level bands and the score from the level test (ELO moves only with the test). */
function EloScale({ elo, tested }: { elo: number; tested: boolean }) {
    const at = scalePosition(elo);
    return (
        <section className="rounded-2xl bg-surface border border-line p-5" aria-label="Thang ELO">
            <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm text-ink">
                    {tested ? (
                        <>
                            Điểm bài kiểm tra: <span className="font-mono text-accent font-bold">{elo}</span>
                        </>
                    ) : (
                        'Chưa làm bài kiểm tra từ vựng'
                    )}
                </p>
                <Link href="/test" className="flex items-center gap-1.5 text-sm text-muted hover:text-ink">
                    <RotateCcw className="w-3.5 h-3.5" /> {tested ? 'Làm lại bài test' : 'Làm bài test'}
                </Link>
            </div>
            <div className="relative mt-6">
                <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                    {LEVELS.map((l) => (
                        <div key={l.id} className="h-full bg-surface-3" style={{ width: `${(scalePosition(l.eloMax) - scalePosition(l.eloMin)) * 100}%` }} />
                    ))}
                </div>
                {tested && <span
                    className="absolute -top-1.5 w-1 h-5 rounded-full bg-accent -translate-x-1/2"
                    style={{ left: `${at * 100}%` }}
                    aria-hidden
                />}
                <div className="relative mt-2 h-4 font-mono text-[10px] text-subtle">
                    {LEVELS.map((l) => (
                        <span key={l.id} className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${((scalePosition(l.eloMin) + scalePosition(l.eloMax)) / 2) * 100}%` }}>
                            {l.label}
                        </span>
                    ))}
                </div>
                <div className="flex justify-between font-mono text-[10px] text-subtle">
                    <span>{ELO_FLOOR}</span>
                    <span>{ELO_CEIL}</span>
                </div>
            </div>
        </section>
    );
}
