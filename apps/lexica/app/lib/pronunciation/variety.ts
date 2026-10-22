/**
 * Which kind of exercise each word of a speaking drill gets, so a run does
 * not repeat one method word after word. Pure, unit tested.
 *
 * Step 3 (using the word) rotates between what the card has:
 * - phrase: say one of its collocations (always possible: falls back to the word);
 * - shadow: hear a real quote with the word and say it back;
 * - translate: say the card's Vietnamese sentence in English, with the word;
 * - mine: read aloud the sentence the learner wrote with the word.
 * Step 2 (saying the word) sometimes hides the spelling until the attempt:
 * listen, then repeat.
 */
export type UseKind = 'phrase' | 'shadow' | 'translate' | 'mine';
export const USE_KINDS: readonly UseKind[] = ['phrase', 'shadow', 'translate', 'mine'];
export const USE_LABEL: Record<UseKind, string> = {
    phrase: 'Nói trong cụm',
    shadow: 'Nói theo câu thật',
    translate: 'Nói bằng tiếng Anh',
    mine: 'Đọc câu của bạn',
};

/** A quote short enough to say back in one breath. */
export const MAX_SHADOW_WORDS = 18;
export const shadowable = (text: string) => text.trim().split(/\s+/).length <= MAX_SHADOW_WORDS;

export interface CardFacts {
    hasQuote: boolean;
    hasScenario: boolean;
    hasMine: boolean;
}

/** What a card allows for step 3. */
export function allowedUseKinds(f: CardFacts): UseKind[] {
    return USE_KINDS.filter((k) => k === 'phrase' || (k === 'shadow' && f.hasQuote) || (k === 'translate' && f.hasScenario) || (k === 'mine' && f.hasMine));
}

/**
 * One kind per word: walk a shuffled order of kinds (`seed`), skipping what a
 * card cannot do and, where there is a choice, the kind the previous word got.
 */
export function planUseKinds(cards: readonly CardFacts[], seed: number): UseKind[] {
    const order = shuffled(USE_KINDS, seed);
    const out: UseKind[] = [];
    let at = 0;
    for (const facts of cards) {
        const allowed = allowedUseKinds(facts);
        let pick: UseKind = 'phrase';
        for (let i = 0; i < order.length; i++) {
            const k = order[(at + i) % order.length];
            if (allowed.includes(k) && (k !== out[out.length - 1] || allowed.length === 1)) {
                pick = k;
                at = (at + i + 1) % order.length;
                break;
            }
        }
        out.push(pick);
    }
    return out;
}

/** Every third word or so (varied by `seed`), step 2 starts by ear, without the spelling. */
export const listenFirst = (index: number, seed: number) => (index + seed) % 3 === 2;

function shuffled<T>(xs: readonly T[], seed: number): T[] {
    const a = [...xs];
    let s = seed >>> 0 || 1;
    for (let i = a.length - 1; i > 0; i--) {
        s = (s * 1664525 + 1013904223) >>> 0;
        const j = s % (i + 1);
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
