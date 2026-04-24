'use client';

import { useState, useEffect } from 'react';
import type { CueCard as CueCardType, Ratings } from '@/types';
import { CueCard } from '@/components/ui/CueCard';
import { getBandDescriptor } from '@/lib/scoring';
import { useLanguage } from '@/components/LanguageProvider';
import { ORATIO_BASE_URL } from '@/lib/constants';
import { logSoliloAction } from '@/lib/cortex';

interface ResultPanelProps {
    cueCard: CueCardType;
    ratings: Ratings;
    score: number;
    notes?: string;
    transcript?: string;
    fillerCount?: number;
    onReset: () => void;
}

function useCountUp(target: number, duration = 1200) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        const start = performance.now();
        let raf: number;
        function tick(now: number) {
            const t = Math.min((now - start) / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - t, 3);
            setValue(Math.round(eased * target * 10) / 10);
            if (t < 1) raf = requestAnimationFrame(tick);
        }
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, duration]);
    return value;
}

function getScoreColor(score: number): string {
    if (score <= 3.5) return 'text-accent';
    if (score <= 5.5) return 'text-accent/70';
    if (score <= 7.0) return 'text-band-gold';
    return 'text-band-gold/80';
}

export function ResultPanel({ cueCard, ratings, score, notes, transcript, fillerCount, onReset }: ResultPanelProps) {
    const { t } = useLanguage();
    const descriptor = getBandDescriptor(score);
    const oratioUrl = `${ORATIO_BASE_URL}?topic=${encodeURIComponent(cueCard.id)}`;
    const displayScore = useCountUp(score);
    const colorClass = getScoreColor(score);

    // Send log to Cortex on mount
    useEffect(() => {
        const userId = localStorage.getItem('cortex_user_id') || 'ce99b943-f480-439e-a6f1-4adef7d56f57';
        logSoliloAction(userId, 'COMPLETE_SOLILO_SESSION', {
            cueCardId: cueCard.id,
            topic: cueCard.topic,
            transcript: transcript || notes || cueCard.topic,
            fillerCount: fillerCount || 0,
            score,
            ratings
        });
    }, [cueCard, score, ratings, notes, transcript, fillerCount]);

    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-8 stagger" suppressHydrationWarning>
            <p className="font-mono text-xs tracking-[0.4em] uppercase text-muted">
                {t.yourResult}
            </p>

            {/* Big score with animation */}
            <div className="flex flex-col items-center gap-2 score-pop">
                <span className={`font-mono font-bold text-8xl tabular-nums ${colorClass}`}>
                    {displayScore.toFixed(1)}
                </span>
                <span className={`font-mono text-base uppercase tracking-[0.3em] ${colorClass} opacity-70`}>
                    {descriptor}
                </span>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-foreground font-mono rounded-lg border border-surface-light bg-surface p-5">
                {([
                    [t.fluency, ratings.fluency],
                    [t.lexical, ratings.lexical],
                    [t.grammar, ratings.grammar],
                    [t.pronunciation, ratings.pronunciation],
                ] as const).map(([label, val]) => (
                    <div key={label} className="contents">
                        <span className="text-muted text-sm uppercase tracking-wide">{label}</span>
                        <span className="text-foreground dark:text-gray-100 tabular-nums text-right">{val?.toFixed(1) ?? '—'}</span>
                    </div>
                ))}
            </div>

            {/* Topic */}
            <CueCard card={cueCard} compact />

            {/* ORATIO CTA */}
            <a
                href={oratioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group max-w-md text-center font-mono text-base uppercase tracking-[0.15em] px-10 py-5 border-2 border-accent text-accent rounded transition-all duration-300 hover:bg-accent hover:text-background dark:glow-accent dark:hover:glow-accent-strong hover:scale-105 active:scale-95"
            >
                {t.oratioPromo}
                <br />
                <span className="text-xs opacity-60 group-hover:opacity-100 tracking-widest transition-opacity">
                    {t.oratioPromoSub}
                </span>
            </a>

            {/* Try again */}
            <button
                onClick={onReset}
                className="font-mono text-sm uppercase tracking-[0.2em] text-muted hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 hover:tracking-[0.3em]"
            >
                {t.tryAgain}
            </button>
        </div>
    );
}
