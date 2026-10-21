/**
 * From the model's log-probabilities to a 0–2 score per phone
 * (docs/LEXICA_PRONUNCIATION_DESIGN.md, 5.2): align the model word's phones,
 * read GOP features off each phone's frames, run the regressor. Also the
 * audio side: trim silence and decide whether an attempt fits the model's
 * 5 s context. Pure; the worker (scorer.worker.ts) runs the network.
 */
import { forcedAlign, gopRows, validFrames } from './ctc';
import { predict, type Gbm } from './gbm';
import { BLANK, CONTEXT_SEC, FRAMES_PER_SEC, MAX_FRAMES, OUTPUTS, VOCAB } from './pack';
import { SAMPLE_RATE } from './mel';
import { bare } from '../phones';

export interface ScoredPhone {
    phone: string;
    score: number;
    /** The strongest other phone over its frames, without stress ("S"). */
    competitor: string;
    /** Seconds from the start of the trimmed audio. */
    start: number;
    end: number;
}

/** Token ids of the phones; null when one is not in the model's vocabulary. */
export function phoneIds(phones: readonly string[]): number[] | null {
    const ids = phones.map((p) => VOCAB.indexOf(p));
    return ids.every((i) => i > 1) ? ids : null;
}

/** Scores per phone from `logp` ([frames × OUTPUTS]), or null when the phones do not align. */
export function scorePhones(logp: Float32Array, frames: number, phones: readonly string[], durationSec: number, gbm: Gbm): ScoredPhone[] | null {
    const ids = phoneIds(phones);
    if (!ids) return null;
    const V = OUTPUTS;
    const T = Math.min(validFrames(durationSec, ids.length, MAX_FRAMES, FRAMES_PER_SEC), frames);
    const spans = forcedAlign(logp, T, V, ids, BLANK);
    if (!spans) return null;
    const name = (k: number) => (VOCAB[k] && !VOCAB[k].startsWith('<') ? bare(VOCAB[k]) : '');
    return gopRows(logp, V, spans, BLANK).map((r, i) => ({
        phone: phones[i],
        score: predict(gbm, r.features, r.token),
        competitor: name(r.competitor),
        start: r.start / FRAMES_PER_SEC,
        end: r.end / FRAMES_PER_SEC,
    }));
}

/**
 * The attempt without the quiet before and after the voice (20 ms frames
 * against the loudest frame), with 0.15 s kept on each side so a soft
 * final consonant stays in.
 */
export function trimSilence(audio: Float32Array, rate = SAMPLE_RATE): Float32Array {
    const size = Math.round(rate * 0.02);
    const frames = Math.floor(audio.length / size);
    if (frames === 0) return audio;
    const rms = Array.from({ length: frames }, (_, f) => {
        let s = 0;
        for (let i = f * size; i < (f + 1) * size; i++) s += audio[i] * audio[i];
        return Math.sqrt(s / size);
    });
    const peak = Math.max(...rms);
    if (peak === 0) return audio.subarray(0, 0);
    const loud = (r: number) => r > Math.max(peak * 0.06, 0.004);
    const first = rms.findIndex(loud);
    let last = frames - 1;
    while (last > first && !loud(rms[last])) last--;
    const pad = Math.round(rate * 0.15);
    return audio.subarray(Math.max(0, first * size - pad), Math.min(audio.length, (last + 1) * size + pad));
}

/** The model reads at most 5 s; longer attempts are not scored phone by phone. */
export const fitsContext = (samples: number, rate = SAMPLE_RATE) => samples > rate * 0.2 && samples <= rate * CONTEXT_SEC;
