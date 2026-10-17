/**
 * Near-sound pairs for listening practice (HVPT: hear several voices, pick
 * the right one of two close words), built around the errors Vietnamese
 * learners make most: dropped or swapped final consonants, -s/-ed endings,
 * /θ/ heard as /t/, long and short /iː ɪ/, /tʃ dʒ ʃ/, final /ŋ/ and
 * consonant clusters (docs/LEXICA_FEEDBACK_TASKS.md T8).
 */

export type ErrorKind = 'final_consonant' | 'th' | 'cluster' | 'ending' | 'long_short' | 'ch_j' | 'final_ng';

/** Real minimal pairs per error, a few each. */
export const MINIMAL_PAIRS: Record<ErrorKind, readonly [string, string][]> = {
    final_consonant: [['light', 'lie'], ['bike', 'buy'], ['cart', 'car'], ['rice', 'rye'], ['wide', 'why'], ['rope', 'row']],
    th: [['think', 'sink'], ['three', 'tree'], ['thin', 'tin'], ['bath', 'bat'], ['thank', 'tank']],
    cluster: [['play', 'pay'], ['street', 'seat'], ['bread', 'bed'], ['glass', 'gas'], ['crowd', 'cowed']],
    ending: [['walked', 'walk'], ['plays', 'play'], ['cats', 'cat'], ['needed', 'need']],
    long_short: [['sheep', 'ship'], ['leave', 'live'], ['feet', 'fit'], ['seat', 'sit'], ['heel', 'hill']],
    ch_j: [['chip', 'ship'], ['cheap', 'sheep'], ['jeep', 'cheap'], ['watch', 'wash']],
    final_ng: [['thing', 'thin'], ['sing', 'sin'], ['wing', 'win'], ['ban', 'bang']],
};

/** Error kinds this word is exposed to, most important first. Sounds come from the IPA when there is one. */
export function errorKinds(word: string, ipa = ''): ErrorKind[] {
    const w = word.toLowerCase();
    const p = ipa.replace(/[/ˈˌ]/g, '');
    const has = (ipaTest: RegExp, spelling: RegExp) => (p ? ipaTest.test(p) : spelling.test(w));
    const out: ErrorKind[] = [];
    // a final consonant sound, not counting a syllabic l/n/m ("subtle" ends in /tl/: the /t/ is not final)
    if (has(/(tʃ|dʒ|ʤ|ʧ|[ptkbdgfvszʃʒθð])$/, /([bcdfgkpstvxz]|ck|ct|nt|nd|st|sk|ft|pt|ld|rd|rt|rk|nk)e?$/)) out.push('final_consonant');
    if (has(/[θð]/, /th/)) out.push('th');
    if (/^(str|spr|scr|spl|pl|pr|bl|br|cl|cr|gl|gr|fl|fr|tr|dr|sk|sp|st|sc)/.test(w)) out.push('cluster');
    if (/(ed|es)$/.test(w) || (/[^s]s$/.test(w) && w.length > 4)) out.push('ending');
    if (has(/iː/, /(ee|ea|ie)/)) out.push('long_short');
    if (has(/(tʃ|dʒ|ʤ|ʧ|ʃ)/, /(ch|sh|j|dge|ge$)/)) out.push('ch_j');
    if (has(/ŋ$/, /ng$/)) out.push('final_ng');
    return out;
}

/**
 * A made-up near-sound version of the word itself, by the first error that
 * applies ("abundant" → "abundan", "thorough" → "torough"). Null when no
 * rule changes the spelling.
 */
export function nearSound(word: string, ipa = ''): { kind: ErrorKind; distractor: string } | null {
    const w = word.toLowerCase();
    for (const kind of errorKinds(w, ipa)) {
        let d: string | null = null;
        switch (kind) {
            case 'final_consonant': {
                const silentE = /[^aeiou]e$/.test(w) && !/le$/.test(w);
                const base = silentE ? w.slice(0, -1) : w;
                const cut = base.replace(/(ck|ct|nt|nd|st|sk|ft|pt|ld|rd|rt|rk|nk|[bcdfgkpstvxz])$/, (m) => (m.length === 2 ? m[0] : ''));
                d = cut !== base ? cut : null;
                break;
            }
            case 'th':
                d = w.includes('th') ? w.replace('th', 't') : null;
                break;
            case 'cluster':
                d = w.replace(/^([bcdfgkpst])[lr]/, '$1').replace(/^s([ckpt])/, '$1');
                break;
            case 'ending':
                d = w.replace(/(ed|es|s)$/, '');
                break;
            case 'long_short':
                d = w.replace(/ee|ea|ie/, 'i');
                break;
            case 'ch_j':
                d = w.replace(/sh/, 's').replace(/ch/, 'sh').replace(/dge$|ge$/, 'z').replace(/^j/, 'z');
                break;
            case 'final_ng':
                d = w.replace(/ng$/, 'n');
                break;
        }
        if (d && d !== w && d.length >= 2) return { kind, distractor: d };
    }
    return null;
}

/** A real minimal pair for the word's first error kind (round 1 of the drill). */
export function pairFor(word: string, ipa = '', seed = 0): { kind: ErrorKind; pair: readonly [string, string] } {
    const kind = errorKinds(word, ipa)[0] ?? 'long_short';
    const list = MINIMAL_PAIRS[kind];
    return { kind, pair: list[Math.abs(seed) % list.length] };
}

/** The last consonant sound of a word, for the tip ("/t/"). */
function finalSound(word: string, ipa: string): string {
    const p = ipa.replace(/[/ˈˌ]/g, '');
    const m = /(tʃ|dʒ|ʤ|ʧ|[ptkbdgfvszʃʒθðlmnŋ])$/.exec(p);
    if (m) return m[1];
    const w = word.toLowerCase().replace(/e$/, '');
    return w.slice(-1);
}

/** One rule-based tip for the word's main difficulty. */
export function tipFor(word: string, ipa = '', stressed?: string): string {
    const kind = errorKinds(word, ipa)[0];
    switch (kind) {
        case 'final_consonant':
            return `Đừng nuốt âm /${finalSound(word, ipa)}/ cuối: đọc rõ rồi mới dừng.`;
        case 'th':
            return 'Âm /θ/: đặt đầu lưỡi giữa hai hàm răng rồi thổi hơi, đừng đọc thành /t/.';
        case 'cluster':
            return 'Đọc liền cụm phụ âm đầu, không chen nguyên âm vào giữa.';
        case 'ending':
            return 'Đọc rõ đuôi -s/-ed ở cuối từ.';
        case 'long_short':
            return 'Âm /iː/ kéo dài và căng môi, khác /ɪ/ ngắn.';
        case 'ch_j':
            return 'Phân biệt /ʃ/ (sh) với /s/, và /tʃ/ (ch) với /ʃ/: chu môi khi đọc.';
        case 'final_ng':
            return 'Âm /ŋ/ cuối: giữ cuống lưỡi chạm vòm, đừng thành /n/.';
        default:
            return stressed ? `Nhấn mạnh âm tiết ${stressed}.` : 'Đọc chậm, rõ từng âm tiết.';
    }
}
