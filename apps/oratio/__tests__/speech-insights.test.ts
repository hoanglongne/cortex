import { describe, expect, it } from "vitest";
import { insightsFor } from "@/lib/speech-insights";
import { addSummary, compare, compareLine, previousOf, summaryOf } from "@/lib/speech-history";
import { analyzeWords, type Word } from "@/lib/speech-words";

const run = (spec: [string, number, number][]): Word[] => spec.map(([text, start, end]) => ({ text, start, end }));
const analyze = (spec: [string, number, number][]) => {
  const a = analyzeWords(run(spec));
  return { ...a, insights: insightsFor(a.tokens, a.gaps, a.stats) };
};

// Pauses right after "the" and "to": the speaker knows the sentence, not the word
const searching: [string, number, number][] = [
  ["I", 0.5, 0.6], ["think", 0.7, 1.0], ["the", 1.1, 1.2], ["biggest", 3.0, 3.5], ["problem", 3.6, 4.0], ["is", 4.1, 4.2], ["to", 4.3, 4.4], ["balance", 6.0, 6.5],
  ["school", 6.6, 7.0], ["and", 7.1, 7.2], ["a", 7.3, 7.4], ["social", 8.9, 9.3], ["life", 9.4, 9.7], ["every", 9.8, 10.0], ["day.", 10.1, 10.4],
];

describe("insightsFor", () => {
  it("names a search for the next word when the pauses follow grammar words", () => {
    const r = analyze(searching);
    const retrieval = r.insights.find((i) => i.id === "retrieval");
    expect(retrieval).toBeDefined();
    expect(retrieval!.evidence[0]).toMatch(/“(to|the|a)” … “/);
    expect(retrieval!.phrases?.length).toBeGreaterThan(0);
    expect(retrieval!.words).toEqual(expect.arrayContaining(["balance"]));
  });

  it("notices a slow start", () => {
    const r = analyze([["Well", 3.2, 3.5], ["my", 3.6, 3.8], ["day", 3.9, 4.1], ["starts", 4.2, 4.6], ["early", 4.7, 5.0], ["in", 5.1, 5.2], ["the", 5.3, 5.4], ["morning", 5.5, 6.0], ["always.", 6.1, 6.5]]);
    expect(r.insights.some((i) => i.id === "opening")).toBe(true);
  });

  it("counts fillers and repeats with the words as evidence", () => {
    const r = analyze([["So", 0, 0.2], ["um", 0.3, 0.6], ["I", 0.7, 0.8], ["like", 0.9, 1.1], ["um", 1.2, 1.5], ["working", 1.6, 2.0], ["uh", 2.1, 2.4], ["with", 2.5, 2.7], ["with", 2.8, 3.0], ["people", 3.1, 3.5], ["people", 3.6, 3.9], ["every", 4.0, 4.3], ["day.", 4.4, 4.7]]);
    const fillers = r.insights.find((i) => i.id === "fillers");
    expect(fillers?.evidence).toContain("“um”");
    expect(r.insights.find((i) => i.id === "repeats")?.title).toMatch(/2 lần/);
  });

  it("praises a smooth answer and says nothing about one that is too short", () => {
    const words: [string, number, number][] = Array.from({ length: 24 }, (_, i) => [i % 8 === 7 ? "end." : `word${i}`, 0.5 + i * 0.3, 0.5 + i * 0.3 + 0.25]);
    expect(analyze(words).insights.some((i) => i.id === "smooth")).toBe(true);
    expect(analyze([["hi", 0, 0.2]]).insights).toEqual([]);
  });

  it("flags a very slow pace (each word drawn out, few pauses)", () => {
    const words: [string, number, number][] = Array.from({ length: 12 }, (_, i) => [`wonderful${i}`, i * 1.0, i * 1.0 + 0.9]);
    expect(analyze(words).insights.some((i) => i.id === "slow")).toBe(true);
  });
});

describe("history", () => {
  const stats = (o = {}) => analyzeWords(run(searching)).stats && { ...analyzeWords(run(searching)).stats, ...o };
  it("compares per minute and calls the direction", () => {
    const before = summaryOf("a", stats({ midPausesPerMinute: 6, fillersPerMinute: 4, meanRun: 4 }), 1);
    const now = summaryOf("b", stats({ midPausesPerMinute: 2, fillersPerMinute: 4, meanRun: 7 }), 2);
    const d = compare(before, now);
    expect(d.find((x) => x.id === "mid")?.direction).toBe("better");
    expect(d.find((x) => x.id === "fillers")?.direction).toBe("same");
    expect(d.find((x) => x.id === "run")?.direction).toBe("better");
    expect(compareLine(d)).toMatch(/Tốt hơn lần trước ở 2 mục/);
  });
  it("does not call small wobbles a change", () => {
    const a = summaryOf("a", stats({ midPausesPerMinute: 4 }), 1);
    const b = summaryOf("b", stats({ midPausesPerMinute: 4.3 }), 2);
    expect(compare(a, b).find((x) => x.id === "mid")?.direction).toBe("same");
  });
  it("finds the take before this one and keeps one entry per recording", () => {
    const one = summaryOf("a", stats(), 1);
    const two = summaryOf("b", stats(), 2);
    const three = summaryOf("c", stats(), 3);
    const list = addSummary(two, addSummary(one, []));
    expect(previousOf("c", [...list, three])?.key).toBe("b");
    expect(previousOf("b", list)?.key).toBe("a");
    expect(previousOf("a", list)).toBeNull();
    expect(addSummary({ ...two, words: 99 }, list).filter((x) => x.key === "b")).toHaveLength(1);
  });
});
