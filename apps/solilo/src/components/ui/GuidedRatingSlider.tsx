'use client';

import { useState } from 'react';
import * as Slider from '@radix-ui/react-slider';
import { RATING_MIN, RATING_MAX, RATING_STEP, BAND_DESCRIPTORS } from '@/lib/constants';
import type { BandGuide } from '@/lib/rubric';
import { useLanguage } from '@/components/LanguageProvider';

interface GuidedRatingSliderProps {
    label: string;
    question: string;
    guides: BandGuide[];
    value: number | null;
    onChange: (value: number) => void;
}

function getActiveGuideIndex(value: number | null): number {
    if (value === null) return -1;
    if (value <= 3.5) return 0;
    if (value <= 5.5) return 1;
    if (value <= 7.5) return 2;
    return 3;
}

export function GuidedRatingSlider({ label, question, guides, value, onChange }: GuidedRatingSliderProps) {
    const { t } = useLanguage();
    const [expanded, setExpanded] = useState(false);
    const displayValue = value !== null ? value.toFixed(1) : '—';
    const bandLabel = value !== null ? (BAND_DESCRIPTORS[value.toFixed(1)] ?? '') : '';
    const activeIdx = getActiveGuideIndex(value);

    return (
        <div className="flex flex-col gap-3 w-full">
            {/* Header */}
            <div className="flex justify-between items-center gap-3">
                <button
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-2 text-sm font-mono uppercase tracking-wide text-foreground hover:opacity-80 transition-opacity group"
                >
                    <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="currentColor"
                        className={`transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
                    >
                        <path d="M3 1l4 4-4 4z" />
                    </svg>
                    {label}
                    {!expanded && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20 normal-case tracking-normal opacity-60 group-hover:opacity-100 transition-opacity">
                            {t.tips}
                        </span>
                    )}
                </button>
                <div className="flex items-baseline gap-2">
                    {bandLabel && (
                        <span className="text-xs font-mono text-foreground uppercase tracking-wide hidden sm:inline">
                            {bandLabel}
                        </span>
                    )}
                    <span className="text-2xl font-mono tabular-nums text-foreground">
                        {displayValue}
                    </span>
                </div>
            </div>

            {/* Slider */}
            <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-5"
                min={RATING_MIN}
                max={RATING_MAX}
                step={RATING_STEP}
                value={value !== null ? [value] : [RATING_MIN]}
                onValueChange={([v]) => onChange(v)}
                aria-label={`${label} rating`}
            >
                <Slider.Track data-radix-slider-track="">
                    <Slider.Range data-radix-slider-range="" />
                </Slider.Track>
                <Slider.Thumb data-radix-slider-thumb="" />
            </Slider.Root>

            {/* Scale */}
            <div className="flex justify-between">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <span key={n} className="text-xs font-mono text-foreground dark:text-gray-300 tabular-nums">{n}</span>
                ))}
            </div>

            {/* Rubric guide (expandable) — monochrome, text only */}
            {expanded && (
                <div className="flex flex-col gap-1 mt-1 panel-enter">
                    <p className="text-xs text-foreground font-mono mb-0.5">{question}</p>
                    {guides.map((g, i) => (
                        <button
                            key={g.range}
                            type="button"
                            className={`text-left px-2.5 py-1.5 rounded border transition-all duration-150 ${activeIdx === i
                                ? 'border-accent/30 bg-accent/5'
                                : 'border-transparent hover:border-surface-light hover:bg-surface-light/20'
                                }`}
                            onClick={() => {
                                const midValues: Record<string, number> = {
                                    '1–3': 2.0, '4–5': 4.5, '6–7': 6.5, '8–9': 8.5
                                };
                                onChange(midValues[g.range] ?? 5.0);
                            }}
                        >
                            <span className="font-mono text-xs text-foreground dark:text-gray-300">{g.range}</span>
                            <div className="ml-2 flex flex-col gap-0.5">
                                <span className="text-xs text-foreground font-medium">{g.description}</span>
                                <span className="text-xs text-foreground opacity-70 italic">{g.examples}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
