'use client';

import type { CueCard as CueCardType, RatingCriterion, Ratings } from '@/types';
import { CueCard } from '@/components/ui/CueCard';
import { GuidedRatingSlider } from '@/components/ui/GuidedRatingSlider';
import { CustomAudioPlayer } from '@/components/ui/CustomAudioPlayer';
import { useLanguage } from '@/components/LanguageProvider';
import { getRubricData } from '@/lib/rubric';

interface EvaluationPanelProps {
    cueCard: CueCardType;
    audioBlob: Blob;
    ratings: Ratings;
    onRatingChange: (criterion: RatingCriterion, value: number) => void;
    onSubmit: () => void;
}

export function EvaluationPanel({
    cueCard,
    audioBlob,
    ratings,
    onRatingChange,
    onSubmit,
}: EvaluationPanelProps) {
    const { t } = useLanguage();
    const rubricData = getRubricData(t);
    const allRated = rubricData.every((c) => ratings[c.key] !== null);

    return (
        <div className="flex flex-1 flex-col items-center gap-6 px-4 py-8 stagger" suppressHydrationWarning>
            <p className="font-mono text-xs tracking-[0.4em] uppercase text-accent">
                {t.evaluateYourself}
            </p>

            {/* Topic card */}
            <div className="w-full max-w-5xl">
                <CueCard card={cueCard} compact />
            </div>

            {/* Audio player - full width row */}
            <div className="w-full max-w-5xl">
                <CustomAudioPlayer audioBlob={audioBlob} />
                <p className="text-base text-gray-800 dark:text-gray-300 font-mono mt-2 text-center">
                    {t.listenBackHonest}
                </p>
            </div>

            {/* Ratings — 2-column grid on desktop */}
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4">
                {rubricData.map((c) => (
                    <div key={c.key} className="rounded-lg border border-surface-light bg-surface p-4">
                        <GuidedRatingSlider
                            label={c.label}
                            question={c.question}
                            guides={c.guides}
                            value={ratings[c.key]}
                            onChange={(v) => onRatingChange(c.key, v)}
                        />
                    </div>
                ))}
            </div>

            {/* Submit */}
            <div className="flex flex-col items-center gap-2">
                <button
                    onClick={onSubmit}
                    disabled={!allRated}
                    className="font-mono text-sm uppercase tracking-[0.2em] px-10 py-3 border border-accent text-accent rounded transition-all duration-300 hover:bg-accent hover:text-background active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed"
                >
                    {t.submit}
                </button>
                {!allRated && (
                    <p className="text-sm text-gray-800 dark:text-gray-300 font-mono tracking-wide">
                        {t.rateAllCriteria}
                    </p>
                )}
            </div>
        </div>
    );
}
