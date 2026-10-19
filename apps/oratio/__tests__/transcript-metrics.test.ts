import { describe, expect, it } from "vitest";
import { lexicaWordsIn, mattr, transcriptMetrics, words } from "@/lib/transcript-metrics";

describe("transcriptMetrics", () => {
  it("counts words, speed, runs and fillers", () => {
    const text = "Um, I think travelling is, uh, really important. You know, it broadens the mind.";
    const m = transcriptMetrics(text, 30_000, 1);
    expect(m.wordCount).toBe(words(text).length - 2);
    expect(m.wpm).toBeCloseTo(m.wordCount * 2, 1);
    expect(m.meanRunWords).toBeCloseTo(m.wordCount / 2, 1);
    expect(m.fillers).toBe(3);
  });

  it("is zero for an empty transcript", () => {
    expect(transcriptMetrics("", 10_000, 0)).toMatchObject({ wordCount: 0, wpm: 0, lexicalDiversity: 0 });
  });
});

describe("mattr", () => {
  it("is 1 for all different words and lower for repeats", () => {
    expect(mattr(["a", "b", "c"])).toBe(1);
    expect(mattr(Array(60).fill("same"))).toBeCloseTo(1 / 25);
  });
});

describe("lexicaWordsIn", () => {
  it("finds inflected words and phrases, once each", () => {
    const text = "We should mitigate risks. Mitigating them early helps, and I planned to cut down on sugar.";
    expect(lexicaWordsIn(text, ["mitigate", "plan", "cut down on", "resilient"]).sort()).toEqual(["cut down on", "mitigate", "plan"]);
  });

  it("handles -y words", () => {
    expect(lexicaWordsIn("Many cities studied this.", ["city", "study"]).sort()).toEqual(["city", "study"]);
  });
});
