/**
 * The quality bar of a core card, as checks a machine can run (docs/LEXICA_DECK_AND_TIERS_PLAN.md,
 * A1). Every card in the core deck must pass the hard checks; new batches are written to it.
 * Pure: no React, no data imports.
 */

export interface CheckableCard {
    id: string;
    word: string;
    ipa?: string;
    elo: number;
    level: string;
    scenario: string;
    translationHint: string;
    collocations?: string[];
    upgradeModule?: {
        simpleSentence?: string;
        targetSlot?: string;
        academicOptions?: { text?: string; nuance?: string; formalityScore?: number }[];
    };
    surgeryModule?: Record<string, { text?: string; meaning?: string; relatedWords?: { word?: string; meaning?: string }[] } | undefined>;
}

/** ELO range of each level, as the deck uses them (with the overlaps the deck has). */
export const LEVEL_ELO: Record<string, [number, number]> = {
    beginner: [800, 950],
    intermediate: [900, 1190],
    advanced: [1110, 1330],
    expert: [1300, 1490],
};

/** Forms of a word that may stand in the sentence: plural, past, -ing, -ly not included. */
export function wordForms(word: string): Set<string> {
    const w = word.trim().toLowerCase();
    const forms = new Set([w, `${w}s`, `${w}es`, `${w}ed`, `${w}d`, `${w}ing`, `${w}'s`]);
    if (w.endsWith('e')) forms.add(`${w.slice(0, -1)}ing`);
    if (w.endsWith('y')) {
        forms.add(`${w.slice(0, -1)}ies`);
        forms.add(`${w.slice(0, -1)}ied`);
    }
    // a doubled final consonant: plan → planned, planning
    const last = w.at(-1) ?? '';
    if (/[bdgklmnprt]/.test(last) && /[aeiou]/.test(w.at(-2) ?? '')) {
        forms.add(`${w}${last}ed`);
        forms.add(`${w}${last}ing`);
    }
    return forms;
}

const VI = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
const IPA_OK = /^[a-zˈˌːæɑɒɔəɜɛɪʊʌθðŋʃʒʤʧɡɹɾɐɝɚ.\-ʔ̃ɫ ()]+$/u; // "(r)": Oxford's optional r

export interface CardProblem {
    id: string;
    rule: string;
    detail: string;
}

/** Problems of one card; `seen` holds scenarios of the cards before it (duplicates). */
export function checkCard(card: CheckableCard, seen?: Set<string>): CardProblem[] {
    const out: CardProblem[] = [];
    const bad = (rule: string, detail: string) => out.push({ id: card.id, rule, detail });
    const word = card.word?.trim() ?? '';
    if (!card.id || !word) bad('fields', 'id or word missing');
    if (!card.ipa || !IPA_OK.test(card.ipa)) bad('ipa', `"${card.ipa ?? ''}"`);
    const range = LEVEL_ELO[card.level];
    if (!range) bad('level', card.level);
    else if (!(card.elo >= range[0] && card.elo <= range[1])) bad('elo', `${card.elo} outside ${card.level} ${range.join('-')}`);

    // The sentence: Vietnamese, one English word in capitals, the card's word in some form.
    const s = card.scenario ?? '';
    if (s.length < 60 || s.length > 140) bad('length', `${s.length} chars`);
    const caps = (s.match(/\b[A-Z][A-Z'-]+\b/g) ?? []).filter((t) => t.length > 3);
    const forms = wordForms(word);
    if (caps.length !== 1) bad('single_target', `${caps.length} capitalised words: ${caps.join(', ')}`);
    else if (!forms.has(caps[0].toLowerCase())) bad('target_form', `${caps[0]} is not a form of ${word}`);
    if ((s.match(new RegExp(VI.source, 'gi')) ?? []).length < 5) bad('vietnamese', 'too few Vietnamese letters');
    const key = s.toLowerCase().replace(/\s+/g, ' ').trim();
    if (seen) {
        if (seen.has(key)) bad('dup_scenario', s.slice(0, 50));
        seen.add(key);
    }

    const hint = card.translationHint?.trim() ?? '';
    if (hint.length < 2 || hint.length > 80) bad('hint', `${hint.length} chars`);

    const stem = word.toLowerCase().slice(0, Math.max(4, Math.min(word.length - 2, 6)));
    const col = card.collocations ?? [];
    if (col.length < 2) bad('collocations', `${col.length}`);
    for (const c of col) if (!c.toLowerCase().includes(stem)) bad('collocation_word', c);

    const up = card.upgradeModule;
    if (!up || !up.simpleSentence || !up.targetSlot) bad('upgrade', 'missing sentence or slot');
    else {
        if (!up.simpleSentence.includes(up.targetSlot)) bad('upgrade_slot', `"${up.targetSlot}" not in "${up.simpleSentence}"`);
        const opts = up.academicOptions ?? [];
        if (opts.length !== 3) bad('upgrade_options', `${opts.length}`);
        for (const o of opts) {
            if (!o.text || !o.nuance) bad('upgrade_option', JSON.stringify(o).slice(0, 60));
            if (!(typeof o.formalityScore === 'number' && o.formalityScore >= 1 && o.formalityScore <= 10)) bad('upgrade_formality', `${o.formalityScore}`);
        }
    }

    const parts = Object.entries(card.surgeryModule ?? {}).filter(([, p]) => p);
    if (parts.length === 0) bad('surgery', 'no word parts');
    for (const [k, p] of parts) {
        if (!p!.text || !p!.meaning) bad('surgery_part', k);
        const rel = p!.relatedWords ?? [];
        if (rel.length > 3) bad('surgery_related', `${k}: ${rel.length}`);
        for (const r of rel) if (!r.word || !r.meaning || r.word.toLowerCase() === word.toLowerCase()) bad('surgery_related_word', `${k}: ${r.word}`);
    }
    return out;
}

/** Problems of a whole deck, plus words that have more than one card. */
export function checkDeck(cards: readonly CheckableCard[]): { problems: CardProblem[]; repeatedWords: string[] } {
    const seen = new Set<string>();
    const ids = new Set<string>();
    const problems: CardProblem[] = [];
    const count = new Map<string, number>();
    for (const c of cards) {
        if (ids.has(c.id)) problems.push({ id: c.id, rule: 'dup_id', detail: c.id });
        ids.add(c.id);
        problems.push(...checkCard(c, seen));
        const w = c.word.trim().toLowerCase();
        count.set(w, (count.get(w) ?? 0) + 1);
    }
    return { problems, repeatedWords: [...count].filter(([, n]) => n > 1).map(([w]) => w) };
}
