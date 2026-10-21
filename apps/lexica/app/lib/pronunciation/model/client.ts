/**
 * The scoring pack on the learner's device: download only when they ask,
 * verify each file's sha256, keep it in Cache Storage, and score attempts
 * in a Web Worker (scorer.worker.ts). Hidden behind a flag until it passes
 * the Vietnamese-voice check (docs/LEXICA_PRONUNCIATION_DESIGN.md, 8).
 */
import { parseGbm, type Gbm } from './gbm';
import { PACK } from './pack';
import { CONTENT_MANIFEST_URL } from '../../content/loader';
import { fitsContext, scorePhones, trimSilence, type ScoredPhone } from './score';
import { modelPhones } from '../phones';

/**
 * Where the pack lives: NEXT_PUBLIC_PRON_PACK_URL, else pron/v1/ next to the
 * content manifest (…/packs/manifest.json → …/pron/v1/). Null when neither is set.
 */
export function packBaseUrl(): string | null {
    const explicit = process.env.NEXT_PUBLIC_PRON_PACK_URL;
    if (explicit) return explicit.endsWith('/') ? explicit : `${explicit}/`;
    if (!CONTENT_MANIFEST_URL) return null;
    return CONTENT_MANIFEST_URL.replace(/packs\/manifest\.json(\?.*)?$/, `pron/${PACK.version}/`);
}

const CACHE = `lexica-pron-${PACK.version}`;
const FLAG_KEY = 'lexica-pron-beta';
const FILES = [PACK.model, PACK.wasm, PACK.regressor] as const;

/** Phone scoring is on for this learner (`?pron=1` on the speaking page turns it on, `?pron=0` off). */
export function pronBeta(): boolean {
    try {
        return process.env.NEXT_PUBLIC_PRON_BETA === 'on' || localStorage.getItem(FLAG_KEY) === '1';
    } catch {
        return false;
    }
}

export function setPronBeta(on: boolean) {
    try {
        if (on) localStorage.setItem(FLAG_KEY, '1');
        else localStorage.removeItem(FLAG_KEY);
    } catch {
        // Private mode: off.
    }
}

/** The pack can be downloaded here: a URL for it, Cache Storage, WebAssembly and workers. */
export function packAvailable(): boolean {
    return typeof window !== 'undefined' && Boolean(packBaseUrl()) && 'caches' in window && typeof WebAssembly === 'object' && typeof Worker === 'function';
}

export const packMegabytes = () => Math.round(FILES.reduce((n, f) => n + f.bytes, 0) / 1e6);

