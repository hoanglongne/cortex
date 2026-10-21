/**
 * Which sound may be off, and how to fix it (docs/LEXICA_PRONUNCIATION_DESIGN.md,
 * 5.2–5.4). A phone of the model word is either replaced by another phone or
 * dropped; `classify` maps that to the errors Vietnamese learners make most,
 * each with a short tip and a minimal pair. Two sources feed it:
 *  - the on-device model: phones scoring low, with the competing phone it heard;
 *  - without the model: the word the recognizer heard instead, phone by phone.
 * At most two sounds per attempt, known errors first. Pure, unit tested.
 */
import { MINIMAL_PAIRS, type ErrorKind } from './pairs';
import { bare, ipaOf, isVowel } from './phones';

export const SOUND_LABEL: Record<ErrorKind, string> = {
    final_consonant: 'Mất phụ âm cuối',
    final_voicing: 'Phụ âm cuối',
    th: 'Âm /θ ð/ (th)',
    cluster: 'Cụm phụ âm',
    ending: 'Đuôi -s, -ed',
    long_short: 'Nguyên âm dài, ngắn',
    ch_j: 'Âm /ʃ tʃ dʒ/',
    final_ng: 'Âm /ŋ/ cuối',
    final_l: 'Âm /l/ cuối, /r/',
    initial_z: 'Âm /z/',
    ae_e: 'Nguyên âm /æ/, /e/',
};

export const SOUND_TIP: Record<ErrorKind, string> = {
    final_consonant: 'Đọc rõ phụ âm cuối rồi mới dừng, đừng nuốt.',
    final_voicing: 'Phụ âm cuối hữu thanh (/d z v g b/): giữ rung cổ họng và kéo dài nguyên âm trước nó một chút.',
    th: 'Đặt đầu lưỡi giữa hai hàm răng rồi thổi hơi; /ð/ thì thêm rung cổ họng.',
    cluster: 'Đọc liền các phụ âm trong cụm, không bỏ âm nào, không chen nguyên âm vào giữa.',
    ending: 'Đọc rõ đuôi: -s là /s/ hoặc /z/, -ed là /t/, /d/ hoặc /ɪd/.',
    long_short: '/iː/ dài và căng môi như cười; /ɪ/ ngắn và thả lỏng.',
    ch_j: '/ʃ/ (sh) chu môi và thổi hơi liên tục; /tʃ/ (ch) bật ra một lần; /dʒ/ như /tʃ/ nhưng rung cổ họng.',
    final_ng: '/ŋ/: cuống lưỡi chạm vòm mềm, giữ một chút; đừng đưa đầu lưỡi lên thành /n/.',
    final_l: '/l/ cuối: đầu lưỡi chạm lợi trên và giữ lại. /r/: cong lưỡi, không chạm vòm.',
    initial_z: '/z/ như /s/ nhưng rung cổ họng (đặt tay lên cổ để cảm nhận).',
    ae_e: '/æ/ mở miệng rộng, hạ hàm; /e/ miệng hẹp hơn.',
};

const FINAL_VOICING: Record<string, string> = { D: 'T', Z: 'S', V: 'F', G: 'K', B: 'P', JH: 'CH', DH: 'TH' };

/** Position of a phone in its word. */
function where(phones: readonly string[], i: number) {
    const firstVowel = phones.findIndex(isVowel);
    let lastVowel = -1;
    phones.forEach((p, k) => {
        if (isVowel(p)) lastVowel = k;
    });
    return { final: i === phones.length - 1, initial: i === 0, onset: firstVowel < 0 || i < firstVowel, coda: i > lastVowel };
}

/**
 * The known error a change to `phones[i]` matches: replaced by `heardAs`, or
 * dropped when `heardAs` is null. Null when it is no known pattern.
 */
export function classify(phones: readonly string[], i: number, heardAs: string | null): ErrorKind | null {
    const p = bare(phones[i]);
    const h = heardAs === null ? null : bare(heardAs);
    const at = where(phones, i);
    if (p === 'TH' || p === 'DH') return h === null || ['T', 'S', 'F', 'D', 'Z', 'V'].includes(h) ? 'th' : null;
    if (h === null) {
        if (isVowel(p)) return null;
        // A consonant next to another in the onset: "pl", "str".
        if (at.onset && phones.findIndex(isVowel) >= 2) return 'cluster';
        if (!at.coda) return null;
        if (p === 'L') return 'final_l';
        if (p === 'NG') return 'final_ng';
        // -s / -ed after another consonant ("walked", "cats").
        if (at.final && ['S', 'Z', 'T', 'D'].includes(p) && i > 0 && !isVowel(phones[i - 1])) return 'ending';
        return 'final_consonant';
    }
    if (p === h) return null;
    if (at.coda && FINAL_VOICING[p] === h) return 'final_voicing';
    if ((p === 'IY' && h === 'IH') || (p === 'IH' && h === 'IY') || (p === 'UW' && h === 'UH') || (p === 'UH' && h === 'UW')) return 'long_short';
    const sh = ['SH', 'CH', 'JH', 'ZH'];
    if (sh.includes(p) && (sh.includes(h) || h === 'S' || h === 'Z')) return 'ch_j';
    if (p === 'NG' && h === 'N' && at.coda) return 'final_ng';
    if ((p === 'R' && h === 'L') || (p === 'L' && h === 'R')) return 'final_l';
    if (p === 'Z' && h === 'S' && at.onset) return 'initial_z';
    if ((p === 'AE' && h === 'EH') || (p === 'EH' && h === 'AE')) return 'ae_e';
    return null;
}

