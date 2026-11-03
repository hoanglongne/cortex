import { describe, expect, it } from "vitest";
import { grammarProfile } from "@/lib/grammar-check";

const g = (s: string) => grammarProfile(s.split(" "));

describe("error candidates", () => {
  it("finds the usual high-confidence slips", () => {
    const rules = (s: string) => g(s).candidates.map((c) => c.snippet);
    expect(rules("she go to school every day")).toContain("she go");
    expect(rules("they was very happy")).toContain("they was");
    expect(rules("I have a apple")).toContain("a apple");
    expect(rules("it was more better")).toContain("more better");
    expect(rules("he didn't went there")).toContain("didn't went");
    expect(rules("people is kind")).toContain("people is");
  });
  it("stays quiet on correct sentences", () => {
    expect(g("She goes to school every day and he has a university degree in an old building").candidates).toEqual([]);
    expect(g("I am a student and we are an hour away").candidates).toEqual([]);
  });
});

describe("range of structures", () => {
  it("sees tenses and clauses the speaker tried", () => {
    const p = g("Last year I moved to Hanoi because I had been offered a job which was well paid. If I stay I would save money and I have never regretted it.");
    expect(p.structures).toEqual(expect.arrayContaining(["past", "subordinate", "relative", "perfect", "passive", "conditional"]));
  });
  it("shows few structures in only simple sentences", () => {
    expect(g("I like my job. It is good. I work every day.").structures.length).toBeLessThanOrEqual(1);
  });
  it("counts sentences from punctuation", () => {
    expect(grammarProfile(["I", "like", "it.", "It", "is", "good."]).sentences).toBe(2);
  });
});
