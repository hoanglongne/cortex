import { describe, expect, it } from "vitest";
import { analyzeSamples, profileSamples } from "@/lib/client/speech-metrics";

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


describe("profileSamples", () => {
  // 3 s speech, 2.4 s pause, 2 s speech, 1.6 s pause, 3 s speech
  const take = build([[3], 2.4, [2], 1.6, [3]]);

  it("finds each long pause with where it starts and ends", () => {
    const p = profileSamples(take, SR);
    expect(p.pauses).toHaveLength(2);
    expect(p.pauses[0].startMs).toBeCloseTo(3000, -2);
    expect(p.pauses[0].endMs - p.pauses[0].startMs).toBeCloseTo(2400, -2);
    expect(p.pauses[1].endMs - p.pauses[1].startMs).toBeCloseTo(1600, -2);
  });

  it("agrees with the long pause count of analyzeSamples", () => {
    expect(profileSamples(take, SR).pauses.length).toBe(analyzeSamples(take, SR).longPauses);
  });

  it("draws a bar per slice, loud where there is voice and flat in the pause", () => {
    const p = profileSamples(take, SR, { bars: 100 });
    expect(p.peaks).toHaveLength(100);
    expect(p.peaks[5]).toBeGreaterThan(0.5);
    // 3.0 to 5.4 s of 12 s is bars 25 to 45: the middle of it is silent
    expect(p.peaks[35]).toBeLessThan(0.1);
    expect(Math.max(...p.peaks)).toBeLessThanOrEqual(1);
  });

  it("reports how much of the answer had voice in it", () => {
    const p = profileSamples(take, SR);
    expect(p.voicedShare).toBeGreaterThan(0.6);
    expect(p.voicedShare).toBeLessThan(0.75);
  });

  it("does not call leading or trailing silence a pause", () => {
    expect(profileSamples(build([3, [2], 3]), SR).pauses).toHaveLength(0);
  });

  it("copes with silence and an empty recording", () => {
    expect(profileSamples(build([3]), SR).pauses).toEqual([]);
    expect(profileSamples(new Float32Array(0), SR).peaks.every((v) => v === 0)).toBe(true);
  });
});
