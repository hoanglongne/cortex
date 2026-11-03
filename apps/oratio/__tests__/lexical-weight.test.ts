import { describe, expect, it } from "vitest";
import { lexicalProfile, mattr, wordLevel } from "@/lib/lexical-weight";

const toks = (s: string) => s.split(" ").map((text) => ({ text, clean: text.toLowerCase().replace(/[^a-z']/g, "") }));

describe("wordLevel", () => {
  it("knows how common a word is", () => {
    expect(wordLevel("the")).toBe("basic");
    expect(wordLevel("thing")).toBe("basic");
    expect(["uncommon", "advanced"]).toContain(wordLevel("sophisticated"));
    expect(wordLevel("zzzqx")).toBe("rare");
  });
  it("counts an inflected word as its base", () => {
    expect(["basic", "common"]).toContain(wordLevel("walking"));
    expect(["basic", "common"]).toContain(wordLevel("studies"));
  });
});

describe("mattr", () => {
  it("is not changed by how long the answer is", () => {
    const unit = "one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty".split(" ");
    expect(mattr(unit)).toBe(1);
    expect(mattr([...unit, ...unit, ...unit])).toBe(1);
    expect(mattr("go go go go go go go go go go go go go go go go go go go go go go".split(" "))).toBeLessThan(0.1);
  });
});

describe("lexicalProfile", () => {
  it("separates plain talk from a richer answer", () => {
    const plain = lexicalProfile(toks("I like my job because it is good and my boss is good and my work is good and I like it a lot"));
    const rich = lexicalProfile(toks("The reluctant manager scrutinised every ambiguous proposal before endorsing a sustainable, meticulous strategy for expansion"));
    expect(rich.advancedShare).toBeGreaterThan(plain.advancedShare);
    expect(rich.examples.length).toBeGreaterThan(0);
  });
  it("lists words said three times or more", () => {
    const p = lexicalProfile(toks("good place good food good people good time"));
    expect(p.repeated[0]).toEqual({ word: "good", count: 4 });
  });
  it("leaves names out", () => {
    const p = lexicalProfile(toks("We visited Okonkwo yesterday and Okonkwo smiled"));
    expect(p.examples).not.toContain("okonkwo");
  });
});
