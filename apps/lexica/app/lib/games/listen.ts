/**
 * Luyện nghe (issue #104): Nghe chép (dictation at a chosen pace), Nghe và
 * điền (fill the gaps of a short text heard once or twice) and Âm nối và âm
 * rút (what was said, in full). Pure and unit tested; the screens play the
 * voice. The voice is synthetic, so this is listening practice, not a
 * Listening test.
 */
import { shuffle, type GameCard, type Rand } from './rounds';

// ── Nghe chép ──────────────────────────────────────────────────────────

export interface DictationRound {
    cardId: string;
    word: string;
    sentence: string;
}

/** Plain English only: the voice cannot read Vietnamese, and a "Name:" label is a speaker, not words. */
const readable = (s: string) => /^[\x20-\x7E\u2018\u2019\u201C\u201D\u2013\u2014\u2026]+$/.test(s) && !/\b[A-Z][a-z]+:/.test(s);
/** A sentence cut out of a quote can start with a closing quote mark. */
const tidy = (s: string) => s.replace(/^[\u201D\u2019"'\s]+/, '').trim();

const escape = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const wordRe = (word: string) => new RegExp(`\\b${escape(word.trim())}(?:s|es|d|ed|ing)?\\b`, 'i');

/** Sentences of 30 to 110 characters that contain one of my words, one per word. */
export function dictationRounds(cards: readonly GameCard[], sentences: readonly string[], n: number, rand: Rand = Math.random): DictationRound[] {
    const out: DictationRound[] = [];
    const used = new Set<string>();
    for (const card of shuffle(cards, rand)) {
        if (out.length >= n) break;
        const re = wordRe(card.word);
        const hits = sentences.map(tidy).filter((s) => s.length >= 25 && s.length <= 110 && readable(s) && re.test(s) && !used.has(s));
        if (!hits.length) continue;
        const sentence = hits[Math.floor(rand() * hits.length)];
        used.add(sentence);
        out.push({ cardId: card.id, word: card.word.trim(), sentence });
    }
    return out;
}

/** Speeds for the same sentence, slow to fast. */
export const PACES = [0.8, 1, 1.2] as const;
export type Pace = (typeof PACES)[number];
export const PACE_LABEL: Record<Pace, string> = { 0.8: '0,8×', 1: '1×', 1.2: '1,2×' };
/** The system-voice rate behind a pace (0.9 is the normal one, see AudioService). */
export const paceRate = (p: Pace): number => Math.round(p * 0.9 * 100) / 100;

const tokens = (s: string): string[] =>
    s
        .toLowerCase()
        .replace(/[’‘]/g, "'")
        .replace(/[^a-z0-9'\s-]/g, ' ')
        .split(/\s+/)
        .map((w) => w.replace(/^['-]+|['-]+$/g, ''))
        .filter(Boolean);

export interface Checked {
    /** The sentence's words, as written in it, and whether the learner got each. */
    words: { text: string; ok: boolean }[];
    /** Words typed that are not in the sentence. */
    extra: string[];
    /** Share of the sentence's words that were heard right, 0..1. */
    accuracy: number;
}

/** Compares what was typed with the sentence word by word (longest common run, so one slip does not shift the rest). */
export function checkDictation(sentence: string, typed: string): Checked {
    const shown = sentence.replace(/\s+/g, ' ').trim().split(' ');
    const want = shown.map((w) => tokens(w).join(' '));
    const got = tokens(typed);
    // Longest common subsequence over words; empty tokens (pure punctuation) match nothing
    const a = want.length;
    const b = got.length;
    const dp = Array.from({ length: a + 1 }, () => Array<number>(b + 1).fill(0));
    for (let i = a - 1; i >= 0; i--)
        for (let j = b - 1; j >= 0; j--) dp[i][j] = want[i] && want[i] === got[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    const ok = Array<boolean>(a).fill(false);
    const used = new Set<number>();
    let i = 0;
    let j = 0;
    while (i < a && j < b) {
        if (want[i] && want[i] === got[j]) {
            ok[i] = true;
            used.add(j);
            i++;
            j++;
        } else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
        else j++;
    }
    const counted = want.filter(Boolean).length;
    const right = ok.filter(Boolean).length;
    return {
        words: shown.map((text, k) => ({ text, ok: ok[k] || !want[k] })),
        extra: got.filter((_, k) => !used.has(k)),
        accuracy: counted ? right / counted : 0,
    };
}

/** Did the learner get this word of mine (with an ending) in a checked sentence? */
export function gotWord(checked: Checked, word: string): boolean {
    const re = new RegExp(`^${escape(word.trim().toLowerCase())}(?:s|es|d|ed|ing)?$`, 'i');
    return checked.words.some((w) => w.ok && re.test(tokens(w.text).join(' ')));
}

/** Points for a dictation: accuracy, more at a faster pace, a little less for each play after the second. */
export function dictationPoints(accuracy: number, pace: Pace, plays: number): number {
    const mult = pace === 1.2 ? 1.5 : pace === 1 ? 1.25 : 1;
    return Math.max(0, Math.round(accuracy * 20 * mult) - Math.max(0, plays - 2) * 2);
}

// ── Nghe và điền ───────────────────────────────────────────────────────

export type FillPart = { text: string } | { blank: number };

export interface FillRound {
    /** The text as the voice reads it. */
    spoken: string;
    parts: FillPart[];
    /** The words that fill the blanks, in order. */
    answers: string[];
    /** Card ids behind the blanks that are my words (some blanks are plain words). */
    cardIds: (string | null)[];
}

const STOP = new Set(['because', 'through', 'another', 'between', 'without', 'something', 'everything', 'however', 'although', 'together', 'during', 'around', 'before', 'little', 'people', 'there', 'their', 'which', 'would', 'should', 'could', 'about', 'again', 'always']);

/**
 * A short text (two or three sentences, up to 260 characters) with 3 to 4
 * words hidden: my words in it first, then long plain words. `texts` are
 * passages and dialogues (a "A:" label is read as a speaker, not as a word).
 */
export function fillRounds(cards: readonly GameCard[], texts: readonly string[], n: number, rand: Rand = Math.random): FillRound[] {
    const windows: string[] = [];
    for (const t of texts) {
        const lines = t
            .split(/\n+/)
            .map((l) => l.replace(/^[A-Z]:\s*/, '').trim())
            .filter(Boolean);
        const sents = lines.flatMap((l) => l.match(/[^.!?]+[.!?]["”']?/g) ?? [l]).map(tidy);
        for (let k = 0; k < sents.length; k++) {
            let w = '';
            for (let m = k; m < Math.min(sents.length, k + 3); m++) {
                w = `${w} ${sents[m]}`.trim();
                if (w.length >= 70 && w.length <= 260 && readable(w)) windows.push(w);
            }
        }
    }
    const out: FillRound[] = [];
    const usedText = new Set<string>();
    for (const card of shuffle(cards, rand)) {
        if (out.length >= n) break;
        const re = wordRe(card.word);
        const hits = windows.filter((w) => re.test(w) && !usedText.has(w));
        if (!hits.length) continue;
        const spoken = hits[Math.floor(rand() * hits.length)];
        usedText.add(spoken);
        const round = buildFill(spoken, cards, rand);
        if (round) out.push(round);
    }
    return out;
}

function buildFill(spoken: string, cards: readonly GameCard[], rand: Rand): FillRound | null {
    const re = /[A-Za-z][A-Za-z'’-]*/g;
    const found: { start: number; end: number; word: string; cardId: string | null }[] = [];
    const lower = (s: string) => s.toLowerCase();
    for (const m of spoken.matchAll(re)) {
        const word = m[0];
        const card = cards.find((c) => wordRe(c.word).test(word) && lower(word).startsWith(lower(c.word.trim()).slice(0, Math.max(3, c.word.trim().length - 3))));
        found.push({ start: m.index!, end: m.index! + word.length, word, cardId: card?.id ?? null });
    }
    const mine = found.filter((f) => f.cardId);
    const plain = shuffle(found.filter((f) => !f.cardId && f.word.length >= 6 && !STOP.has(lower(f.word)) && !/'/.test(f.word)), rand);
    const picked = [...mine.slice(0, 3), ...plain].slice(0, 4);
    if (picked.length < 3) return null;
    picked.sort((a, b) => a.start - b.start);
    const parts: FillPart[] = [];
    let at = 0;
    picked.forEach((p, k) => {
        if (p.start > at) parts.push({ text: spoken.slice(at, p.start) });
        parts.push({ blank: k });
        at = p.end;
    });
    if (at < spoken.length) parts.push({ text: spoken.slice(at) });
    return { spoken, parts, answers: picked.map((p) => p.word), cardIds: picked.map((p) => p.cardId) };
}

/** One blank is right when it matches the word, ignoring case and spaces around it. */
export const fillOk = (typed: string, answer: string): boolean => typed.trim().toLowerCase().replace(/[’]/g, "'") === answer.toLowerCase().replace(/[’]/g, "'");

// ── Âm nối và âm rút ───────────────────────────────────────────────────

export interface LinkedItem {
    /** What the voice says. */
    said: string;
    /** What it means in full. */
    full: string;
    /** The rule in one line, shown after the answer. */
    note: string;
    /** For sound-alike pairs: the other reading that fits the sound. */
    twin?: string;
}

export const LINKED: readonly LinkedItem[] = [
    { said: "I'm gonna call her tonight.", full: 'I am going to call her tonight.', note: 'gonna = going to' },
    { said: 'Do you wanna grab lunch?', full: 'Do you want to grab lunch?', note: 'wanna = want to' },
    { said: 'I gotta go now.', full: 'I have got to go now.', note: 'gotta = have got to' },
    { said: "It's kinda cold in here.", full: 'It is kind of cold in here.', note: 'kinda = kind of' },
    { said: 'Lemme see your phone.', full: 'Let me see your phone.', note: 'lemme = let me' },
    { said: 'Gimme a minute, please.', full: 'Give me a minute, please.', note: 'gimme = give me' },
    { said: 'Whatcha doing later?', full: 'What are you doing later?', note: 'whatcha = what are you' },
    { said: 'I dunno what to say.', full: 'I do not know what to say.', note: "dunno = don't know" },
    { said: 'You shoulda told me.', full: 'You should have told me.', note: 'shoulda = should have' },
    { said: 'We coulda won that game.', full: 'We could have won that game.', note: 'coulda = could have' },
    { said: 'Howya doing today?', full: 'How are you doing today?', note: 'howya = how are you' },
    { said: "I'll see ya tomorrow.", full: 'I will see you tomorrow.', note: 'ya = you' },
    { said: "I'd like a nice cold drink.", full: "I'd like a nice cold drink.", twin: "I'd like an ice cold drink.", note: '"a nice" và "an ice" nghe gần như nhau: nối âm n sang từ sau' },
    { said: 'I met some others at the party.', full: 'I met some others at the party.', twin: 'I met some mothers at the party.', note: '"some others" nối thành âm giống "some mothers"' },
    { said: 'That was a great aim.', full: 'That was a great aim.', twin: 'That was a great name.', note: '"an aim" và "a name" là cùng một âm khi nối' },
];

export interface LinkedRound {
    said: string;
    options: string[];
    answer: number;
    note: string;
    /** The sentence with the sound-alike twin, when the item is one. */
    twin: boolean;
}

/** `n` rounds: hear the line, pick what was said in full (or which of two sound-alikes). */
export function linkedRounds(n: number, rand: Rand = Math.random): LinkedRound[] {
    const gist = LINKED.filter((i) => !i.twin);
    return shuffle(LINKED, rand)
        .slice(0, n)
        .map((item) => {
            const wrong = item.twin ? [item.twin] : shuffle(gist.filter((g) => g.full !== item.full), rand).slice(0, 2).map((g) => g.full);
            const options = shuffle([item.full, ...wrong], rand);
            return { said: item.said, options, answer: options.indexOf(item.full), note: item.note, twin: Boolean(item.twin) };
        });
}
