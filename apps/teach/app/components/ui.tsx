'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Check, Copy, X } from 'lucide-react';

/** Small building blocks of the teacher app: one look everywhere. */

/**
 * A white card on the cream ground, no tint: colour only says a status
 * (docs/TEACH_PLAN.md, design). `flush`: no inner padding, for a full-width
 * list or table. `tone` is accepted from older callers and ignored.
 */
export function Card({ children, className = '', flush = false }: { children: React.ReactNode; className?: string; tone?: 'warm' | 'accent' | 'lilac'; flush?: boolean }) {
    return <section className={`rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)] ${flush ? 'overflow-hidden' : 'p-6 sm:p-7'} ${className}`}>{children}</section>;
}

export function CardTitle({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
    return (
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-serif text-[21px] font-semibold leading-snug text-ink">{children}</h2>
            {aside}
        </div>
    );
}

/** A section's title outside a card: serif, with a small count or note beside it. */
export function SectionTitle({ children, aside, tone = 'muted' }: { children: React.ReactNode; aside?: React.ReactNode; tone?: 'muted' | 'warm' | 'accent' }) {
    const t = { muted: 'text-muted', warm: 'text-warm', accent: 'text-accent-strong' };
    return (
        <h2 className="mb-4 flex flex-wrap items-baseline gap-x-3 font-serif text-2xl font-semibold leading-snug text-ink">
            {children}
            {aside && <span className={`font-sans text-[15px] font-semibold ${t[tone]}`}>{aside}</span>}
        </h2>
    );
}

/** A small uppercase label over a group (side columns, stats). */
export function Label({ children }: { children: React.ReactNode }) {
    return <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">{children}</p>;
}

/** A key number in serif: what the eye should land on. */
export function Stat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: 'warm' | 'accent' }) {
    return (
        <div>
            <p className="text-[15px] text-ink-2">{label}</p>
            <p className={`mt-0.5 font-serif text-[34px] font-semibold leading-tight tabular ${tone === 'warm' ? 'text-warm' : tone === 'accent' ? 'text-accent-strong' : 'text-ink'}`}>{value}</p>
        </div>
    );
}

type ButtonProps = { kind?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'md' | 'sm' } & React.ButtonHTMLAttributes<HTMLButtonElement>;

const BUTTON = {
    primary: 'bg-accent text-on-accent hover:bg-accent-strong',
    secondary: 'bg-surface text-ink border border-line-strong hover:bg-surface-2',
    ghost: 'text-accent-strong hover:bg-accent-soft',
    danger: 'text-danger hover:bg-danger/10',
};

export function Button({ kind = 'primary', size = 'md', className = '', ...rest }: ButtonProps) {
    const sz = size === 'sm' ? 'h-10 px-4 text-[15px]' : 'h-11 px-5';
    return <button {...rest} className={`${sz} inline-flex items-center justify-center gap-2 rounded-[10px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${BUTTON[kind]} ${className}`} />;
}

export function LinkButton({ href, kind = 'primary', size = 'md', children }: { href: string; kind?: ButtonProps['kind']; size?: 'md' | 'sm'; children: React.ReactNode }) {
    const sz = size === 'sm' ? 'h-10 px-4 text-[15px]' : 'h-11 px-5';
    return (
        <Link href={href} className={`${sz} inline-flex items-center justify-center gap-2 rounded-[10px] font-medium transition-colors ${BUTTON[kind ?? 'primary']}`}>
            {children}
        </Link>
    );
}

export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'accent' | 'warm' | 'lilac'; children: React.ReactNode }) {
    // Three meanings only: needs you (warm), fine (accent), everything else (neutral)
    const t = { neutral: 'bg-surface-2 text-ink-2', accent: 'bg-accent-soft text-accent-strong', warm: 'bg-warm-soft text-warm', lilac: 'bg-surface-2 text-ink-2' };
    return <span className={`inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-[13px] font-medium ${t[tone]}`}>{children}</span>;
}

