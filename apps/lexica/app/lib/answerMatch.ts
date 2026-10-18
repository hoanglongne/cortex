/**
 * Grading a typed answer in review ("Gõ từ"): exact, close, or wrong.
 *
 * Close is either a spelling slip (a small edit distance, transpositions
 * counting as one edit) or another form of the same word (ANNOY for
 * ANNOYING, HAPPINESS for HAPPY): the learner recalled the word, not the
 * exact spelling or form. Short words get no slack, since one letter there
 * makes another word (CAT/CAR).
 */

export type AnswerMatch = { kind: 'exact' } | { kind: 'close'; why: 'typo' | 'form' } | { kind: 'wrong' };

const norm = (s: string) =>
    s
        .toUpperCase()
        .replace(/[^A-Z' ]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

/** Edits allowed for a slip, by the answer's length. */
export function typoAllowance(length: number): number {
    return length <= 4 ? 0 : length <= 7 ? 1 : 2;
}

/** Optimal string alignment distance: insert, delete, substitute, swap two neighbours. */
export function editDistance(a: string, b: string): number {
    const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
            if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
        }
    }
    return d[a.length][b.length];
}

// Longest first, so ATION goes before ION and INGS before S.
const SUFFIXES = ['ATIONS', 'ATION', 'NESS', 'MENT', 'INGS', 'ABLE', 'IBLE', 'EDLY', 'ING', 'IES', 'EST', 'ION', 'ED', 'ES', 'LY', 'ER', 'S'];

/** A rough stem: one inflection or derivation off, then spelling changes it causes. */
export function stem(word: string): string {
    let s = word;
    for (const suf of SUFFIXES) {
        if (s.endsWith(suf) && s.length - suf.length >= 3) {
            s = s.slice(0, -suf.length);
            break;
        }
    }
    if (s.length > 3 && s.endsWith('E')) s = s.slice(0, -1); // HOPE / HOPING
    if (s.length > 3 && s.endsWith('I')) s = `${s.slice(0, -1)}Y`; // HAPPI(LY) / HAPPY
    if (s.length > 3 && s[s.length - 1] === s[s.length - 2] && !'AEIOULS'.includes(s[s.length - 1])) s = s.slice(0, -1); // RUNN(ING)
    return s;
}

function sameFamily(a: string, b: string): boolean {
    if (a.includes(' ') || b.includes(' ')) return false;
    const [short, long] = a.length <= b.length ? [a, b] : [b, a];
    if (short.length < 3) return false;
    // ANNOY + ING: the longer one is the shorter one plus a known suffix.
    if (long.startsWith(short) && SUFFIXES.includes(long.slice(short.length))) return true;
    return stem(a).length >= 3 && stem(a) === stem(b);
}

export function matchAnswer(typed: string, answer: string): AnswerMatch {
    const a = norm(typed);
    const b = norm(answer);
    if (!a) return { kind: 'wrong' };
    if (a === b) return { kind: 'exact' };
    if (sameFamily(a, b)) return { kind: 'close', why: 'form' };
    const allowed = typoAllowance(b.length);
    if (allowed > 0 && a.length >= 3 && editDistance(a, b) <= allowed) return { kind: 'close', why: 'typo' };
    return { kind: 'wrong' };
}

/** The answer split around what the learner got wrong: same start, the different middle, same end. */
export function answerDiff(typed: string, answer: string): { head: string; mid: string; tail: string } {
    const a = norm(typed);
    const b = norm(answer);
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    let j = 0;
    while (j < a.length - i && j < b.length - i && a[a.length - 1 - j] === b[b.length - 1 - j]) j++;
    return { head: b.slice(0, i), mid: b.slice(i, b.length - j), tail: b.slice(b.length - j) };
}
