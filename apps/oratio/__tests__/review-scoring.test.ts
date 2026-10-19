import { describe, expect, it } from "vitest";
import { answerBand, pickNext, reliabilityOf, submissionsLeft, type QueueCandidate } from "@/lib/review-scoring";

const s = (v: number) => ({ fluency: v, vocabulary: v, grammar: v, pronunciation: v });
const pairs = (n: number, diff: number) => Array.from({ length: n }, () => ({ given: 6 + diff, reference: 6 }));

describe("reliabilityOf", () => {
  it("has no score and a middle weight until enough samples", () => {
    const r = reliabilityOf({ anchors: pairs(2, 0), consensus: [] });
    expect(r.score).toBeNull();
    expect(r.weight).toBeCloseTo(0.6);
    expect(r.trusted).toBe(false);
  });

  it("trusts a reviewer who matches the anchors", () => {
    const r = reliabilityOf({ anchors: pairs(6, 0.5), consensus: pairs(4, 0) });
    expect(r.score).toBe(1);
    expect(r.weight).toBe(1);
    expect(r.trusted).toBe(true);
  });

  it("weights down a reviewer who is far off", () => {
    const r = reliabilityOf({ anchors: pairs(5, 2), consensus: [] });
    expect(r.score).toBe(0);
    expect(r.weight).toBeCloseTo(0.2);
  });
});

describe("answerBand", () => {
  it("is null without reviews", () => {
    expect(answerBand([])).toBeNull();
  });

  it("gives ±0.5 for one rater", () => {
    expect(answerBand([{ scores: s(6), weight: 1 }])).toMatchObject({ low: 5.5, high: 6.5, raters: 1 });
  });

  it("leans to the reliable reviewer", () => {
    const band = answerBand([
      { scores: s(7), weight: 1 },
      { scores: s(5), weight: 0.2 },
      { scores: s(7), weight: 1 },
    ])!;
    expect(band.criteria.fluency).toBe(7);
    expect(band.low).toBeGreaterThanOrEqual(6);
    expect(band.high).toBeLessThanOrEqual(7.5);
  });
});

describe("submissionsLeft", () => {
  it("gives one free, then one per two reviews", () => {
    expect(submissionsLeft(0, 0)).toBe(1);
    expect(submissionsLeft(0, 1)).toBe(0);
    expect(submissionsLeft(3, 1)).toBe(1);
    expect(submissionsLeft(4, 1)).toBe(2);
  });
});

describe("pickNext", () => {
  const c = (id: string, over: Partial<QueueCandidate> = {}): QueueCandidate => ({
    id,
    isAnchor: false,
    submittedAt: "2026-10-19T08:00:00Z",
    reviews: 0,
    ownerReviewsGiven: 0,
    ...over,
  });

  it("returns null with nothing open", () => {
    expect(pickNext([c("a", { reviews: 5 })])).toBeNull();
  });

  it("prefers answers still short of reviews, then the oldest", () => {
    const next = pickNext(
      [c("full", { reviews: 3, submittedAt: "2026-10-18T00:00:00Z" }), c("new", { submittedAt: "2026-10-19T09:00:00Z" }), c("old")],
      () => 0.9
    );
    expect(next?.id).toBe("old");
  });

  it("moves helpful owners up", () => {
    const next = pickNext([c("early"), c("helper", { submittedAt: "2026-10-19T10:00:00Z", ownerReviewsGiven: 4 })], () => 0.9);
    expect(next?.id).toBe("helper");
  });

  it("serves an anchor sometimes, and when nothing else is left", () => {
    expect(pickNext([c("a"), c("anchor", { isAnchor: true })], () => 0.1)?.id).toBe("anchor");
    expect(pickNext([c("a"), c("anchor", { isAnchor: true })], () => 0.9)?.id).toBe("a");
    expect(pickNext([c("anchor", { isAnchor: true })], () => 0.9)?.id).toBe("anchor");
  });
});
