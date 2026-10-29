/**
 * Level 3 of pronunciation feedback (docs/LEXICA_PRONUNCIATION_DESIGN.md, 6):
 * what Web Audio can measure on a finished recording. A dropped final
 * consonant (when the phone-scoring pack is not there), which syllable was
 * stressed, the pitch shape against the model voice, and speed and pauses.
 * Every measure has a confidence bar: below it the answer is null ("no
 * conclusion"), which beats a wrong remark. Pure, unit tested; 16 kHz mono.
 */
import { detectPitch, semitones } from './pitch';
import { bare, isVowel } from './phones';

export const RATE = 16000;
/** 10 ms per frame. */
export const HOP = 160;
const WIN = 400;
const PITCH_WIN = 640;

export interface Frames {
    /** RMS per frame, after normalizing the recording's peak. */
    rms: Float32Array;
    /** RMS above ~3 kHz (fricatives and bursts). */
    high: Float32Array;
    /** Pitch in Hz per frame, null when unvoiced. */
    pitch: (number | null)[];
    /** Seconds per frame. */
    step: number;
}

const db = (x: number) => 20 * Math.log10(Math.max(x, 1e-6));

/** A second-order high-pass (RBJ cookbook), for the band fricatives live in. */
function highPass(x: Float32Array, cutoff = 3000, rate = RATE): Float32Array {
    const w = (2 * Math.PI * cutoff) / rate;
    const alpha = Math.sin(w) / (2 * Math.SQRT1_2);
    const cos = Math.cos(w);
    const a0 = 1 + alpha;
    const b0 = (1 + cos) / 2 / a0;
    const b1 = -(1 + cos) / a0;
    const b2 = b0;
    const a1 = (-2 * cos) / a0;
    const a2 = (1 - alpha) / a0;
    const y = new Float32Array(x.length);
    let x1 = 0;
    let x2 = 0;
    let y1 = 0;
    let y2 = 0;
    for (let i = 0; i < x.length; i++) {
        const v = b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
        x2 = x1;
        x1 = x[i];
        y2 = y1;
        y1 = v;
        y[i] = v;
    }
    return y;
}

/** Energy, high-band energy and pitch every 10 ms. The recording is scaled to a 0.5 peak first, so quiet microphones compare with loud ones. */
export function analyze(samples: Float32Array): Frames {
    let peak = 0;
    for (let i = 0; i < samples.length; i++) peak = Math.max(peak, Math.abs(samples[i]));
    const g = peak > 0 ? 0.5 / peak : 1;
    const x = Float32Array.from(samples, (v) => v * g);
    const hp = highPass(x);
    const n = Math.max(0, Math.floor((x.length - WIN) / HOP) + 1);
    const rms = new Float32Array(n);
    const high = new Float32Array(n);
    for (let f = 0; f < n; f++) {
        let s = 0;
        let h = 0;
        for (let i = f * HOP; i < f * HOP + WIN; i++) {
            s += x[i] * x[i];
            h += hp[i] * hp[i];
        }
        rms[f] = Math.sqrt(s / WIN);
        high[f] = Math.sqrt(h / WIN);
    }
    // Pitch only where the voice is: within 30 dB of the loudest frame, and
    // not at the edge of the search range (noise often lands there).
    let loudest = 0;
    for (let f = 0; f < n; f++) loudest = Math.max(loudest, rms[f]);
    const pitch: (number | null)[] = [];
    for (let f = 0; f < n; f++) {
        if (db(rms[f]) < db(loudest) - 30) {
            pitch.push(null);
            continue;
        }
        const c = f * HOP + WIN / 2;
        const from = Math.max(0, c - PITCH_WIN / 2);
        const hz = detectPitch(x.subarray(from, Math.min(x.length, from + PITCH_WIN)), RATE, 70, 420);
        pitch.push(hz !== null && hz > 75 && hz < 400 ? hz : null);
    }
    // A lone voiced frame is usually noise; a gap of one or two frames inside a vowel is a glitch.
    const p = pitch.map((v, i) => (v !== null && pitch[i - 1] == null && pitch[i + 1] == null ? null : v));
    for (let i = 1; i < n - 1; i++) {
        if (p[i] !== null) continue;
        const before = p[i - 1];
        const after = p[i + 1] ?? (i + 2 < n ? p[i + 2] : null);
        if (before != null && after != null) p[i] = (before + after) / 2;
    }
    return { rms, high, pitch: p, step: HOP / RATE };
}

