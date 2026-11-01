/**
 * The natural voice made on the learner's own device (issue #114). Kokoro-82M
 * (the same voice as the clips made in advance) runs in a Web Worker. It is
 * off by default and the learner turns it on; a speed test on first use keeps
 * it off on a device that cannot keep up. Measured on a Mac: WebGPU is five
 * times faster than listening speed, single-threaded WASM is too slow.
 *
 * Order of voices (AudioService): the clip made in advance, then this voice
 * when it is ready, then the Cortex API, then the browser's own voice.
 */

// ── pure ────────────────────────────────────────────────────────────────

/** The API's voice names as Kokoro voices (the same map the clips made in advance use). */
export const KOKORO_VOICE: Record<string, string> = { Kore: 'af_heart', Puck: 'am_michael', Aoede: 'bf_emma', Charon: 'bm_george' };
export const SLOW_SPEED = 0.8;
/** Longest text made on the device (longer goes to the API). */
export const MAX_CHARS = 300;
/** A speed test counts as fit up to this much time per second of speech. */
export const FIT_RTF = 0.8;

export interface DeviceConfig {
    device: 'webgpu' | 'wasm';
    dtype: 'fp32' | 'q4';
    /** About how much the first download is, in MB. */
    downloadMB: number;
}

/**
 * What this device could run. WebGPU first (the fast route: five times faster
 * than listening on a Mac); else WASM q4, which the speed test then judges
 * (multi-threaded when the page is cross-origin isolated; single-threaded on an
 * iPhone before iOS 26 has no WebGPU, so it may well be too slow, and the test
 * says so after about 90 MB). Only a device with no Web Worker gets null.
 */
export function chooseConfig(env: { webgpu: boolean; isolated: boolean; cores: number }): DeviceConfig | null {
    if (env.webgpu) return { device: 'webgpu', dtype: 'fp32', downloadMB: 300 };
    if (env.cores >= 4 || env.isolated) return { device: 'wasm', dtype: 'q4', downloadMB: 90 };
    return null;
}

/** Time per second of speech: under FIT_RTF the device keeps up. */
export const rtfOf = (ms: number, seconds: number) => (seconds > 0 ? ms / 1000 / seconds : Infinity);
export const isFit = (rtf: number) => rtf <= FIT_RTF;

/** 16-bit mono WAV of the samples. */
export function wavBlob(samples: Float32Array, rate: number): Blob {
    const n = samples.length;
    const buf = new ArrayBuffer(44 + n * 2);
    const v = new DataView(buf);
    const w = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
    w(0, 'RIFF');
    v.setUint32(4, 36 + n * 2, true);
    w(8, 'WAVEfmt ');
    v.setUint32(16, 16, true);
    v.setUint16(20, 1, true);
    v.setUint16(22, 1, true);
    v.setUint32(24, rate, true);
    v.setUint32(28, rate * 2, true);
    v.setUint16(32, 2, true);
    v.setUint16(34, 16, true);
    w(36, 'data');
    v.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, samples[i])) * 0x7fff, true);
    return new Blob([buf], { type: 'audio/wav' });
}

/** A small least-recently-used map, so a line heard twice is made once. */
export class Lru<V> {
    private readonly map = new Map<string, V>();
    constructor(private readonly max: number) {}
    get(key: string): V | undefined {
        const v = this.map.get(key);
        if (v !== undefined) {
            this.map.delete(key);
            this.map.set(key, v);
        }
        return v;
    }
    set(key: string, value: V): void {
        this.map.delete(key);
        this.map.set(key, value);
        if (this.map.size > this.max) this.map.delete(this.map.keys().next().value as string);
    }
    clear(): void {
        this.map.clear();
    }
    get size() {
        return this.map.size;
    }
}

// ── runtime ─────────────────────────────────────────────────────────────

export type DeviceVoiceState = 'off' | 'unavailable' | 'loading' | 'testing' | 'ready' | 'unfit' | 'error';

const PREF_KEY = 'lexica-device-voice';
let state: DeviceVoiceState = 'off';
let progress = 0;
let lastRtf: number | null = null;
let worker: Worker | null = null;
let nextId = 1;
const pending = new Map<number, { resolve: (m: { samples: Float32Array; rate: number; ms: number }) => void; reject: (e: Error) => void }>();
let loading: { resolve: () => void; reject: (e: Error) => void } | null = null;
const listeners = new Set<() => void>();
const cache = new Lru<Blob>(40);

const emit = () => listeners.forEach((l) => l());
const set = (s: DeviceVoiceState) => {
    state = s;
    emit();
};

