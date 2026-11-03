import { describe, expect, it } from "vitest";
import { analyzeWords, findGaps, gapKind, tokenize, wordsFromChunks, xrayHeadline, type Word } from "@/lib/speech-words";

/** "I think the problem is that I I have no time" with a pause in the middle of "the ... problem" and one before "because". */
const say = (parts: [string, number][], gapBefore: Record<number, number> = {}): Word[] => {
  let t = 0;
  return parts.map(([text, dur], i) => {
    t += gapBefore[i] ?? 0.08;
    const w = { text, start: t, end: t + dur };
    t += dur;
    return w;
  });
};

describe("tokenize", () => {
  it("flags fillers and repeats and drops words with no timing", () => {
    const words = say([["I", 0.2], ["um", 0.3], ["think", 0.3], ["the", 0.2], ["the", 0.2], ["problem", 0.4]]);
    words.push({ text: "lost", start: NaN, end: NaN });
    const t = tokenize(words);
    expect(t).toHaveLength(6);
    expect(t.find((x) => x.clean === "um")?.filler).toBe(true);
    expect(t.filter((x) => x.repeat).map((x) => x.i)).toEqual([4]);
  });
  it("catches a repeated pair", () => {
    const t = tokenize(say([["I", 0.2], ["think", 0.3], ["I", 0.2], ["think", 0.3], ["so", 0.2]]));
    expect(t.filter((x) => x.repeat).length).toBe(2);
  });
});

describe("gap kinds", () => {
  const tk = (text: string) => ({ ...tokenize([{ text, start: 0, end: 0.2 }])[0] });
  it("is the edge of an idea after punctuation or before a conjunction", () => {
    expect(gapKind(tk("work."), tk("Then"))).toBe("boundary");
    expect(gapKind(tk("work"), tk("because"))).toBe("boundary");
  });
  it("is the middle of an idea between an article and its noun", () => {
    expect(gapKind(tk("the"), tk("problem"))).toBe("mid");
  });
});

describe("analyzeWords", () => {
  const words = say(
    [["I", 0.2], ["think", 0.3], ["the", 0.2], ["problem", 0.5], ["is", 0.2], ["time,", 0.4], ["because", 0.5], ["I", 0.2], ["um", 0.3], ["work", 0.4], ["late", 0.4]],
    { 3: 1.6, 6: 1.1 }
  );
  const r = analyzeWords(words);
  it("finds the long gaps and says which sit in the middle of an idea", () => {
    expect(r.gaps).toHaveLength(2);
    expect(r.gaps[0]).toMatchObject({ kind: "mid" });
    expect(r.gaps[0].seconds).toBeCloseTo(1.6, 1);
    expect(r.gaps[1]).toMatchObject({ kind: "boundary" });
  });
  it("counts what a rater would listen for", () => {
    expect(r.stats.midPauses).toBe(1);
    expect(r.stats.boundaryPauses).toBe(1);
    expect(r.stats.fillers).toBe(1);
    expect(r.stats.words).toBe(10);
  });
  it("measures how fast it sounds when they speak, and the runs between pauses", () => {
    expect(r.stats.articulationRate).toBeGreaterThan(r.stats.wordsPerMinute);
    expect(r.stats.meanRun).toBeGreaterThan(1);
  });
  it("tells the listener where the trouble is", () => {
    expect(xrayHeadline(r.stats)).toMatch(/giữa chừng/);
    expect(xrayHeadline(analyzeWords(say([["a", 0.1]])).stats)).toMatch(/quá ngắn/);
  });
});

describe("findGaps", () => {
  it("ignores gaps shorter than the minimum", () => {
    const t = tokenize(say([["so", 0.2], ["it", 0.2], ["goes", 0.2], ["on", 0.2]], { 2: 0.3 }));
    expect(findGaps(t)).toHaveLength(0);
  });
});

describe("wordsFromChunks", () => {
  it("reads Whisper's chunks and gives the last word an end when it has none", () => {
    const w = wordsFromChunks([
      { text: " And", timestamp: [0, 0.78] },
      { text: " so", timestamp: [0.78, 1.2] },
      { text: " my", timestamp: [1.2, 1.5] },
      { text: " fellow", timestamp: [1.6, null] },
    ]);
    expect(w).toHaveLength(4);
    expect(w![3].end).toBeCloseTo(2, 0);
  });
  it("is null when the timing is missing or unusable", () => {
    expect(wordsFromChunks(undefined)).toBeNull();
    expect(wordsFromChunks([{ text: "a", timestamp: [0, 1] }])).toBeNull();
    expect(wordsFromChunks([{ text: "a" }, { text: "b" }, { text: "c" }])).toBeNull();
  });
  it("drops a word that goes back in time", () => {
    const w = wordsFromChunks([
      { text: "a", timestamp: [0, 1] },
      { text: "b", timestamp: [1, 2] },
      { text: "c", timestamp: [0.2, 0.4] },
      { text: "d", timestamp: [2, 3] },
    ]);
    expect(w?.map((x) => x.text)).toEqual(["a", "b", "d"]);
  });
});