async function sha256(buf: ArrayBuffer): Promise<string> {
    const h = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(h), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Every file of the pack is in the cache. */
export async function packReady(): Promise<boolean> {
    if (!packAvailable()) return false;
    try {
        const cache = await caches.open(CACHE);
        const hits = await Promise.all(FILES.map((f) => cache.match(f.file)));
        return hits.every(Boolean);
    } catch {
        return false;
    }
}

/** Downloads the pack with progress (0–1), verifies it and caches it. Throws with a message for the learner. */
export async function downloadPack(onProgress: (share: number) => void): Promise<void> {
    const base = packBaseUrl();
    if (!base) throw new Error('Chưa cấu hình nơi tải gói chấm phát âm.');
    const cache = await caches.open(CACHE);
    const total = FILES.reduce((n, f) => n + f.bytes, 0);
    let done = 0;
    for (const f of FILES) {
        if (await cache.match(f.file)) {
            done += f.bytes;
            onProgress(done / total);
            continue;
        }
        const res = await fetch(base + f.file);
        if (!res.ok || !res.body) throw new Error('Không tải được gói chấm phát âm. Kiểm tra mạng rồi thử lại.');
        const reader = res.body.getReader();
        const parts: Uint8Array[] = [];
        let got = 0;
        for (;;) {
            const { done: end, value } = await reader.read();
            if (end) break;
            parts.push(value);
            got += value.length;
            onProgress((done + Math.min(got, f.bytes)) / total);
        }
        const buf = new Uint8Array(got);
        let at = 0;
        for (const p of parts) {
            buf.set(p, at);
            at += p.length;
        }
        if ((await sha256(buf.buffer)) !== f.sha256) throw new Error('Gói chấm phát âm tải về bị lỗi. Thử tải lại.');
        await cache.put(f.file, new Response(buf));
        done += f.bytes;
        onProgress(done / total);
    }
}

/** Removes the pack (Cài đặt). */
export async function deletePack(): Promise<void> {
    reset();
    if (typeof caches !== 'undefined') await caches.delete(CACHE);
}

// ─── The worker ───────────────────────────────────────────────────────────

let worker: Worker | null = null;
let ready: Promise<Gbm> | null = null;
let nextId = 1;
const waiting = new Map<number, { resolve: (r: { logp: Float32Array; frames: number }) => void; reject: (e: Error) => void }>();

function reset() {
    worker?.terminate();
    worker = null;
    ready = null;
    for (const w of waiting.values()) w.reject(new Error('stopped'));
    waiting.clear();
}

async function cached(file: string): Promise<ArrayBuffer> {
    const res = await (await caches.open(CACHE)).match(file);
    if (!res) throw new Error(`missing ${file}`);
    return res.arrayBuffer();
}

/** Starts the worker from the cached pack, once. */
function start(): Promise<Gbm> {
    ready ??= (async () => {
        const [model, wasm, gbmBuf] = await Promise.all([cached(PACK.model.file), cached(PACK.wasm.file), cached(PACK.regressor.file)]);
        const gbm = parseGbm(JSON.parse(new TextDecoder().decode(gbmBuf)));
        if (!gbm) throw new Error('bad regressor');
        const w = new Worker(new URL('./scorer.worker.ts', import.meta.url), { type: 'module' });
        worker = w;
        await new Promise<void>((resolve, reject) => {
            w.onmessage = (e: MessageEvent<{ type: string; id?: number; logp?: Float32Array; frames?: number; message?: string }>) => {
                const m = e.data;
                if (m.type === 'ready') return resolve();
                const job = m.id !== undefined ? waiting.get(m.id) : undefined;
                if (m.type === 'error' && m.id === -1) return reject(new Error(m.message));
                if (!job) return;
                waiting.delete(m.id!);
                if (m.type === 'result') job.resolve({ logp: m.logp!, frames: m.frames! });
                else job.reject(new Error(m.message));
            };
            w.onerror = (e) => reject(new Error(e.message));
            const threads = self.crossOriginIsolated ? Math.min(4, navigator.hardwareConcurrency || 1) : 1;
            w.postMessage({ type: 'init', model, wasm, threads }, [model, wasm]);
        });
        return gbm;
    })().catch((err: unknown) => {
        reset();
        throw err;
    });
    return ready;
}

/** Warms the worker up (the first run builds the session: about a second). */
export function warmUp(): void {
    void packReady().then((ok) => {
        if (ok) start().catch(() => undefined);
    });
}

export interface WordScores {
    word: string;
    /** CMUdict phones, as shown to the learner. */
    phones: string[];
    scores: ScoredPhone[];
}

/**
 * Scores each phone of `words` in a 16 kHz recording, or null when the pack
 * is not there, the attempt is too long or too short, or the phones do not align.
 */
export async function scoreRecording(audio: Float32Array, words: { word: string; phones: string[] }[]): Promise<WordScores[] | null> {
    if (words.length === 0 || !(await packReady())) return null;
    const voice = trimSilence(audio);
    if (!fitsContext(voice.length)) return null;
    const gbm = await start();
    const id = nextId++;
    const copy = new Float32Array(voice);
    const { logp, frames } = await new Promise<{ logp: Float32Array; frames: number }>((resolve, reject) => {
        waiting.set(id, { resolve, reject });
        worker!.postMessage({ type: 'run', id, audio: copy }, [copy.buffer]);
    });
    const all = words.flatMap((w) => modelPhones(w.phones));
    const scored = scorePhones(logp, frames, all, voice.length / 16000, gbm);
    if (!scored) return null;
    let at = 0;
    return words.map((w) => {
        const scores = scored.slice(at, at + w.phones.length);
        at += w.phones.length;
        return { word: w.word, phones: w.phones, scores };
    });
}