export const deviceVoiceStatus = () => ({ state, progress, rtf: lastRtf });
export function onDeviceVoiceChange(fn: () => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
}

export function environment(): DeviceConfig | null {
    if (typeof window === 'undefined' || typeof Worker === 'undefined') return null;
    return chooseConfig({ webgpu: 'gpu' in navigator, isolated: self.crossOriginIsolated === true, cores: navigator.hardwareConcurrency ?? 2 });
}

const readPref = (): string | null => {
    try {
        return localStorage.getItem(PREF_KEY);
    } catch {
        return null;
    }
};
const writePref = (v: string | null) => {
    try {
        if (v === null) localStorage.removeItem(PREF_KEY);
        else localStorage.setItem(PREF_KEY, v);
    } catch {
        // Private mode: the choice lasts until the page closes.
    }
};

/** The worker's messages go to whoever waits for them. */
function startWorker(): Worker {
    worker?.terminate();
    const w = new Worker('/device-voice-worker.js', { type: 'module' });
    w.onmessage = (e: MessageEvent) => {
        const m = e.data as { type: string; id?: number; progress?: number; samples?: Float32Array; rate?: number; ms?: number; message?: string };
        if (m.type === 'progress') {
            progress = m.progress ?? 0;
            emit();
        } else if (m.type === 'loaded') loading?.resolve();
        else if (m.type === 'audio' && m.id !== undefined) pending.get(m.id)?.resolve({ samples: m.samples!, rate: m.rate!, ms: m.ms! });
        else if (m.type === 'error') {
            const err = new Error(m.message);
            if (m.id !== undefined) pending.get(m.id)?.reject(err);
            else loading?.reject(err);
        }
    };
    w.onerror = (e) => {
        const err = new Error(e.message || 'worker error');
        loading?.reject(err);
        pending.forEach((p) => p.reject(err));
    };
    worker = w;
    return w;
}

function generate(text: string, voice: string, speed: number) {
    return new Promise<{ samples: Float32Array; rate: number; ms: number }>((resolve, reject) => {
        const id = nextId++;
        pending.set(id, {
            resolve: (m) => {
                pending.delete(id);
                resolve(m);
            },
            reject: (e) => {
                pending.delete(id);
                reject(e);
            },
        });
        worker?.postMessage({ type: 'gen', id, text, voice, speed });
    });
}

/**
 * Turns the voice on: downloads the model (once; the browser keeps it), then
 * a speed test. Fit: ready. Not fit: off, and it says so.
 */
export async function enableDeviceVoice(): Promise<DeviceVoiceState> {
    const config = environment();
    if (!config) {
        set('unavailable');
        return state;
    }
    try {
        set('loading');
        progress = 0;
        const w = startWorker();
        await new Promise<void>((resolve, reject) => {
            loading = { resolve, reject };
            w.postMessage({ type: 'load', device: config.device, dtype: config.dtype });
        });
        set('testing');
        await generate('Hello.', KOKORO_VOICE.Kore, 1); // warm-up, not counted
        const sentence = 'This is a quick test of the voice on your device.';
        const r = await generate(sentence, KOKORO_VOICE.Kore, 1);
        lastRtf = rtfOf(r.ms, r.samples.length / r.rate);
        if (!isFit(lastRtf)) {
            worker?.terminate();
            worker = null;
            writePref('unfit');
            set('unfit');
            return state;
        }
        writePref('on');
        set('ready');
    } catch {
        worker?.terminate();
        worker = null;
        set('error');
    }
    return state;
}

export function disableDeviceVoice(): void {
    worker?.terminate();
    worker = null;
    cache.clear();
    writePref(null);
    set('off');
}

/** On the next visit after the learner turned it on: load the voice quietly (the model is already cached by the browser). */
export function resumeDeviceVoice(): void {
    if (state !== 'off' || readPref() !== 'on') return;
    void enableDeviceVoice();
}

/** The line as a WAV, made on this device, or null when the voice is not ready or the line is too long. */
export async function synthOnDevice(text: string, opts: { voice?: string; slow?: boolean } = {}): Promise<Blob | null> {
    if (state !== 'ready' || !worker || text.length > MAX_CHARS || !text.trim()) return null;
    const voice = KOKORO_VOICE[opts.voice ?? 'Kore'] ?? KOKORO_VOICE.Kore;
    const key = `${voice}|${opts.slow ? 1 : 0}|${text}`;
    const kept = cache.get(key);
    if (kept) return kept;
    try {
        const r = await generate(text, voice, opts.slow ? SLOW_SPEED : 1);
        const blob = wavBlob(r.samples, r.rate);
        cache.set(key, blob);
        return blob;
    } catch {
        return null;
    }
}
