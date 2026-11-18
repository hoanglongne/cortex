/**
 * A word split into its sounds with the letters that spell each (issue #157,
 * docs/LEXICA_MOUTH_GUIDE_PLAN.md M6), so the learner can tap a letter and
 * see that sound's mouth. Uses the dictionary phones and the letter
 * alignment that the sound chips already use.
 */
import { spellPhones } from './graphemes';
import { bare, ipaOf } from './phones';

export interface WordSound {
    /** Letters spelling this sound ('' when none of its own, like the y-sound in "cute"). */
    letters: string;
    /** ARPAbet without stress. */
    phone: string;
    ipa: string;
}

/** The sounds of `word` in order, or null when the letters cannot be lined up. */
export function wordSounds(word: string, phones: readonly string[] | null): WordSound[] | null {
    if (!phones?.length) return null;
    const spelled = spellPhones(word, phones);
    if (!spelled) return null;
    return phones.map((p, i) => ({ letters: spelled[i], phone: bare(p), ipa: ipaOf(p) }));
}
