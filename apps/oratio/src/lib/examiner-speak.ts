import { pickExaminerVoice } from "@/lib/examiner-voice";
import { sentenceChunks } from "@/lib/exam-flow";
import { voiceFileName } from "@/lib/voice-key";

/**
 * The examiner's voice. Same order as Lexica: the clip already made (public
 * voice cache, shared with Lexica), then the Cortex API makes it, then the
 * browser's own voice. A line that is late never freezes the exam.
 */

/** British-sounding model voice. */
const VOICE = "Aoede";

const CACHE_URL = (() => {
  const own = process.env.NEXT_PUBLIC_VOICE_CACHE_URL?.trim().replace(/\/+$/, "");
  if (own) return own;
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, "");
  return supabase ? `${supabase}/storage/v1/object/public/lexica-content/cache/tts` : null;
})();

const API_URL = (() => {
  const v = process.env.NEXT_PUBLIC_CORTEX_API_URL?.trim().replace(/\/+$/, "");
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
})();

/** Where a line's clip may be found, best first. */
export function clipUrls(text: string): { stored: string | null; api: string | null } {
  const t = text.trim();
  if (!t || t.length > 1200) return { stored: null, api: null };
  const stored = CACHE_URL ? `${CACHE_URL}/${voiceFileName({ text: t, voice: VOICE })}` : null;
  const api = API_URL ? `${API_URL}/v1/lexica/tts?${new URLSearchParams({ text: t, voice: VOICE })}` : null;
  return { stored, api };
}

/** How long the API gets to make a line before the system voice reads it. */
export const apiWaitMs = (text: string) => (text.length <= 40 ? 4500 : 6000 + text.length * 20);

// One element for the whole visit: once the learner's tap let it play, later lines may too (iOS).
let shared: HTMLAudioElement | null = null;
const audio = () => {
  if (typeof Audio === "undefined") return null;
  return (shared ??= new Audio());
};

const wait = (el: HTMLAudioElement) =>
  new Promise<void>((resolve) => {
    const end = () => {
      el.removeEventListener("ended", end);
      el.removeEventListener("pause", end);
      el.removeEventListener("error", end);
      resolve();
    };
    el.addEventListener("ended", end);
    el.addEventListener("pause", end);
    el.addEventListener("error", end);
  });

async function playUrl(el: HTMLAudioElement, url: string, timeoutMs: number, alive: () => boolean): Promise<boolean> {
  el.src = url;
  try {
    const started = await Promise.race([el.play().then(() => "ok" as const), new Promise<"late">((r) => setTimeout(() => r("late"), timeoutMs))]);
    if (!alive()) return true;
    if (started === "late") {
      el.pause();
      return false;
    }
    await wait(el);
    return true;
  } catch {
    return false;
  }
}

function speakSystem(text: string, alive: () => boolean): Promise<void> {
  const synth = typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;
  if (!synth) return Promise.resolve();
  return new Promise<void>((resolve) => {
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-GB";
    u.rate = 0.92;
    const voices = synth.getVoices();
    const i = pickExaminerVoice(voices);
    if (i >= 0) u.voice = voices[i];
    const timer = setTimeout(resolve, 4000 + text.length * 90);
    const end = () => {
      clearTimeout(timer);
      resolve();
    };
    u.onend = end;
    u.onerror = end;
    if (alive()) synth.speak(u);
    else end();
  });
}

/** Asks the API to make these lines now, so they are ready when the examiner needs them. Lines already stored cost nothing. */
export function warmLines(lines: readonly string[]) {
  for (const line of sentenceChunks(lines)) {
    const { api } = clipUrls(line);
    if (api) void fetch(api, { mode: "no-cors" }).catch(() => {});
  }
}

/** Reads the lines one after another. `onStart` fires when the first sound begins; `done` resolves when finished or cancelled. */
export function speakLines(source: readonly string[], onStart?: () => void): { done: Promise<void>; cancel: () => void } {
  const lines = sentenceChunks(source);
  let started = false;
  const begin = () => {
    if (started) return;
    started = true;
    onStart?.();
  };
  let alive = true;
  let release: () => void = () => {};
  const cancelled = new Promise<void>((r) => (release = r));
  const el = audio();
  const run = (async () => {
    for (let i = 0; i < lines.length && alive; i++) {
      const line = lines[i];
      el?.addEventListener("playing", begin, { once: true });
      const next = lines[i + 1] ? clipUrls(lines[i + 1]).api : null;
      if (next) void fetch(next, { mode: "no-cors" }).catch(() => {}); // asks the API to make the next line while this one plays
      const { stored, api } = clipUrls(line);
      let ok = false;
      if (el && stored) ok = await playUrl(el, stored, 2500, () => alive);
      if (el && !ok && alive && api) ok = await playUrl(el, api, apiWaitMs(line), () => alive);
      if (!ok && alive) {
        begin();
        await speakSystem(line, () => alive);
      }
    }
  })();
  return {
    done: Promise.race([run, cancelled]),
    cancel: () => {
      alive = false;
      el?.pause();
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
      release();
    },
  };
}
