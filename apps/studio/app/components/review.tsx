'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronDown, Pencil, X } from 'lucide-react';

/** Status tabs shared by every review page: the same look and the same counts. */
export function StatusTabs<T extends string>({
    tabs,
    value,
    onChange,
    counts,
}: {
    tabs: readonly { id: T; label: string }[];
    value: T;
    onChange: (id: T) => void;
    counts?: Partial<Record<T, number>> | null;
}) {
    return (
        <div className="flex gap-1 rounded-xl bg-surface border border-line p-1 w-fit" role="tablist">
            {tabs.map(t => (
                <button
                    key={t.id}
                    role="tab"
                    aria-selected={value === t.id}
                    onClick={() => onChange(t.id)}
                    className={`h-8 px-3 rounded-lg text-sm font-medium whitespace-nowrap ${value === t.id ? 'bg-surface-3 text-ink' : 'text-muted hover:text-ink'}`}
                >
                    {t.label}
                    {counts?.[t.id] !== undefined && <span className="ml-1.5 font-mono text-[11px] text-subtle">{counts[t.id]}</span>}
                </button>
            ))}
        </div>
    );
}

/**
 * Everything that is not reviewing (generate, publish, stats, add by hand)
 * sits behind one fold so the list to review starts at the top of the page.
 * `actions` stay visible next to it for the one or two buttons used daily.
 */
export function Tools({ summary, actions, children }: { summary?: ReactNode; actions?: ReactNode; children: ReactNode }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="rounded-xl border border-line bg-surface">
            <div className="flex flex-wrap items-center gap-2 px-3 py-2">
                <div className="mr-auto min-w-0 text-sm text-muted">{summary}</div>
                {actions}
                <button
                    onClick={() => setOpen(o => !o)}
                    aria-expanded={open}
                    className="flex h-9 items-center gap-1 rounded-lg px-2 text-sm text-muted hover:text-ink hover:bg-surface-2"
                >
                    Công cụ <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
            </div>
            {open && <div className="border-t border-line p-4 flex flex-col gap-4">{children}</div>}
        </div>
    );
}

export type RowAction = 'approve' | 'reject' | 'edit';

const ICON = { approve: Check, reject: X, edit: Pencil } as const;
const LABEL = { approve: 'Duyệt', reject: 'Loại', edit: 'Sửa' } as const;
const TONE = {
    approve: 'bg-accent text-on-accent hover:bg-accent-strong',
    reject: 'text-danger border border-danger/30 hover:bg-danger/10',
    edit: 'text-muted border border-line hover:text-ink hover:bg-surface-2',
} as const;

/** One icon button of a row: a check, a cross or a pencil, with a text label for screen readers and a tooltip. */
export function IconAction({ kind, onClick, disabled, label, withText }: { kind: RowAction; onClick: () => void; disabled?: boolean; label?: string; withText?: boolean }) {
    const Icon = ICON[kind];
    const text = label ?? LABEL[kind];
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={text}
            aria-label={text}
            className={`flex h-9 items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors ${withText ? 'px-3' : 'w-9'} disabled:opacity-40 disabled:cursor-not-allowed ${TONE[kind]}`}
        >
            <Icon className="w-4 h-4" />
            {withText && text}
        </button>
    );
}

/** A compact row: tick box, content, icon actions on the right. */
export function ReviewRow({
    id,
    focused,
    selected,
    onToggle,
    actions,
    children,
}: {
    id: string;
    focused?: boolean;
    selected?: boolean;
    onToggle?: () => void;
    actions?: ReactNode;
    children: ReactNode;
}) {
    return (
        <div
            data-row={id}
            className={`flex items-start gap-3 rounded-xl border bg-surface px-3 py-2.5 transition-colors ${focused ? 'border-accent' : selected ? 'border-accent/50' : 'border-line'}`}
        >
            {onToggle && (
                <input type="checkbox" checked={!!selected} onChange={onToggle} aria-label="Chọn dòng này" className="mt-1.5 h-4 w-4 shrink-0 accent-[var(--color-accent)]" />
            )}
            <div className="min-w-0 flex-1">{children}</div>
            {actions && <div className="flex shrink-0 gap-1.5">{actions}</div>}
        </div>
    );
}

/**
 * Keyboard for a list of rows: J/K (or arrows) move, A approves, R rejects,
 * Space ticks. Ignored while typing. Returns the focused id.
 */
export function useRowKeys(opts: {
    ids: readonly string[];
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
    onToggle?: (id: string) => void;
    enabled?: boolean;
}) {
    const { ids, onApprove, onReject, onToggle, enabled = true } = opts;
    const [at, setAt] = useState(0);
    const focused = ids[Math.min(at, Math.max(ids.length - 1, 0))] as string | undefined;
    const ref = useRef({ ids, onApprove, onReject, onToggle, focused });
    useEffect(() => {
        ref.current = { ids, onApprove, onReject, onToggle, focused };
    });

    const move = useCallback((delta: number) => {
        setAt(i => Math.min(Math.max(i + delta, 0), Math.max(ref.current.ids.length - 1, 0)));
    }, []);

    useEffect(() => {
        if (!enabled) return;
        const onKey = (e: KeyboardEvent) => {
            const el = e.target;
            if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return;
            if (e.metaKey || e.ctrlKey || e.altKey) return;
            const { focused: id, onApprove: ap, onReject: rj, onToggle: tg } = ref.current;
            const k = e.key.toLowerCase();
            if (k === 'j' || e.key === 'ArrowDown') move(1);
            else if (k === 'k' || e.key === 'ArrowUp') move(-1);
            else if (!id) return;
            else if (k === 'a') ap?.(id);
            else if (k === 'r' || k === 'x') rj?.(id);
            else if (e.key === ' ' && tg) tg(id);
            else return;
            e.preventDefault();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [enabled, move]);

    useEffect(() => {
        if (focused) document.querySelector(`[data-row="${CSS.escape(focused)}"]`)?.scrollIntoView({ block: 'nearest' });
    }, [focused]);

    return focused;
}

export function KeyHint() {
    return (
        <p className="hidden md:block text-xs text-subtle">
            Phím: <kbd className="font-mono">J</kbd>/<kbd className="font-mono">K</kbd> di chuyển · <kbd className="font-mono">A</kbd> duyệt · <kbd className="font-mono">R</kbd> loại ·{' '}
            <kbd className="font-mono">Space</kbd> chọn
        </p>
    );
}
