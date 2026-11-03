// On-device transcription for Oratio (docs/ORATIO_REDESIGN.md §5.1).
// Runs Whisper tiny (English) with transformers.js in this worker; the model
// (~40 MB) is downloaded once, after the learner agrees, and cached by the
// browser. Audio never leaves the device.
import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.6";

env.allowLocalModels = false;

// tiny: ~40 MB, quick but mishears a lot of everyday speech. base and small hear far more (issue #130).
const MODELS = { tiny: "Xenova/whisper-tiny.en", base: "Xenova/whisper-base.en", small: "Xenova/whisper-small.en" };
let asr = null;
let loadedModel = null;

function load(model) {
  const name = MODELS[model] || MODELS.tiny;
  if (loadedModel !== name) {
    asr = null;
    loadedModel = name;
  }
  asr ??= pipeline("automatic-speech-recognition", name, {
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
  const { id, type, audio, model } = event.data;
  try {
    const run = await load(model);
    if (type === "load") {
      self.postMessage({ id, type: "ready" });
      return;
    }
    if (type === "transcribe-words") {
      // Each word with the time it started and ended (issue #130). If the model cannot give timings, the text alone still comes back.
      try {
        const out = await run(audio, { chunk_length_s: 30, stride_length_s: 5, return_timestamps: "word" });
        self.postMessage({ id, type: "result", text: (out.text || "").trim(), chunks: out.chunks || null });
        return;
      } catch (err) {
        const out = await run(audio, { chunk_length_s: 30, stride_length_s: 5 });
        self.postMessage({ id, type: "result", text: (out.text || "").trim(), chunks: null });
        return;
      }
    }
    const out = await run(audio, { chunk_length_s: 30, stride_length_s: 5 });
    self.postMessage({ id, type: "result", text: (out.text || "").trim() });
  } catch (err) {
    self.postMessage({ id, type: "error", message: String((err && err.message) || err) });
  }
};