export interface SoundIssue {
    word: string;
    /** Index in the word's phones. */
    index: number;
    phone: string;
    /** The phone it sounded like; null when it seemed dropped. */
    heardAs: string | null;
    kind: ErrorKind | null;
    /** "Âm /θ/ trong “think” có thể nghe như /s/." */
    text: string;
    tip: string | null;
    pair: readonly [string, string] | null;
}

export function describe(word: string, phones: readonly string[], index: number, heardAs: string | null): SoundIssue {
    const kind = classify(phones, index, heardAs);
    const phone = phones[index];
    const at = where(phones, index);
    const sound = `/${ipaOf(phone)}/${at.final && !isVowel(phone) ? ' cuối' : ''}`;
    const text =
        heardAs === null
            ? `Âm ${sound} trong “${word}” có thể bị mất.`
            : heardAs && bare(heardAs) !== bare(phone)
              ? `Âm ${sound} trong “${word}” có thể nghe như /${ipaOf(heardAs)}/.`
              : `Âm ${sound} trong “${word}” có thể chưa rõ.`;
    return { word, index, phone, heardAs, kind, text, tip: kind ? SOUND_TIP[kind] : null, pair: kind ? MINIMAL_PAIRS[kind][0] : null };
}

/** At most `max` issues: known errors first, then in the order given (worst first). */
export function topIssues(issues: readonly SoundIssue[], max = 2): SoundIssue[] {
    const seen = new Set<string>();
    return [...issues]
        .map((x, k) => ({ x, k }))
        .sort((a, b) => Number(b.x.kind !== null) - Number(a.x.kind !== null) || a.k - b.k)
        .map(({ x }) => x)
        .filter((x) => {
            const key = `${x.word}:${x.index}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .slice(0, max);
}

// ─── Without the model: from the word the recognizer heard (5.3) ──────────

/**
 * The sounds that differ between the model word and the word heard instead
 * ("think" heard as "sink": /θ/ like /s/). Phones are aligned with a cheap
 * cost for known confusions; extra phones in the heard word are ignored.
 */
export function issuesFromHeardWord(word: string, target: readonly string[], heard: readonly string[]): SoundIssue[] {
    const t = target.map(bare);
    const h = heard.map(bare);
    const GAP = 0.8;
    const sub = (i: number, j: number) => {
        if (t[i] === h[j]) return 0;
        if (classify(target, i, heard[j])) return 0.4;
        return isVowel(t[i]) === isVowel(h[j]) ? 1 : 1.8;
    };
    const n = t.length;
    const m = h.length;
    const D = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j * GAP : j === 0 ? i * GAP : 0)));
    for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) D[i][j] = Math.min(D[i - 1][j - 1] + sub(i - 1, j - 1), D[i - 1][j] + GAP, D[i][j - 1] + GAP);
    const out: SoundIssue[] = [];
    let i = n;
    let j = m;
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && D[i][j] === D[i - 1][j - 1] + sub(i - 1, j - 1)) {
            if (t[i - 1] !== h[j - 1]) out.push(describe(word, target, i - 1, heard[j - 1]));
            i--;
            j--;
        } else if (i > 0 && D[i][j] === D[i - 1][j] + GAP) {
            out.push(describe(word, target, i - 1, null));
            i--;
        } else j--;
    }
    return out.reverse();
}

// ─── With the model (5.2) ─────────────────────────────────────────────────

export interface PhoneScore {
    phone: string;
    /** 0 wrong … 2 right (speechocean762's scale). */
    score: number;
    /** The strongest other phone over its frames. */
    competitor: string;
}

/** Below this a phone "may be unclear" (docs/LEXICA_PRONUNCIATION_SPIKE.md; tune on Vietnamese voices). */
export const UNCLEAR_BELOW = 0.6;

/**
 * Low-scoring phones of each word, worst first. The competing phone names
 * a known substitution when it matches one; otherwise a consonant at the end
 * of a word is read as dropped (the model scores a missing final phone low).
 */
export function issuesFromScores(words: readonly { word: string; phones: readonly string[]; scores: readonly PhoneScore[] }[], threshold = UNCLEAR_BELOW): SoundIssue[] {
    const low: { issue: SoundIssue; score: number }[] = [];
    for (const w of words)
        w.scores.forEach((s, i) => {
            if (s.score >= threshold) return;
            const swapped = classify(w.phones, i, s.competitor) ? s.competitor : null;
            const dropped = !swapped && classify(w.phones, i, null) && where(w.phones, i).coda;
            low.push({ issue: describe(w.word, w.phones, i, swapped ?? (dropped ? null : s.phone)), score: s.score });
        });
    return low.sort((a, b) => a.score - b.score).map((x) => x.issue);
}
