'use client';

import * as Slider from '@radix-ui/react-slider';
import { RATING_MIN, RATING_MAX, RATING_STEP, BAND_DESCRIPTORS } from '@/lib/constants';

interface RatingSliderProps {
    label: string;
    value: number | null;
    onChange: (value: number) => void;
}

function getValueColor(value: number): string {
    if (value <= 3.5) return 'text-accent';
    if (value <= 5.5) return 'text-orange-400';
    if (value <= 7.0) return 'text-yellow-400';
    return 'text-green-400';
}

export function RatingSlider({ label, value, onChange }: RatingSliderProps) {
    const displayValue = value !== null ? value.toFixed(1) : '—';
    const bandLabel = value !== null ? (BAND_DESCRIPTORS[value.toFixed(1)] ?? '') : '';
    const colorClass = value !== null ? getValueColor(value) : 'text-muted';

    return (
        <div className="flex flex-col gap-2.5 w-full group">
            <div className="flex justify-between items-baseline">
                <span className="text-sm font-mono uppercase tracking-wide text-muted group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                    {label}
                </span>
                <div className="flex items-baseline gap-2">
                    {bandLabel && (
                        <span className="text-[10px] font-mono text-muted/70 uppercase tracking-wide">
                            {bandLabel}
                        </span>
                    )}
                    <span className={`text-xl font-mono tabular-nums transition-colors ${colorClass}`}>
                        {displayValue}
                    </span>
                </div>
            </div>
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
        </div>
    );
}
