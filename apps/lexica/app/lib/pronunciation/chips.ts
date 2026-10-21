/**
 * The row of sound chips under a word (docs/LEXICA_PRONUNCIATION_UI_PLAN.md):
 * each phone with its IPA, the letters that spell it, and a colour level
 * from the on-device model's 0–2 score. Clear, maybe unclear, or off; the
 * off and maybe ones carry the issue the detail sheet explains. Pure.
 */
import { ipaOf } from './phones';
import { spellPhones } from './graphemes';
import { classify, describe, UNCLEAR_BELOW, type PhoneScore, type SoundIssue } from './sounds';

export type ChipLevel = 'ok' | 'warn' | 'bad';

/** At or above this a phone is clear (green); between UNCLEAR_BELOW and this, "maybe" (amber). */
export const CLEAR_FROM = 1.3;

export const chipLevel = (score: number): ChipLevel => (score >= CLEAR_FROM ? 'ok' : score >= UNCLEAR_BELOW ? 'warn' : 'bad');

export interface Chip {
    phone: string;
    ipa: string;
    /** The letters spelling it; '' when none of its own or the word would not align. */
    letters: string;
    level: ChipLevel;
    /** What may be off and how to fix it, for warn and bad chips. */
    issue: SoundIssue | null;
}

/** Chips for one word scored by the model. */
export function wordChips(word: string, phones: readonly string[], scores: readonly PhoneScore[]): Chip[] {
    const letters = spellPhones(word, phones);
    return phones.map((phone, i) => {
        const s = scores[i];
        const level = s ? chipLevel(s.score) : 'warn';
        let issue: SoundIssue | null = null;
        if (level !== 'ok') {
            // The competing phone names a known swap; otherwise a final consonant scored low reads as dropped.
            const swapped = s && classify(phones, i, s.competitor, word) ? s.competitor : null;
            const final = i === phones.length - 1;
            issue = describe(word, phones, i, swapped ?? (level === 'bad' && final && classify(phones, i, null, word) ? null : phone));
        }
        return { phone, ipa: ipaOf(phone), letters: letters?.[i] ?? '', level, issue };
    });
}
