/**
 * Núm vặn (docs/LEXICA_WOW_PLAN.md §2.3), layer 1: find Vietnamese phrases in
 * a text that a vetted rule maps to an English card word. Runs on device, no
 * network. Pure and dependency-free so scripts can run it with plain Node.
 *
 * Matching works on syllables. Each syllable is reduced to a key that is
 * lower-case, NFC, with the tone mark moved to the end, so "hoà" and "hòa"
 * (old and new tone placement) give the same key.
 */

export interface DialRule {
    /** Card id, e.g. "v004". */
    cardId: string;
    /** The English word shown in place of the phrase, in base form. */
    en: string;
    /** Vietnamese phrases that certainly mean this word. */
    vi: string[];
    /** Skip a match when one of these phrases ends right before it. */
    notBefore?: string[];
    /** Skip a match when one of these phrases starts right after it. */
    notAfter?: string[];
    /** For ambiguous phrases: match only right after one of these phrases. */
    onlyAfter?: string[];
}

export interface DialHit {
    cardId: string;
    en: string;
    /** The matched text exactly as written in the source. */
    vi: string;
    /** Character offsets into the source text. */
    start: number;
    end: number;
}

interface Token {
    key: string;
    start: number;
    end: number;
    capital: boolean;
}

const TONE = /[̣̀́̃̉]/g;

/** Canonical key of one syllable: lower case, tone mark last. */
export function syllableKey(s: string): string {
    const d = s.normalize('NFD').toLowerCase();
    const tones = d.match(TONE) ?? [];
    const base = d.replace(TONE, '').normalize('NFC');
    return base + (tones[0] ?? '');
}

const WORD = /\p{L}+/gu;

export function tokenize(text: string): Token[] {
    const out: Token[] = [];
    for (const m of text.matchAll(WORD)) {
        const raw = m[0];
        out.push({
            key: syllableKey(raw),
            start: m.index ?? 0,
            end: (m.index ?? 0) + raw.length,
            capital: raw[0] !== raw[0].toLowerCase(),
        });
    }
    return out;
}

const keys = (phrase: string) => phrase.split(/\s+/).filter(Boolean).map(syllableKey);

interface Compiled {
    rule: DialRule;
    phrase: string[];
    notBefore: string[][];
    notAfter: string[][];
    onlyAfter: string[][] | null;
}

export interface DialIndex {
    byFirst: Map<string, Compiled[]>;
}

export function compileRules(rules: DialRule[]): DialIndex {
    const byFirst = new Map<string, Compiled[]>();
    for (const rule of rules) {
        for (const v of rule.vi) {
            const c: Compiled = {
                rule,
                phrase: keys(v),
                notBefore: (rule.notBefore ?? []).map(keys),
                notAfter: (rule.notAfter ?? []).map(keys),
                onlyAfter: rule.onlyAfter ? rule.onlyAfter.map(keys) : null,
            };
            const list = byFirst.get(c.phrase[0]) ?? [];
            list.push(c);
            byFirst.set(c.phrase[0], list);
        }
    }
    // Longest phrase first, so "không thể tránh khỏi" wins over shorter ones.
    for (const list of byFirst.values()) list.sort((a, b) => b.phrase.length - a.phrase.length);
    return { byFirst };
}

function seqAt(tokens: Token[], at: number, seq: string[]): boolean {
    if (at < 0 || at + seq.length > tokens.length) return false;
    return seq.every((k, i) => tokens[at + i].key === k);
}

/** True when a token starts a sentence (nothing before it but punctuation ending a sentence). */
function sentenceStart(text: string, tokens: Token[], i: number): boolean {
    if (i === 0) return true;
    const gap = text.slice(tokens[i - 1].end, tokens[i].start);
    return /[.!?:…\n"“”]/.test(gap);
}

/** Tokens i..j-1 must not be split by punctuation (a phrase never crosses a comma). */
function contiguous(text: string, tokens: Token[], i: number, n: number): boolean {
    for (let k = i; k < i + n - 1; k++) {
        if (!/^\s+$/.test(text.slice(tokens[k].end, tokens[k + 1].start))) return false;
    }
    return true;
}

export function findHits(text: string, index: DialIndex): DialHit[] {
    const src = text.normalize('NFC');
    const tokens = tokenize(src);
    const hits: DialHit[] = [];
    let i = 0;
    while (i < tokens.length) {
        const cands = index.byFirst.get(tokens[i].key);
        let taken = 0;
        if (cands) {
            for (const c of cands) {
                const n = c.phrase.length;
                if (!seqAt(tokens, i, c.phrase) || !contiguous(src, tokens, i, n)) continue;
                // A capital letter mid-sentence means a proper name ("Bộ Tài chính").
                if (tokens[i].capital && !sentenceStart(src, tokens, i)) continue;
                if (c.notBefore.some((p) => seqAt(tokens, i - p.length, p))) continue;
                if (c.notAfter.some((p) => seqAt(tokens, i + n, p))) continue;
                if (c.onlyAfter && !c.onlyAfter.some((p) => seqAt(tokens, i - p.length, p))) continue;
                hits.push({
                    cardId: c.rule.cardId,
                    en: c.rule.en,
                    vi: src.slice(tokens[i].start, tokens[i + n - 1].end),
                    start: tokens[i].start,
                    end: tokens[i + n - 1].end,
                });
                taken = n;
                break;
            }
        }
        i += taken || 1;
    }
    return hits;
}
