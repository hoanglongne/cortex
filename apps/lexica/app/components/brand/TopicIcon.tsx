import type { TopicId } from '../../lib/engagement/collection';

const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/**
 * One drawn icon per topic (docs/LEXICA_DESIGN_B.md §Assets): thick rounded
 * strokes in currentColor on a 56×56 grid, to sit on the topic's colour block.
 */
export default function TopicIcon({ topic, className = 'w-12 h-12' }: { topic: TopicId; className?: string }) {
    return (
        <svg viewBox="0 0 56 56" className={className} aria-hidden>
            {topic === 'money' && (
                <>
                    <circle cx="28" cy="28" r="18" {...P} />
                    <path d="M28 17v22M22 23h9a4 4 0 0 1 0 8h-6a4 4 0 0 0 0 8h9" {...P} strokeWidth={3.5} />
                </>
            )}
            {topic === 'work' && (
                <>
                    <rect x="9" y="19" width="38" height="28" rx="5" {...P} />
                    <path d="M20 19v-4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v4M9 31h38" {...P} />
                </>
            )}
            {topic === 'love' && <path d="M28 46S8 34 8 21a10 10 0 0 1 20-3 10 10 0 0 1 20 3c0 13-20 25-20 25z" {...P} />}
            {topic === 'study' && (
                <>
                    <path d="M6 22l22-10 22 10-22 10z" {...P} />
                    <path d="M16 27v10c0 4 6 7 12 7s12-3 12-7V27M50 22v12" {...P} />
                </>
            )}
            {topic === 'social' && (
                <>
                    <path d="M10 14h36a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H26l-10 8v-8h-6a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4z" {...P} />
                    <path d="M18 27h0M28 27h0M38 27h0" {...P} strokeWidth={6} />
                </>
            )}
            {topic === 'food' && (
                <>
                    <path d="M8 27h40a20 20 0 0 1-40 0z" {...P} />
                    <path d="M21 19c0-4 4-4 4-8M31 19c0-4 4-4 4-8" {...P} strokeWidth={3.5} />
                </>
            )}
            {topic === 'people' && (
                <>
                    <circle cx="21" cy="20" r="7" {...P} />
                    <circle cx="37" cy="22" r="6" {...P} />
                    <path d="M8 46a13 13 0 0 1 26 0M32 34a11 11 0 0 1 16 10" {...P} />
                </>
            )}
            {topic === 'life' && (
                <>
                    <circle cx="28" cy="28" r="9" {...P} />
                    <path d="M28 8v5M28 43v5M8 28h5M43 28h5M14 14l4 4M38 38l4 4M42 14l-4 4M18 38l-4 4" {...P} />
                </>
            )}
        </svg>
    );
}
