import { describe, expect, it } from "vitest";
import { GUIDE, MIN_ANSWERED, outsideNote, points, suggestBand, type Answer } from "@/lib/rating-guide";

const answerAll = (criterion: keyof typeof GUIDE, strong: boolean): Record<string, Answer> =>
  Object.fromEntries(GUIDE[criterion].questions.map((q) => [q.id, (strong ? q.positive : !q.positive) ? "yes" : "no"]));

describe("points", () => {
  it("rewards yes on a strength and no on a weakness", () => {
    const strength = { id: "a", text: "", positive: true };
    const weakness = { id: "b", text: "", positive: false };
    expect([points(strength, "yes"), points(strength, "no"), points(weakness, "yes"), points(weakness, "no")]).toEqual([2, 0, 0, 2]);
    expect(points(strength, "some")).toBe(1);
  });
});

describe("suggestBand", () => {
  it("points low when everything heard was weak and high when strong", () => {
    const low = suggestBand("fluency", answerAll("fluency", false));
    const high = suggestBand("fluency", answerAll("fluency", true));
    expect(low).toMatchObject({ low: 2, high: 3 });
    expect(high).toMatchObject({ low: 7, high: 8 });
  });
  it("gives a middle range for mixed answers", () => {
    const mixed = Object.fromEntries(GUIDE.grammar.questions.map((q) => [q.id, "some" as Answer]));
    expect(suggestBand("grammar", mixed)).toMatchObject({ low: 5, high: 6 });
  });
  it("needs enough answers and ignores the ones left out", () => {
    const [a, b, c] = GUIDE.vocabulary.questions;
    expect(suggestBand("vocabulary", { [a.id]: "yes", [b.id]: "yes" })).toBeNull();
    expect(MIN_ANSWERED).toBe(3);
    expect(suggestBand("vocabulary", { [a.id]: "no", [b.id]: "yes", [c.id]: "no" })?.answered).toBe(3);
  });
  it("never leaves the 1 to 9 scale", () => {
    for (const c of Object.keys(GUIDE) as (keyof typeof GUIDE)[]) {
      for (const strong of [true, false]) {
        const s = suggestBand(c, answerAll(c, strong))!;
        expect(s.low).toBeGreaterThanOrEqual(1);
        expect(s.high).toBeLessThanOrEqual(9);
        expect(s.high).toBeGreaterThan(s.low);
      }
    }
  });
});

describe("outsideNote", () => {
  const s = { low: 5, high: 6, answered: 4 };
  it("is quiet inside the range and for no suggestion", () => {
    expect(outsideNote(5, s)).toBeNull();
    expect(outsideNote(6, s)).toBeNull();
    expect(outsideNote(3, null)).toBeNull();
  });
  it("asks the rater to listen again outside the range", () => {
    expect(outsideNote(3, s)).toMatch(/Thấp hơn/);
    expect(outsideNote(8, s)).toMatch(/Cao hơn/);
  });
});
