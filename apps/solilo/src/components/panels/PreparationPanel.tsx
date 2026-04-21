'use client';

import type { CueCard as CueCardType } from '@/types';
import { CueCard } from '@/components/ui/CueCard';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { useCountdown } from '@/hooks/useCountdown';
import { useLanguage } from '@/components/LanguageProvider';
import { PREP_DURATION_S } from '@/lib/constants';

interface PreparationPanelProps {
    cueCard: CueCardType;
    notes: string;
    onNotesChange: (notes: string) => void;
    onComplete: () => void;
}

export function PreparationPanel({ cueCard, notes, onNotesChange, onComplete }: PreparationPanelProps) {
    const { t } = useLanguage();
    const { remaining } = useCountdown({
        seconds: PREP_DURATION_S,
        onComplete,
    });

    const handleSkip = () => {
        onComplete();
    };

    return (
        <div className="flex flex-1 flex-col items-center gap-4 md:gap-6 px-4 py-4 md:py-8 stagger" suppressHydrationWarning>
            <p className="font-mono text-xs tracking-[0.4em] uppercase text-accent">
                {t.prepTime}
            </p>

            <CountdownTimer remaining={remaining} total={PREP_DURATION_S} label={t.prepLabel} />

            <CueCard card={cueCard} />

            <div className="w-full max-w-lg">
                <label htmlFor="notes" className="sr-only">
                    Your notes
                </label>
                <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => onNotesChange(e.target.value)}
                    placeholder={t.notesPlaceholder}
                    className="w-full h-24 md:h-32 resize-none rounded-lg border border-surface-light bg-surface p-3 md:p-4 font-mono text-xs md:text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/50 focus-glow-accent transition-all duration-300"
                />
            </div>

            <div className="flex flex-col items-center gap-2">
                <button
                    onClick={handleSkip}
                    className="font-mono text-sm uppercase tracking-[0.2em] px-8 py-2 border border-accent/50 text-accent/70 rounded transition-all duration-200 hover:bg-accent/10 hover:text-accent hover:border-accent active:scale-95"
                >
                    {t.skip}
                </button>
                <p className="text-base text-gray-800 dark:text-gray-300 font-mono tracking-wide">
                    {t.autoStartInfo}
                </p>
            </div>
        </div>
    );
}
