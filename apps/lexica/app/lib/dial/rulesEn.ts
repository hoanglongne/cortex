/**
 * Núm vặn N7 (issue #165), experimental and off by default: on English pages,
 * plain phrases become the academic word the learner is studying ("get rid
 * of" → eliminate). Same matcher as the Vietnamese rules (it works on any
 * letters); `vi` holds the English phrases here.
 *
 * Only phrases whose meaning is safe in base form are listed. Inflected forms
 * ("got rid of") are left alone on purpose. Not measured on real pages yet:
 * measure like round D0 (docs/LEXICA_DIAL_D0.md) before turning it on for all.
 */
import type { DialRule } from './match';

export const DIAL_RULES_EN: DialRule[] = [
    { cardId: 'v001', en: 'abundant', vi: ['plentiful'] },
    { cardId: 'v306', en: 'obtain', vi: ['get hold of'] },
    { cardId: 'v312', en: 'sufficient', vi: ['enough'], notBefore: ['good', 'big', 'old', 'long', 'fast', 'well', 'fair', 'strong', 'soon', 'early', 'late', 'often', 'far', 'sure', 'funny', 'oddly', 'interestingly', 'have had', 'had'] },
    { cardId: 'v114', en: 'fundamental', vi: ['basic'] },
    { cardId: 'v474', en: 'accurate', vi: ['precise'] },
    { cardId: 'v303', en: 'collaborate', vi: ['work together'] },
    { cardId: 'v100', en: 'comprehensive', vi: ['thorough'] },
    { cardId: 'v325', en: 'eliminate', vi: ['get rid of'] },
    { cardId: 'v328', en: 'implement', vi: ['put into practice', 'carry out'] },
    { cardId: 'v527', en: 'maintain', vi: ['keep up'], notAfter: ['with'] },
    { cardId: 'v077', en: 'relevant', vi: ['related'], onlyBefore: ['to'] },
    { cardId: 'v318', en: 'reveal', vi: ['uncover'] },
    { cardId: 'v491', en: 'utilize', vi: ['make use of'] },
    { cardId: 'v005', en: 'inevitable', vi: ['unavoidable'] },
    { cardId: 'v146', en: 'alleviate', vi: ['relieve'] },
    { cardId: 'v007', en: 'ambiguous', vi: ['unclear'] },
    { cardId: 'v011', en: 'meticulous', vi: ['very careful'] },
    { cardId: 'v130', en: 'prevalent', vi: ['widespread'] },
];
