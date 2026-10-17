/**
 * Pitch (intonation) for the speaking drill: the learner's voice drawn over a
 * model line (docs/LEXICA_FEEDBACK_TASKS.md T8, Hardison 2004). Detection is a
 * small autocorrelation pitch tracker, so there is no extra dependency. The
 * system TTS voice can't be recorded in the browser, so the model line is
 * shaped from the stress pattern: a rise on each stressed syllable and a
 * fall at the end of the phrase, as in a plain English statement.
 */

/** Fundamental frequency of one frame in Hz, or null when it isn't voiced. */
export function detectPitch(frame: Float32Array, sampleRate: number, minHz = 70, maxHz = 400): number | null {
    let energy = 0;
    for (let i = 0; i < frame.length; i++) energy += frame[i] * frame[i];
    if (Math.sqrt(energy / frame.length) < 0.01) return null; // silence
    const minLag = Math.floor(sampleRate / maxHz);
    const maxLag = Math.min(Math.floor(sampleRate / minHz), frame.length - 1);
    let bestLag = -1;
    let best = 0;
    for (let lag = minLag; lag <= maxLag; lag++) {
        let sum = 0;
        for (let i = 0; i + lag < frame.length; i++) sum += frame[i] * frame[i + lag];
        const norm = sum / energy;
        if (norm > best) {
            best = norm;
            bestLag = lag;
        }
    }
    if (bestLag < 0 || best < 0.5) return null; // not periodic enough
    return sampleRate / bestLag;
}

/** Hz to semitones above `ref` (so different voices compare by shape). */
export const semitones = (hz: number, ref: number) => 12 * Math.log2(hz / ref);

/**
 * A pitch track as semitones around its own median, unvoiced frames dropped,
 * resampled to `points` values (0 = the speaker's middle pitch).
 */
export function normalizeTrack(track: readonly (number | null)[], points = 40): number[] {
    const voiced = track.filter((v): v is number => v !== null && v > 0);
    if (voiced.length < 3) return [];
    const sorted = [...voiced].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const st = voiced.map((v) => semitones(v, median));
    return Array.from({ length: points }, (_, i) => st[Math.min(st.length - 1, Math.floor((i / (points - 1)) * (st.length - 1)))]);
}

/**
 * The model line for a phrase: one value per point, peaks on stressed
 * syllables, falling at the end. `syllables` is the stressed flag per
 * syllable across the phrase.
 */
export function modelContour(syllables: readonly boolean[], points = 40): number[] {
    const n = Math.max(1, syllables.length);
    return Array.from({ length: points }, (_, i) => {
        const pos = (i / (points - 1)) * n; // 0..n
        const k = Math.min(n - 1, Math.floor(pos));
        const within = pos - k;
        const bump = syllables[k] ? 3 * Math.sin(Math.PI * Math.min(1, within)) : 0;
        const fall = -4 * Math.max(0, (pos - (n - 1)) / 1); // the last syllable falls
        const drift = -1.5 * (pos / n); // a gentle downward slope over the phrase
        return bump + fall + drift;
    });
}

/** How close two lines are in shape, 0–1 (1 = same shape). */
export function contourMatch(a: readonly number[], b: readonly number[]): number {
    const n = Math.min(a.length, b.length);
    if (n < 3) return 0;
    const mean = (x: readonly number[]) => x.slice(0, n).reduce((s, v) => s + v, 0) / n;
    const ma = mean(a);
    const mb = mean(b);
    let num = 0;
    let da = 0;
    let db = 0;
    for (let i = 0; i < n; i++) {
        num += (a[i] - ma) * (b[i] - mb);
        da += (a[i] - ma) ** 2;
        db += (b[i] - mb) ** 2;
    }
    if (da === 0 || db === 0) return 0;
    return Math.max(0, num / Math.sqrt(da * db));
}
