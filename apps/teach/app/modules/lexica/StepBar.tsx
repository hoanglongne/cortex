import { STEP_LABEL, STEPS, type Counts } from '@cortex/classroom-lexica';

/** The four steps as a stacked bar: how many words reached each, from Hiểu (light) to Dùng (deep). */
export default function StepBar({ counts, total }: { counts: Counts; total?: number }) {
    const max = Math.max(1, total ?? counts.hieu ?? 0);
    const colors = { hieu: 'bg-step-hieu', nho: 'bg-step-nho', gap: 'bg-step-gap', dung: 'bg-step-dung' };
    return (
        <div>
            <div className="flex h-2 overflow-hidden rounded-full bg-surface-2">
                {STEPS.map((s, i) => {
                    const here = (counts[s] ?? 0) - (STEPS[i + 1] ? (counts[STEPS[i + 1]] ?? 0) : 0);
                    return <span key={s} className={colors[s]} style={{ width: `${(Math.max(0, here) / max) * 100}%` }} />;
                })}
            </div>
            <p className="mt-1.5 flex flex-wrap gap-x-3 text-xs text-muted tabular">
                {STEPS.map((s) => (
                    <span key={s}>
                        <b className="font-semibold text-ink-2">{counts[s] ?? 0}</b> {STEP_LABEL[s]}
                    </span>
                ))}
                {(counts.doi ?? 0) > 0 && (
                    <span className="text-lilac">
                        <b className="font-semibold">{counts.doi}</b> {STEP_LABEL.doi}
                    </span>
                )}
            </p>
        </div>
    );
}