const percentile = (a: ArrayLike<number>, q: number) => {
    const s = Array.from(a).sort((x, y) => x - y);
    return s.length ? s[Math.min(s.length - 1, Math.floor(q * s.length))] : 0;
};

/** The room's level: the quietest tenth of the frames (digital silence left out). */
export function noiseFloor(f: Frames) {
    const live = Array.from(f.rms.keys()).filter((i) => f.rms[i] > 1e-5);
    return { rms: percentile(live.map((i) => f.rms[i]), 0.1), high: percentile(live.map((i) => f.high[i]), 0.1) };
}

/** Moving average over `k` frames. */
function smooth(a: Float32Array, k = 3): Float32Array {
    const out = new Float32Array(a.length);
    const h = Math.floor(k / 2);
    for (let i = 0; i < a.length; i++) {
        let s = 0;
        let c = 0;
        for (let j = Math.max(0, i - h); j <= Math.min(a.length - 1, i + h); j++) {
            s += a[j];
            c++;
        }
        out[i] = s / c;
    }
    return out;
}

/** Frames with speech: louder than the room by `marginDb`. */
export function speechSpan(f: Frames, marginDb = 12): { first: number; last: number } | null {
    const floor = db(noiseFloor(f).rms);
    const loud = (i: number) => db(f.rms[i]) > floor + marginDb;
    let first = -1;
    for (let i = 0; i < f.rms.length; i++)
        if (loud(i)) {
            first = i;
            break;
        }
    if (first < 0) return null;
    let last = f.rms.length - 1;
    while (last > first && !loud(last)) last--;
    return { first, last };
}

/** The voice stood well above the room: below this, no measure says anything. */
const MIN_SNR_DB = 20;

// ─── 6.1 Final consonant (without the phone-scoring pack) ─────────────────

const FRICATIVES = new Set(['S', 'Z', 'SH', 'ZH', 'F', 'V', 'TH', 'DH', 'CH', 'JH']);
const STOPS = new Set(['P', 'B', 'T', 'D', 'K', 'G']);

export type FinalKind = 'fricative' | 'stop';

const SONORANTS = new Set(['L', 'R', 'M', 'N', 'NG', 'W', 'Y']);

/**
 * Which kind of final consonant a word ends in, if one this measure can
 * hear: right after a vowel or sonorant. After another consonant ("walked",
 * "cats") the one before it still leaves a burst, so dropping the last says nothing here.
 */
export function finalKind(phones: readonly string[]): FinalKind | null {
    const last = bare(phones[phones.length - 1] ?? '');
    const before = phones[phones.length - 2];
    if (!before || !(isVowel(before) || SONORANTS.has(bare(before)))) return null;
    return FRICATIVES.has(last) ? 'fricative' : STOPS.has(last) ? 'stop' : null;
}

export interface FinalCheck {
    verdict: 'clear' | 'weak' | null;
    /** High-band level after the voice, dB above the room. */
    db: number | null;
}

/**
 * Is there a consonant after the last voiced frame? 40–250 ms after the
 * voice stops, a fricative leaves noise above 3 kHz and a stop a short
 * burst. Measured against the room's own high-band level.
 */
