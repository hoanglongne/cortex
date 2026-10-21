/**
 * What to tell the learner after an attempt, beyond Rõ / Gần đúng / Chưa rõ:
 * up to two sounds that may be off, each with a tip (sounds.ts). From the
 * on-device model when its pack is there (5.2), else from the word the
 * recognizer heard instead (5.3). Pure.
 */
import type { Alignment } from './align';
import { phonesOf, type Dict } from './phones';
import { issuesFromHeardWord, issuesFromScores, topIssues, type PhoneScore, type SoundIssue } from './sounds';

export interface SoundFeedback {
    issues: SoundIssue[];
    /** Where the issues come from: the model on the device, or the word heard instead. */
    source: 'model' | 'heard' | null;
}

const clean = (w: string) => w.toLowerCase().replace(/[’]/g, "'").replace(/[^a-z']/g, '');

/**
 * Sounds that may be off. `scored`: the model's phone scores per word, when
 * it ran. Otherwise each word heard as another real word (`swaps`) is
 * compared phone by phone.
 */
export function soundFeedback(opts: { dict: Dict | null; scored?: { word: string; phones: readonly string[]; scores: readonly PhoneScore[] }[] | null; swaps: { word: string; heard: string; ipa?: string }[] }): SoundFeedback {
    if (opts.scored && opts.scored.length > 0) return { issues: topIssues(issuesFromScores(opts.scored)), source: 'model' };
    const issues: SoundIssue[] = [];
    for (const s of opts.swaps) {
        const word = clean(s.word);
        const heard = clean(s.heard);
        if (!word || !heard || word === heard || heard.includes(' ')) continue;
        const target = phonesOf(opts.dict, word, s.ipa);
        // Only a real word the dictionary knows: a made-up spelling has no phones to compare.
        const said = opts.dict?.[heard] ? opts.dict[heard].split(' ') : null;
        if (target && said) issues.push(...issuesFromHeardWord(word, target, said));
    }
    const top = topIssues(issues);
    return { issues: top, source: top.length ? 'heard' : null };
}

/** The words of a phrase heard as other words, from its alignment. */
export const swapsOf = (a: Alignment) => a.words.filter((w) => w.status === 'swapped' && w.heard).map((w) => ({ word: w.word, heard: w.heard! }));
