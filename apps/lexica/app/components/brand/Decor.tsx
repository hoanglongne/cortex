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

/* ── More decor (round 2): same rules, flat fills, black outline, offset black shadow. ── */

const OUT = { stroke: '#000', strokeWidth: 2.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

/** Draws a shape twice: a black copy shifted down-right (the flat shadow), then the coloured one. */
function Shadowed({ d, fill, viewBox, className }: { d: string; fill: string; viewBox: string; className: string }) {
    return (
        <svg viewBox={viewBox} className={className} aria-hidden>
            <path d={d} transform="translate(3 3)" fill="#000" />
            <path d={d} fill={fill} {...OUT} />
        </svg>
    );
}

/** A chunky five-point star (ratings, "giỏi lắm"). */
export function Star({ className = 'w-12 h-12', color = '#F2C230' }: { className?: string; color?: string }) {
    return <Shadowed viewBox="-2 -2 60 60" className={className} fill={color} d="M28 3l7.6 15.4 17 2.5-12.3 12 2.9 16.9L28 41.8l-15.2 8 2.9-16.9-12.3-12 17-2.5z" />;
}

/** A plump heart. */
export function Heart({ className = 'w-12 h-12', color = '#FF7BA0' }: { className?: string; color?: string }) {
    return <Shadowed viewBox="-2 -2 60 60" className={className} fill={color} d="M28 50S5 36 5 20A11.5 11.5 0 0 1 28 14a11.5 11.5 0 0 1 23 6c0 16-23 30-23 30z" />;
}

/** A lightning bolt (speed games, combos). */
export function Bolt({ className = 'w-10 h-12', color = '#C6F432' }: { className?: string; color?: string }) {
    return <Shadowed viewBox="-2 -2 50 62" className={className} fill={color} d="M28 2L4 34h16l-4 24 26-34H26z" />;
}

/** A speech bubble with room for a word ("Hi!", "Wow"). */
export function Bubble({ children, className = 'w-28 h-20', color = '#FFFFFF' }: { children?: ReactNode; className?: string; color?: string }) {
    const d = 'M10 4h72a8 8 0 0 1 8 8v30a8 8 0 0 1-8 8H38l-14 12v-12H10a8 8 0 0 1-8-8V12a8 8 0 0 1 8-8z';
    return (
        <div className={`relative ${className}`}>
            <svg viewBox="-2 -2 100 70" className="absolute inset-0 h-full w-full" aria-hidden>
                <path d={d} transform="translate(3 3)" fill="#000" />
                <path d={d} fill={color} {...OUT} />
            </svg>
            <span className="relative flex h-[78%] items-center justify-center font-extrabold text-[#16150F]">{children}</span>
        </div>
    );
}

/** A crown, for legendary cards and the top of a leaderboard. */
export function Crown({ className = 'w-14 h-10', color = '#F2C230' }: { className?: string; color?: string }) {
    return <Shadowed viewBox="-2 -2 66 46" className={className} fill={color} d="M4 12l14 12 13-20 13 20 14-12-6 28H10z" />;
}

/** A ribbon banner for titles ("ĐỦ BỘ!"). */
export function Ribbon({ children, className = 'h-12', color = '#FF7BA0' }: { children?: ReactNode; className?: string; color?: string }) {
    return (
        <div className={`relative inline-flex items-center ${className}`}>
            <svg viewBox="-2 -2 204 52" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
                <path d="M2 10h20v30H2l8-15z" transform="translate(3 3)" fill="#000" />
                <path d="M2 10h20v30H2l8-15z" fill={color} {...OUT} />
                <path d="M198 10h-20v30h20l-8-15z" transform="translate(3 3)" fill="#000" />
                <path d="M198 10h-20v30h20l-8-15z" fill={color} {...OUT} />
                <path d="M16 2h168v36H16z" transform="translate(3 3)" fill="#000" />
                <path d="M16 2h168v36H16z" fill={color} {...OUT} />
            </svg>
            <span className="relative px-8 pb-2 font-mono text-sm font-bold uppercase tracking-wider text-[#16150F] whitespace-nowrap">{children}</span>
        </div>
    );
}

/** A round stamp ("ĐÃ THUỘC", "MỚI"), slightly tilted. */
export function Stamp({ children, className = 'w-24 h-24', color = '#C6F432' }: { children?: ReactNode; className?: string; color?: string }) {
    return (
        <div className={`relative ${className}`} style={{ transform: 'rotate(-12deg)' }}>
            <svg viewBox="-2 -2 104 104" className="absolute inset-0 h-full w-full" aria-hidden>
                <circle cx="50" cy="50" r="46" transform="translate(3 3)" fill="#000" />
                <circle cx="50" cy="50" r="46" fill={color} {...OUT} />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#000" strokeWidth="2" strokeDasharray="4 5" />
            </svg>
            <span className="relative flex h-full items-center justify-center whitespace-nowrap text-center font-mono text-[10px] font-bold uppercase text-[#16150F]">{children}</span>
        </div>
    );
}

/** A strip of washi tape, to "stick" a card or a note to the page. */
export function Tape({ className = 'w-20 h-6', color = '#3FD0C9' }: { className?: string; color?: string }) {
    return (
        <svg viewBox="0 0 80 24" preserveAspectRatio="none" className={className} aria-hidden>
            <path d="M3 3l4 3 4-3 4 3 4-3 4 3 4-3 4 3 4-3 4 3 4-3 4 3 4-3 4 3 4-3 4 3 4-3 4 3 v14l-4 3-4-3-4 3-4-3-4 3-4-3-4 3-4-3-4 3-4-3-4 3-4-3-4 3-4-3-4 3-4-3-4 3-4-3z" fill={color} fillOpacity=".85" stroke="#000" strokeWidth="1.5" />
            <path d="M14 8h52M14 14h52" stroke="#000" strokeOpacity=".15" strokeWidth="2" />
        </svg>
    );
}

/** A hand-drawn circle around something (the right answer, a word to notice). */
export function ScribbleCircle({ className = 'w-32 h-16', color = '#C6F432' }: { className?: string; color?: string }) {
    return (
        <svg viewBox="0 0 120 60" preserveAspectRatio="none" className={className} aria-hidden>
            <path d="M18 14C40 2 98 4 112 22s-20 34-58 34S4 44 6 30 34 6 70 8" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
        </svg>
    );
}

/** A big check mark (correct, done). */
export function Check({ className = 'w-12 h-12', color = '#C6F432' }: { className?: string; color?: string }) {
    return <Shadowed viewBox="-2 -2 60 60" className={className} fill={color} d="M4 30l8-8 10 10L44 8l8 8-30 30z" />;
}

/** A small cloud for empty states and the sky in illustrations. */
export function Cloud({ className = 'w-24 h-14', color = '#FFFFFF' }: { className?: string; color?: string }) {
    return <Shadowed viewBox="-2 -2 104 60" className={className} fill={color} d="M22 52a16 16 0 0 1-2-32 22 22 0 0 1 40-8 16 16 0 0 1 24 12 14 14 0 0 1 0 28z" />;
}

/** A flat rainbow of solid bands (no gradient), for milestones. */
export function Rainbow({ className = 'w-28 h-16' }: { className?: string }) {
    const bands = ['#FF7BA0', '#F2C230', '#C6F432', '#3FD0C9', '#5B8DEF'];
    return (
        <svg viewBox="-2 -2 106 58" className={className} aria-hidden>
            {/* flat shadow: one thick arc covering the bands, shifted down-right */}
            <path d="M28 52a22 22 0 0 1 44 0" transform="translate(3 3)" fill="none" stroke="#000" strokeWidth="44" />
            {bands.map((c, i) => {
                const r = 44 - i * 8;
                return <path key={c} d={`M${50 - r} 52a${r} ${r} 0 0 1 ${2 * r} 0`} fill="none" stroke={c} strokeWidth="8" />;
            })}
            <path d="M2 52a48 48 0 0 1 96 0M42 52a8 8 0 0 1 16 0M2 52h8M90 52h8" fill="none" stroke="#000" strokeWidth="2.5" />
        </svg>
    );
}

/** Confetti: a handful of flat pieces (squares, circles, squiggles) for a corner. */
export function Confetti({ className = 'w-28 h-20' }: { className?: string }) {
    return (
        <svg viewBox="0 0 112 80" className={className} aria-hidden>
            <rect x="8" y="10" width="10" height="10" rx="2" fill="#F2C230" stroke="#000" strokeWidth="2" transform="rotate(-15 13 15)" />
            <circle cx="44" cy="14" r="5" fill="#FF7BA0" stroke="#000" strokeWidth="2" />
            <path d="M70 8c4 6 10 0 14 6" fill="none" stroke="#5B8DEF" strokeWidth="4" strokeLinecap="round" />
            <rect x="92" y="22" width="9" height="9" rx="2" fill="#C6F432" stroke="#000" strokeWidth="2" transform="rotate(20 96 26)" />
            <circle cx="22" cy="48" r="4" fill="#3FD0C9" stroke="#000" strokeWidth="2" />
            <path d="M48 52c4-6 10 0 14-6" fill="none" stroke="#FF8A4C" strokeWidth="4" strokeLinecap="round" />
            <rect x="80" y="56" width="10" height="10" rx="2" fill="#A98BFF" stroke="#000" strokeWidth="2" transform="rotate(-25 85 61)" />
            <path d="M12 70l4 4M30 66l-3 6" stroke="#000" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}

/** A smiley face sticker (friendly empty states, "Bạn học"). */
export function Smiley({ className = 'w-14 h-14', color = '#F2C230' }: { className?: string; color?: string }) {
    return (
        <svg viewBox="-2 -2 60 60" className={className} aria-hidden>
            <circle cx="28" cy="28" r="25" transform="translate(3 3)" fill="#000" />
            <circle cx="28" cy="28" r="25" fill={color} {...OUT} />
            <circle cx="20" cy="23" r="3.5" fill="#000" />
            <circle cx="36" cy="23" r="3.5" fill="#000" />
            <path d="M17 33c6 8 16 8 22 0" fill="none" stroke="#000" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
    );
}

/** A pencil (Viết, my sentence). */
export function Pencil({ className = 'w-16 h-16', color = '#F2C230' }: { className?: string; color?: string }) {
    return (
        <svg viewBox="-2 -2 66 66" className={className} aria-hidden>
            <g transform="rotate(-40 31 31)">
                <path d="M10 24h36l10 7-10 7H10z" transform="translate(3 3)" fill="#000" />
                <path d="M10 24h36v14H10z" fill={color} {...OUT} />
                <path d="M46 24l10 7-10 7z" fill="#F6D9B0" {...OUT} />
                <path d="M53 29l3 2-3 2z" fill="#000" />
                <path d="M4 24h8v14H4z" fill="#FF7BA0" {...OUT} />
                <path d="M10 31h36" stroke="#000" strokeOpacity=".25" strokeWidth="2" />
            </g>
        </svg>
    );
}

/** A speaker with sound waves (listening, Giọng mẫu). */
export function Speaker({ className = 'w-14 h-12', color = '#3FD0C9' }: { className?: string; color?: string }) {
    return (
        <svg viewBox="-2 -2 64 52" className={className} aria-hidden>
            <path d="M4 16h10l14-12v40L14 32H4z" transform="translate(3 3)" fill="#000" />
            <path d="M4 16h10l14-12v40L14 32H4z" fill={color} {...OUT} />
            <path d="M36 16c4 4 4 12 0 16M44 9c8 8 8 22 0 30" fill="none" stroke="#000" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
    );
}

/** A trophy cup (milestones, day 30). */
export function Trophy({ className = 'w-14 h-14', color = '#F2C230' }: { className?: string; color?: string }) {
    const cup = 'M16 4h28v16a14 14 0 0 1-28 0zM24 34h12v8h6v8H18v-8h6z';
    return (
        <svg viewBox="-2 -2 64 60" className={className} aria-hidden>
            <path d="M16 8H6c0 10 4 14 12 14M44 8h10c0 10-4 14-12 14" fill="none" stroke="#000" strokeWidth="3.5" strokeLinecap="round" />
            <path d={cup} transform="translate(3 3)" fill="#000" />
            <path d={cup} fill={color} {...OUT} />
        </svg>
    );
}

/** A small "eyes" doodle peeking over an edge (a playful touch for empty lists). */
export function PeekEyes({ className = 'w-16 h-8' }: { className?: string }) {
    return (
        <svg viewBox="0 0 64 32" className={className} aria-hidden>
            <ellipse cx="20" cy="18" rx="11" ry="12" fill="#fff" stroke="#000" strokeWidth="2.5" />
            <ellipse cx="44" cy="18" rx="11" ry="12" fill="#fff" stroke="#000" strokeWidth="2.5" />
            <circle cx="23" cy="20" r="4.5" fill="#000" />
            <circle cx="47" cy="20" r="4.5" fill="#000" />
            <path d="M2 30h60" stroke="#000" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}
