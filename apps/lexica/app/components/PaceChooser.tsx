'use client';

import { clampPace, PACE_MAX, PACE_MIN, PACE_PRESETS, projection, sessionMinutes } from '../lib/journey/pace';

const W = 320;
const H = 130;
const PAD = { l: 34, r: 12, t: 10, b: 18 };
/** The vertical axis never moves, so 5 words a day looks low and 40 looks high. */
const AXIS_MAX = PACE_MAX * 30;
const TICKS = [0, 300, 600, 900, 1200];
const MILESTONES = [7, 14, 30];

const x = (day: number) => PAD.l + ((day - 1) / 29) * (W - PAD.l - PAD.r);
const y = (words: number) => H - PAD.b - (words / AXIS_MAX) * (H - PAD.t - PAD.b);
const line = (pace: number) => projection(pace).map((v, i) => `${i ? 'L' : 'M'}${x(i + 1)},${y(v)}`).join(' ');

/**
 * Pick any number of new words per day and see the next 30 days: the line is
 * the words learned so far, the dashed one is where the current pace would be.
 */
export default function PaceChooser({ value, onChange, compareTo }: { value: number; onChange: (n: number) => void; compareTo?: number }) {
    const total = value * 30;

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
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Sau 30 ngày khoảng ${total} từ`}>
                    {TICKS.map((t) => (
                        <g key={t}>
                            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="currentColor" className="text-line" strokeWidth="1" />
                            <text x={PAD.l - 4} y={y(t) + 3} textAnchor="end" className="fill-subtle" fontSize="8">
                                {t}
                            </text>
                        </g>
                    ))}
                    {/* The other common choices, faint, to see where this one stands */}
                    {PACE_PRESETS.filter((n) => n !== value).map((n) => (
                        <path key={n} d={line(n)} fill="none" stroke="currentColor" strokeWidth="1" className="text-subtle" opacity="0.35" />
                    ))}
                    {compareTo !== undefined && compareTo !== value && <path d={line(compareTo)} fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" className="text-warning" />}
                    <path d={line(value)} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-accent" />
                    {MILESTONES.map((d) => (
                        <g key={d}>
                            <circle cx={x(d)} cy={y(value * d)} r="3.5" className="fill-accent" />
                            <text x={d === 30 ? x(d) - 4 : x(d)} y={y(value * d) - 7} textAnchor={d === 30 ? 'end' : 'middle'} fontSize="9" fontWeight="bold" className="fill-ink">
                                {value * d}
                            </text>
                            <text x={x(d)} y={H - 5} textAnchor="middle" fontSize="8" className="fill-subtle">
                                ngày {d}
                            </text>
                        </g>
                    ))}
                </svg>
                <p data-testid="path-promise" className="mt-1 text-sm text-ink-2">
                    Sau 30 ngày: khoảng <span className="font-semibold text-ink">{total} từ</span> mới ({value} từ × 30 ngày), mỗi ngày chừng {sessionMinutes(value)} phút.
                </p>
                {value >= 25 && <p className="mt-1 text-xs text-warning">Nhịp cao: nếu hay không học hết, app sẽ gợi ý hạ xuống.</p>}
                {value <= 7 && <p className="mt-1 text-xs text-muted">Nhịp nhẹ: dễ giữ đều, từ nhớ chắc nhưng cần hơn một tháng để đủ vốn từ.</p>}
            </div>
        </div>
    );
}
