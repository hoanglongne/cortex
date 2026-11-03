"use client";

import { useCallback, useEffect, useState } from "react";
import { wordsFromChunks, type Word } from "@/lib/speech-words";

/**
 * On-device transcription (public/whisper-worker.js). Off until the learner
 * agrees, because the model is a ~40 MB download. Without it the answer
 * still gets the pause and speaking-time metrics.
 */

export type TranscribeChoice = "on" | "off" | "unset";
const KEY = "oratio-transcribe";

const BUSY_KEY = "oratio-whisper-busy";
let busy = 0;

/**
 * Some phones close the page when the model needs more memory than they give
 * it: the screen goes white and the app opens again from the start. That cannot
 * be caught in code, but it can be noticed the next time: the model was marked
 * "busy" and never marked finished. Then the next lighter model is used, and
 * when even the lightest one fails, transcription is turned off.
 */
function markBusy(on: boolean) {
  busy = Math.max(0, busy + (on ? 1 : -1));
  try {
    if (busy > 0) localStorage.setItem(BUSY_KEY, modelChoice());
    else localStorage.removeItem(BUSY_KEY);
  } catch {
    // storage blocked
  }
}
if (typeof window !== "undefined")
  window.addEventListener("pagehide", () => {
    try {
      localStorage.removeItem(BUSY_KEY);
    } catch {
      // storage blocked
    }
  });

async function guarded<T>(work: () => Promise<T>): Promise<T> {
  markBusy(true);
  try {
    return await work();
  } finally {
    markBusy(false);
  }
}

/** If the last visit ended while the model was working, lower the model and say so. Null when all was well. */
export function recoverFromCrash(): string | null {
  try {
    const was = localStorage.getItem(BUSY_KEY);
    if (!was) return null;
    localStorage.removeItem(BUSY_KEY);
    if (was === "small" || was === "base") {
      const next = was === "small" ? "base" : "tiny";
      localStorage.setItem(MODEL_KEY, next);
      return `Lần trước máy bị đóng đột ngột khi đang chép lời (có thể do thiếu bộ nhớ). Mình đã chuyển sang mô hình nhẹ hơn (${next === "base" ? "cân bằng" : "nhẹ"}). Bạn có thể đổi lại ở chỗ chọn mô hình.`;
    }
    localStorage.setItem(KEY, "off");
    return "Lần trước máy bị đóng đột ngột khi đang chép lời, kể cả với mô hình nhẹ nhất. Mình đã tắt chép lời tự động. Bạn vẫn luyện và xem quãng ngừng bình thường.";
  } catch {
    return null;
  }
}

export function useTranscribeChoice() {
  const [choice, setChoice] = useState<TranscribeChoice>("unset");
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {
    const crashed = recoverFromCrash();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (crashed) setNotice(crashed);
    try {
      const v = localStorage.getItem(KEY);
      if (v === "on" || v === "off") setChoice(v);
    } catch {
      // storage blocked: ask each visit
    }
  }, []);
  const set = useCallback((next: "on" | "off") => {
    setChoice(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // not saved
    }
  }, []);
  return { choice, setChoice: set, notice };
}

export type WhisperModel = "tiny" | "base" | "small";
const MODEL_KEY = "oratio-whisper-model";

/** What each model costs to download (approximate) and how well it hears. */
export const MODEL_INFO: Record<WhisperModel, { size: string; label: string }> =
  {
    tiny: { size: "khoảng 40 MB", label: "Nhẹ, nghe sai nhiều" },
    base: { size: "khoảng 80 MB", label: "Cân bằng" },
    small: { size: "khoảng 250 MB", label: "Chính xác nhất" },
  };

/** A phone gets the middle model, a computer with enough memory the best one. */
export function defaultModel(): WhisperModel {
  if (typeof navigator === "undefined") return "base";
  if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) return "base";
  const memory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;
  return memory === undefined || memory >= 4 ? "small" : "base";
}

/** The model in use. Someone who agreed to the small download before keeps it until they choose another. */
export function modelChoice(): WhisperModel {
  try {
    const v = localStorage.getItem(MODEL_KEY);
    if (v === "tiny" || v === "base" || v === "small") return v;
    if (localStorage.getItem(KEY) === "on") return "tiny";
  } catch {
    // storage blocked
  }
  return defaultModel();
}