export function finalConsonant(f: Frames, kind: FinalKind, thresholds = FINAL_THRESHOLDS): FinalCheck {
    const span = speechSpan(f);
    if (!span) return { verdict: null, db: null };
    const floor = noiseFloor(f);
    let peakRms = 0;
    for (let i = span.first; i <= span.last; i++) peakRms = Math.max(peakRms, f.rms[i]);
    if (db(peakRms) - db(floor.rms) < MIN_SNR_DB) return { verdict: null, db: null };
    // The end of the word's voiced core: voiced and within 25 dB of its peak.
    let lastVoiced = -1;
    for (let i = span.first; i < f.pitch.length; i++) if (f.pitch[i] !== null && db(f.rms[i]) > db(peakRms) - 25) lastVoiced = i;
    if (lastVoiced < 0) return { verdict: null, db: null };
    const from = lastVoiced + Math.round(0.04 / f.step);
    const to = lastVoiced + Math.round(0.25 / f.step);
    // The recording stops too soon after the voice: the consonant may have been cut off.
    if (to >= f.high.length) return { verdict: null, db: null };
    const high = smooth(f.high);
    let best = 0;
    for (let i = from; i <= to; i++) best = Math.max(best, high[i]);
    const level = db(best) - db(floor.high);
    const t = thresholds[kind];
    return { verdict: level >= t.clear ? 'clear' : level < t.weak ? 'weak' : null, db: Math.round(level * 10) / 10 };
}

/**
 * dB above the room: at or over `clear` the consonant is there, under
 * `weak` it seems dropped, between says nothing. Set from one speaker's
 * recording kit (docs/LEXICA_PRONUNCIATION_DESIGN.md, 12), with a margin;
 * to be checked on more voices before learners see it.
 */
export const FINAL_THRESHOLDS: Record<FinalKind, { clear: number; weak: number }> = {
    fricative: { clear: 25, weak: 12 },
    stop: { clear: 15, weak: 10 },
};

// ─── 6.2 Stress ───────────────────────────────────────────────────────────

export interface Nucleus {
    /** Frames. */
    start: number;
    end: number;
    peak: number;
    /** Seconds, dB, semitones (around the speaker's median). */
    duration: number;
    loudness: number;
    pitch: number;
}

/**
 * Syllable nuclei: voiced stretches of the smoothed energy, split at dips
 * of 3 dB or more between peaks at least 100 ms apart. With `spans` (vowel
 * times from the phone-scoring model), those are used instead.
 */
export function nuclei(f: Frames, spans?: readonly { start: number; end: number }[]): Nucleus[] {
    const e = smooth(f.rms, 3);
    const voiced = f.pitch.filter((p): p is number => p !== null);
    const median = voiced.length ? percentile(voiced, 0.5) : 0;
    const describe = (start: number, end: number): Nucleus => {
        let peak = start;
        for (let i = start; i <= end; i++) if (e[i] > e[peak]) peak = i;
        const ps = f.pitch.slice(start, end + 1).filter((p): p is number => p !== null);
        const pitch = ps.length && median ? Math.max(...ps.map((p) => semitones(p, median))) : 0;
        return { start, end, peak, duration: (end - start + 1) * f.step, loudness: db(e[peak]), pitch };
    };
    if (spans?.length) return spans.map((s) => describe(Math.max(0, Math.round(s.start / f.step)), Math.min(e.length - 1, Math.max(Math.round(s.start / f.step), Math.round(s.end / f.step) - 1))));

    const floor = db(noiseFloor(f).rms);
    const out: Nucleus[] = [];
    let i = 0;
    while (i < e.length) {
        if (f.pitch[i] === null || db(e[i]) < floor + 15) {
            i++;
            continue;
        }
        let j = i;
        while (j + 1 < e.length && f.pitch[j + 1] !== null && db(e[j + 1]) >= floor + 15) j++;
        // Split one voiced stretch at energy dips between peaks.
        const peaks: number[] = [];
        for (let k = i; k <= j; k++) if ((k === i || e[k] >= e[k - 1]) && (k === j || e[k] > e[k + 1])) peaks.push(k);
        const kept: number[] = [];
        for (const p of peaks) {
            const prev = kept[kept.length - 1];
            if (prev === undefined) {
                kept.push(p);
                continue;
            }
            let dip = Infinity;
            for (let k = prev; k <= p; k++) dip = Math.min(dip, e[k]);
            const deep = db(Math.min(e[prev], e[p])) - db(dip) >= 3;
            if (deep && (p - prev) * f.step >= 0.1) kept.push(p);
            else if (e[p] > e[prev]) kept[kept.length - 1] = p;
        }
        let start = i;
        kept.forEach((p, k) => {
            let end = j;
            if (k + 1 < kept.length) {
                end = p;
                for (let m = p; m <= kept[k + 1]; m++) if (e[m] < e[end]) end = m;
            }
            // Drop blips shorter than 50 ms.
            if ((end - start + 1) * f.step >= 0.05) out.push(describe(start, end));
            start = end + 1;
        });
        i = j + 1;
    }
    // A syllable's peak is within 15 dB of the word's loudest: quieter voiced stretches are closures and tails.
    const top = Math.max(...out.map((n) => n.loudness));
    return out.filter((n) => n.loudness >= top - 15);
}

