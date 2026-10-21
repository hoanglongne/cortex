/**
 * Level 1 of pronunciation feedback (docs/LEXICA_PRONUNCIATION_DESIGN.md, 4):
 * which words of a model phrase or sentence the recognizer heard, missed or
 * heard as another word. Recognition tends to "correct" a near miss, so a
 * word another reading of the attempt has right is only "unsure", and a
 * low-confidence attempt reports missing words only. Pure, unit tested.
 */
import { editDistance, type Alternative } from './score';

export type WordStatus = 'ok' | 'missing' | 'swapped' | 'unsure';

export interface WordResult {
    /** The word as written in the model. */
    word: string;
    status: WordStatus;
    /** What the recognizer heard instead ('swapped'). */
    heard?: string;
}

export interface Alignment {
    words: WordResult[];
    /** Words said that are not in the model (fillers left out): counted, not blamed. */
    extra: number;
    level: 'clear' | 'close' | 'unclear';
}

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

/** 0–999 in words ("42" → "forty two"); other numbers stay as digits. */
export function numberWords(n: number): string {
    if (!Number.isInteger(n) || n < 0 || n > 999) return String(n);
    if (n < 20) return ONES[n];
    if (n < 100) return n % 10 ? `${TENS[Math.floor(n / 10)]} ${ONES[n % 10]}` : TENS[n / 10];
    return n % 100 ? `${ONES[Math.floor(n / 100)]} hundred ${numberWords(n % 100)}` : `${ONES[n / 100]} hundred`;
}

const CONTRACTIONS: Record<string, string> = {
    "can't": 'can not',
    cannot: 'can not',
    "won't": 'will not',
    "shan't": 'shall not',
    "let's": 'let us',
    "i'm": 'i am',
    "it's": 'it is',
    "that's": 'that is',
    "what's": 'what is',
    "there's": 'there is',
    "here's": 'here is',
    "he's": 'he is',
    "she's": 'she is',
    "who's": 'who is',
    "where's": 'where is',
    "how's": 'how is',
};
const SUFFIXES: [RegExp, string][] = [
    [/n't$/, ' not'],
    [/'re$/, ' are'],
    [/'ve$/, ' have'],
    [/'ll$/, ' will'],
    [/'d$/, ' would'],
];
const FILLERS = new Set(['uh', 'um', 'umm', 'uhm', 'er', 'erm', 'ah', 'eh', 'hmm', 'mm']);

/** Lowercase words without punctuation; numbers spelled out, contractions expanded. */
export function normalizeWords(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[’‘]/g, "'")
        .replace(/\d+/g, (d) => ` ${numberWords(Number(d))} `)
        .replace(/[^a-z' ]/g, ' ')
        .split(/\s+/)
        .map((w) => w.replace(/^'+|'+$/g, ''))
        .filter(Boolean)
        .flatMap((w) => {
            if (CONTRACTIONS[w]) return CONTRACTIONS[w].split(' ');
            for (const [re, full] of SUFFIXES) if (re.test(w)) return w.replace(re, full).split(' ');
            return [w];
        });
}

/** A crude stem, enough to pair "walked" with "walk". */
const stem = (w: string) => w.replace(/(ing|ed|es|s)$/, '');

/** Two words close enough that hearing one for the other is a swap, not a miss plus an extra. */
export function similar(a: string, b: string): boolean {
    if (a === b) return true;
    if (stem(a) === stem(b) && stem(a).length >= 3) return true;
    return editDistance(a, b) <= Math.max(1, Math.ceil(Math.max(a.length, b.length) / 3));
}

type Step = { kind: 'match' | 'sub'; i: number; j: number } | { kind: 'del'; i: number } | { kind: 'ins'; j: number };

/** Needleman–Wunsch between model words and heard words: similar words pair up as a swap; unrelated ones count as a miss plus an extra. */
function alignWords(model: string[], heard: string[]): Step[] {
    const GAP = 1;
    const cost = (a: string, b: string) => (a === b ? 0 : similar(a, b) ? 0.9 : 2.1);
    const n = model.length;
    const m = heard.length;
    const D = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j * GAP : j === 0 ? i * GAP : 0)));
    for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) D[i][j] = Math.min(D[i - 1][j - 1] + cost(model[i - 1], heard[j - 1]), D[i - 1][j] + GAP, D[i][j - 1] + GAP);
    const steps: Step[] = [];
    let i = n;
    let j = m;
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && D[i][j] === D[i - 1][j - 1] + cost(model[i - 1], heard[j - 1])) {
            steps.push({ kind: model[i - 1] === heard[j - 1] ? 'match' : 'sub', i: i - 1, j: j - 1 });
            i--;
            j--;
        } else if (i > 0 && D[i][j] === D[i - 1][j] + GAP) {
            steps.push({ kind: 'del', i: i - 1 });
            i--;
        } else {
            steps.push({ kind: 'ins', j: j - 1 });
            j--;
        }
    }
    return steps.reverse();
}

