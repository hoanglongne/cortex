/**
 * Decor assets for direction B (docs/LEXICA_DESIGN_B.md §Assets). Flat 2D,
 * no gradients; colours come from props or currentColor so they work on dark
 * and light. Pure SVG, no state.
 */
import type { ReactNode } from 'react';

const STAR = '50,0 61,18 79,7 80,28 100,30 88,47 100,64 80,68 80,90 61,80 50,100 39,80 20,90 20,68 0,64 12,47 0,30 20,28 21,7 39,18';

/** A spiky burst behind a big number or a reward ("+14"). */
export function Burst({ color = '#C6F432', className = '', children }: { color?: string; className?: string; children?: ReactNode }) {
    return (
        <div className={`relative ${className}`}>
            <svg viewBox="-4 -4 108 108" className="absolute inset-0 h-full w-full" aria-hidden>
                <polygon points={STAR} transform="translate(3 3)" fill="#000" />
                <polygon points={STAR} fill={color} stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
            </svg>
            <div className="relative flex h-full w-full flex-col items-center justify-center text-[#16150F]">{children}</div>
        </div>
    );
}

/** A four-point sparkle, for small celebrations next to text. */
export function Sparkle({ className = 'w-5 h-5', color = 'currentColor' }: { className?: string; color?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
            <path d="M12 1c1 6 5 10 11 11-6 1-10 5-11 11-1-6-5-10-11-11 6-1 10-5 11-11z" fill={color} />
        </svg>
    );
}

/** A hand-drawn wavy underline. */
export function Squiggle({ className = 'w-24 h-3', color = 'currentColor' }: { className?: string; color?: string }) {
    return (
        <svg viewBox="0 0 100 12" preserveAspectRatio="none" className={className} aria-hidden>
            <path d="M2 7c8-6 14 6 22 0s14 6 22 0 14 6 22 0 14 6 22 0" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
        </svg>
    );
}

/** A hand-drawn curved arrow pointing to the next step. */
export function DoodleArrow({ className = 'w-16 h-12', color = 'currentColor' }: { className?: string; color?: string }) {
    return (
        <svg viewBox="0 0 80 60" className={className} aria-hidden>
            <path d="M6 10c20-6 44 0 52 24" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
            <path d="M46 30l12 6 4-13" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/** The streak flame, flat two-tone. */
export function Flame({ className = 'w-5 h-5' }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
            <path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z" fill="#FF8A4C" stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M12 12c1 2 3 3 3 5a3 3 0 0 1-6 0c0-1 1-2 1-2 0 1 1 1 1 1 0-2 0-3 1-4z" fill="#F2C230" />
        </svg>
    );
}

/** A soft blob shape to sit behind an icon or a mascot-free empty state. */
export function Blob({ className = 'w-32 h-32', color = '#A98BFF' }: { className?: string; color?: string }) {
    return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden>
            <path d="M52 6c18 2 36 14 40 32s-6 40-24 48-42 6-54-8S2 40 12 24 34 4 52 6z" fill={color} stroke="#000" strokeWidth="2.5" />
        </svg>
    );
}

/** A dot grid for empty corners (a pattern, not a gradient). */
export function DotGrid({ className = 'w-24 h-24', color = 'currentColor' }: { className?: string; color?: string }) {
    const dots = [];
    for (let y = 0; y < 6; y++) for (let x = 0; x < 6; x++) dots.push(<circle key={`${x}-${y}`} cx={6 + x * 16} cy={6 + y * 16} r="2" fill={color} />);
    return (
        <svg viewBox="0 0 96 96" className={className} aria-hidden>
            {dots}
        </svg>
    );
}

/** A sticker label: rounded pill, black outline and flat shadow ("🔥 6 ngày", "x4 liền!"). */
export function Sticker({ children, color = '#C6F432', tilt = 0, className = '' }: { children: ReactNode; color?: string; tilt?: number; className?: string }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-black px-3 py-1 text-sm font-extrabold text-[#16150F] shadow-[3px_3px_0_#000] ${className}`}
            style={{ background: color, transform: tilt ? `rotate(${tilt}deg)` : undefined }}
        >
            {children}
        </span>
    );
}