/** The syllable that stands out most: duration, loudness and pitch, each relative to the word's syllables, weighted equally. */
export function prominent(ns: readonly Nucleus[]): number {
    const z = (vals: number[]) => {
        const m = vals.reduce((a, b) => a + b, 0) / vals.length;
        const sd = Math.sqrt(vals.reduce((a, b) => a + (b - m) ** 2, 0) / vals.length) || 1;
        return vals.map((v) => (v - m) / sd);
    };
    const d = z(ns.map((n) => n.duration));
    const l = z(ns.map((n) => n.loudness));
    const p = z(ns.map((n) => n.pitch));
    let best = 0;
    ns.forEach((_, i) => {
        if (d[i] + l[i] + p[i] > d[best] + l[best] + p[best]) best = i;
    });
    return best;
}

export interface StressCheck {
    verdict: 'ok' | 'off' | null;
    /** 0-based syllables. */
    expected: number;
    said: number | null;
}

/** The dictionary's stressed syllable (primary stress) of a word; null for one syllable. */
export function expectedStress(phones: readonly string[]): number | null {
    const vowels = phones.filter(isVowel);
    if (vowels.length < 2) return null;
    const i = vowels.findIndex((v) => v.endsWith('1'));
    return i >= 0 ? i : null;
}

/** Stress of a word of 2+ syllables. No conclusion when the syllables counted differ from the dictionary's. */
export function stressCheck(f: Frames, phones: readonly string[], vowelSpans?: readonly { start: number; end: number }[]): StressCheck | null {
    const expected = expectedStress(phones);
    if (expected === null) return null;
    const ns = nuclei(f, vowelSpans);
    const count = phones.filter(isVowel).length;
    if (ns.length !== count) return { verdict: null, expected, said: null };
    const said = prominent(ns);
    return { verdict: said === expected ? 'ok' : 'off', expected, said };
}

// ─── 6.3 Intonation ───────────────────────────────────────────────────────

/** Voiced frames as semitones around the speaker's median (so voices compare by shape). */
export function contour(f: Frames): number[] {
    const voiced = f.pitch.filter((p): p is number => p !== null);
    if (voiced.length < 5) return [];
    const median = percentile(voiced, 0.5);
    return voiced.map((p) => semitones(p, median));
}

/** Dynamic time warping: the cost and, for each point of `a`, the matching point of `b`. */
export function dtw(a: readonly number[], b: readonly number[]): { cost: number; path: number[] } {
    const n = a.length;
    const m = b.length;
    if (!n || !m) return { cost: Infinity, path: [] };
    const D = Array.from({ length: n + 1 }, () => new Float64Array(m + 1).fill(Infinity));
    D[0][0] = 0;
    for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) D[i][j] = Math.abs(a[i - 1] - b[j - 1]) + Math.min(D[i - 1][j], D[i][j - 1], D[i - 1][j - 1]);
    const path = new Array<number>(n).fill(0);
    let i = n;
    let j = m;
    while (i > 0 && j > 0) {
        path[i - 1] = j - 1;
        const diag = D[i - 1][j - 1];
        const up = D[i - 1][j];
        const left = D[i][j - 1];
        if (diag <= up && diag <= left) {
            i--;
            j--;
        } else if (up <= left) i--;
        else j--;
    }
    return { cost: D[n][m] / (n + m), path };
}