/** Per model word: heard right, missing, or heard as another word (with that word). */
function readOne(model: string[], transcript: string): { per: { ok: boolean; heard?: string }[]; extra: number } {
    const heard = normalizeWords(transcript).filter((w) => !FILLERS.has(w));
    const per: { ok: boolean; heard?: string }[] = model.map(() => ({ ok: false }));
    let extra = 0;
    for (const s of alignWords(model, heard)) {
        if (s.kind === 'match') per[s.i] = { ok: true };
        else if (s.kind === 'sub') per[s.i] = { ok: false, heard: heard[s.j] };
        else if (s.kind === 'ins') extra++;
    }
    return { per, extra };
}

/** Below this (and above 0, which means "unknown"), the attempt only reports missing words. */
export const LOW_CONFIDENCE = 0.5;

/**
 * Which words of `model` were heard. A word is 'swapped' only when no
 * reading of the attempt has it right; when only a later reading does, it
 * is 'unsure'. Model words are kept as written (case, punctuation) for display.
 */
export function alignAttempt(model: string, alternatives: readonly Alternative[]): Alignment {
    const shown = model.split(/\s+/).filter(Boolean);
    // Display words and their normalized forms ("I'm" is one shown word, two normalized).
    const owners: number[] = [];
    const norm: string[] = [];
    shown.forEach((w, k) =>
        normalizeWords(w).forEach((n) => {
            norm.push(n);
            owners.push(k);
        }),
    );
    if (alternatives.length === 0 || norm.length === 0) return { words: shown.map((word) => ({ word, status: 'missing' })), extra: 0, level: 'unclear' };

    const top = readOne(norm, alternatives[0].transcript);
    const others = alternatives.slice(1).map((a) => readOne(norm, a.transcript));
    const lowConfidence = alternatives[0].confidence > 0 && alternatives[0].confidence < LOW_CONFIDENCE;
    const perNorm = top.per.map((p, k): WordResult => {
        if (p.ok) return { word: norm[k], status: 'ok' };
        if (others.some((o) => o.per[k].ok)) return { word: norm[k], status: 'unsure' };
        if (p.heard && !lowConfidence) return { word: norm[k], status: 'swapped', heard: p.heard };
        return { word: norm[k], status: p.heard ? 'unsure' : 'missing' };
    });

    // A shown word takes the worst status of its parts.
    const rank: Record<WordStatus, number> = { ok: 0, unsure: 1, swapped: 2, missing: 3 };
    const words = shown.map((word, k): WordResult => {
        const parts = perNorm.filter((_, n) => owners[n] === k);
        const worst = parts.reduce((a, b) => (rank[b.status] > rank[a.status] ? b : a), { word, status: 'ok' as WordStatus });
        return worst.status === 'swapped' ? { word, status: 'swapped', heard: worst.heard } : { word, status: worst.status };
    });
    const ok = words.filter((w) => w.status === 'ok').length;
    const fine = ok + words.filter((w) => w.status === 'unsure').length;
    const level = ok === words.length ? 'clear' : fine / words.length >= 0.6 ? 'close' : 'unclear';
    return { words, extra: top.extra, level };
}
