/**
 * Browser speech for the drill: model voices (natural voices from the Cortex
 * API, else the best system voices), and one listening attempt: the learner's
 * own recording, a pitch track and what was said. The browser's recognition
 * is tried first; when it hears nothing although the recording has a voice
 * (common on phones, where it competes for the microphone), the recording is
 * sent to the API to be transcribed, and later attempts go there directly.
 */
import { CORTEX_API_URL } from '../cortexConfig';
import { NATURAL_VOICES, speakNatural, voiceQuality } from '../audio/AudioService';
import { detectPitch } from './pitch';
import type { Alternative } from './score';

/** Up to `n` distinct English system voices, the most natural first, different accents first. */
export function englishVoices(n = 3): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !window.speechSynthesis) return [];
    const all = window.speechSynthesis
        .getVoices()
        .filter((v) => v.lang.toLowerCase().startsWith('en') && voiceQuality(v) > -10)
        .sort((a, b) => voiceQuality(b) - voiceQuality(a));
    const byLang = new Map<string, SpeechSynthesisVoice>();
    for (const v of all) if (!byLang.has(v.lang)) byLang.set(v.lang, v);
    const picked = [...byLang.values()].sort((a, b) => voiceQuality(b) - voiceQuality(a));
    for (const v of all) if (picked.length < n && !picked.includes(v)) picked.push(v);
    return picked.slice(0, n);
}

/** Speaks `text` with a given system voice; resolves when done (or after a timeout). */
export function speakWith(text: string, voice: SpeechSynthesisVoice | null, rate = 0.9, pitch = 1): Promise<void> {
    return new Promise((resolve) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return resolve();
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = voice?.lang ?? 'en-US';
        if (voice) u.voice = voice;
        u.rate = rate;
        u.pitch = pitch;
        const timer = setTimeout(resolve, 2500 + text.length * 120);
        u.onend = () => {
            clearTimeout(timer);
            resolve();
        };
        u.onerror = () => {
            clearTimeout(timer);
            resolve();
        };
        window.speechSynthesis.speak(u);
    });
}

/** The model: a natural voice, slow or normal, else the best system voice. Resolves when done. */
export async function sayModel(text: string, speed: 'slow' | 'normal' = 'normal', voice?: string): Promise<void> {
    if (await speakNatural(text, { slow: speed === 'slow', voice, wait: true })) return;
    await speakWith(text, englishVoices(1)[0] ?? null, speed === 'slow' ? 0.7 : 0.9);
}

/**
 * The same word in 2–3 voices. Natural voices when the API is there; else
 * system voices, and with fewer of them the same voice at a different pitch
 * stands in, so the learner still hears variety.
 */
export async function speakVaried(text: string, times = 3): Promise<void> {
    const voices = englishVoices(times);
    for (let i = 0; i < times; i++) {
        if (!(await speakNatural(text, { voice: NATURAL_VOICES[i % NATURAL_VOICES.length], wait: true }))) {
            const voice = voices[i % Math.max(1, voices.length)] ?? null;
            const shift = voices.length > i ? 1 : [0.85, 1.15, 1][i % 3];
            await speakWith(text, voice, 0.9, shift);
        }
        await new Promise((r) => setTimeout(r, 300));
    }
}

/** How many distinct voices `speakVaried` will use. */
export const variedVoiceCount = () => (CORTEX_API_URL ? 3 : englishVoices(3).length);

type RecognitionCtor = new () => SpeechRecognition;

