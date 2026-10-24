/**
 * The adaptive vocabulary test (docs/LEXICA_LEVEL_TEST_DESIGN.md).
 *
 * Every deck card is a possible question, its `elo` the difficulty. After
 * each answer the learner's level is re-estimated from all answers so far
 * (a Rasch model with a guessing floor, solved on a grid), and the next
 * question is a card near that level, rotating three kinds:
 * - meaning: the word, four Vietnamese meanings;
 * - phrase: one of its collocations with the word blanked, four words;
 * - real: "is this an English word?", sometimes about a made-up word
 *   (those are not scored; saying yes to them is reported as overclaiming).
 * "Không biết" and running out of time count as not knowing, without the
 * guessing floor. The test stops when the estimate is tight or after 30.
 * Pure functions; the page keeps the state.
 */
import type { DifficultyLevel } from '../../types/vocab';
import { ELO_CEIL, ELO_FLOOR, levelForElo } from '../levels';

export type ItemKind = 'meaning' | 'phrase' | 'real';
export type Answer = 'right' | 'wrong' | 'skip';

export interface BankCard {
    id: string;
    word: string;
    elo: number;
    level: DifficultyLevel;
    translationHint: string;
    collocations?: string[];
}

export interface Item {
    kind: ItemKind;
    /** null for a made-up word. */
    cardId: string | null;
    /** What is asked: the word, or the phrase with "___". */
    prompt: string;
    options: string[];
    answer: number;
    /** Difficulty on the ELO scale; null when the item is not scored. */
    difficulty: number | null;
    /** Chance of a right answer by guessing. */
    guess: number;
}

export interface Response {
    item: Item;
    answer: Answer;
}

export const MIN_ITEMS = 15;
export const MAX_ITEMS = 30;
/** Stop once the estimate's spread is this small. */
export const TARGET_SD = 60;
const PRIOR_SD = 250;
const GRID_LO = 650;
const GRID_HI = 1650;
const STEP = 5;

/** Chance that someone at `ability` knows an item of `difficulty`. */
export function know(ability: number, difficulty: number): number {
    return 1 / (1 + Math.pow(10, (difficulty - ability) / 400));
}

function likelihood(r: Response, ability: number): number {
    const p = know(ability, r.item.difficulty!);
    if (r.answer === 'skip') return 1 - p;
    const c = r.item.guess;
    return r.answer === 'right' ? c + (1 - c) * p : (1 - c) * (1 - p);
}

/** Mean and spread of the level given the answers (prior around `start`). */
export function estimate(responses: readonly Response[], start = 1000): { score: number; sd: number } {
    const scored = responses.filter((r) => r.item.difficulty !== null);
    let total = 0;
    let mean = 0;
    let sq = 0;
    const weights: [number, number][] = [];
    for (let a = GRID_LO; a <= GRID_HI; a += STEP) {
        let log = -((a - start) ** 2) / (2 * PRIOR_SD ** 2);
        for (const r of scored) log += Math.log(Math.max(1e-9, likelihood(r, a)));
        weights.push([a, log]);
    }
    const top = Math.max(...weights.map(([, l]) => l));
    for (const [a, l] of weights) {
        const w = Math.exp(l - top);
        total += w;
        mean += w * a;
        sq += w * a * a;
    }
    mean /= total;
    const sd = Math.sqrt(Math.max(0, sq / total - mean * mean));
    return { score: Math.round(mean), sd: Math.round(sd) };
}

export function scoredCount(responses: readonly Response[]): number {
    return responses.filter((r) => r.item.difficulty !== null).length;
}

export function isDone(responses: readonly Response[], start = 1000): boolean {
    const n = scoredCount(responses);
    if (n >= MAX_ITEMS) return true;
    return n >= MIN_ITEMS && estimate(responses, start).sd <= TARGET_SD;
}

/** Made-up words that look English: "is this a word?" checks. */
export const FAKE_WORDS = [
    'flendid', 'proctave', 'mivorous', 'scrandle', 'bluthery', 'tremulate', 'ganderly', 'plosiveness', 'cromptious', 'vintory',
    'sulberate', 'drimble', 'ostrify', 'quandish', 'perlocate', 'frostive', 'menticule', 'abrontic', 'glimper', 'reboundful',
    'carvulous', 'snerdish', 'implacent', 'wobbish', 'dextrify', 'trelling', 'obvolent', 'farcile', 'harbinate', 'clemptory',
];

