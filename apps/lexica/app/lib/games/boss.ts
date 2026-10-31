/**
 * "Trùm cuối": a boss fight made of the same questions as the other games.
 * Right answers hurt the boss, quick and chained ones hurt more; wrong or late
 * ones cost a heart. Pure, unit tested; the screen only draws the state.
 */
export const HEARTS = 3;
/** Seconds to answer before the boss strikes. */
export const STRIKE_SECONDS = 15;
/** Right answers in a row that charge a critical hit. */
export const CRIT_COMBO = 3;
/** Right answers in a row that raise a shield. */
export const SHIELD_COMBO = 5;

export interface Fight {
    /** Boss life, 0–100. */
    boss: number;
    hearts: number;
    combo: number;
    best: number;
    shield: boolean;
    /** Damage of one plain hit: the boss falls to about three quarters of the questions right. */
    hit: number;
    asked: number;
    fiftyLeft: number;
}

export type Strike = 'hit' | 'crit' | 'blocked' | 'hurt' | 'late';

export function newFight(questions: number): Fight {
    return { boss: 100, hearts: HEARTS, combo: 0, best: 0, shield: false, hit: Math.ceil(100 / Math.max(3, Math.round(questions * 0.75))), asked: 0, fiftyLeft: 1 };
}

export const won = (f: Fight) => f.boss <= 0;
export const lost = (f: Fight) => f.hearts <= 0 && f.boss > 0;
export const over = (f: Fight, total: number) => won(f) || lost(f) || f.asked >= total;

/**
 * One answer. `ms` is the time taken (null when it ran out). A right answer in
 * the first third of the time adds a quarter more damage; a critical doubles it.
 */
export function answer(f: Fight, correct: boolean, ms: number | null): { fight: Fight; strike: Strike; damage: number } {
    const asked = f.asked + 1;
    if (!correct || ms === null) {
        if (f.shield) return { fight: { ...f, asked, shield: false, combo: 0 }, strike: 'blocked', damage: 0 };
        return { fight: { ...f, asked, hearts: f.hearts - 1, combo: 0 }, strike: ms === null ? 'late' : 'hurt', damage: 0 };
    }
    const combo = f.combo + 1;
    const crit = combo > 0 && combo % CRIT_COMBO === 0;
    const quick = ms <= (STRIKE_SECONDS * 1000) / 3;
    const damage = Math.round(f.hit * (quick ? 1.25 : 1) * (crit ? 2 : 1));
    return {
        fight: { ...f, asked, combo, best: Math.max(f.best, combo), boss: Math.max(0, f.boss - damage), shield: f.shield || combo % SHIELD_COMBO === 0 },
        strike: crit ? 'crit' : 'hit',
        damage,
    };
}

/** Score of a finished fight: boss life taken, hearts left, best chain, and a bonus for winning. */
export function fightScore(f: Fight): number {
    return Math.round((100 - f.boss) * 5 + f.hearts * 50 + f.best * 20 + (won(f) ? 300 : 0));
}

/** The score while the fight goes on: no hearts bonus until it is over. */
export const liveScore = (f: Fight) => Math.round((100 - f.boss) * 5 + f.best * 20);
