import { describe, expect, it } from "vitest";
import { clampBand, emptySelf, gap, gapLine, overall } from "../src/lib/self-rating";

describe("self rating", () => {
  it("overall is the mean of the four to the nearest half band", () => {
    expect(overall({ fluency: 6, vocabulary: 6, grammar: 5, pronunciation: 5 })).toBe(5.5);
    expect(overall({ fluency: 7, vocabulary: 6, grammar: 6, pronunciation: 6 })).toBe(6.5);
    expect(overall(emptySelf())).toBe(5);
  });

  it("bands are whole numbers from 1 to 9", () => {
    expect(clampBand(0)).toBe(1);
    expect(clampBand(11)).toBe(9);
    expect(clampBand(5.6)).toBe(6);
  });

  it("the gap is the learner's rating minus the partners', only where the partners rated", () => {
    const self = { fluency: 7, vocabulary: 6, grammar: 5, pronunciation: 6 };
    const g = gap(self, { fluency: 6, vocabulary: 6.5, overall: 5.5 });
    expect(g).toEqual({ fluency: 1, vocabulary: -0.5, overall: 0.5 });
    expect(gap(self, {})).toEqual({});
  });

  it("says in words which way the gap goes", () => {
    expect(gapLine(undefined)).toContain("Chưa có");
    expect(gapLine(0)).toContain("gần đúng");
    expect(gapLine(1)).toContain("cao hơn 1 band");
    expect(gapLine(-1.5)).toContain("thấp hơn 1.5 band");
  });
});

describe("unsure criteria kept with a self rating", () => {
  it("are stored next to the bands and read back, without changing the bands", async () => {
    const store = new Map<string, string>();
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    };
    const { saveSelf, readSelf, readUnsure } = await import("@/lib/self-rating");
    expect(saveSelf("a1", { fluency: 6, vocabulary: 5, grammar: 6, pronunciation: 4 }, ["pronunciation", "grammar"])).toBe(true);
    expect(readSelf().a1).toEqual({ fluency: 6, vocabulary: 5, grammar: 6, pronunciation: 4 });
    expect(readUnsure("a1")).toEqual(["pronunciation", "grammar"]);
    expect(readUnsure("missing")).toEqual([]);
  });
});
