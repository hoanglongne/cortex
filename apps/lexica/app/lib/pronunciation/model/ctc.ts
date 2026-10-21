/**
 * CTC forced alignment of the model word's phones to the model's per-frame
 * log-probabilities (Viterbi with blanks, like torchaudio.functional.forced_align
 * and merge_tokens), then the GOP features of each phone's frames, as the
 * scoring model's regressor expects them. Pure.
 */

export interface Span {
    token: number;
    start: number;
    /** Exclusive. */
    end: number;
}

/** Frames holding real audio, floored so CTC always has a path (valid_frames_for). */
export function validFrames(durationSec: number, phones: number, maxFrames: number, fps = 50): number {
    const frames = Math.min(Math.floor(durationSec * fps), maxFrames);
    return Math.min(Math.max(frames, phones + 5), maxFrames);
}

/**
 * The best path through `ids` over the first `T` frames of `logp`
 * ([frames × V], row-major), as one span per phone. Null when they do not fit.
 */
export function forcedAlign(logp: Float32Array, T: number, V: number, ids: readonly number[], blank = 0): Span[] | null {
    const L = ids.length;
    const S = 2 * L + 1;
    if (L === 0) return [];
    // Repeated phones need a blank between them.
    let need = L;
    for (let i = 1; i < L; i++) if (ids[i] === ids[i - 1]) need++;
    if (need > T) return null;
    const label = (s: number) => (s % 2 === 0 ? blank : ids[(s - 1) >> 1]);
    const NEG = -Infinity;
    let prev = new Float64Array(S).fill(NEG);
    let cur = new Float64Array(S);
    const back = new Int8Array(T * S);
    prev[0] = logp[blank];
    prev[1] = logp[ids[0]];
    for (let t = 1; t < T; t++) {
        const row = t * V;
        for (let s = 0; s < S; s++) {
            let best = prev[s];
            let from = 0;
            if (s > 0 && prev[s - 1] > best) {
                best = prev[s - 1];
                from = 1;
            }
            if (s > 1 && s % 2 === 1 && ids[(s - 1) >> 1] !== ids[(s - 3) >> 1] && prev[s - 2] > best) {
                best = prev[s - 2];
                from = 2;
            }
            cur[s] = best === NEG ? NEG : best + logp[row + label(s)];
            back[t * S + s] = from;
        }
        [prev, cur] = [cur, prev];
    }
    let s = prev[S - 1] >= prev[S - 2] ? S - 1 : S - 2;
    if (prev[s] === NEG) return null;
    const path = new Int32Array(T);
    for (let t = T - 1; t >= 0; t--) {
        path[t] = s;
        if (t > 0) s -= back[t * S + s];
    }
    const spans: Span[] = [];
    for (let t = 0; t < T; t++) {
        const st = path[t];
        if (st % 2 === 0) continue;
        const last = spans[spans.length - 1];
        if (last && last.end === t && path[t - 1] === st) last.end = t + 1;
        else spans.push({ token: label(st), start: t, end: t + 1 });
    }
    return spans.length === L ? spans : null;
}

export const GOP_FEATURES = ['gop', 'logp_target', 'logp_competitor', 'logp_target_min', 'n_frames'] as const;

export interface GopRow {
    token: number;
    start: number;
    end: number;
    /** GOP_FEATURES, in order. */
    features: [number, number, number, number, number];
    /** The strongest other token over the span (by summed log-probability). */
    competitor: number;
}

/** GOP features per span: mean of target − best other (blank excluded), means, worst frame, length. */
export function gopRows(logp: Float32Array, V: number, spans: readonly Span[], blank = 0): GopRow[] {
    return spans.map(({ token, start, end }) => {
        let gop = 0;
        let target = 0;
        let comp = 0;
        let min = Infinity;
        const votes = new Float64Array(V);
        for (let t = start; t < end; t++) {
            const row = t * V;
            let best = -Infinity;
            for (let k = 0; k < V; k++) {
                if (k === blank || k === token) continue;
                const v = logp[row + k];
                votes[k] += v;
                if (v > best) best = v;
            }
            const tg = logp[row + token];
            gop += tg - best;
            target += tg;
            comp += best;
            if (tg < min) min = tg;
        }
        const n = end - start;
        let competitor = -1;
        for (let k = 0; k < V; k++) if (k !== blank && k !== token && (competitor < 0 || votes[k] > votes[competitor])) competitor = k;
        return { token, start, end, features: [gop / n, target / n, comp / n, min, n], competitor };
    });
}