export function PageHeader({ title, sub, actions }: { title: React.ReactNode; sub?: React.ReactNode; actions?: React.ReactNode }) {
    return (
        <header className="mb-10 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <div className="min-w-0">
                <h1 className="font-serif text-[32px] font-semibold leading-tight text-ink sm:text-[40px]">{title}</h1>
                {sub && <p className="mt-2 max-w-2xl text-[16px] text-muted">{sub}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
        </header>
    );
}

/** Never a blank screen: what this place is for, and the one thing to do next. */
export function Empty({ title, children, action }: { title: string; children?: React.ReactNode; action?: React.ReactNode }) {
    return (
        <div className="rounded-[var(--radius-card)] border border-dashed border-line-strong px-6 py-12 text-center">
            <p className="font-serif text-xl font-semibold text-ink">{title}</p>
            {children && <p className="mx-auto mt-2 max-w-md text-ink-2">{children}</p>}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <span className="text-[15px] font-medium text-ink-2">{label}</span>
            <div className="mt-2">{children}</div>
            {hint && <span className="mt-1.5 block text-[13px] text-muted">{hint}</span>}
        </label>
    );
}

export const inputClass = 'w-full h-12 rounded-[10px] border border-line-strong bg-surface px-4 text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/15';

export function CopyField({ value, label }: { value: string; label?: string }) {
    const [done, setDone] = useState(false);
    return (
        <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg bg-surface-2 px-3 py-2 font-mono text-sm text-ink" title={value}>
                {value}
            </code>
            <Button
                kind="secondary"
                size="sm"
                onClick={() => {
                    void navigator.clipboard?.writeText(value);
                    setDone(true);
                    setTimeout(() => setDone(false), 1600);
                }}
                aria-label={label ?? 'Chép'}
            >
                {done ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />} {done ? 'Đã chép' : 'Chép'}
            </Button>
        </div>
    );
}

/** A panel from the right for a task that should not leave the page (assigning, inviting). */
export function Drawer({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose} role="presentation">
            <div role="dialog" aria-label={title} className="h-full w-full max-w-lg overflow-y-auto bg-bg p-6 shadow-2xl sm:p-8" onClick={(e) => e.stopPropagation()}>
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="font-serif text-2xl font-semibold text-ink">{title}</h2>
                    <button onClick={onClose} aria-label="Đóng" className="rounded-lg p-2 text-muted hover:bg-surface-2">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

export function ErrorNote({ error }: { error: string }) {
    if (!error) return null;
    return <p role="alert" className="rounded-[10px] bg-danger/10 px-4 py-2.5 text-[15px] text-danger">{error}</p>;
}

export const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** Copies a ready message (a nudge, praise) to paste into Zalo or Messenger; `primary` when it is the row's main action. */
export function CopyChip({ text, label, primary = false }: { text: string; label: string; primary?: boolean }) {
    const [done, setDone] = useState(false);
    return (
        <button
            onClick={() => {
                void navigator.clipboard?.writeText(text);
                setDone(true);
                setTimeout(() => setDone(false), 1600);
            }}
            title={text}
            className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-[10px] px-4 text-[15px] transition-colors ${primary ? 'bg-accent font-semibold text-on-accent hover:bg-accent-strong' : 'border border-line-strong bg-surface text-ink hover:bg-surface-2'}`}
        >
            {done ? <Check className="h-4 w-4" /> : <Copy className={`h-4 w-4 ${primary ? '' : 'text-muted'}`} />} {done ? 'Đã chép' : label}
        </button>
    );
}

/** The round "đã xử lý" box at the start of a to-do row. */
export function DoneButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            aria-label="Đánh dấu đã xử lý (ẩn 7 ngày)"
            title="Đã xử lý: ẩn 7 ngày"
            className="group mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-line-strong bg-surface transition-colors hover:border-accent"
        >
            <Check className="h-3.5 w-3.5 text-accent opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
    );
}
