/**
 * Whisper's log-mel spectrogram, the scoring model's input
 * (whisper.log_mel_spectrogram): 16 kHz audio padded to `samples`, a
 * 400-point Hann STFT every 160 samples, 80 Slaney mel bands, log10,
 * clamped 8 below the peak, scaled (x + 4) / 4. Output is band-major
 * [80 × frames], like the model's [1, 80, frames] input. Pure.
 */

export const SAMPLE_RATE = 16000;
export const N_FFT = 400;
export const HOP = 160;
export const N_MELS = 80;
const BINS = N_FFT / 2 + 1;

/** librosa's Slaney mel scale (linear below 1 kHz, log above). */
const hzToMel = (f: number) => (f < 1000 ? f / (200 / 3) : 15 + Math.log(f / 1000) / (Math.log(6.4) / 27));
const melToHz = (m: number) => (m < 15 ? (m * 200) / 3 : 1000 * Math.exp((Math.log(6.4) / 27) * (m - 15)));

let filters: Float64Array | null = null;

/** librosa.filters.mel(sr=16000, n_fft=400, n_mels=80), Slaney-normalized: [80 × 201]. */
export function melFilters(): Float64Array {
    if (filters) return filters;
    const f = new Float64Array(N_MELS * BINS);
    const top = hzToMel(SAMPLE_RATE / 2);
    const melF = Array.from({ length: N_MELS + 2 }, (_, i) => melToHz((top * i) / (N_MELS + 1)));
    for (let m = 0; m < N_MELS; m++) {
        const enorm = 2 / (melF[m + 2] - melF[m]);
        for (let k = 0; k < BINS; k++) {
            const hz = (k * SAMPLE_RATE) / N_FFT;
            const lower = (hz - melF[m]) / (melF[m + 1] - melF[m]);
            const upper = (melF[m + 2] - hz) / (melF[m + 2] - melF[m + 1]);
            f[m * BINS + k] = Math.max(0, Math.min(lower, upper)) * enorm;
        }
    }
    filters = f;
    return f;
}

let tables: { cos: Float64Array; sin: Float64Array; window: Float64Array } | null = null;

function dftTables() {
    if (tables) return tables;
    const cos = new Float64Array(BINS * N_FFT);
    const sin = new Float64Array(BINS * N_FFT);
    for (let k = 0; k < BINS; k++)
        for (let n = 0; n < N_FFT; n++) {
            const a = (2 * Math.PI * k * n) / N_FFT;
            cos[k * N_FFT + n] = Math.cos(a);
            sin[k * N_FFT + n] = Math.sin(a);
        }
    // torch.hann_window(400): periodic.
    const window = Float64Array.from({ length: N_FFT }, (_, n) => 0.5 - 0.5 * Math.cos((2 * Math.PI * n) / N_FFT));
    tables = { cos, sin, window };
    return tables;
}

/** The log-mel of `audio` padded (or cut) to `samples`: [80 × samples/160]. */
export function logMel(audio: Float32Array, samples = 5 * SAMPLE_RATE): Float32Array {
    const x = new Float64Array(samples);
    x.set(audio.subarray(0, samples));
    const frames = samples / HOP;
    const { cos, sin, window } = dftTables();
    const fb = melFilters();
    const half = N_FFT / 2;
    // Reflect padding at both ends (torch.stft, center=True).
    const at = (i: number) => x[i < 0 ? -i : i >= samples ? 2 * (samples - 1) - i : i];
    const lastSound = audio.length > 0 ? Math.min(samples, audio.length) : 0;
    const out = new Float32Array(N_MELS * frames);
    const frame = new Float64Array(N_FFT);
    const power = new Float64Array(BINS);
    let peak = -Infinity;
    for (let t = 0; t < frames; t++) {
        const start = t * HOP - half;
        // Frames past the audio see only zero padding: their power is zero.
        const silent = start >= lastSound;
        if (!silent) {
            for (let n = 0; n < N_FFT; n++) frame[n] = at(start + n) * window[n];
            for (let k = 0; k < BINS; k++) {
                let re = 0;
                let im = 0;
                const row = k * N_FFT;
                for (let n = 0; n < N_FFT; n++) {
                    re += frame[n] * cos[row + n];
                    im -= frame[n] * sin[row + n];
                }
                power[k] = re * re + im * im;
            }
        }
        for (let m = 0; m < N_MELS; m++) {
            let e = 0;
            if (!silent) {
                const row = m * BINS;
                for (let k = 0; k < BINS; k++) e += fb[row + k] * power[k];
            }
            const v = Math.log10(Math.max(e, 1e-10));
            out[m * frames + t] = v;
            if (v > peak) peak = v;
        }
    }
    for (let i = 0; i < out.length; i++) out[i] = (Math.max(out[i], peak - 8) + 4) / 4;
    return out;
}
