'use client';

import { clampPace, PACE_MAX, PACE_MIN, PACE_PRESETS, projection, sessionMinutes } from '../lib/journey/pace';

const W = 300;
const H = 90;

/**
 * Pick any number of new words per day and see the next 30 days: the line is
 * the words learned so far, the dashed one is where the current pace would be.
 */
export default function PaceChooser({ value, onChange, compareTo }: { value: number; onChange: (n: number) => void; compareTo?: number }) {
    const pts = projection(value);
    const max = Math.max(PACE_PRESETS[2] * 30, value * 30, (compareTo ?? 0) * 30);
    const path = (series: number[]) =>
        series.map((v, i) => `${i ? 'L' : 'M'}${((i + 1) / series.length) * W},${H - (v / max) * (H - 6) - 2}`).join(' ');
    const total = pts[pts.length - 1];

    return (
        <div className="space-y-3" data-testid="pace-chooser">
            <div className="flex items-end justify-between gap-3">
                <div className="flex items-center gap-2">
                    <button type="button" aria-label="Bớt một từ" onClick={() => onChange(clampPace(value - 1))} className="w-10 h-10 rounded-xl border border-line bg-surface text-ink text-lg">
                        −
                    </button>
                    <span data-testid="pace-value" className="min-w-[3.5ch] text-center text-3xl font-bold text-ink">
                        {value}
                    </span>
                    <button type="button" aria-label="Thêm một từ" onClick={() => onChange(clampPace(value + 1))} className="w-10 h-10 rounded-xl border border-line bg-surface text-ink text-lg">
                        +
                    </button>
                </div>
                <p className="text-sm text-muted text-right">từ mới/ngày · ~{sessionMinutes(value)} phút</p>
            </div>
            <input
                type="range"
                min={PACE_MIN}
                max={PACE_MAX}
                value={value}
                onChange={(e) => onChange(clampPace(Number(e.target.value)))}
                aria-label="Số từ mới mỗi ngày"
                className="w-full accent-[var(--color-accent,currentColor)]"
            />
            <div className="flex flex-wrap gap-1.5">
                {PACE_PRESETS.map((n) => (
                    <button
                        key={n}
                        type="button"
                        onClick={() => onChange(n)}
                        aria-pressed={value === n}
                        className={`h-8 px-3 rounded-lg border text-xs font-medium ${value === n ? 'bg-accent/12 border-accent/40 text-accent' : 'bg-surface-2/40 border-line-strong/50 text-ink-2'}`}
                    >
                        {n}
                    </button>
                ))}
            </div>
            <div className="rounded-xl border border-line bg-surface-2/40 p-3">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-24" role="img" aria-label={`Sau 30 ngày khoảng ${total} từ`}>
                    {compareTo !== undefined && compareTo !== value && <path d={path(projection(compareTo))} fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" className="text-subtle" />}
                    <path d={path(pts)} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-accent" />
                </svg>
                <div className="flex justify-between text-[11px] text-subtle">
                    <span>Hôm nay</span>
                    <span>Ngày 15: {pts[14]} từ</span>
                    <span>Ngày 30</span>
                </div>
                <p data-testid="path-promise" className="mt-1 text-sm text-ink-2">
                    Sau 30 ngày: khoảng <span className="font-semibold text-ink">{total} từ</span> mới.
                </p>
            </div>
        </div>
    );
}