export function setModelChoice(model: WhisperModel) {
  try {
    localStorage.setItem(MODEL_KEY, model);
  } catch {
    // not saved
  }
  if (model !== loadedFor) {
    ready = null;
    loadedFor = null;
  }
}

export function useWhisperModel(): [WhisperModel, (m: WhisperModel) => void] {
  const [model, setModel] = useState<WhisperModel>("base");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModel(modelChoice());
  }, []);
  return [
    model,
    (m) => {
      setModelChoice(m);
      setModel(m);
    },
  ];
}

/** Download progress, 0–1, across the model files */
export type ProgressListener = (fraction: number) => void;

let worker: Worker | null = null;
let ready: Promise<void> | null = null;
/** The model the running worker was last asked to load */
let loadedFor: WhisperModel | null = null;
let nextId = 1;
const pending = new Map<
  number,
  {
    resolve: (r: { text: string; chunks?: unknown }) => void;
    reject: (e: Error) => void;
  }
>();
const listeners = new Set<ProgressListener>();
const files = new Map<string, { loaded: number; total: number }>();

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker("/whisper-worker.js", { type: "module" });
  worker.onmessage = (e: MessageEvent) => {
    const m = e.data as {
      id?: number;
      type: string;
      text?: string;
      chunks?: unknown;
      message?: string;
      file?: string;
      loaded?: number;
      total?: number;
    };
    if (m.type === "progress" && m.file && m.total) {
      files.set(m.file, { loaded: m.loaded ?? 0, total: m.total });
      let loaded = 0;
      let total = 0;
      for (const f of files.values()) {
        loaded += f.loaded;
        total += f.total;
      }
      listeners.forEach((l) => l(total ? loaded / total : 0));
      return;
    }
    const p = m.id ? pending.get(m.id) : undefined;
    if (!p) return;
    pending.delete(m.id!);
    if (m.type === "error") p.reject(new Error(m.message ?? "Whisper failed"));
    else p.resolve({ text: m.text ?? "", chunks: m.chunks });
  };
  worker.onerror = (e) => {
    pending.forEach((p) =>
      p.reject(new Error(e.message || "Whisper worker failed")),
    );
    pending.clear();
    worker?.terminate();
    worker = null;
    ready = null;
  };
  return worker;
}

function call(
  type: "load" | "transcribe" | "transcribe-words",
  audio?: Float32Array,
): Promise<{ text: string; chunks?: unknown }> {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    getWorker().postMessage(
      { id, type, audio, model: modelChoice() },
      audio ? [audio.buffer] : [],
    );
  });
}

/** Downloads the model (once) and starts it. */
export function loadWhisper(onProgress?: ProgressListener): Promise<void> {
  if (onProgress) listeners.add(onProgress);
  if (loadedFor !== null && loadedFor !== modelChoice()) ready = null;
  loadedFor = modelChoice();
  files.clear();
  ready ??= guarded(() => call("load")).then(
    () => undefined,
    (e) => {
      ready = null;
      throw e;
    },
  );
  return ready.finally(() => onProgress && listeners.delete(onProgress));
}

/** 16 kHz mono samples, what Whisper expects. */
async function toWhisperInput(blob: Blob): Promise<Float32Array> {
  const ctx = new AudioContext({ sampleRate: 16000 });
  try {
    const buf = await ctx.decodeAudioData(await blob.arrayBuffer());
    if (buf.numberOfChannels === 1) return buf.getChannelData(0).slice();
    const out = new Float32Array(buf.length);
    for (let c = 0; c < buf.numberOfChannels; c++) {
      const ch = buf.getChannelData(c);
      for (let i = 0; i < ch.length; i++)
        out[i] += ch[i] / buf.numberOfChannels;
    }
    return out;
  } finally {
    void ctx.close();
  }
}

/** The English transcript of a recording, made on this device. */
export async function transcribe(blob: Blob): Promise<string> {
  await loadWhisper();
  return (
    await guarded(async () => call("transcribe", await toWhisperInput(blob)))
  ).text;
}

/** The transcript with each word's start and end time (null words when the model gave no usable timing). */
export async function transcribeWords(
  blob: Blob,
): Promise<{ text: string; words: Word[] | null }> {
  await loadWhisper();
  const r = await guarded(async () =>
    call("transcribe-words", await toWhisperInput(blob)),
  );
  return { text: r.text, words: wordsFromChunks(r.chunks) };
}
