import { describe, expect, it } from "vitest";
import { countConnectors, goodness, inRange, presets, QUESTIONS, questionsOf, rangeFor, type Answer } from "@/lib/evidence";
import { BAND_EXAMPLES } from "@/lib/band-examples";
import { CRITERIA } from "@/lib/feedback";
import type { SpeechStats } from "@/lib/speech-words";

const all = (c: "fluency" | "vocabulary" | "grammar" | "pronunciation", pick: (good: "yes" | "no") => Answer) =>
  Object.fromEntries(questionsOf(c).map((q) => [q.id, pick(q.good)]));

describe("questions", () => {
  it("has four per criterion", () => {
    for (const c of CRITERIA) expect(questionsOf(c)).toHaveLength(4);
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length);
  });
  it("scores the good answer 1, the bad one 0 and 'some' half", () => {
    const stall = QUESTIONS.find((q) => q.id === "f-pause")!;
    expect([goodness(stall, "no"), goodness(stall, "some"), goodness(stall, "yes")]).toEqual([1, 0.5, 0]);
    const link = QUESTIONS.find((q) => q.id === "f-link")!;
    expect([goodness(link, "yes"), goodness(link, "no")]).toEqual([1, 0]);
  });
});

describe("rangeFor", () => {
  it("is null with no answers", () => {
    expect(rangeFor("fluency", {})).toBeNull();
  });
  it("puts all-good answers high and all-bad low, two bands wide", () => {
    const good = rangeFor("fluency", all("fluency", (g) => g))!;
    const bad = rangeFor("fluency", all("fluency", (g) => (g === "yes" ? "no" : "yes")))!;
    expect(good.high).toBe(7);
    expect(bad.low).toBe(3);
    expect(good.high - good.low).toBe(1);
    expect(good.center).toBeGreaterThan(bad.center);
  });
  it("is wider when fewer questions were answered", () => {
    const one = rangeFor("grammar", { "g-verb": "some" })!;
    const four = rangeFor("grammar", all("grammar", () => "some"))!;
    expect(one.high - one.low).toBeGreaterThan(four.high - four.low);
    expect(four).toMatchObject({ low: 5, high: 6 });
  });
  it("never leaves 3 to 7", () => {
    for (const a of ["yes", "some", "no"] as const) {
      const r = rangeFor("vocabulary", all("vocabulary", () => a))!;
      expect(r.low).toBeGreaterThanOrEqual(3);
      expect(r.high).toBeLessThanOrEqual(7);
    }
  });
  it("says whether a band is inside", () => {
    const r = rangeFor("grammar", all("grammar", () => "some"));
    expect(inRange(5, r)).toBe(true);
    expect(inRange(8, r)).toBe(false);
    expect(inRange(2, null)).toBe(true);
  });
});

describe("presets from what the machine measured", () => {
  const speech = (o: Partial<SpeechStats> = {}): SpeechStats => ({
    words: 120, span: 60, wordsPerMinute: 120, articulationRate: 140, meanRun: 6, medianRun: 8, midPauses: 0, boundaryPauses: 6, fillers: 0, markers: 0, repeats: 0, stretches: 0, midPausesPerMinute: 0, fillersPerMinute: 0, repeatsPerMinute: 0, ...o,
  });
  it("answers the pause question from the numbers and says why", () => {
    const calm = presets({ marks: [], speech: speech() });
    expect(calm["f-pause"]?.answer).toBe("no");
    const halting = presets({ marks: [], speech: speech({ midPauses: 9 }), machine: { hums: 3 } });
    expect(halting["f-pause"]?.answer).toBe("yes");
    expect(halting["f-pause"]?.note).toMatch(/\d+ chỗ dừng/);
  });
  it("leaves questions it knows nothing about to the rater", () => {
    expect(presets({ marks: [] })).toEqual({});
    expect(presets({ marks: [], speech: speech() })["p-intonation"]).toBeUndefined();
  });
  it("uses the rater's own taps for grammar and pronunciation", () => {
    const p = presets({ marks: [{ kind: "grammar", t: 1 }, { kind: "grammar", t: 5 }, { kind: "unclear", t: 9 }] });
    expect(p["g-verb"]?.answer).toBe("some");
    expect(p["p-unclear"]?.answer).toBe("some");
  });
});

describe("countConnectors", () => {
  it("counts linking words", () => {
    expect(countConnectors(["I", "went", "and", "bought", "it", "because", "it", "was", "cheap,", "but", "Heavy"])).toBe(3);
  });
});

describe("band examples", () => {
  it("has bands 4, 6 and 8 for every criterion", () => {
    for (const c of CRITERIA) expect(BAND_EXAMPLES[c].map((e) => e.band)).toEqual([4, 6, 8]);
  });
});
