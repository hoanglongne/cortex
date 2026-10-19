// On-device transcription for Oratio (docs/ORATIO_REDESIGN.md §5.1).
// Runs Whisper tiny (English) with transformers.js in this worker; the model
// (~40 MB) is downloaded once, after the learner agrees, and cached by the
// browser. Audio never leaves the device.
import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.6";

env.allowLocalModels = false;

const MODEL = "Xenova/whisper-tiny.en";
let asr = null;

function load() {
  asr ??= pipeline("automatic-speech-recognition", MODEL, {
    dtype: "q8",
    device: "wasm",
    progress_callback: (p) => {
      if (p.status === "progress") self.postMessage({ type: "progress", file: p.file, loaded: p.loaded, total: p.total });
    },
  }).catch((err) => {
    asr = null;
    throw err;
  });
  return asr;
}

self.onmessage = async (event) => {
  const { id, type, audio } = event.data;
  try {
    const run = await load();
    if (type === "load") {
      self.postMessage({ id, type: "ready" });
      return;
    }
    const out = await run(audio, { chunk_length_s: 30, stride_length_s: 5 });
    self.postMessage({ id, type: "result", text: (out.text || "").trim() });
  } catch (err) {
    self.postMessage({ id, type: "error", message: String((err && err.message) || err) });
  }
};
