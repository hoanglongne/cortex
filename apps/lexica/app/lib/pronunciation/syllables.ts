/**
 * Syllables with stress for the speaking drill: "a·BUN·dant" from ABUNDANT
 * and /əˈbʌndənt/. The IPA gives the number of syllables and which one is
 * stressed; the spelling is cut into that many pieces by simple rules. When
 * the two disagree, the IPA is shown instead, so nothing wrong is ever
 * displayed as a fact.
 */

/** IPA vowels, longest first so diphthongs and long vowels match as one. */
const IPA_VOWELS = ['aɪə', 'aʊə', 'eɪ', 'aɪ', 'ɔɪ', 'əʊ', 'oʊ', 'aʊ', 'ɪə', 'eə', 'ʊə', 'iː', 'ɑː', 'ɔː', 'uː', 'ɜː', 'i', 'ɪ', 'e', 'æ', 'ɑ', 'ɒ', 'ɔ', 'ʊ', 'u', 'ʌ', 'ɜ', 'ə', 'ɚ', 'ɝ', 'a', 'o'];
const SYLLABIC = /[lnm]$/;

export interface IpaSyllables {
    /** Number of syllables (vowel sounds, plus a final syllabic l/n/m). */
    count: number;
    /** Index of the stressed syllable (primary stress), 0 when unmarked. */
    stress: number;
}

export function ipaSyllables(ipa: string): IpaSyllables {
    const s = ipa.replace(/[/[\]\s.ˌ]/g, '');
    let count = 0;
    let stress = -1;
    let i = 0;
    while (i < s.length) {
        if (s[i] === 'ˈ' || s[i] === "'") {
            stress = count;
            i++;
            continue;
        }
        const v = IPA_VOWELS.find((x) => s.startsWith(x, i));
        if (v) {
            count++;
            i += v.length;
        } else {
            i++;
        }
    }
    // "bl" in /ˈfiːzəbl/ or "tl" in /ˈsʌtl/: a final syllabic consonant after a consonant
    const tail = s.replace(/ˈ/g, '');
    if (SYLLABIC.test(tail) && tail.length >= 2 && !IPA_VOWELS.some((v) => tail.slice(0, -1).endsWith(v))) count++;
    return { count: Math.max(1, count), stress: stress < 0 ? 0 : Math.min(stress, Math.max(0, count - 1)) };
}

const VOWEL = /[aeiouy]/;
/** Consonant pairs that stay together when splitting. */
const DIGRAPHS = ['ch', 'sh', 'th', 'ph', 'wh', 'ck', 'qu', 'gh'];

/** Splits a written word into roughly spoken syllables. */
export function spellingSyllables(word: string): string[] {
    const w = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!w) return [];
    // Vowel groups: indexes of runs of vowels ("y" at the start is a consonant).
    const groups: [number, number][] = [];
    for (let i = 0; i < w.length; i++) {
        const isV = VOWEL.test(w[i]) && !(w[i] === 'y' && i === 0) && !(w[i] === 'u' && w[i - 1] === 'q');
        if (!isV) continue;
        const last = groups[groups.length - 1];
        if (last && last[1] === i - 1) last[1] = i;
        else groups.push([i, i]);
    }
    if (groups.length === 0) return [w];
    // A silent final "e" ("cognitive") is not a syllable; "-ble"/"-tle" is.
    const last = groups[groups.length - 1];
    if (groups.length > 1 && last[0] === w.length - 1 && w.endsWith('e') && !/[^aeiou]le$/.test(w)) groups.pop();

    const cuts: number[] = [];
    for (let g = 0; g < groups.length - 1; g++) {
        const from = groups[g][1] + 1;
        const to = groups[g + 1][0]; // consonants are w[from..to-1]
        const n = to - from;
        if (n <= 1) {
            cuts.push(from); // V|CV
            continue;
        }
        const pair = w.slice(to - 2, to);
        // keep a digraph or a consonant + l/r with the next vowel ("sub·tle", "con·tem·plate")
        if (DIGRAPHS.includes(pair) || /[bcdfgkpt][lr]/.test(pair)) cuts.push(to - 2);
        else cuts.push(to - 1); // VC|CV
    }
    const out: string[] = [];
    let start = 0;
    for (const c of cuts) {
        out.push(w.slice(start, c));
        start = c;
    }
    out.push(w.slice(start));
    return out.filter(Boolean);
}

/**
 * "a·BUN·dant". Falls back to the IPA with the stressed part marked when the
 * spelling cannot be cut into the same number of syllables.
 */
export function stressedSyllables(word: string, ipa: string | undefined): { text: string; fromIpa: boolean; count: number; stress: number } {
    const spelled = spellingSyllables(word);
    if (!ipa) return { text: spelled.join('·'), fromIpa: false, count: spelled.length, stress: 0 };
    const { count, stress } = ipaSyllables(ipa);
    if (spelled.length === count) {
        return { text: spelled.map((s, i) => (i === stress ? s.toUpperCase() : s)).join('·'), fromIpa: false, count, stress };
    }
    return { text: `/${ipa.replace(/^\/|\/$/g, '')}/`, fromIpa: true, count, stress };
}
