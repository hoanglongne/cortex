"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * On-device transcription (public/whisper-worker.js). Off until the learner
 * agrees, because the model is a ~40 MB download. Without it the answer
 * still gets the pause and speaking-time metrics.
 */

export type TranscribeChoice = "on" | "off" | "unset";
const KEY = "oratio-transcribe";

export function useTranscribeChoice() {
  const [choice, setChoice] = useState<TranscribeChoice>("unset");
  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
  return { choice, setChoice: set };
}

/** Download progress, 0–1, across the model files */
export type ProgressListener = (fraction: number) => void;

let worker: Worker | null = null;
let ready: Promise<void> | null = null;
let nextId = 1;
const pending = new Map<number, { resolve: (text: string) => void; reject: (e: Error) => void }>();
const listeners = new Set<ProgressListener>();
const files = new Map<string, { loaded: number; total: number }>();

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker("/whisper-worker.js", { type: "module" });
  worker.onmessage = (e: MessageEvent) => {
    const m = e.data as { id?: number; type: string; text?: string; message?: string; file?: string; loaded?: number; total?: number };
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
    else p.resolve(m.text ?? "");
  };
  worker.onerror = (e) => {
    pending.forEach((p) => p.reject(new Error(e.message || "Whisper worker failed")));
    pending.clear();
    worker?.terminate();
    worker = null;
    ready = null;
  };
  return worker;
}

function call(type: "load" | "transcribe", audio?: Float32Array): Promise<string> {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    getWorker().postMessage({ id, type, audio }, audio ? [audio.buffer] : []);
  });
}

/** Downloads the model (once) and starts it. */
export function loadWhisper(onProgress?: ProgressListener): Promise<void> {
  if (onProgress) listeners.add(onProgress);
  ready ??= call("load").then(
    () => undefined,
    (e) => {
      ready = null;
      throw e;
    }
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
      for (let i = 0; i < ch.length; i++) out[i] += ch[i] / buf.numberOfChannels;
    }
    return out;
  } finally {
    void ctx.close();
  }
}

/** The English transcript of a recording, made on this device. */
export async function transcribe(blob: Blob): Promise<string> {
  await loadWhisper();
  return call("transcribe", await toWhisperInput(blob));
}
