/**
 * Rounds for the Lexica games (docs/LEXICA_GAMES_PLAN.md): who they are asked
 * about, what is shown, what counts as right. Pure, so every rule is tested;
 * the screens only draw them.
 */
import type { ContentCard } from '../content/pack';

export type Rand = () => number;

/** The slice of a card the games need. */
export type GameCard = Pick<ContentCard, 'id' | 'word' | 'translationHint' | 'collocations' | 'scenario' | 'ipa' | 'upgradeModule'>;

export function shuffle<T>(list: readonly T[], rand: Rand = Math.random): T[] {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const lower = (s: string) => s.trim().toLowerCase();

/** A choice question: the options are shuffled, `answer` indexes the right one. */
export interface Choice {
    cardId: string;
    /** What is asked. */
    prompt: string;
    /** Detective: clues shown one by one, weakest first. */
    clues?: string[];
    options: string[];
    answer: number;
    /** Plays the word aloud (Nghe). */
    say?: string;
}

function withOptions(right: string, wrong: readonly string[], rand: Rand): { options: string[]; answer: number } {
    const options = shuffle([right, ...wrong], rand);
    return { options, answer: options.indexOf(right) };
}

/** Other cards' words, as wrong options. */
function otherWords(card: GameCard, bank: readonly GameCard[], n: number, rand: Rand): string[] {
    return shuffle(bank.filter((c) => c.id !== card.id && lower(c.word) !== lower(card.word)), rand)
        .slice(0, n)
        .map((c) => c.word);
}

/** The scenario with the word hidden ("___"), or null when it does not contain it. */
export function maskWord(text: string | undefined, word: string): string | null {
    if (!text) return null;
    const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\w*`, 'i');
    return re.test(text) ? text.replace(re, '___') : null;
}

/** A collocation with the word hidden, or null. */
function maskedPhrase(card: GameCard): string | null {
    for (const c of card.collocations ?? []) {
        const m = maskWord(c, card.word);
        if (m) return m;
    }
    return null;
}

/** Chớp: a meaning or a phrase to fill in, four options. Needs 4+ cards in the bank. */
export function blitzRounds(cards: readonly GameCard[], bank: readonly GameCard[], n: number, rand: Rand = Math.random): Choice[] {
    const out: Choice[] = [];
    for (const card of shuffle(cards, rand)) {
        if (out.length >= n) break;
        const phrase = out.length % 2 === 1 ? maskedPhrase(card) : null;
        const wrong = otherWords(card, bank, 3, rand);
        if (wrong.length < 3) continue;
        out.push({ cardId: card.id, prompt: phrase ?? card.translationHint, ...withOptions(card.word, wrong, rand) });
    }
    return out;
}

/**
 * Thám tử từ: three clues, from the vaguest to the plainest, then the choice.
 * Clue 1 the length and first letter, 2 the situation or a phrase with the word
 * hidden, 3 the meaning. Cards without a second clue are left out.
 */
export function detectiveRounds(cards: readonly GameCard[], bank: readonly GameCard[], n: number, rand: Rand = Math.random): Choice[] {
    const out: Choice[] = [];
    for (const card of shuffle(cards, rand)) {
        if (out.length >= n) break;
        const middle = maskWord(card.scenario, card.word) ?? maskedPhrase(card);
        const wrong = otherWords(card, bank, 3, rand);
        if (!middle || wrong.length < 3) continue;
        const w = card.word.trim();
        out.push({
            cardId: card.id,
            prompt: 'Từ nào?',
            clues: [`${w.length} chữ cái, bắt đầu bằng "${w[0].toUpperCase()}"`, middle, card.translationHint],
            ...withOptions(card.word, wrong, rand),
        });
    }
    return out;
}

/** Points for a detective answer: 3, 2 or 1 by clues used; 0 when wrong. */
export function detectivePoints(cluesUsed: number, right: boolean): number {
    return right ? Math.max(1, 4 - Math.min(3, Math.max(1, cluesUsed))) : 0;
}

/**
 * Từ nói dối: four phrases, three real (the cards' own collocations), one
 * where the word is swapped for another card's. `answer` is the fake one.
 */
export function liarRounds(cards: readonly GameCard[], bank: readonly GameCard[], n: number, rand: Rand = Math.random): Choice[] {
    const withPhrase = cards.filter((c) => (c.collocations ?? []).some((p) => maskWord(p, c.word)));
    const out: Choice[] = [];
    for (const card of shuffle(withPhrase, rand)) {
        if (out.length >= n) break;
        const real = shuffle(bank.filter((c) => c.id !== card.id && (c.collocations ?? []).length > 0), rand)
            .slice(0, 3)
            .map((c) => c.collocations![0]);
        const src = (card.collocations ?? []).find((p) => maskWord(p, card.word))!;
        const realPhrases = new Set(bank.flatMap((c) => (c.collocations ?? []).map(lower)));
        const re = new RegExp(`\\b${card.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\w*`, 'i');
        // A swapped phrase that happens to be a real one is no lie: take the first that is not
        const fake = shuffle(bank, rand)
            .filter((c) => c.id !== card.id && lower(c.word) !== lower(card.word))
            .map((c) => src.replace(re, c.word.toLowerCase()))
            .find((f) => !realPhrases.has(lower(f)));
        if (real.length < 3 || !fake) continue;
        const options = shuffle([...real, fake], rand);
        out.push({ cardId: card.id, prompt: 'Cụm nào sai?', options, answer: options.indexOf(fake) });
    }
    return out;
}

/** Nghe: the word is spoken, pick it. */
export function listenRounds(cards: readonly GameCard[], bank: readonly GameCard[], n: number, rand: Rand = Math.random): Choice[] {
    const out: Choice[] = [];
    for (const card of shuffle(cards, rand)) {
        if (out.length >= n) break;
        const wrong = otherWords(card, bank, 3, rand);
        if (wrong.length < 3) continue;
        out.push({ cardId: card.id, prompt: 'Bạn nghe được từ nào?', say: card.word, ...withOptions(card.word, wrong, rand) });
    }
    return out;
}

/** Sentences of 30–180 characters from English texts, for the cloze. */
export function sentencesOf(texts: readonly string[]): string[] {
    return texts
        .flatMap((t) => t.replace(/\s+/g, ' ').match(/[^.!?]+[.!?]["”']?/g) ?? [])
        .map((x) => x.trim())
        .filter((x) => x.length >= 30 && x.length <= 180 && !/^[A-Z]:/.test(x));
}

/**
 * Điền đoạn: a real sentence from a text with one of my words blanked out,
 * four words to choose from (like a Reading gap-fill). The word may appear
 * with an ending (plans, planned). Words with no sentence are left out.
 */
export function clozeRounds(cards: readonly GameCard[], bank: readonly GameCard[], sentences: readonly string[], n: number, rand: Rand = Math.random): Choice[] {
    const out: Choice[] = [];
    for (const card of shuffle(cards, rand)) {
        if (out.length >= n) break;
        const w = card.word.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`\\b${w}(?:s|es|d|ed|ing)?\\b`, 'i');
        const hits = sentences.filter((x) => re.test(x));
        const wrong = otherWords(card, bank, 3, rand);
        if (!hits.length || wrong.length < 3) continue;
        const sentence = hits[Math.floor(rand() * hits.length)];
        out.push({ cardId: card.id, prompt: sentence.replace(re, '_____'), ...withOptions(card.word, wrong, rand) });
    }
    return out;
}

/**
 * Nâng cấp câu: a plain sentence and the phrase to replace; pick the most
 * formal of the card's three academic options. Only cards whose most formal
 * option is clear (one top score) are used.
 */
export function upgradeRounds(cards: readonly GameCard[], n: number, rand: Rand = Math.random): Choice[] {
    const out: Choice[] = [];
    for (const card of shuffle(cards, rand)) {
        if (out.length >= n) break;
        const m = card.upgradeModule;
        if (!m || m.academicOptions.length < 3) continue;
        const top = Math.max(...m.academicOptions.map((o) => o.formalityScore));
        if (m.academicOptions.filter((o) => o.formalityScore === top).length !== 1) continue;
        const right = m.academicOptions.find((o) => o.formalityScore === top)!.text;
        const options = shuffle(m.academicOptions.map((o) => o.text), rand);
        out.push({
            cardId: card.id,
            prompt: `${m.simpleSentence.replace(m.targetSlot, `[${m.targetSlot}]`)}\nCách nói trang trọng nhất cho "${m.targetSlot}"?`,
            options,
            answer: options.indexOf(right),
        });
    }
    return out;
}

/** Gõ: the meaning, the letter count and the first letter; type the word. */
export interface Spell {
    cardId: string;
    meaning: string;
    word: string;
    /** "A _ _ _ _" */
    mask: string;
}

export function spellRounds(cards: readonly GameCard[], n: number, rand: Rand = Math.random): Spell[] {
    return shuffle(cards, rand)
        .filter((c) => /^[a-z' -]+$/i.test(c.word.trim()))
        .slice(0, n)
        .map((c) => {
            const w = c.word.trim();
            return { cardId: c.id, meaning: c.translationHint, word: w, mask: [...w].map((ch, i) => (i === 0 || ch === ' ' || ch === '-' ? ch.toUpperCase() : '_')).join(' ') };
        });
}

/** Typed answer vs the word, forgiving case, spaces and one swapped neighbour pair. */
export function spellOk(typed: string, word: string): boolean {
    const a = lower(typed).replace(/\s+/g, ' ');
    const b = lower(word);
    return a === b;
}

/** Ghép: a board of pairs, word ↔ meaning. */
export interface MatchTile {
    key: string;
    pair: string;
    text: string;
    kind: 'word' | 'meaning';
}

export function matchBoard(cards: readonly GameCard[], pairs: number, rand: Rand = Math.random): MatchTile[] {
    const picked = shuffle(cards, rand).slice(0, pairs);
    return shuffle(
        picked.flatMap((c) => [
            { key: `${c.id}:w`, pair: c.id, text: c.word, kind: 'word' as const },
            { key: `${c.id}:m`, pair: c.id, text: c.translationHint, kind: 'meaning' as const },
        ]),
        rand,
    );
}

/** Nối chuỗi: the next word starts with the last letter of the one before. */
export function chainOk(prev: string, next: string): boolean {
    const p = lower(prev);
    const n = lower(next);
    return p.length > 0 && n.length > 1 && n[0] === p[p.length - 1];
}

/** Words the computer could answer with, unused and fitting, shortest first among the known. */
export function chainReplies(prev: string, words: readonly string[], used: ReadonlySet<string>): string[] {
    return words.filter((w) => !used.has(lower(w)) && chainOk(prev, w) && /^[a-z]+$/i.test(w.trim()));
}

/** One answer of a played round, for the review. */
export interface GameAnswer {
    cardId: string;
    correct: boolean;
}

/** What a finished game gives back to review: wrong words come again, right ones count once. */
export function gameReview(answers: readonly GameAnswer[], known: (id: string) => boolean): { again: string[]; recalled: string[] } {
    const wrong = new Set<string>();
    const right = new Set<string>();
    for (const a of answers) (a.correct ? right : wrong).add(a.cardId);
    return {
        again: [...wrong].filter(known),
        recalled: [...right].filter((id) => !wrong.has(id) && known(id)),
    };
}
