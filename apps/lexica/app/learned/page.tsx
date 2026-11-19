'use client';

import KnowUseLexica from '../components/KnowUseLexica';
import LearnerFacets from '../components/LearnerFacets';
import Link from 'next/link';
import { BookOpen, Trophy, Save, Sparkles, Swords } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import LearnedWordsList from '../components/LearnedWordsList';
import KnownWordsList from '../components/KnownWordsList';
import OnboardingModal from '../components/OnboardingModal';
import { useState, useMemo } from 'react';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { getCard } from '../lib/content/repository';
import { hardWords } from '../lib/engagement/hard';

export default function LearnedPage() {
    const [showHelp, setShowHelp] = useState(false);
    const { buttonPress, click } = useSoundEffects();
    const learnedCount = useLexicaStore(state => state.learnedWords.size);
    const masteredCount = useLexicaStore(state => state.getMasteredWordsCount());
    const cardProgress = useLexicaStore(state => state.cardProgress);
    const hard = useMemo(() => hardWords(cardProgress), [cardProgress]);

    // Words due now or within two days: the ones about to slip.
    const [now] = useState(() => Date.now());
    const fading = useMemo(() => Object.values(cardProgress).filter((p) => p.state !== 'mastered' && p.nextReviewAt <= now + 2 * 86_400_000).length, [cardProgress, now]);

    return (
        <div className="min-h-screen bg-bg px-3 sm:px-4 py-6 sm:py-8 pb-20">
            {showHelp && (
                <OnboardingModal onComplete={() => setShowHelp(false)} />
            )}
            {/* Help Button */}
            <button
                onClick={() => {
                    click();
                    setShowHelp(true);
                }}
                className="fixed bottom-24 lg:bottom-5 right-5 z-50 w-8 h-8 rounded-full bg-surface-2 border border-line-strong hover:border-ink hover:bg-surface-3 transition-colors flex items-center justify-center text-muted hover:text-accent text-sm font-bold"
                aria-label="Hướng dẫn"
            >
                ?
            </button>
            {/* Header */}
            <div className="max-w-5xl mx-auto mb-8">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-muted hover:text-accent transition-colors mb-6 group"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span>
                    <span>Quay lại trang chính</span>
                </Link>

                <div className="text-center mb-6 sm:mb-8">
                    <div className="flex items-center justify-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                        <BookOpen className="w-7 sm:w-8 h-7 sm:h-8 text-accent" />
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-ink">
                            Từ đã học
                        </h1>
                    </div>
                    <div className="flex items-center justify-center gap-6 sm:gap-8 text-base flex-wrap">
                        <div className="flex flex-col items-center">
                            <span className="text-muted text-[10px] sm:text-xs uppercase font-mono mb-1">Tổng số</span>
                            <span className="text-ink font-bold text-xl sm:text-2xl tracking-tight">{learnedCount}</span>
                        </div>
                        <div className="w-px h-8 sm:h-10 bg-surface"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-muted text-[10px] sm:text-xs uppercase font-mono mb-1">Thành thạo</span>
                            <span className="text-warning font-bold text-xl sm:text-2xl tracking-tight flex items-center gap-1.5">
                                {masteredCount}
                                <Trophy className="w-4 h-4" />
                            </span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                {learnedCount > 0 && (
                    <div className="lx-soft mb-6 px-3 sm:px-4 py-2.5 sm:py-3 bg-surface/40 rounded-xl sm:rounded-2xl">
                        <div className="flex items-center justify-between text-[11px] font-medium uppercase font-mono text-muted mb-2">
                            <span>Tiến độ thành thạo</span>
                            <span className="text-accent">{Math.round((masteredCount / learnedCount) * 100)}%</span>
                        </div>
                        <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                            <div
                                className="h-full bg-accent transition-all duration-700 ease-out shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                                style={{ width: `${(masteredCount / learnedCount) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Từ khó của bạn: words this learner keeps missing */}
            {hard.length > 0 && (
                <div className="max-w-5xl mx-auto mb-6 sm:mb-8 rounded-xl border border-warning/40 bg-warning/5 p-4">
                    <div className="flex items-center gap-2">
                        <Swords className="w-5 h-5 text-warning" />
                        <h2 className="text-base font-bold text-ink">Từ khó của bạn</h2>
                        <span className="ml-auto font-mono text-xs text-muted">{hard.length} từ</span>
                    </div>
                    <p className="mt-1 text-xs text-muted">Những từ bạn hay quên. Chúng sẽ quay lại sớm hơn cho tới khi bạn nhớ chắc.</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {hard.slice(0, 8).map(p => (
                            <span key={p.cardId} className="lx-soft px-2.5 py-1 rounded-lg bg-surface text-sm text-ink lowercase">
                                {getCard(p.cardId)?.word ?? p.cardId}
                                <span className="ml-1.5 font-mono text-[10px] text-warning">×{p.wrongCount}</span>
                            </span>
                        ))}
                        {hard.length > 8 && <span className="px-2 py-1 text-xs text-muted">+{hard.length - 8}</span>}
                    </div>
                    <Link
                        href="/review?hard=1"
                        onClick={() => buttonPress()}
                        className="mt-3 w-full h-11 rounded-xl bg-warning text-bg font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition"
                    >
                        Ôn {hard.length} từ khó ngay
                    </Link>
                </div>
            )}

            <KnowUseLexica />
            <LearnerFacets />

            {/* Vocabulary Warehouse Section */}
            <div id="vocabulary-section" className="max-w-5xl mx-auto mb-6 sm:mb-8">
                <h2 className="text-base sm:text-lg font-bold text-ink mb-3 sm:mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-accent" />
                    Kho từ vựng
                </h2>

                {/* Instead of a review calendar: how many words are about to slip */}
                {fading > 0 && (
                    <Link
                        href="/review"
                        onClick={() => buttonPress()}
                        data-testid="fading-words"
                        className="lx-soft mb-4 sm:mb-6 flex items-center justify-between gap-3 rounded-xl bg-surface/40 p-4 hover:border-line-strong"
                    >
                        <div>
                            <p className="text-ink font-semibold text-sm">{fading} từ sắp quên</p>
                            <p className="text-muted text-xs">Ôn trong 2 ngày tới để giữ chúng lại</p>
                        </div>
                        <span className="text-accent text-sm font-semibold">Ôn ngay →</span>
                    </Link>
                )}

                {/* Learned Words List */}
                <LearnedWordsList />
                <KnownWordsList />
            </div>

            {/* Footer Info */}
            <div className="max-w-5xl mx-auto mt-12 text-center space-y-2">
                <p className="text-xs text-muted flex items-center justify-center gap-1.5">
                    <Save className="w-3.5 h-3.5" />
                    Từ của bạn được lưu trên máy này
                </p>
                <p className="text-xs text-subtle flex items-center justify-center gap-1.5">
                    Mỗi ngày bạn học, bộ não sẽ mạnh hơn một chút
                    <Sparkles className="w-3.5 h-3.5" />
                </p>
            </div>




        </div>
    );
}
