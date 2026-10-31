/**
 * Nối chuỗi: each word starts with the last letter of the one before. The
 * player may use any real English word (checked against a dictionary), not
 * only the ones learnt; learnt words score more. The computer answers with a
 * common word. Pure, unit tested; the lists load in the screen.
 */
import { shuffle, type Rand } from './rounds';

export interface Dict {
    /** Every English lemma that exists (WordNet) plus the common words. */
    valid: ReadonlySet<string>;
    /** Common words, what the computer plays. */
    common: readonly string[];
}

export const MIN_LEN = 3;
export const MAX_LEN = 15;
/** Seconds to answer. */
export const TURN_SECONDS = 20;
/** Rejected words allowed before the game ends. */
export const CHANCES = 3;

const clean = (w: string) => w.trim().toLowerCase();
const lastLetter = (w: string) => w[w.length - 1];

export function makeDict(valid: string, common: string): Dict {
    const commonList = common.split(/\s+/).filter(Boolean);
    return { valid: new Set([...valid.split(/\s+/).filter(Boolean), ...commonList]), common: commonList };
}

/** Real English: in the dictionary, or a plain inflection of a word that is (plans, planned, planning, happily). */
export function isWord(word: string, dict: Dict, extra: ReadonlySet<string> = new Set()): boolean {
    const w = clean(word);
    if (!/^[a-z]+$/.test(w) || w.length < MIN_LEN || w.length > MAX_LEN) return false;
    if (dict.valid.has(w) || extra.has(w)) return true;
    const bases: string[] = [];
    if (w.endsWith('ies')) bases.push(w.slice(0, -3) + 'y');
    if (w.endsWith('es')) bases.push(w.slice(0, -2));
    if (w.endsWith('s')) bases.push(w.slice(0, -1));
    if (w.endsWith('ied')) bases.push(w.slice(0, -3) + 'y');
    if (w.endsWith('ed')) bases.push(w.slice(0, -2), w.slice(0, -1));
    if (w.endsWith('ing')) bases.push(w.slice(0, -3), w.slice(0, -3) + 'e');
    if (w.endsWith('ily')) bases.push(w.slice(0, -3) + 'y');
    if (w.endsWith('ly')) bases.push(w.slice(0, -2));
    // planned, running: the doubled consonant
    for (const b of [...bases]) if (b.length > 3 && b[b.length - 1] === b[b.length - 2]) bases.push(b.slice(0, -1));
    return bases.some((b) => b.length >= MIN_LEN && (dict.valid.has(b) || extra.has(b)));
}

export type Verdict = 'ok' | 'start' | 'used' | 'nonword' | 'rule';

/** What a word must satisfy on top of the dictionary, from a given turn on. */
export interface Limits {
    minLen: number;
    maxLen: number;
    /** A letter the word must contain. */
    has?: string;
    /** The rule that switched on at exactly this turn, to announce. */
    fresh?: string;
}

/** Turns (1-based, the player's own) at which a new condition joins; each keeps the earlier ones. */
const MILESTONES: { from: number; apply: (l: Limits, letter: string) => string }[] = [
    { from: 6, apply: (l) => ((l.minLen = 4), 'Từ phải có ít nhất 4 chữ cái') },
    { from: 10, apply: (l) => ((l.minLen = 5), 'Từ phải có ít nhất 5 chữ cái') },
    { from: 14, apply: (l) => ((l.maxLen = 8), 'Từ không dài quá 8 chữ cái') },
    { from: 18, apply: (l, letter) => ((l.has = letter), `Từ phải chứa chữ "${letter.toUpperCase()}"`) },
    { from: 22, apply: (l) => ((l.minLen = 6), 'Từ phải có ít nhất 6 chữ cái') },
    { from: 26, apply: (l) => ((l.maxLen = 7), 'Từ chỉ được 6 đến 7 chữ cái') },
];

export const RULE_LETTERS = 'rtnlsdp';

/** The conditions in force on the player's `turn`-th word. `letter` is the one required from turn 18. */
export function limitsAt(turn: number, letter = 'r'): Limits {
    const l: Limits = { minLen: MIN_LEN, maxLen: MAX_LEN };
    for (const m of MILESTONES) if (turn >= m.from) {
        const text = m.apply(l, letter);
        if (turn === m.from) l.fresh = text;
    }
    return l;
}

/** All the conditions as short lines, for the screen. */
export function describeLimits(l: Limits): string[] {
    const out: string[] = [];
    if (l.minLen > MIN_LEN) out.push(`từ ${l.minLen} chữ trở lên`);
    if (l.maxLen < MAX_LEN) out.push(`không quá ${l.maxLen} chữ`);
    if (l.has) out.push(`có chữ "${l.has.toUpperCase()}"`);
    return out;
}

export const breaks = (w: string, l: Limits): boolean => w.length < l.minLen || w.length > l.maxLen || (l.has !== undefined && !w.includes(l.has));

/** Can the player's `word` follow `prev`? */
export function check(prev: string, word: string, used: ReadonlySet<string>, dict: Dict, extra?: ReadonlySet<string>, limits?: Limits): Verdict {
    const w = clean(word);
    if (!w || w[0] !== lastLetter(clean(prev))) return 'start';
    if (used.has(w)) return 'used';
    if (limits && breaks(w, limits)) return 'rule';
    return isWord(w, dict, extra) ? 'ok' : 'nonword';
}

/** Letters few words start with: ending a word on one is a trap. */
const HARD_ENDS = new Set(['x', 'q', 'z', 'j', 'v', 'k']);

/** The computer's word: common, not used, starting right; easy ones avoid awkward last letters. Null when it has none. */
export function botReply(prev: string, used: ReadonlySet<string>, dict: Dict, rand: Rand = Math.random, hard = false): string | null {
    const start = lastLetter(clean(prev));
    const pool = dict.common.filter((w) => w[0] === start && !used.has(w) && w.length >= 4 && w.length <= 9);
    if (pool.length === 0) return null;
    const preferred = pool.filter((w) => HARD_ENDS.has(lastLetter(w)) === hard);
    return shuffle(preferred.length ? preferred : pool, rand)[0];
}

/** Points for a word: longer is worth more, and a word the learner has learnt is worth a lot more. */
export const wordScore = (word: string, learnt: boolean): number => clean(word).length * 5 + (learnt ? 15 : 0);

export const MESSAGES: Record<Exclude<Verdict, 'ok'>, string> = {
    start: 'Từ phải bắt đầu bằng chữ cuối của từ trước',
    used: 'Từ này đã dùng rồi',
    nonword: 'Không thấy từ này trong từ điển tiếng Anh',
    rule: 'Từ này chưa đúng điều kiện của lượt này',
};
