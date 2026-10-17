/** Segmented daily-goal bar in the design system's "Focus" style. */
export default function DailyProgress({ done, goal }: { done: number; goal: number }) {
    const segments = Math.max(1, Math.min(goal, 30));
    const filled = Math.min(segments, Math.round((done / Math.max(goal, 1)) * segments));
    return (
        <div className="space-y-2" aria-label={`Tiến độ hôm nay ${done}/${goal} từ`}>
            <div className="flex items-center justify-between font-mono text-xs text-muted">
                <span>Hôm nay</span>
                <span><span className="text-ink">{done}</span><span className="text-subtle">/{goal}</span> từ</span>
            </div>
            <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${segments}, minmax(0, 1fr))` }}>
                {Array.from({ length: segments }, (_, i) => (
                    <div key={i} className={`h-[3px] ${i < filled ? 'bg-accent' : 'bg-surface-3'}`} />
                ))}
            </div>
        </div>
    );
}
