/**
 * Phones for level 2 (docs/LEXICA_PRONUNCIATION_DESIGN.md, 5.1): ARPAbet with
 * stress, as CMUdict writes it and the scoring model reads it. The app ships
 * a reduced CMUdict (public/pron/cmudict-v1.json, scripts/build-cmudict.mjs),
 * loaded when the speaking drill opens; a word it lacks falls back to the
 * card's IPA. Pure apart from `loadDict`.
 */

export const VOWELS = new Set(['AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'EH', 'ER', 'EY', 'IH', 'IY', 'OW', 'OY', 'UH', 'UW']);

/** "IY1" → "IY". */
export const bare = (phone: string) => phone.replace(/[012]$/, '');
export const isVowel = (phone: string) => VOWELS.has(bare(phone));

const IPA: Record<string, string> = {
    AA: 'ɑː',
    AE: 'æ',
    AH: 'ʌ',
    AO: 'ɔː',
    AW: 'aʊ',
    AY: 'aɪ',
    EH: 'e',
    ER: 'ɜː',
    EY: 'eɪ',
    IH: 'ɪ',
    IY: 'iː',
    OW: 'oʊ',
    OY: 'ɔɪ',
    UH: 'ʊ',
    UW: 'uː',
    B: 'b',
    CH: 'tʃ',
    D: 'd',
    DH: 'ð',
    F: 'f',
    G: 'g',
    HH: 'h',
    JH: 'dʒ',
    K: 'k',
    L: 'l',
    M: 'm',
    N: 'n',
    NG: 'ŋ',
    P: 'p',
    R: 'r',
    S: 's',
    SH: 'ʃ',
    T: 't',
    TH: 'θ',
    V: 'v',
    W: 'w',
    Y: 'j',
    Z: 'z',
    ZH: 'ʒ',
};

/** The IPA a learner reads on cards ("TH" → "θ"; unstressed AH is "ə"). */
export function ipaOf(phone: string): string {
    if (phone === 'AH0') return 'ə';
    if (phone === 'ER0') return 'ər';
    return IPA[bare(phone)] ?? bare(phone).toLowerCase();
}

/** IPA symbols to ARPAbet, longest first. */
const FROM_IPA: [string, string][] = (
    [
        ['tʃ', 'CH'],
        ['ʧ', 'CH'],
        ['dʒ', 'JH'],
        ['ʤ', 'JH'],
        ['aɪ', 'AY'],
        ['aʊ', 'AW'],
        ['eɪ', 'EY'],
        ['oʊ', 'OW'],
        ['əʊ', 'OW'],
        ['ɔɪ', 'OY'],
        ['ɪə', 'IH'],
        ['eə', 'EH'],
        ['ʊə', 'UH'],
        ['iː', 'IY'],
        ['uː', 'UW'],
        ['ɑː', 'AA'],
        ['ɔː', 'AO'],
        ['ɜː', 'ER'],
        ['ɝ', 'ER'],
        ['ɚ', 'ER'],
        ['i', 'IY'],
        ['u', 'UW'],
        ['ɪ', 'IH'],
        ['ʊ', 'UH'],
        ['e', 'EH'],
        ['ɛ', 'EH'],
        ['æ', 'AE'],
        ['ʌ', 'AH'],
        ['ə', 'AH'],
        ['ɐ', 'AH'],
        ['ɑ', 'AA'],
        ['ɒ', 'AA'],
        ['ɔ', 'AO'],
        ['a', 'AA'],
        ['o', 'OW'],
        ['θ', 'TH'],
        ['ð', 'DH'],
        ['ʃ', 'SH'],
        ['ʒ', 'ZH'],
        ['ŋ', 'NG'],
        ['ɹ', 'R'],
        ['r', 'R'],
        ['ɡ', 'G'],
        ['g', 'G'],
        ['j', 'Y'],
        ['b', 'B'],
        ['d', 'D'],
        ['f', 'F'],
        ['h', 'HH'],
        ['k', 'K'],
        ['l', 'L'],
        ['m', 'M'],
        ['n', 'N'],
        ['p', 'P'],
        ['s', 'S'],
        ['t', 'T'],
        ['v', 'V'],
        ['w', 'W'],
        ['z', 'Z'],
    ] as [string, string][]
).sort((a, b) => b[0].length - a[0].length);

/**
 * A card's IPA ("əˈbʌndənt") as ARPAbet with stress ("AH0 B AH1 N D AH0 N T").
 * The vowel after ˈ gets 1, after ˌ gets 2, others 0. Null when a symbol is unknown.
 */
export function ipaToArpabet(ipa: string): string[] | null {
    const s = ipa.replace(/[/[\]().\s]/g, '');
    const out: string[] = [];
    let stress: '0' | '1' | '2' = '0';
    let i = 0;
    while (i < s.length) {
        const c = s[i];
        if (c === 'ˈ' || c === "'") {
            stress = '1';
            i++;
            continue;
        }
        if (c === 'ˌ') {
            stress = '2';
            i++;
            continue;
        }
        if (c === 'ː' || c === '̩' || c === '̃') {
            i++;
            continue;
        }
        const hit = FROM_IPA.find(([sym]) => s.startsWith(sym, i));
        if (!hit) return null;
        const phone = hit[1];
        if (VOWELS.has(phone)) {
            out.push(phone + stress);
            stress = '0';
        } else out.push(phone);
        i += hit[0].length;
    }
    return out.length ? out : null;
}

/**
 * The phones the scoring model expects for one word. The model learned from
 * speechocean762, which marks the vowel of a one-syllable word 0, while
 * CMUdict marks it 1; feeding CMUdict's 1 there drops accuracy sharply
 * (AUC 0.92 → 0.80 on 200 test sentences). Longer words keep CMUdict's stress.
 */
export function modelPhones(phones: readonly string[]): string[] {
    const vowels = phones.filter(isVowel).length;
    return phones.map((p) => (isVowel(p) ? bare(p) + (vowels === 1 ? '0' : (/[012]$/.exec(p)?.[0] ?? '0')) : p));
}

export type Dict = Record<string, string>;

/** A word's phones from the dictionary, else from its IPA. */
export function phonesOf(dict: Dict | null, word: string, ipa?: string): string[] | null {
    const w = word.toLowerCase().replace(/[’]/g, "'").replace(/[^a-z']/g, '');
    const hit = dict?.[w];
    if (hit) return hit.split(' ');
    return ipa ? ipaToArpabet(ipa) : null;
}

export const DICT_URL = '/pron/cmudict-v1.json';
let dictPromise: Promise<Dict | null> | null = null;

/** The reduced CMUdict, fetched once; null offline. */
export function loadDict(): Promise<Dict | null> {
    if (typeof window === 'undefined') return Promise.resolve(null);
    dictPromise ??= fetch(DICT_URL)
        .then((r) => (r.ok ? (r.json() as Promise<Dict>) : null))
        .catch(() => {
            dictPromise = null;
            return null;
        });
    return dictPromise;
}
