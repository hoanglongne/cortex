import { pickExaminerVoice } from "@/lib/examiner-voice";

/** Reads the lines one after another in a British-leaning voice. Resolves when done, failed, or after a time based on the text (a voice that never fires `end` must not freeze the exam). */
export function speakLines(lines: readonly string[]): { done: Promise<void>; cancel: () => void } {
  const synth = typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;
  let cancelled = false;
  let finish: () => void = () => {};
  const done = new Promise<void>((resolve) => {
    finish = resolve;
  });
  if (!synth || lines.length === 0) {
    finish();
    return { done, cancel: () => {} };
  }
  synth.cancel();
  const timeoutMs = 4000 + lines.join(" ").length * 90;
  const timer = setTimeout(() => finish(), timeoutMs);
  const voices = synth.getVoices();
  const i = pickExaminerVoice(voices);
  lines.forEach((line, n) => {
    const u = new SpeechSynthesisUtterance(line);
    u.lang = "en-GB";
    u.rate = 0.92;
    if (i >= 0) u.voice = voices[i];
    if (n === lines.length - 1) {
      u.onend = () => {
        clearTimeout(timer);
        finish();
      };
      u.onerror = u.onend;
    }
    synth.speak(u);
  });
  return {
    done,
    cancel: () => {
      if (cancelled) return;
      cancelled = true;
      clearTimeout(timer);
      synth.cancel();
      finish();
    },
  };
}
