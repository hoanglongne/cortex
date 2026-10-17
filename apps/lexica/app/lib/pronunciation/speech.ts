/**
 * Browser speech for the drill: several English system voices (for
 * listening practice), one recognition attempt with alternatives, a
 * recording of the learner's voice and a pitch track, all at once. No paid
 * API; on Chrome the recognition itself runs on Google's servers.
 */
import { detectPitch } from './pitch';
import type { Alternative } from './score';

/** Up to `n` distinct English voices, different accents first. */
export function englishVoices(n = 3): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !window.speechSynthesis) return [];
    const all = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('en'));
    const byLang = new Map<string, SpeechSynthesisVoice>();
    for (const v of all) if (!byLang.has(v.lang)) byLang.set(v.lang, v);
    const picked = [...byLang.values()];
    for (const v of all) if (picked.length < n && !picked.includes(v)) picked.push(v);
    return picked.slice(0, n);
}

/** Speaks `text` with a given voice; resolves when done (or after a timeout). */
export function speakWith(text: string, voice: SpeechSynthesisVoice | null, rate = 0.85, pitch = 1): Promise<void> {
    return new Promise((resolve) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return resolve();
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

/**
 * The same word in 2–3 voices. With fewer system voices, the same voice at a
 * different pitch and speed stands in, so the learner still hears variety.
 */
export async function speakVaried(text: string, times = 3): Promise<void> {
    const voices = englishVoices(times);
    for (let i = 0; i < times; i++) {
        const voice = voices[i % Math.max(1, voices.length)] ?? null;
        const shift = voices.length > i ? 1 : [0.8, 1.2, 1][i % 3];
        await speakWith(text, voice, 0.85, shift);
        await new Promise((r) => setTimeout(r, 250));
    }
}

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
    /** Pitch per ~30 ms frame (null = unvoiced). */
    pitch: (number | null)[];
    error?: 'no-speech' | 'not-allowed' | 'unsupported' | 'network' | 'other';
}

/**
 * Listens once: speech recognition (5 alternatives), plus a recording and a
 * pitch track from the same microphone. Stops on the first result, after
 * `maxMs`, or when `signal` aborts (the learner tapped stop).
 */
export async function listenOnce(opts: { maxMs?: number; signal?: AbortSignal } = {}): Promise<Attempt> {
    const Ctor = recognitionCtor();
    if (!Ctor) return { alternatives: [], audioUrl: null, pitch: [], error: 'unsupported' };
    let stream: MediaStream | null = null;
    try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
        return { alternatives: [], audioUrl: null, pitch: [], error: 'not-allowed' };
    }

    // Recording
    const chunks: Blob[] = [];
    let recorder: MediaRecorder | null = null;
    try {
        recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
        recorder.start();
    } catch {
        recorder = null;
    }

    // Pitch
    const pitch: (number | null)[] = [];
    let ctx: AudioContext | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    try {
        ctx = new AudioContext();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        ctx.createMediaStreamSource(stream).connect(analyser);
        const buf = new Float32Array(analyser.fftSize);
        timer = setInterval(() => {
            analyser.getFloatTimeDomainData(buf);
            pitch.push(detectPitch(buf, ctx!.sampleRate));
        }, 30);
    } catch {
        ctx = null;
    }

    const recognition = new Ctor();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;

    const result = await new Promise<Pick<Attempt, 'alternatives' | 'error'>>((resolve) => {
        let done = false;
        const finish = (r: Pick<Attempt, 'alternatives' | 'error'>) => {
            if (done) return;
            done = true;
            try {
                recognition.stop();
            } catch {
                // already stopped
            }
            resolve(r);
        };
        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const res = event.results[0];
            const alternatives: Alternative[] = [];
            for (let i = 0; i < res.length; i++) alternatives.push({ transcript: res[i].transcript, confidence: res[i].confidence ?? 0 });
            finish({ alternatives });
        };
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            const e = event.error;
            finish({ alternatives: [], error: e === 'no-speech' ? 'no-speech' : e === 'not-allowed' ? 'not-allowed' : e === 'network' ? 'network' : 'other' });
        };
        recognition.onend = () => finish({ alternatives: [], error: 'no-speech' });
        setTimeout(() => finish({ alternatives: [], error: 'no-speech' }), opts.maxMs ?? 6000);
        opts.signal?.addEventListener('abort', () => {
            try {
                recognition.stop(); // delivers a final result if there is one
            } catch {
                finish({ alternatives: [], error: 'no-speech' });
            }
        });
        try {
            recognition.start();
        } catch {
            finish({ alternatives: [], error: 'other' });
        }
    });

    if (timer) clearInterval(timer);
    void ctx?.close();
    const audioUrl = await new Promise<string | null>((resolve) => {
        if (!recorder || recorder.state === 'inactive') return resolve(null);
        recorder.onstop = () => resolve(chunks.length ? URL.createObjectURL(new Blob(chunks, { type: recorder!.mimeType })) : null);
        recorder.stop();
    });
    stream.getTracks().forEach((t) => t.stop());
    return { ...result, audioUrl, pitch };
}
