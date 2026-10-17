import type { ContentCard } from '../content/pack';

/**
 * "Câu của bạn": at the end of a session the learner may tie one word they
 * just remembered to their own life, by picking the sentence that fits them
 * best or writing one in Vietnamese with the word. It is never asked mid-flow,
 * never graded, and backs off when skipped (docs/LEXICA_CONTENT_PLAN.md, A).
 */

export interface MySentence {
    text: string;
    kind: 'picked' | 'written';
    at: number;
}

export interface MySentencePrompt {
    /** Turned off in Tôi. */
    off: boolean;
    /** "Để sau" taps in a row. */
    skips: number;
    /** No offer before this time (ms). */
    snoozeUntil: number;
}

export const DEFAULT_PROMPT: MySentencePrompt = { off: false, skips: 0, snoozeUntil: 0 };

/** Two skips in a row → no offer for this long. */
export const SNOOZE_MS = 3 * 24 * 60 * 60 * 1000;
const SKIPS_BEFORE_SNOOZE = 2;

export const MIN_WRITTEN = 8;
export const MAX_WRITTEN = 160;

/** Highlight and cloze find the word as a case-insensitive substring. */
const hasWord = (text: string, word: string) => text.toLowerCase().includes(word.toLowerCase());

export function canOffer(prompt: MySentencePrompt, now = Date.now()): boolean {
    return !prompt.off && now >= prompt.snoozeUntil;
}

export function afterSkip(prompt: MySentencePrompt, now = Date.now()): MySentencePrompt {
    const skips = prompt.skips + 1;
    return skips >= SKIPS_BEFORE_SNOOZE ? { ...prompt, skips: 0, snoozeUntil: now + SNOOZE_MS } : { ...prompt, skips };
}

export function afterSave(prompt: MySentencePrompt): MySentencePrompt {
    return { ...prompt, skips: 0 };
}

/** The card's distinct sentences that still contain the word: its own one first, then archetype ones. */
export function sentenceOptions(card: ContentCard): string[] {
    const all = [card.scenario, card.scenarios?.casual, card.scenarios?.tech, card.scenarios?.business, card.scenarios?.student];
    const out: string[] = [];
    for (const s of all) {
        if (s && hasWord(s, card.word) && !out.includes(s)) out.push(s);
    }
    return out.slice(0, 4);
}

/**
 * The word to offer: the latest one remembered this session that has no
 * sentence of the learner's yet. Words with several sentences to pick from
 * come first, since picking needs no typing.
 */
export function pickCandidate(
    remembered: readonly string[],
    mine: Readonly<Record<string, MySentence>>,
    getCard: (id: string) => ContentCard | undefined,
): string | null {
    const open = [...remembered].reverse().filter(id => !mine[id] && getCard(id));
    return open.find(id => sentenceOptions(getCard(id)!).length >= 2) ?? open[0] ?? null;
}

export type WrittenCheck = { ok: true; text: string } | { ok: false; reason: 'no_word' | 'too_short' | 'too_long' };

/** The only rules on a written sentence: it has the word and a few words around it. */
export function checkWritten(input: string, word: string): WrittenCheck {
    const text = input.replace(/\s+/g, ' ').trim();
    if (!hasWord(text, word)) return { ok: false, reason: 'no_word' };
    const rest = text.toLowerCase().replace(word.toLowerCase(), '').replace(/[^\p{L}]/gu, '');
    if (text.length < MIN_WRITTEN || rest.length < 3) return { ok: false, reason: 'too_short' };
    if (text.length > MAX_WRITTEN) return { ok: false, reason: 'too_long' };
    return { ok: true, text };
}

/** Adds the word (in capitals, like the app's sentences) at the end of what was typed. */
export function insertWord(text: string, word: string): string {
    const t = text.replace(/\s+$/, '');
    return `${t}${t ? ' ' : ''}${word.toUpperCase()} `;
}

/** The learner's sentence when it still has the word, else the given one. */
export function displaySentence(card: Pick<ContentCard, 'word'>, mine: MySentence | undefined, fallback: string): { text: string; mine: boolean } {
    return mine && hasWord(mine.text, card.word) ? { text: mine.text, mine: true } : { text: fallback, mine: false };
}