export function recognitionCtor(): RecognitionCtor | null {
    if (typeof window === 'undefined') return null;
    const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface Attempt {
    alternatives: Alternative[];
    /** Object URL of the learner's recording, when recording worked. */
    audioUrl: string | null;
    /** The recording as 16 kHz samples, for phone scoring on the device. */
    samples?: Float32Array;
    /** Pitch per ~40 ms frame (null = unvoiced). */
    pitch: (number | null)[];
    /** The recording had a voice in it (louder than the room). */
    voiced?: boolean;
    error?: 'no-speech' | 'not-allowed' | 'unsupported' | 'network' | 'other';
}

const MODE_KEY = 'lexica-speech-mode';
const canTranscribe = () => Boolean(CORTEX_API_URL);

/**
 * How this browser listens, learned during the visit (sessionStorage, so a
 * bad guess never sticks for good):
 * - "browser": record and let the browser recognise at the same time;
 * - "server": the browser missed a voice the recording had, the API read it: skip the browser;
 * - "solo": neither read it (phones often can't record and recognise at once):
 *   let the browser recognise alone, without our recording.
 */
type SpeechMode = 'browser' | 'server' | 'solo';

function speechMode(): SpeechMode {
    try {
        const m = sessionStorage.getItem(MODE_KEY);
        return m === 'server' || m === 'solo' ? m : 'browser';
    } catch {
        return 'browser';
    }
}

function setSpeechMode(mode: SpeechMode) {
    try {
        sessionStorage.setItem(MODE_KEY, mode);
    } catch {
        // Private mode: decided again next attempt.
    }
}

// ─── The microphone, kept open between attempts ─────────────────────────

/**
 * One microphone stream for the whole drill. Opening a new one for every
 * attempt made Safari (and Chrome's "allow this time") ask for permission
 * again and again. It closes after a minute unused, or when the page is hidden.
 */
let mic: MediaStream | null = null;
let micIdle: ReturnType<typeof setTimeout> | null = null;
const MIC_IDLE_MS = 60_000;

function releaseMic() {
    if (micIdle) clearTimeout(micIdle);
    micIdle = null;
    mic?.getTracks().forEach((t) => t.stop());
    mic = null;
}

async function openMic(): Promise<MediaStream> {
    if (micIdle) clearTimeout(micIdle);
    micIdle = null;
    if (mic && mic.getAudioTracks().some((t) => t.readyState === 'live')) return mic;
    mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    if (typeof document !== 'undefined' && !openMic.watching) {
        openMic.watching = true;
        document.addEventListener('visibilitychange', () => document.hidden && releaseMic());
        window.addEventListener('pagehide', releaseMic);
    }
    return mic;
}
openMic.watching = false;

function keepMicAwhile() {
    if (micIdle) clearTimeout(micIdle);
    micIdle = setTimeout(releaseMic, MIC_IDLE_MS);
}

/**
 * Listens once and returns what was said (up to 5 alternatives), the
 * recording and a pitch track. Stops when the browser recognises something,
 * after a pause following speech, after `maxMs`, or when `signal` aborts
 * (the learner tapped stop or let go of the button).
 *
 * `sentence`: the learner says a sentence of their own around `target`
 * ("Please keep in mind that…"). Then hearing the target is no reason to
 * stop: only a pause of `SENTENCE_PAUSE_MS` after speech, or the learner, ends it.
 */
export async function listenOnce(opts: { target?: string; maxMs?: number; signal?: AbortSignal; sentence?: boolean; onReady?: () => void } = {}): Promise<Attempt> {
    const Ctor = recognitionCtor();
    const server = canTranscribe() && Boolean(opts.target);
    if (!Ctor && !server) return { alternatives: [], audioUrl: null, pitch: [], error: 'unsupported' };
    const mode = speechMode();
    const solo = Boolean(Ctor) && mode === 'solo';
    let rec: ReturnType<typeof startRecording> | null = null;
    if (!solo) {
        try {
            rec = startRecording(await openMic());
        } catch {
            return { alternatives: [], audioUrl: null, pitch: [], error: 'not-allowed' };
        }
    }
    opts.onReady?.();
    const useBrowser = Boolean(Ctor) && !(server && mode === 'server');

    const browser = await new Promise<Pick<Attempt, 'alternatives' | 'error'>>((resolve) => {
        let done = false;
        let recognition: SpeechRecognition | null = null;
        const finish = (r: Pick<Attempt, 'alternatives' | 'error'>) => {
            if (done) return;
            done = true;
            clearInterval(vad);
            clearTimeout(max);
            try {
                recognition?.stop();
            } catch {
                // already stopped
            }
            resolve(r);
        };
        let heard: Alternative[] = [];
        const max = setTimeout(() => finish({ alternatives: heard, error: heard.length ? undefined : 'no-speech' }), opts.maxMs ?? (opts.sentence ? 20000 : 7000));
        // Without the browser's recognition, end on a pause after speech.
        const vad = setInterval(() => {
            if (!recognition && rec?.silentAfterVoice(opts.sentence ? SENTENCE_PAUSE_MS : words(opts.target ?? '').length > 1 ? 1500 : 900)) finish({ alternatives: [], error: 'no-speech' });
            // A sentence ends when the learner stops talking, whatever the browser heard so far.
            if (recognition && opts.sentence && heard.length > 0 && rec?.silentAfterVoice(SENTENCE_PAUSE_MS)) finish({ alternatives: heard });
        }, 100);
        opts.signal?.addEventListener('abort', () => {
            if (!recognition) return finish({ alternatives: [], error: 'no-speech' });
            try {
                recognition.stop(); // delivers a final result if there is one
            } catch {
                finish({ alternatives: [], error: 'no-speech' });
            }
            setTimeout(() => finish({ alternatives: [], error: 'no-speech' }), 1500);
        });
        if (!useBrowser) return;
        const r = new Ctor!();
        recognition = r;
        r.lang = 'en-US';
        // A phrase ("keep in mind") is often said with a pause inside: keep listening across
        // pauses until every word is heard, or the learner stays quiet.
        const targetWords = words(opts.target ?? '');
        const phrase = targetWords.length > 1;
        r.continuous = phrase || Boolean(opts.sentence);
        r.interimResults = false;
        r.maxAlternatives = 5;
        // The browser gave up without words: with the API, keep recording until the learner pauses.
        const gaveUp = (error: Attempt['error']) => {
            // The microphone is ours already, so even "not-allowed" here means the speech service is off.
            if (server && !opts.signal?.aborted) recognition = null;
            else finish({ alternatives: [], error });
        };
        let quiet: ReturnType<typeof setTimeout> | null = null;
        r.onresult = (event: SpeechRecognitionEvent) => {
            // Earlier pieces in their best reading, then each reading of the latest piece.
            const before = Array.from({ length: event.results.length - 1 }, (_, i) => event.results[i][0].transcript.trim()).join(' ');
            const last = event.results[event.results.length - 1];
            const alternatives: Alternative[] = [];
            for (let i = 0; i < last.length; i++) alternatives.push({ transcript: `${before} ${last[i].transcript}`.replace(/\s+/g, ' ').trim(), confidence: last[i].confidence ?? 0 });
            if (!alternatives.some((x) => x.transcript)) return;
            heard = alternatives;
            // A sentence: keep listening; the pause check above ends it.
            if (opts.sentence) return;
            if (!phrase || alternatives.some((x) => targetWords.every((w) => words(x.transcript).includes(w)))) return finish({ alternatives });
            if (quiet) clearTimeout(quiet);
            quiet = setTimeout(() => finish({ alternatives: heard }), 1800);
        };
        r.onerror = (event: SpeechRecognitionErrorEvent) => {
            const e = event.error;
            if (heard.length > 0) return finish({ alternatives: heard });
            gaveUp(e === 'no-speech' ? 'no-speech' : e === 'not-allowed' ? 'not-allowed' : e === 'network' ? 'network' : 'other');
        };
        r.onend = () => {
            if (heard.length > 0) finish({ alternatives: heard });
            else if (recognition === r) gaveUp('no-speech');
        };
        try {
            r.start();
        } catch {
            gaveUp('other');
        }
    });

    const take = rec?.stop() ?? { wav: null, samples: null, pitch: [], voiced: false };
    keepMicAwhile();
    const audioUrl = take.wav ? URL.createObjectURL(take.wav) : null;
    const base = { audioUrl, pitch: take.pitch, voiced: take.voiced, samples: take.samples ?? undefined };
    if (browser.alternatives.length > 0) return { ...browser, ...base };
    if (!take.voiced || !take.wav) return { alternatives: [], error: browser.error ?? 'no-speech', ...base };
    // A voice was recorded but not read. Next time let the browser listen alone (phones
    // often cannot record and recognise at once); the API reads this one if it can.
    const tryAlone = () => {
        if (Ctor && useBrowser) setSpeechMode('solo');
        else if (mode === 'server') setSpeechMode(Ctor ? 'solo' : 'browser');
    };
    if (!server) {
        tryAlone();
        return { ...browser, ...base };
    }
    try {
        const alternatives = await transcribe(take.wav, opts.target!);
        if (alternatives.length > 0) {
            if (useBrowser) setSpeechMode('server');
            return { alternatives, ...base };
        }
        tryAlone();
        return { alternatives: [], error: 'no-speech', ...base };
    } catch {
        tryAlone();
        return { alternatives: [], error: 'network', ...base };
    }
}

const words = (s: string) =>
    s
        .toLowerCase()
        .replace(/[^a-z' ]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);

async function transcribe(wav: Blob, target: string): Promise<Alternative[]> {
    const audio = await blobToBase64(wav);
    const res = await fetch(`${CORTEX_API_URL}/v1/lexica/transcribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio, target }),
    });
    if (!res.ok) throw new Error(`transcribe ${res.status}`);
    const body = (await res.json()) as { transcripts?: string[]; confidence?: number };
    return (body.transcripts ?? []).map((transcript) => ({ transcript, confidence: body.confidence ?? 0.8 }));
}

async function blobToBase64(blob: Blob): Promise<string> {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(bin);
}

// ─── Recording ───────────────────────────────────────────────────────────

const RATE = 16000;
/** Quiet after speech that ends a sentence: long enough to think mid-sentence. */
const SENTENCE_PAUSE_MS = 1800;
/** RMS that counts as a voice at least (quiet microphones with noise suppression stay low)… */
const VOICE_RMS = 0.006;
/** …and this many times the room's noise, measured in the first frames. */
const VOICE_OVER_NOISE = 2.5;
const NOISE_FRAMES = 4;
const VOICE_NOISE_CAP = 0.012;

/**
 * Raw microphone samples through Web Audio (works on every browser that has
 * a microphone, unlike MediaRecorder's formats): a 16 kHz WAV for playback
 * and transcription, a pitch track, and whether a voice was heard.
 */
export function startRecording(stream: MediaStream) {
    const chunks: Float32Array[] = [];
    const pitch: (number | null)[] = [];
    let voicedFrames = 0;
    let lastVoice = 0;
    let frames = 0;
    /** The room, from the quietest of the first frames (before the learner starts). */
    let noise = Infinity;
    let ctx: AudioContext | null = null;
    let sampleRate = 48000;
    try {
        ctx = new AudioContext();
        sampleRate = ctx.sampleRate;
        void ctx.resume();
        const source = ctx.createMediaStreamSource(stream);
        const node = ctx.createScriptProcessor(2048, 1, 1);
        const mute = ctx.createGain();
        mute.gain.value = 0;
        node.onaudioprocess = (e) => {
            const input = e.inputBuffer.getChannelData(0);
            chunks.push(new Float32Array(input));
            let sum = 0;
            for (let i = 0; i < input.length; i++) sum += input[i] * input[i];
            const rms = Math.sqrt(sum / input.length);
            if (frames++ < NOISE_FRAMES) noise = Math.min(noise, rms);
            // Capped: someone speaking from the first frame must not raise the bar above their own voice.
            const loud = rms > Math.max(VOICE_RMS, Math.min(VOICE_NOISE_CAP, Number.isFinite(noise) ? noise * VOICE_OVER_NOISE : 0));
            if (loud) {
                voicedFrames++;
                lastVoice = performance.now();
            }
            pitch.push(loud ? detectPitch(input, sampleRate) : null);
        };
        source.connect(node);
        node.connect(mute);
        mute.connect(ctx.destination);
    } catch {
        ctx = null;
    }
    return {
        /** A voice was heard, then `ms` of quiet. */
        silentAfterVoice: (ms: number) => voicedFrames >= 3 && performance.now() - lastVoice > ms,
        stop(): { wav: Blob | null; samples: Float32Array | null; pitch: (number | null)[]; voiced: boolean } {
            void ctx?.close();
            if (!ctx || chunks.length === 0) return { wav: null, samples: null, pitch, voiced: false };
            const samples = downsample(chunks, sampleRate, RATE);
            return { wav: encodeWav(samples, RATE), samples, pitch, voiced: voicedFrames >= 3 };
        },
    };
}

/** Averages each window of input samples into one output sample. */
export function downsample(chunks: Float32Array[], from: number, to: number): Float32Array {
    const total = chunks.reduce((n, c) => n + c.length, 0);
    const input = new Float32Array(total);
    let at = 0;
    for (const c of chunks) {
        input.set(c, at);
        at += c.length;
    }
    if (from <= to) return input;
    const ratio = from / to;
    const out = new Float32Array(Math.floor(total / ratio));
    for (let i = 0; i < out.length; i++) {
        const start = Math.floor(i * ratio);
        const end = Math.min(total, Math.floor((i + 1) * ratio));
        let sum = 0;
        for (let j = start; j < end; j++) sum += input[j];
        out[i] = sum / Math.max(1, end - start);
    }
    return out;
}

/** 16-bit mono PCM WAV. */
export function encodeWav(samples: Float32Array, rate: number): Blob {
    const buf = new ArrayBuffer(44 + samples.length * 2);
    const v = new DataView(buf);
    const str = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
    str(0, 'RIFF');
    v.setUint32(4, 36 + samples.length * 2, true);
    str(8, 'WAVE');
    str(12, 'fmt ');
    v.setUint32(16, 16, true);
    v.setUint16(20, 1, true);
    v.setUint16(22, 1, true);
    v.setUint32(24, rate, true);
    v.setUint32(28, rate * 2, true);
    v.setUint16(32, 2, true);
    v.setUint16(34, 16, true);
    str(36, 'data');
    v.setUint32(40, samples.length * 2, true);
    for (let i = 0; i < samples.length; i++) {
        const x = Math.max(-1, Math.min(1, samples[i]));
        v.setInt16(44 + i * 2, x < 0 ? x * 0x8000 : x * 0x7fff, true);
    }
    return new Blob([buf], { type: 'audio/wav' });
}
