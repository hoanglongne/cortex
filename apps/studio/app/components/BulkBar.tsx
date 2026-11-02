import { Button } from './ui';

/** Select-all, a count and the bulk actions, pinned under the header while a list is long. */
export function BulkBar({
    total,
    selected,
    all,
    onToggleAll,
    onApprove,
    onReject,
    progress,
    approveLabel = 'Duyệt',
    rejectLabel = 'Loại',
}: {
    total: number;
    selected: number;
    all: boolean;
    onToggleAll: (on: boolean) => void;
    onApprove?: () => void;
    onReject?: () => void;
    progress: string;
    approveLabel?: string;
    rejectLabel?: string;
}) {
    if (total === 0) return null;
    const busy = progress !== '';
    return (
        <div className="sticky top-14 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-bg/95 px-3 py-2 backdrop-blur-sm">
            <label className="flex items-center gap-2 text-sm text-ink-2">
                <input type="checkbox" checked={all} onChange={(e) => onToggleAll(e.target.checked)} disabled={busy} className="accent-[var(--color-accent)]" />
                Chọn tất cả ({total})
            </label>
            {selected > 0 && <span className="font-mono text-xs text-muted">đã chọn {selected}</span>}
            <div className="ml-auto flex gap-2">
                {onApprove && (
                    <Button variant="primary" disabled={selected === 0 || busy} onClick={onApprove}>
                        {busy ? `Đang xử lý ${progress}` : `${approveLabel}${selected ? ` ${selected}` : ''}`}
                    </Button>
                )}
                {onReject && (
                    <Button disabled={selected === 0 || busy} onClick={onReject}>
                        {`${rejectLabel}${selected ? ` ${selected}` : ''}`}
                    </Button>
                )}
            </div>
        </div>
    );
}

export function RowCheck({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
    return <input type="checkbox" checked={checked} onChange={onChange} aria-label={label} className="mt-1 accent-[var(--color-accent)]" />;
}
