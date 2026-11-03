import { pickExaminerVoice } from "@/lib/examiner-voice";
import { sentenceChunks } from "@/lib/exam-flow";
import { voiceFileName } from "@/lib/voice-key";

/**
 * The examiner's voice. The rule: the examiner never keeps the learner waiting.
 *
 * - If every sentence of what is about to be said is already made (the public
 *   voice cache, shared with Lexica), the natural voice plays it, all of it,
 *   so one utterance never changes voice halfway.
 * - If not, the browser's own voice speaks at once, and the natural clips are
 *   made in the background, one at a time, for the next time (and for every
 *   other learner: the fixed lines are the same for everyone).
 *
 * Before, a missing clip made the learner wait up to 10 seconds per sentence
 * for the API, and the exam asked for every line at once, which the voice
 * service's rate limit turned into minutes of silence.
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

/** Where a line's clip may be found. */
export function clipUrls(text: string): { stored: string | null; api: string | null } {
  const t = text.trim();
  if (!t || t.length > 1200) return { stored: null, api: null };
  const stored = CACHE_URL ? `${CACHE_URL}/${voiceFileName({ text: t, voice: VOICE })}` : null;
  const api = API_URL ? `${API_URL}/v1/lexica/tts?${new URLSearchParams({ text: t, voice: VOICE })}` : null;
  return { stored, api };
}

/** Longest the check "is this clip already made?" may take: a missing file answers in a fraction of a second. */
export const PROBE_MS = 1200;
/** Time given to a clip that exists before the system voice takes over. */
const PLAY_MS = 4000;

// One element for the whole visit: once the learner's tap let it play, later lines may too (iOS).
let shared: HTMLAudioElement | null = null;
const audio = () => {
  if (typeof Audio === "undefined") return null;
  return (shared ??= new Audio());
};

/** Whether the clip at this URL is there: loads its first bytes with a separate element, so the playing one is not touched. */
function probe(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof Audio === "undefined") return resolve(false);
    const a = new Audio();
    const done = (ok: boolean) => {
      clearTimeout(timer);
      a.removeAttribute("src");
      a.load();
      resolve(ok);
    };
    const timer = setTimeout(() => done(false), PROBE_MS);
    a.preload = "metadata";
    a.onloadedmetadata = () => done(true);
    a.onerror = () => done(false);
    a.src = url;
  });
}

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

async function playUrl(el: HTMLAudioElement, url: string, alive: () => boolean): Promise<boolean> {
  el.src = url;
  try {
    const started = await Promise.race([el.play().then(() => "ok" as const), new Promise<"late">((r) => setTimeout(() => r("late"), PLAY_MS))]);
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

// ─── Making the natural clips in the background ───────────────────────────

const wanted: string[] = [];
const seen = new Set<string>();
let running = false;
let restUntil = 0;
/** Pause after the voice service refuses (rate limit), so the queue does not hammer it. */
const REST_MS = 60_000;
/** Longest one clip may take to make. */
const MAKE_MS = 25_000;

async function drain() {
  if (running) return;
  running = true;
  try {
    while (wanted.length > 0) {
      if (Date.now() < restUntil) {
        await new Promise((r) => setTimeout(r, Math.min(5000, restUntil - Date.now())));
        continue;
      }
      const url = wanted.shift()!;
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), MAKE_MS);
      try {
        const res = await fetch(url, { signal: ctrl.signal });
        // The service saves what it makes; a refusal means rest a while
        if (!res.ok) restUntil = Date.now() + REST_MS;
        else await res.arrayBuffer();
      } catch {
        restUntil = Date.now() + REST_MS;
      } finally {
        clearTimeout(timer);
      }
    }
  } finally {
    running = false;
  }
}

/** Asks for these lines to be made, one at a time, without anyone waiting for them. Lines already asked for are skipped. */
export function warmLines(lines: readonly string[]) {
  if (typeof window === "undefined") return;
  for (const line of sentenceChunks(lines)) {
    const { api, stored } = clipUrls(line);
    if (!api || !stored || seen.has(stored)) continue;
    seen.add(stored);
    // Only what is not made yet
    void probe(stored).then((there) => {
      if (there) return;
      wanted.push(api);
      void drain();
    });
  }
}

/** Reads the lines one after another. `onStart` fires when the first sound begins; `done` resolves when finished or cancelled. */
export function speakLines(source: readonly string[], onStart?: () => void): { done: Promise<void>; cancel: () => void } {
  const lines = sentenceChunks(source);
  let alive = true;
  let started = false;
  const begin = () => {
    if (started) return;
    started = true;
    onStart?.();
  };
  let release: () => void = () => {};
  const cancelled = new Promise<void>((r) => (release = r));
  const el = audio();

  const run = (async () => {
    if (lines.length === 0) return;
    const urls = lines.map((l) => clipUrls(l));
    const stored = urls.map((u) => u.stored);
    // Natural voice only when every sentence is made: one voice for the whole utterance
    const allThere = el != null && stored.every((s) => s != null) && (await Promise.all(stored.map((s) => probe(s as string)))).every(Boolean);
    if (!alive) return;

    if (allThere && el) {
      el.addEventListener("playing", begin, { once: true });
      for (let i = 0; i < lines.length && alive; i++) {
        const ok = await playUrl(el, stored[i] as string, () => alive);
        if (!ok && alive) {
          // A clip that would not play: the system voice reads this and the rest
          begin();
          for (const rest of lines.slice(i)) if (alive) await speakSystem(rest, () => alive);
          return;
        }
      }
      return;
    }

    // Not made yet: speak now, make the natural clips for next time
    begin();
    warmLines(lines);
    for (const line of lines) {
      if (!alive) return;
      await speakSystem(line, () => alive);
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