/** Pitch range in semitones, ignoring the outer tenths (stray frames). */
export const range = (c: readonly number[]) => (c.length ? percentile(c, 0.9) - percentile(c, 0.1) : 0);

/**
 * How the end moves: the last fifth against the middle, in semitones
 * (negative = falls). Medians, so a short dip or stray frames in the middle
 * do not decide it (a staircase fall with one dip still reads as falling).
 */
export function ending(c: readonly number[]): number {
    if (c.length < 10) return 0;
    const tail = c.slice(Math.floor(c.length * 0.8));
    const body = c.slice(Math.floor(c.length * 0.3), Math.floor(c.length * 0.7));
    return percentile(tail, 0.5) - percentile(body, 0.5);
}

/** A yes/no question: ends with "?" and starts with an auxiliary ("Do you…?", "Can I…?"). */
export function isYesNoQuestion(text: string): boolean {
    return /\?\s*$/.test(text) && /^(do|does|did|is|are|was|were|can|could|will|would|shall|should|may|might|have|has|had|am)\b/i.test(text.trim());
}

export type IntonationNote = 'ending' | 'flat';

/**
 * At most the two rough remarks of 6.3, each only when the model voice
 * makes the point clearly too: the end goes the wrong way (a statement
 * should fall, a yes/no question rise), or the voice stays flat
 * (under 3 semitones where the model uses over 6).
 */
export function intonationNotes(mine: readonly number[], model: readonly number[] | null, question: boolean): IntonationNote[] {
    if (mine.length < 10 || !model || model.length < 10) return [];
    const notes: IntonationNote[] = [];
    const want = question ? 1 : -1;
    if (Math.sign(ending(model)) === want && Math.abs(ending(model)) >= 1.5 && ending(mine) * want < -1) notes.push('ending');
    if (range(mine) < 3 && range(model) > 6) notes.push('flat');
    return notes;
}

// ─── 6.4 Speed and pauses ─────────────────────────────────────────────────

export interface Pace {
    /** Syllables per second of speech (pauses left out). */
    rate: number;
    /** Pauses over 300 ms inside the attempt, as [start, end] in seconds. */
    pauses: [number, number][];
}

export function pace(f: Frames, syllables: number): Pace | null {
    const span = speechSpan(f);
    if (!span || syllables < 1) return null;
    const floor = db(noiseFloor(f).rms);
    const e = smooth(f.rms, 3);
    const pauses: [number, number][] = [];
    let quietFrom = -1;
    let quiet = 0;
    for (let i = span.first; i <= span.last; i++) {
        if (db(e[i]) < floor + 8) {
            if (quietFrom < 0) quietFrom = i;
        } else if (quietFrom >= 0) {
            const len = (i - quietFrom) * f.step;
            if (len > 0.3) {
                pauses.push([quietFrom * f.step, i * f.step]);
                quiet += len;
            }
            quietFrom = -1;
        }
    }
    const speech = (span.last - span.first + 1) * f.step - quiet;
    return speech > 0.15 ? { rate: syllables / speech, pauses } : null;
}

export type PaceNote = 'slow' | 'fast';

/** Slower than 0.6× or faster than 1.4× the model voice. */
export function paceNote(mine: Pace | null, model: Pace | null): PaceNote | null {
    if (!mine || !model || model.rate <= 0) return null;
    const r = mine.rate / model.rate;
    return r < 0.6 ? 'slow' : r > 1.4 ? 'fast' : null;
}
