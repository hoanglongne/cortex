import type { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANTS: Record<Variant, string> = {
    primary: 'bg-accent text-on-accent font-bold hover:bg-accent-strong',
    secondary: 'bg-surface border border-line text-ink font-medium hover:bg-surface-2',
    ghost: 'text-muted hover:text-ink',
    danger: 'border border-danger/40 text-danger hover:bg-danger/10',
};

export function Button({ variant = 'secondary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
    return (
        <button
            {...props}
            className={`h-10 px-4 rounded-xl text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
        />
    );
}

const field = 'rounded-xl bg-surface-2 border border-line-strong px-3 text-sm text-ink placeholder-subtle focus:border-accent outline-none';

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
    return <input {...props} className={`h-10 ${field} ${className}`} />;
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return <textarea {...props} className={`py-2 ${field} ${className}`} />;
}

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
    return <select {...props} className={`h-10 ${field} ${className}`} />;
}

export function Label({ children }: { children: React.ReactNode }) {
    return <span className="font-mono text-[11px] uppercase text-subtle">{children}</span>;
}

export function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
    return <div className={`rounded-2xl bg-surface border border-line p-5 ${className}`}>{children}</div>;
}

export function ErrorNote({ error }: { error: string }) {
    if (!error) return null;
    return <p className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>;
}

export function Badge({ children, tone = 'muted' }: { children: React.ReactNode; tone?: 'muted' | 'accent' | 'warning' | 'danger' }) {
    const tones = {
        muted: 'bg-surface-2 text-muted',
        accent: 'bg-accent/10 text-accent',
        warning: 'bg-warning/10 text-warning',
        danger: 'bg-danger/10 text-danger',
    };
    return <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 font-mono text-[11px] ${tones[tone]}`}>{children}</span>;
}
