/**
 * The on-device scoring pack (docs/LEXICA_PRONUNCIATION_DESIGN.md, 3 and 5.2):
 * vb223/whisper-base-en-phoneme-ctc (MIT), int8 with a 5 s context, and its
 * GOP regressor. Both live on Supabase Storage next to the content packs,
 * in pron/v1/, and are downloaded only when the learner asks
 * (scripts/pron-pack/README.md says how to build and upload them).
 */
export const PACK = {
    version: 'v1',
    model: { file: 'pron-model-v1.onnx', bytes: 26565603, sha256: 'e9fb1b0ed6f35c03f3eb79deec8b348848d1b35f52a890429d5d71af8d8ffc10' },
    regressor: { file: 'pron-gbm-v1.json', bytes: 66855, sha256: '382df86515682fb8a4fce664a3f20e10bf3683b3fc62e267e7bd6cfb4fae9664' },
    /** onnxruntime-web 1.22.0's WebAssembly (node_modules/onnxruntime-web/dist), uploaded with the model; must match package.json. */
    wasm: { file: 'ort-wasm-simd-threaded-1.22.0.wasm', bytes: 11210254, sha256: '71aef04959c5c1b6de461b6538e2058e306610034a85aad2742d0c7fd4533fe4' },
} as const;

/** onnxruntime's loader script for its WebAssembly, copied from node_modules/onnxruntime-web/dist (same version). */
export const ORT_LOADER = '/pron/ort-1.22.0/ort-wasm-simd-threaded.mjs';

/** Seconds of audio the model reads at once, and its output frames per second. */
export const CONTEXT_SEC = 5;
export const FRAMES_PER_SEC = 50;
export const MAX_FRAMES = CONTEXT_SEC * FRAMES_PER_SEC;

/** The model's output tokens: blank, unknown, then ARPAbet with and without stress. */
export const VOCAB: readonly string[] = ['<pad>', '<unk>', 'AA', 'AA0', 'AA1', 'AA2', 'AE', 'AE0', 'AE1', 'AE2', 'AH', 'AH0', 'AH1', 'AH2', 'AO', 'AO0', 'AO1', 'AO2', 'AW', 'AW0', 'AW1', 'AW2', 'AY', 'AY0', 'AY1', 'AY2', 'B', 'CH', 'D', 'DH', 'EH', 'EH0', 'EH1', 'EH2', 'ER', 'ER0', 'ER1', 'ER2', 'EY', 'EY0', 'EY1', 'EY2', 'F', 'G', 'HH', 'IH', 'IH0', 'IH1', 'IH2', 'IY', 'IY0', 'IY1', 'IY2', 'JH', 'K', 'L', 'M', 'N', 'NG', 'OW', 'OW0', 'OW1', 'OW2', 'OY', 'OY0', 'OY1', 'OY2', 'P', 'R', 'S', 'SH', 'T', 'TH', 'UH', 'UH0', 'UH1', 'UH2', 'UW', 'UW0', 'UW1', 'UW2', 'V', 'W', 'Y', 'Z', 'ZH'];
export const BLANK = 0;
/** Width of the model's output: one more than the vocabulary (the last class is unused). */
export const OUTPUTS = 87;