const KINDS: ItemKind[] = ['meaning', 'phrase', 'meaning', 'real'];

/** The phrase with the word blanked, if the card has one that holds the word as is. */
export function blankPhrase(card: BankCard): string | null {
    const w = card.word.toLowerCase();
    for (const c of card.collocations ?? []) {
        const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (re.test(c) && c.trim().toLowerCase() !== w) return c.replace(re, '___');
    }
    return null;
}

function shuffle<T>(list: T[], rand: () => number): T[] {
    const out = [...list];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

/** Three other cards near the same difficulty, with different words and meanings. */
function distractors(card: BankCard, bank: readonly BankCard[], rand: () => number, field: 'word' | 'translationHint'): string[] {
    const seen = new Set([card[field].toLowerCase()]);
    const near = [...bank]
        .filter((c) => c.id !== card.id && !c.word.includes(' ') === !card.word.includes(' '))
        .sort((a, b) => Math.abs(a.elo - card.elo) - Math.abs(b.elo - card.elo))
        .slice(0, 24);
    const out: string[] = [];
    for (const c of shuffle(near, rand)) {
        const v = c[field];
        if (seen.has(v.toLowerCase())) continue;
        seen.add(v.toLowerCase());
        out.push(field === 'word' ? v.toLowerCase() : v);
        if (out.length === 3) break;
    }
    return out;
}

/** One question of `kind` about `card` (or a made-up word for kind "real" with no card). */
export function makeItem(kind: ItemKind, card: BankCard | null, bank: readonly BankCard[], rand: () => number, fake?: string): Item | null {
    if (kind === 'real') {
        const options = ['Có, là từ tiếng Anh', 'Không, từ bịa'];
        if (!card) return { kind, cardId: null, prompt: fake ?? FAKE_WORDS[0], options, answer: 1, difficulty: null, guess: 0.5 };
        // Recognising a word is easier than knowing its meaning.
        return { kind, cardId: card.id, prompt: card.word.toLowerCase(), options, answer: 0, difficulty: card.elo - 100, guess: 0.5 };
    }
    if (!card) return null;
    if (kind === 'meaning') {
        const wrong = distractors(card, bank, rand, 'translationHint');
        if (wrong.length < 3) return null;
        const options = shuffle([card.translationHint, ...wrong], rand);
        return { kind, cardId: card.id, prompt: card.word.toLowerCase(), options, answer: options.indexOf(card.translationHint), difficulty: card.elo, guess: 0.25 };
    }
    const phrase = blankPhrase(card);
    if (!phrase) return null;
    const wrong = distractors(card, bank, rand, 'word');
    if (wrong.length < 3) return null;
    const right = card.word.toLowerCase();
    const options = shuffle([right, ...wrong], rand);
    // Producing the word in its phrase is a little harder than recognising its meaning.
    return { kind, cardId: card.id, prompt: phrase, options, answer: options.indexOf(right), difficulty: card.elo + 50, guess: 0.25 };
}

/**
 * The next question: the kind in turn, a card near the current estimate not
 * asked yet (one of the four nearest, at random), about one in three "real"
 * slots a made-up word.
 */
export function nextItem(bank: readonly BankCard[], responses: readonly Response[], rand: () => number, start = 1000): Item | null {
    const asked = new Set(responses.map((r) => r.item.cardId).filter(Boolean));
    const fakesAsked = new Set(responses.filter((r) => r.item.cardId === null).map((r) => r.item.prompt));
    const target = estimate(responses, start).score;
    const kind = KINDS[responses.length % KINDS.length];
    if (kind === 'real' && rand() < 1 / 3) {
        const fake = FAKE_WORDS.find((w) => !fakesAsked.has(w));
        if (fake) return makeItem('real', null, bank, rand, fake);
    }
    const near = bank
        .filter((c) => !asked.has(c.id) && (kind !== 'phrase' || blankPhrase(c) !== null))
        .sort((a, b) => Math.abs(a.elo - target) - Math.abs(b.elo - target))
        .slice(0, 4);
    for (const card of shuffle(near, rand)) {
        const item = makeItem(kind, card, bank, rand);
        if (item) return item;
    }
    // No card fits this kind any more: ask the meaning of the nearest one.
    const any = bank.filter((c) => !asked.has(c.id)).sort((a, b) => Math.abs(a.elo - target) - Math.abs(b.elo - target))[0];
    return any ? makeItem('meaning', any, bank, rand) : null;
}

// ------------------------------------------------------------------ result

export interface PlacementResult {
    /** On the ELO scale, kept within the deck's range. */
    score: number;
    sd: number;
    level: DifficultyLevel;
    /** Right answers / scored questions, per kind. */
    byKind: Record<ItemKind, { right: number; total: number }>;
    /** Made-up words called real / made-up words asked. */
    fakes: { yes: number; total: number };
    questions: number;
}

export function result(responses: readonly Response[], start = 1000): PlacementResult {
    const { score, sd } = estimate(responses, start);
    const clamped = Math.min(ELO_CEIL, Math.max(ELO_FLOOR, score));
    const byKind: PlacementResult['byKind'] = { meaning: { right: 0, total: 0 }, phrase: { right: 0, total: 0 }, real: { right: 0, total: 0 } };
    const fakes = { yes: 0, total: 0 };
    for (const r of responses) {
        if (r.item.cardId === null) {
            fakes.total++;
            if (r.answer === 'wrong') fakes.yes++;
            continue;
        }
        byKind[r.item.kind].total++;
        if (r.answer === 'right') byKind[r.item.kind].right++;
    }
    return { score: clamped, sd, level: levelForElo(clamped), byKind, fakes, questions: responses.length };
}

/** IELTS band on the score scale (the level table in lib/levels.ts, one band per 200 points). */
function band(score: number): number {
    const points: [number, number][] = [
        [800, 4.5],
        [950, 5.5],
        [1150, 6.5],
        [1350, 7.5],
        [1500, 8.5],
    ];
    if (score <= points[0][0]) return points[0][1];
    for (let i = 1; i < points.length; i++) {
        const [x1, y1] = points[i];
        const [x0, y0] = points[i - 1];
        if (score <= x1) return y0 + ((score - x0) / (x1 - x0)) * (y1 - y0);
    }
    return points[points.length - 1][1];
}

const half = (x: number) => Math.round(x * 2) / 2;

/** "IELTS khoảng 6.0–6.5": a range from the score's spread, never one number. */
export function ieltsRange(score: number, sd: number): string {
    const lo = half(band(score - sd));
    const hi = Math.max(lo + 0.5, half(band(score + sd)));
    return `${lo.toFixed(1)}–${hi.toFixed(1)}`;
}

/** Rough count of English words known at a score (ước lượng). */
export function vocabSize(score: number): number {
    const points: [number, number][] = [
        [800, 1500],
        [950, 3000],
        [1150, 5000],
        [1350, 7500],
        [1500, 10000],
    ];
    if (score <= points[0][0]) return points[0][1];
    for (let i = 1; i < points.length; i++) {
        const [x1, y1] = points[i];
        const [x0, y0] = points[i - 1];
        if (score <= x1) return Math.round((y0 + ((score - x0) / (x1 - x0)) * (y1 - y0)) / 100) * 100;
    }
    return points[points.length - 1][1];
}

// ------------------------------------------------------------------ re-takes

export interface Placement {
    at: number;
    score: number;
    sd: number;
    level: DifficultyLevel;
    /** Review answers given so far when this test was taken (sum over cards). */
    reviewsAt: number;
}

export const RETAKE_DAYS = 14;
export const RETAKE_REVIEWS = 100;

/** Whether a new test may count: the first always; then 14 days and 100 reviews after the last. */
export function retake(history: readonly Placement[], reviewsNow: number, now: number): { ok: boolean; daysLeft: number; reviewsLeft: number } {
    const last = history[history.length - 1];
    if (!last) return { ok: true, daysLeft: 0, reviewsLeft: 0 };
    const daysLeft = Math.max(0, Math.ceil(RETAKE_DAYS - (now - last.at) / 86_400_000));
    const reviewsLeft = Math.max(0, RETAKE_REVIEWS - (reviewsNow - last.reviewsAt));
    return { ok: daysLeft === 0 && reviewsLeft === 0, daysLeft, reviewsLeft };
}
