/** Each game has one hue (app/globals.css, --color-game-*); the page and the game both read it from here. */
export type GameId = 'boss' | 'grid' | 'blitz' | 'detective' | 'liar' | 'listen' | 'cloze' | 'upgrade' | 'match' | 'spell' | 'chain';

const HUE = {
    amber: 'var(--color-warning)',
    sky: 'var(--color-game-sky)',
    coral: 'var(--color-game-coral)',
    mint: 'var(--color-game-mint)',
    violet: 'var(--color-game-violet)',
    lime: 'var(--color-accent)',
} as const;

export const GAME_COLOR: Record<GameId, string> = {
    boss: 'var(--color-danger)',
    grid: HUE.sky,
    blitz: HUE.amber,
    detective: HUE.sky,
    liar: HUE.coral,
    listen: HUE.mint,
    cloze: HUE.violet,
    upgrade: HUE.amber,
    match: HUE.violet,
    spell: HUE.lime,
    chain: HUE.mint,
};

/** A soft tint of a hue over the surface, for card backgrounds. */
export const tint = (color: string, pct = 14) => `color-mix(in srgb, ${color} ${pct}%, var(--color-surface))`;
/** The hue at some strength over nothing, for borders and glows. */
export const edge = (color: string, pct = 38) => `color-mix(in srgb, ${color} ${pct}%, transparent)`;

/** Answer tiles: the four Đấu trường colours, so playing alone looks like playing in class. */
export const ANSWER_TILE = ['var(--color-arena-1)', 'var(--color-arena-2)', 'var(--color-arena-3)', 'var(--color-arena-4)'] as const;
export const ANSWER_LETTER = ['A', 'B', 'C', 'D'] as const;
