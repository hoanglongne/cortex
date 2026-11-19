/**
 * Direction B building blocks (docs/LEXICA_DESIGN_B.md, docs/LEXICA_UI_B_ROLLOUT.md D2).
 * Every screen uses these instead of hand-written border, shadow and radius
 * classes, so the app looks the same everywhere. Styling lives in the
 * .lx-hard / .lx-soft / .lx-sticker / .lx-press utilities (app/globals.css).
 */
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { BRAND } from '../../lib/brand';

const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');

/** A cell. `soft` for ordinary content, `hard` for the one thing that matters on the screen. */
export function Card({ variant = 'soft', color, className, style, ...rest }: HTMLAttributes<HTMLDivElement> & { variant?: 'soft' | 'hard'; color?: string }) {
    return (
        <div
            {...rest}
            className={cx(variant === 'hard' ? 'lx-hard rounded-[22px]' : 'lx-soft rounded-[18px]', !color && 'bg-surface', color && 'text-[var(--on-block)]', className)}
            style={color ? { background: color, ...style } : style}
        />
    );
}

type Tone = 'primary' | 'secondary' | 'danger';

/** Buttons: primary is the lime block (one per screen), secondary a soft cell, danger red. */
export function Button({ tone = 'primary', size = 'md', className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; size?: 'sm' | 'md' | 'lg' }) {
    return <button {...rest} className={buttonClass(tone, size, className)} />;
}

export function buttonClass(tone: Tone = 'primary', size: 'sm' | 'md' | 'lg' = 'md', extra?: string) {
    return cx(
        'lx-press inline-flex items-center justify-center gap-2 whitespace-nowrap font-extrabold disabled:opacity-50',
        size === 'sm' ? 'h-9 px-3 text-sm rounded-xl' : size === 'lg' ? 'h-14 px-5 text-lg rounded-[18px]' : 'h-11 px-4 rounded-2xl',
        tone === 'primary' && 'lx-hard bg-accent text-on-accent',
        tone === 'secondary' && 'lx-soft bg-surface text-ink',
        tone === 'danger' && 'lx-hard bg-danger text-on-status',
        extra,
    );
}

/** A number with a label (12 chờ ôn). `on` marks the one that matters most. */
export function Stat({ value, label, on, className }: { value: ReactNode; label: string; on?: boolean; className?: string }) {
    return (
        <div className={cx('rounded-2xl p-3', on ? 'lx-soft bg-accent text-on-accent' : 'lx-soft bg-surface', className)}>
            <b className="block text-2xl font-extrabold leading-tight">{value}</b>
            <span className={cx('text-xs whitespace-nowrap', on ? 'text-on-accent' : 'text-muted')}>{label}</span>
        </div>
    );
}

/** An answer option. `state` colours it after the answer. */
export function Option({ state = 'idle', className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { state?: 'idle' | 'picked' | 'right' | 'wrong' | 'faded' }) {
    return (
        <button
            {...rest}
            className={cx(
                'lx-press w-full rounded-2xl px-4 py-3 text-left font-bold',
                state === 'right' || state === 'picked' ? 'lx-hard bg-accent text-on-accent' : state === 'wrong' ? 'lx-hard bg-[var(--topic-love)] text-[var(--on-block)]' : 'lx-soft bg-surface text-ink',
                state === 'faded' && 'opacity-50',
                className,
            )}
        />
    );
}

/** A small toggle chip (filters, segmented choices). */
export function Chip({ on, className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { on?: boolean }) {
    return <button {...rest} aria-pressed={on} className={cx('lx-press h-9 px-3 rounded-xl whitespace-nowrap text-sm font-bold', on ? 'lx-sticker !rounded-xl bg-accent text-on-accent' : 'lx-soft bg-surface text-ink-2', className)} />;
}

/** A section title, with an optional mono hint on the right. */
export function SectionTitle({ children, hint, className }: { children: ReactNode; hint?: ReactNode; className?: string }) {
    return (
        <div className={cx('mb-2.5 flex items-baseline gap-3', className)}>
            <h2 className="shrink-0 whitespace-nowrap text-xl font-extrabold text-ink">{children}</h2>
            {hint && <span className="ml-auto min-w-0 truncate font-mono text-[11px] uppercase tracking-wider text-muted">{hint}</span>}
        </div>
    );
}

/** A label above a block, in mono capitals. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
    return <p className={cx('font-mono text-[11px] font-bold uppercase tracking-wider text-muted', className)}>{children}</p>;
}

/** A sticker label (streak, combo, counts). Re-exported here so screens import one place. */
export function Tag({ children, color = BRAND.lime, className }: { children: ReactNode; color?: string; className?: string }) {
    return (
        <span className={cx('lx-sticker inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1 text-sm font-extrabold text-[var(--on-block)]', className)} style={{ background: color }}>
            {children}
        </span>
    );
}

/** An empty state: a decor piece, a title and an optional action. */
export function EmptyState({ art, title, text, action, className }: { art?: ReactNode; title: string; text?: string; action?: ReactNode; className?: string }) {
    return (
        <Card className={cx('flex flex-col items-center gap-2 p-6 text-center', className)}>
            {art}
            <p className="text-lg font-extrabold text-ink">{title}</p>
            {text && <p className="text-sm text-muted">{text}</p>}
            {action}
        </Card>
    );
}
