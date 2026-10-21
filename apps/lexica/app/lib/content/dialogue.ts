/**
 * Dialogues as scenes (components/DialogueScene): turns revealed one at a
 * time with a voice per speaker, a few "what will they say?" guesses, and
 * role-play, where the learner says one character's lines from their
 * Vietnamese meaning. Pure, unit tested.
 */

export interface Turn {
    speaker: string;
    line: string;
    meaning: string;
}

/** "Name: what they say" → speaker and line; a line with no name keeps an empty speaker. */
export function speakerOf(raw: string): { speaker: string; line: string } {
    const m = /^([^:]{1,24}):\s*(.*)$/.exec(raw.trim());
    return m ? { speaker: m[1].trim(), line: m[2].trim() } : { speaker: '', line: raw.trim() };
}

/** The turns of a dialogue with each line's meaning (translation lines match by position). */
export function parseTurns(text: string, translation: string): Turn[] {
    const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    const meanings = translation.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    return lines.map((l, i) => {
        const { speaker, line } = speakerOf(l);
        return { speaker, line, meaning: meanings[i] ? speakerOf(meanings[i]).line : '' };
    });
}

/** The speakers in order of first appearance. */
export const speakersOf = (turns: readonly Turn[]) => [...new Set(turns.map((t) => t.speaker).filter(Boolean))];

const rand = (seed: number, i: number) => {
    const x = Math.sin(seed * 9301 + i * 49297) * 233280;
    return x - Math.floor(x);
};

/**
 * Turns before which the learner guesses what comes next: from the third
 * turn on, every other one, at most `max`. Only turns with a meaning.
 */
export function guessTurns(turns: readonly Turn[], max = 3): number[] {
    const out: number[] = [];
    for (let i = 2; i < turns.length && out.length < max; i += 2) if (turns[i].meaning) out.push(i);
    return out;
}

/** Two meanings to choose from before turn `i` is shown: its own and another line's, in an order set by `seed`. */
export function guessOptions(turns: readonly Turn[], i: number, seed: number): { options: [string, string]; answer: string } | null {
    const others = turns.map((t, k) => ({ t, k })).filter(({ t, k }) => k !== i && k !== i - 1 && t.meaning && t.meaning !== turns[i].meaning);
    if (!turns[i]?.meaning || others.length === 0) return null;
    const other = others[Math.floor(rand(seed, i) * others.length)].t.meaning;
    const answer = turns[i].meaning;
    return { options: rand(seed, i + 100) < 0.5 ? [answer, other] : [other, answer], answer };
}

const words = (s: string) =>
    s
        .toLowerCase()
        .replace(/[’']/g, "'")
        .replace(/[^a-z0-9' ]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);

/**
 * How close a spoken line is to the script: the share of the script's words
 * that were heard (in order does not matter; recognition drops small words).
 */
export function lineMatch(heard: string, script: string): { level: 'clear' | 'close' | 'unclear'; missing: string[] } {
    const want = words(script);
    const got = new Set(words(heard));
    const missing = want.filter((w) => !got.has(w));
    const share = want.length ? (want.length - missing.length) / want.length : 0;
    return { level: share >= 0.8 ? 'clear' : share >= 0.5 ? 'close' : 'unclear', missing: [...new Set(missing)] };
}
