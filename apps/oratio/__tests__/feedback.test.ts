import { describe, expect, it } from "vitest";
import { clampBandRange, overallBand, validateFeedback, MAX_COMMENT_LENGTH } from "@/lib/feedback";

const scores = { fluency: 6, vocabulary: 7, grammar: 6, pronunciation: 6 };

describe("overallBand", () => {
  it("rounds the mean to the nearest half band", () => {
    expect(overallBand(scores)).toBe(6.5); // 6.25 -> 6.5
    expect(overallBand({ fluency: 6, vocabulary: 6, grammar: 6, pronunciation: 7 })).toBe(6.5);
    expect(overallBand({ fluency: 5, vocabulary: 5, grammar: 5, pronunciation: 6 })).toBe(5.5);
    expect(overallBand({ fluency: 7, vocabulary: 7, grammar: 7, pronunciation: 7 })).toBe(7);
  });
});

describe("validateFeedback", () => {
  it("accepts whole bands and cleans tags and comments", () => {
    const r = validateFeedback({ scores, tags: [" Clear ", "Clear", "", 3], comments: "  good  ", wouldMatchAgain: true });
    expect(r).toEqual({ ok: true, value: { scores, tags: ["Clear"], comments: "good", wouldMatchAgain: true } });
  });

  it("rejects out-of-range or fractional scores", () => {
    expect(validateFeedback({ scores: { ...scores, grammar: 10 } }).ok).toBe(false);
    expect(validateFeedback({ scores: { ...scores, grammar: 6.5 } }).ok).toBe(false);
    expect(validateFeedback({ scores: { fluency: 6 } }).ok).toBe(false);
    expect(validateFeedback(null).ok).toBe(false);
  });

  it("caps comment length", () => {
    const r = validateFeedback({ scores, comments: "x".repeat(5000) });
    expect(r.ok && r.value.comments?.length).toBe(MAX_COMMENT_LENGTH);
  });
});

describe("clampBandRange", () => {
  it("keeps sensible ranges and falls back to any band", () => {
    expect(clampBandRange(5.5, 6.5)).toEqual({ min: 5.5, max: 6.5 });
    expect(clampBandRange(0, 99)).toEqual({ min: 1, max: 9 });
    expect(clampBandRange(7, 5)).toEqual({ min: 1, max: 9 });
    expect(clampBandRange("6", NaN)).toEqual({ min: 1, max: 9 });
  });
});
