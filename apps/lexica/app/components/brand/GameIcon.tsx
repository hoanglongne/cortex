import type { GameId } from '../../play/theme';

const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const F = { fill: 'currentColor' } as const;

/**
 * One drawn icon per game, in the same hand as TopicIcon: thick rounded
 * strokes in currentColor on a 56×56 grid, to sit on the game's colour square.
 */
export default function GameIcon({ game, className = 'w-12 h-12' }: { game: GameId; className?: string }) {
    return (
        <svg viewBox="0 0 56 56" className={className} aria-hidden>
            {game === 'run' && (
                <>
                    <path d="M14 46V20a14 14 0 0 1 28 0v26z" {...P} />
                    <circle cx="35" cy="33" r="2.5" {...F} />
                    <path d="M8 46h40" {...P} />
                </>
            )}
            {game === 'rain' && (
                <>
                    <path d="M16 30a9 9 0 0 1 2-17.8A12 12 0 0 1 41 15a8 8 0 0 1-1 15z" {...P} />
                    <path d="M18 38l-3 7M29 38l-3 7M40 38l-3 7" {...P} />
                </>
            )}
            {game === 'boss' && (
                <>
                    <path d="M10 22l6 6 12-14 12 14 6-6-4 22H14z" {...P} />
                    <circle cx="22" cy="34" r="2.5" {...F} />
                    <circle cx="34" cy="34" r="2.5" {...F} />
                </>
            )}
            {game === 'grid' && (
                <>
                    <rect x="9" y="9" width="38" height="38" rx="6" {...P} />
                    <path d="M22 9v38M35 9v38M9 22h38M9 35h38" {...P} strokeWidth={3} />
                    <path d="M14 15l29 27" {...P} />
                </>
            )}
            {game === 'blitz' && <path d="M32 6L12 32h14l-4 18 22-28H30z" {...P} />}
            {game === 'listen' && (
                <>
                    <path d="M18 22a10 10 0 0 1 20 0c0 8-8 10-8 18a6 6 0 0 1-11 3" {...P} />
                    <path d="M44 14a18 18 0 0 1 4 10M8 24a18 18 0 0 1 4-10" {...P} />
                </>
            )}
            {game === 'spell' && (
                <>
                    <rect x="6" y="15" width="44" height="28" rx="6" {...P} />
                    <path d="M14 24h2M22 24h2M30 24h2M38 24h4M16 34h24" {...P} />
                </>
            )}
            {game === 'detective' && (
                <>
                    <circle cx="23" cy="23" r="13" {...P} />
                    <path d="M33 33l14 14" {...P} strokeWidth={5} />
                    <path d="M18 20a6 6 0 0 1 6-4" {...P} strokeWidth={3} />
                </>
            )}
            {game === 'liar' && (
                <>
                    <circle cx="24" cy="28" r="16" {...P} />
                    <path d="M38 28h12" {...P} />
                    <circle cx="19" cy="24" r="2.5" {...F} />
                    <circle cx="29" cy="24" r="2.5" {...F} />
                    <path d="M18 34c4 2 8 2 12 0" {...P} strokeWidth={3} />
                </>
            )}
            {game === 'match' && (
                <>
                    <rect x="7" y="9" width="16" height="14" rx="4" {...P} />
                    <rect x="33" y="33" width="16" height="14" rx="4" {...P} />
                    <path d="M23 16c12 0 3 24 10 24" {...P} />
                    <circle cx="15" cy="40" r="5" {...P} />
                    <circle cx="41" cy="16" r="5" {...P} />
                </>
            )}
            {game === 'chain' && (
                <>
                    <rect x="5" y="20" width="26" height="16" rx="8" {...P} />
                    <rect x="25" y="20" width="26" height="16" rx="8" {...P} />
                </>
            )}
            {game === 'dictate' && (
                <>
                    <path d="M10 46l4-12L36 12l8 8-22 22z" {...P} />
                    <path d="M31 17l8 8" {...P} />
                    <path d="M42 40h8M38 47h12" {...P} strokeWidth={3} />
                </>
            )}
            {game === 'fill' && (
                <>
                    <path d="M10 32v-4a18 18 0 0 1 36 0v4" {...P} />
                    <rect x="8" y="32" width="9" height="14" rx="4" {...P} />
                    <rect x="39" y="32" width="9" height="14" rx="4" {...P} />
                </>
            )}
            {game === 'linked' && (
                <>
                    <path d="M8 34c6-14 12-14 20 0s14 14 20 0" {...P} />
                    <circle cx="8" cy="34" r="3" {...F} />
                    <circle cx="48" cy="34" r="3" {...F} />
                </>
            )}
            {game === 'cloze' && (
                <>
                    <path d="M12 6h22l10 10v34H12z" {...P} />
                    <path d="M19 22h12M19 30h4M33 30h4M19 38h18" {...P} strokeWidth={3} />
                    <rect x="24" y="27" width="8" height="6" rx="2" {...F} />
                </>
            )}
            {game === 'upgrade' && (
                <>
                    <path d="M28 46V12M14 26l14-14 14 14" {...P} />
                    <path d="M14 46h28" {...P} />
                </>
            )}
        </svg>
    );
}
