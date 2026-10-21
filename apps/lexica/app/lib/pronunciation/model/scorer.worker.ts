/**
 * Runs the scoring model off the main thread: log-mel, then the network,
 * returning per-frame log-probabilities (the rest is cheap and pure, in
 * score.ts). The main thread hands over the model and onnxruntime's
 * WebAssembly as bytes it already verified and cached (client.ts).
 * onnxruntime still imports its small loader script at run time: it is
 * served from public/pron/, outside the install-time precache.
 */
import * as ort from 'onnxruntime-web/wasm';
import { logMel, N_MELS, SAMPLE_RATE } from './mel';
import { CONTEXT_SEC, ORT_LOADER } from './pack';

type In = { type: 'init'; model: ArrayBuffer; wasm: ArrayBuffer; threads: number } | { type: 'run'; id: number; audio: Float32Array };

let session: ort.InferenceSession | null = null;

self.onmessage = async (e: MessageEvent<In>) => {
    const msg = e.data;
    try {
        if (msg.type === 'init') {
            ort.env.wasm.wasmBinary = msg.wasm;
            ort.env.wasm.wasmPaths = { mjs: new URL(ORT_LOADER, self.location.origin).href };
            ort.env.wasm.numThreads = msg.threads;
            session = await ort.InferenceSession.create(new Uint8Array(msg.model), { executionProviders: ['wasm'] });
            self.postMessage({ type: 'ready' });
            return;
        }
        if (!session) throw new Error('not ready');
        const frames = (CONTEXT_SEC * SAMPLE_RATE) / 160;
        const mel = logMel(msg.audio, CONTEXT_SEC * SAMPLE_RATE);
        const out = await session.run({ mel: new ort.Tensor('float32', mel, [1, N_MELS, frames]) });
        const logp = out.logp;
        // A copy we own, so it can be transferred.
        const data = new Float32Array(logp.data as Float32Array);
        self.postMessage({ type: 'result', id: msg.id, logp: data, frames: logp.dims[1] }, { transfer: [data.buffer] });
    } catch (err) {
        self.postMessage({ type: 'error', id: msg.type === 'run' ? msg.id : -1, message: err instanceof Error ? err.message : String(err) });
    }
};
