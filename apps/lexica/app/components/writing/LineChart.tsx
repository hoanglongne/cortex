import type { ChartData } from '../../lib/writing/checks';

/** Distinct colour AND dash per line, so the chart reads without colour. */
const STYLES = [
    { stroke: 'var(--color-accent, #22c55e)', dash: undefined, mark: 'circle' },
    { stroke: 'var(--color-warning, #f59e0b)', dash: '6 4', mark: 'square' },
    { stroke: 'var(--color-ink-2, #888)', dash: '2 3', mark: 'diamond' },
] as const;

/** A line chart drawn from `ChartData` (see lib/writing/chart.ts); plain SVG, scales to any width. */
export default function LineChart({ chart }: { chart: ChartData }) {
    const W = 520;
    const H = 260;
    const pad = { l: 46, r: 26, t: 14, b: 34 };
    const all = chart.series.flatMap((s) => s.values);
    const max = Math.ceil(Math.max(...all) / 10) * 10 || 10;
    const x = (i: number) => pad.l + (i * (W - pad.l - pad.r)) / (chart.years.length - 1);
    const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((p) => Math.round(max * p));

    return (
        <figure className="w-full">
            <figcaption className="mb-2 text-sm font-semibold text-ink">{chart.title}</figcaption>
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={chart.title} className="w-full rounded-xl border border-line bg-surface">
                {ticks.map((t) => (
                    <g key={t}>
                        <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="currentColor" className="text-line" strokeWidth={1} />
                        <text x={pad.l - 6} y={y(t) + 4} textAnchor="end" className="fill-current text-muted" fontSize={11}>
                            {t}
                        </text>
                    </g>
                ))}
                {chart.years.map((yr, i) => (
                    <text key={yr} x={x(i)} y={H - 12} textAnchor="middle" className="fill-current text-muted" fontSize={11}>
                        {yr}
                    </text>
                ))}
                <text x={12} y={12} className="fill-current text-subtle" fontSize={10}>
                    {chart.unit}
                </text>
                {chart.series.map((s, k) => {
                    const st = STYLES[k % STYLES.length];
                    return (
                        <g key={s.name}>
                            <polyline fill="none" stroke={st.stroke} strokeWidth={2.5} strokeDasharray={st.dash} points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')} />
                            {s.values.map((v, i) => (
                                <circle key={i} cx={x(i)} cy={y(v)} r={3.5} fill={st.stroke} />
                            ))}
                        </g>
                    );
                })}
            </svg>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
                {chart.series.map((s, k) => {
                    const st = STYLES[k % STYLES.length];
                    return (
                        <span key={s.name} className="flex items-center gap-1.5">
                            <svg width="26" height="8" aria-hidden>
                                <line x1="0" x2="26" y1="4" y2="4" stroke={st.stroke} strokeWidth={2.5} strokeDasharray={st.dash} />
                            </svg>
                            {s.name}
                        </span>
                    );
                })}
            </div>
            <details className="mt-2 text-xs text-muted">
                <summary className="cursor-pointer">Xem bảng số liệu</summary>
                <table className="mt-2 w-full text-left">
                    <thead>
                        <tr>
                            <th className="pr-3 font-medium text-ink-2" />
                            {chart.years.map((yr) => (
                                <th key={yr} className="pr-3 font-medium text-ink-2">
                                    {yr}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {chart.series.map((s) => (
                            <tr key={s.name}>
                                <td className="pr-3 text-ink-2">{s.name}</td>
                                {s.values.map((v, i) => (
                                    <td key={i} className="pr-3 tabular-nums">
                                        {v}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </details>
        </figure>
    );
}
