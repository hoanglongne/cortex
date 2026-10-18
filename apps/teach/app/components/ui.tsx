'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Check, Copy, X } from 'lucide-react';

/** Small building blocks of the teacher app: one look everywhere. */

/** `flush`: no inner padding, for a card that holds a full-width list or table. */
export function Card({ children, className = '', tone, flush = false }: { children: React.ReactNode; className?: string; tone?: 'warm' | 'accent' | 'lilac'; flush?: boolean }) {
    const tones = { warm: 'bg-warm-soft border-warm/30', accent: 'bg-accent-soft border-accent/25', lilac: 'bg-lilac-soft border-lilac/25' };
    return <section className={`rounded-[var(--radius-card)] border shadow-[var(--shadow-card)] ${flush ? 'overflow-hidden' : 'p-5'} ${tone ? tones[tone] : 'bg-surface border-line'} ${className}`}>{children}</section>;
}

export function CardTitle({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
    return (
        <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-[15px] font-semibold text-ink">{children}</h2>
            {aside}
        </div>
    );
}

type ButtonProps = { kind?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'md' | 'sm' } & React.ButtonHTMLAttributes<HTMLButtonElement>;

const BUTTON = {
    primary: 'bg-accent text-on-accent hover:bg-accent-strong',
    secondary: 'bg-surface text-ink border border-line-strong hover:bg-surface-2',
    ghost: 'text-accent hover:bg-accent-soft',
    danger: 'text-danger hover:bg-danger/10',
};

export function Button({ kind = 'primary', size = 'md', className = '', ...rest }: ButtonProps) {
    const sz = size === 'sm' ? 'h-9 px-3 text-sm' : 'h-11 px-4';
    return <button {...rest} className={`${sz} inline-flex items-center justify-center gap-1.5 rounded-xl font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${BUTTON[kind]} ${className}`} />;
}

export function LinkButton({ href, kind = 'primary', size = 'md', children }: { href: string; kind?: ButtonProps['kind']; size?: 'md' | 'sm'; children: React.ReactNode }) {
    const sz = size === 'sm' ? 'h-9 px-3 text-sm' : 'h-11 px-4';
    return (
        <Link href={href} className={`${sz} inline-flex items-center justify-center gap-1.5 rounded-xl font-medium transition-colors ${BUTTON[kind ?? 'primary']}`}>
            {children}
        </Link>
    );
}

export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'accent' | 'warm' | 'lilac'; children: React.ReactNode }) {
    const t = { neutral: 'bg-surface-2 text-muted', accent: 'bg-accent-soft text-accent-strong', warm: 'bg-warm-soft text-warm', lilac: 'bg-lilac-soft text-lilac' };
    return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${t[tone]}`}>{children}</span>;
}

export function PageHeader({ title, sub, actions }: { title: React.ReactNode; sub?: React.ReactNode; actions?: React.ReactNode }) {
    return (
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
                <h1 className="text-xl font-semibold text-ink">{title}</h1>
                {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </header>
    );
}

/** Never a blank screen: what this place is for, and the one thing to do next. */
export function Empty({ title, children, action }: { title: string; children?: React.ReactNode; action?: React.ReactNode }) {
    return (
        <div className="rounded-[var(--radius-card)] border border-dashed border-line-strong bg-surface/60 px-6 py-10 text-center">
            <p className="font-medium text-ink">{title}</p>
            {children && <p className="mx-auto mt-1 max-w-md text-sm text-muted">{children}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <span className="text-sm font-medium text-ink-2">{label}</span>
            <div className="mt-1">{children}</div>
            {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
        </label>
    );
}

export const inputClass = 'w-full h-11 rounded-xl border border-line-strong bg-surface px-3 text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/15';

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
            <div role="dialog" aria-label={title} className="h-full w-full max-w-lg overflow-y-auto bg-bg p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-ink">{title}</h2>
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
    return <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>;
}

export const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** Copies a ready message (a nudge, praise) to paste into Zalo or Messenger. */
export function CopyChip({ text, label }: { text: string; label: string }) {
    const [done, setDone] = useState(false);
    return (
        <button
            onClick={() => {
                void navigator.clipboard?.writeText(text);
                setDone(true);
                setTimeout(() => setDone(false), 1600);
            }}
            title={text}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-sm text-accent-strong shadow-sm hover:bg-accent-soft"
        >
            {done ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {done ? 'Đã chép' : label}
        </button>
    );
}
