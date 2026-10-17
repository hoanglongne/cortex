import type { UserCardProgress } from '../eloAlgorithm';
import type { VocabCardData } from '../../types/vocab';

/**
 * "Đã nhớ" has to be earned. A card only counts as known after the learner
 * answers a quick check:
 *
 * - Not peeked: right away, pick the meaning (they claim they know it).
 * - Peeked at the meaning first: the card comes back a few cards later with
 *   the word hidden, and they pick it (new words) or type it (older words).
 *
 * Pure, unit tested; the deck decides when to ask.
 */

export type CheckKind = 'meaning' | 'cloze' | 'type';

export interface RecallCheck {
    cardId: string;
    kind: CheckKind;
    /** Answer choices for 'meaning' and 'cloze'; empty for 'type'. */
    options: string[];
    answer: string;
    /** The meaning was shown before the swipe (this is the retest). */
    peeked: boolean;
    /** The learner had never seen this card before. */
    isNew: boolean;
}

/** Cards a peeked card waits before it comes back. */
export const RETEST_AFTER = 3;

type Card = Pick<VocabCardData, 'id' | 'word' | 'elo' | 'level' | 'translationHint'>;

/** Which check to give, from whether they peeked and how well they know it. */
export function checkKind(progress: UserCardProgress | undefined, peeked: boolean): CheckKind {
    if (!peeked) return 'meaning';
    if (!progress || progress.state === 'seed') return 'cloze';
    return 'type';
}

export function buildCheck(input: {
    card: Card;
    progress: UserCardProgress | undefined;
    pool: readonly Card[];
    peeked: boolean;
    rand?: () => number;
}): RecallCheck {
    const { card, progress, pool, peeked, rand = Math.random } = input;
    const kind = checkKind(progress, peeked);
    const isNew = !progress;
    const base = { cardId: card.id, kind, peeked, isNew };

    if (kind === 'type') return { ...base, options: [], answer: card.word };

    // Claiming an unseen word, or a well-known one, gets one more choice.
    const strong = kind === 'meaning' && (isNew || progress?.state === 'gold' || progress?.state === 'mastered');
    const count = strong ? 4 : 3;
    const field = kind === 'meaning' ? 'translationHint' : 'word';
    const answer = card[field];
    const distractors = pickDistractors(card, pool, field, count - 1, rand);
    return { ...base, options: shuffle([answer, ...distractors], rand), answer };
}

/** Plausible wrong answers: same level first, then the closest difficulty. */
export function pickDistractors(
    card: Card,
    pool: readonly Card[],
    field: 'translationHint' | 'word',
    n: number,
    rand: () => number = Math.random,
): string[] {
    const seen = new Set([norm(card[field])]);
    const candidates = pool
        .filter((c) => c.id !== card.id && c[field])
        .sort((a, b) => Number(b.level === card.level) - Number(a.level === card.level) || Math.abs(a.elo - card.elo) - Math.abs(b.elo - card.elo));
    const near = shuffle(candidates.slice(0, Math.max(n * 4, 12)), rand);
    const out: string[] = [];
    for (const c of [...near, ...candidates]) {
        const value = c[field];
        if (seen.has(norm(value))) continue;
        seen.add(norm(value));
        out.push(value);
        if (out.length === n) break;
    }
    return out;
}

/** The scenario with the target word hidden. */
export function blankWord(text: string, word: string): string {
    if (!word) return text;
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(escaped, 'gi'), '_____');
}

/** Typed answers forgive case, spacing and one typo in longer words. */
export function matchesTyped(input: string, word: string): boolean {
    const a = letters(input);
    const b = letters(word);
    if (!a) return false;
    if (a === b) return true;
    return b.length >= 6 && editDistance(a, b) <= 1;
}

/** A meaning cut at its first comma: "dồi dào, phong phú" → "dồi dào". */
export function shortMeaning(text: string): string {
    const head = text.split(',')[0].trim();
    return head || text.trim();
}

/**
 * One-line labels for meaning options. An option keeps its full text when
 * shortening would make it look like another option.
 */
export function optionLabels(options: readonly string[]): string[] {
    const short = options.map(shortMeaning);
    return options.map((option, i) =>
        short.some((s, j) => j !== i && norm(s) === norm(short[i])) ? option : short[i],
    );
}

/** "f _ _ _ _ _" for FRUGAL. */
export function typeHint(word: string): string {
    const w = word.toLowerCase();
    return [w[0], ...Array.from({ length: Math.max(0, w.length - 1) }, () => '_')].join(' ');
}

const norm = (s: string) => s.trim().toLowerCase();
const letters = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');

function shuffle<T>(items: readonly T[], rand: () => number): T[] {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

function editDistance(a: string, b: string): number {
    const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
        let diag = prev[0];
        prev[0] = i;
        for (let j = 1; j <= b.length; j++) {
            const tmp = prev[j];
            prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
            diag = tmp;
        }
    }
    return prev[b.length];
}
