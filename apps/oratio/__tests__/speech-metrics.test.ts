import { describe, expect, it } from "vitest";
import { analyzeSamples } from "@/lib/client/speech-metrics";

const SR = 16000;

/** Concatenate segments: a number is seconds of silence, [s] is seconds of a 220 Hz tone. */
function build(parts: (number | [number])[], amp = 0.3): Float32Array {
  const chunks = parts.map((p) => {
    const secs = Array.isArray(p) ? p[0] : p;
    const out = new Float32Array(Math.round(secs * SR));
    if (Array.isArray(p)) for (let i = 0; i < out.length; i++) out[i] = amp * Math.sin((2 * Math.PI * 220 * i) / SR);
    return out;
  });
  const all = new Float32Array(chunks.reduce((n, c) => n + c.length, 0));
  let o = 0;
  for (const c of chunks) {
    all.set(c, o);
    o += c.length;
  }
  return all;
}

describe("analyzeSamples", () => {
  it("treats pure silence as no speech", () => {
    const m = analyzeSamples(build([3]), SR);
    expect(m.speakingMs).toBe(0);
    expect(m.longPauses).toBe(0);
    expect(m.totalMs).toBeCloseTo(3000, -1);
  });

  it("measures a continuous tone", () => {
    const m = analyzeSamples(build([[2]]), SR);
    expect(m.speakingMs).toBeGreaterThan(1900);
    expect(m.longPauses).toBe(0);
  });

  it("counts a long pause between speech but not leading or trailing silence", () => {
    const m = analyzeSamples(build([2, [1], 2, [1], 2]), SR);
    expect(m.longPauses).toBe(1);
    expect(m.longestPauseMs).toBeGreaterThanOrEqual(1900);
    expect(m.speakingMs).toBeGreaterThan(1900);
    expect(m.speakingMs).toBeLessThan(2100);
  });

  it("does not count short gaps as pauses and keeps them as speaking time", () => {
    const m = analyzeSamples(build([[1], 0.2, [1], 1, [1]]), SR);
    expect(m.longPauses).toBe(0);
    expect(m.speakingMs).toBeGreaterThan(2150);
  });

  it("adapts to a quiet recording", () => {
    const m = analyzeSamples(build([[1], 2, [1]], 0.03), SR);
    expect(m.longPauses).toBe(1);
  });

  it("handles empty input", () => {
    expect(analyzeSamples(new Float32Array(0), SR)).toEqual({ speakingMs: 0, totalMs: 0, longPauses: 0, longestPauseMs: 0 });
  });
});
