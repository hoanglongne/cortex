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
    /** Detective: the options each clue rules out (indexes into `options`), clue by clue. */
    cuts?: number[][];
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

/**
 * Wrong options that look like the right word: the same first letter and about
 * the same length first, then relaxing. The "N letters, starts with X" clue
 * rules nothing out when the options are shaped alike (it did when they were
 * drawn from the whole bank).
 */
export function lookalikes(card: GameCard, bank: readonly GameCard[], n: number, rand: Rand = Math.random): string[] {
    const word = card.word.trim();
    const first = word[0]?.toLowerCase();
    const tiers: string[][] = [[], [], [], []];
    for (const c of bank) {
        const w = c.word.trim();
        if (c.id === card.id || lower(w) === lower(word) || !/^[a-z' -]+$/i.test(w)) continue;
        const sameFirst = w[0]?.toLowerCase() === first;
        const closeLen = Math.abs(w.length - word.length) <= 1;
        tiers[(sameFirst ? 0 : 2) + (closeLen ? 0 : 1)].push(c.word);
    }
    return tiers.flatMap((t) => shuffle(t, rand)).slice(0, n);
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

/** One clue about a word, and whether another word fits it (the ones that do not are "ruled out"). */
interface Trait {
    text: string;
    fits: (other: GameCard) => boolean;
}

const wordOf = (c: GameCard) => c.word.trim().toLowerCase();
const hasDouble = (w: string) => /(.)\1/.test(w);

/** What can be said about the card's word without naming it, weakest clue first. Every one is exact. */
function traits(card: GameCard): Trait[] {
    const w = wordOf(card);
    const out: Trait[] = [
        { text: `${w.length} chữ cái`, fits: (o) => wordOf(o).length === w.length },
        { text: `Bắt đầu bằng chữ "${w[0].toUpperCase()}"`, fits: (o) => wordOf(o)[0] === w[0] },
        { text: `Kết thúc bằng chữ "${w[w.length - 1].toUpperCase()}"`, fits: (o) => wordOf(o).endsWith(w[w.length - 1]) },
    ];
    if (hasDouble(w)) out.push({ text: 'Có hai chữ cái giống nhau đứng liền nhau', fits: (o) => hasDouble(wordOf(o)) });
    const rare = [...'qxzjkvwy'].find((ch) => w.includes(ch));
    if (rare) out.push({ text: `Có chữ "${rare.toUpperCase()}" trong từ`, fits: (o) => wordOf(o).includes(rare) });
    // Hay đi với: the partner word of a collocation, never the word itself
    const partner = (card.collocations ?? []).map((p) => p.toLowerCase().split(/\s+/).filter((x) => x && !x.startsWith(w.slice(0, Math.max(3, w.length - 3))))).find((p) => p.length > 0);
    if (partner) out.push({ text: `Hay đi cùng "${partner.join(' ')}"`, fits: (o) => (o.collocations ?? []).some((p) => p.toLowerCase().includes(partner.join(' '))) });
    if (card.ipa) out.push({ text: `Đọc là /${card.ipa.replace(/^\/|\/$/g, '')}/`, fits: (o) => o.ipa === card.ipa });
    out.push({ text: `Nghĩa: ${card.translationHint}`, fits: (o) => o.translationHint === card.translationHint });
    return out;
}

/**
 * Thám tử từ: a lineup of four suspects and clues about the word, one at a
 * time, each ruling some of the others out ("Bắt đầu bằng chữ B": the ones
 * that do not are struck). Fewer clues, more points. Only clues that rule at
 * least one option out are kept, so none is wasted; the meaning always closes
 * the case. No sentence with a blank (that is Điền đoạn) and no clue that fits
 * every option.
 */
export function detectiveRounds(cards: readonly GameCard[], bank: readonly GameCard[], n: number, rand: Rand = Math.random): Choice[] {
    const out: Choice[] = [];
    for (const card of shuffle(cards, rand)) {
        if (out.length >= n) break;
        if (!/^[a-z]+$/i.test(card.word.trim())) continue;
        const wrong = otherWords(card, bank, 3, rand);
        if (wrong.length < 3) continue;
        const { options, answer } = withOptions(card.word, wrong, rand);
        const others = options.map((o, i) => ({ i, card: bank.find((c) => c.word === o) })).filter((x) => x.i !== answer && x.card) as { i: number; card: GameCard }[];
        if (others.length < 3) continue;
        const useful = traits(card)
            .map((t) => ({ text: t.text, cut: others.filter((o) => !t.fits(o.card)).map((o) => o.i) }))
            .filter((t) => t.cut.length > 0);
        // The meaning closes the case; at least one clue before it
        if (useful.length < 2) continue;
        out.push({ cardId: card.id, prompt: 'Ai là thủ phạm?', clues: useful.map((t) => t.text), cuts: useful.map((t) => t.cut), options, answer });
    }
    return out;
}

/** The options ruled out once `shown` clues are open. */
export function ruledOut(cuts: readonly number[][] | undefined, shown: number): Set<number> {
    return new Set((cuts ?? []).slice(0, shown).flat());
}

/** Points for a detective answer: 3 with the first clue, down to 1 with all of them; 0 when wrong. */
export function detectivePoints(cluesUsed: number, right: boolean, totalClues = 3): number {
    if (!right) return 0;
    const f = totalClues <= 1 ? 0 : (Math.min(totalClues, Math.max(1, cluesUsed)) - 1) / (totalClues - 1);
    return Math.max(1, Math.round(3 - 2 * f));
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

/** What a boss question looks like, so the screen knows how to show it. */
export type BossMode = 'blitz' | 'detective' | 'liar' | 'cloze' | 'upgrade';
export type BossRound = Choice & { mode: BossMode };

/**
 * Twelve questions in three phases, each harder than the last: meanings, then
 * clues or the liar, then sentences from texts and upgrades. A phase that has
 * no questions to give is filled with meanings.
 */
export function bossRounds(cards: readonly GameCard[], bank: readonly GameCard[], sentences: readonly string[], rand: Rand = Math.random): BossRound[] {
    const tag = (rs: Choice[], mode: BossMode): BossRound[] => rs.map((r) => ({ ...r, mode }));
    const phase1 = tag(blitzRounds(cards, bank, 4, rand), 'blitz');
    let phase2 = tag(detectiveRounds(cards, bank, 2, rand), 'detective').concat(tag(liarRounds(cards, bank, 2, rand), 'liar'));
    let phase3 = tag(clozeRounds(cards, bank, sentences, 2, rand), 'cloze').concat(tag(upgradeRounds(cards, 2, rand), 'upgrade'));
    const used = new Set([...phase1, ...phase2, ...phase3].map((r) => r.cardId));
    const spare = tag(blitzRounds(cards.filter((c) => !used.has(c.id)), bank, 8, rand), 'blitz');
    if (phase2.length < 4) phase2 = phase2.concat(spare.splice(0, 4 - phase2.length));
    if (phase3.length < 4) phase3 = phase3.concat(spare.splice(0, 4 - phase3.length));
    return [...phase1, ...shuffle(phase2, rand), ...shuffle(phase3, rand)];
}

/** `n` mixed questions for a room: "easy" leans on meanings and clues, "hard" on sentences and the liar. */
export function mixedRounds(level: 'easy' | 'hard', cards: readonly GameCard[], bank: readonly GameCard[], sentences: readonly string[], n: number, rand: Rand = Math.random): BossRound[] {
    const tag = (rs: Choice[], mode: BossMode): BossRound[] => rs.map((r) => ({ ...r, mode }));
    const pools: BossRound[][] =
        level === 'easy'
            ? [tag(blitzRounds(cards, bank, n, rand), 'blitz'), tag(detectiveRounds(cards, bank, 2, rand), 'detective'), tag(liarRounds(cards, bank, 1, rand), 'liar')]
            : [tag(clozeRounds(cards, bank, sentences, 2, rand), 'cloze'), tag(upgradeRounds(cards, 1, rand), 'upgrade'), tag(liarRounds(cards, bank, 2, rand), 'liar'), tag(detectiveRounds(cards, bank, 1, rand), 'detective')];
    const seen = new Set<string>();
    const picked: BossRound[] = [];
    for (const r of shuffle(pools.flat(), rand)) {
        if (picked.length >= n) break;
        if (seen.has(r.cardId)) continue;
        seen.add(r.cardId);
        picked.push(r);
    }
    if (picked.length < n) {
        for (const r of tag(blitzRounds(cards.filter((c) => !seen.has(c.id)), bank, n - picked.length, rand), 'blitz')) picked.push(r);
    }
    return picked.slice(0, n);
}
