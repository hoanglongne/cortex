import { describe, expect, it } from "vitest";
import {
  claimOrder,
  isBandCompatible,
  looseBandThreshold,
  msSince,
} from "@/lib/matchmaking/rules";

describe("looseBandThreshold", () => {
  it("starts strict and widens with wait time", () => {
    expect(looseBandThreshold(0)).toBe(0.5);
    expect(looseBandThreshold(20_000)).toBe(1.0);
    expect(looseBandThreshold(45_000)).toBe(1.5);
    expect(looseBandThreshold(5 * 60_000)).toBe(2.0);
  });
});

describe("isBandCompatible", () => {
  const me = { band: 6.0, wantMin: 5.5, wantMax: 7.0, waitedMs: 0 };

  it("accepts mutual range matches", () => {
    expect(
      isBandCompatible(me, { band: 6.5, targetMin: 5.0, targetMax: 7.0 })
    ).toEqual({ compatible: true, perfect: true });
  });

  it("rejects a large gap for a user who just joined", () => {
    const them = { band: 7.5, targetMin: 7.0, targetMax: 8.5 };
    expect(isBandCompatible(me, them).compatible).toBe(false);
  });

  it("accepts the same gap after waiting a while", () => {
    const them = { band: 7.5, targetMin: 7.0, targetMax: 8.5 };
    expect(
      isBandCompatible({ ...me, waitedMs: 50_000 }, them)
    ).toEqual({ compatible: true, perfect: false });
  });

  it("requires both sides to want each other for a perfect match", () => {
    const them = { band: 6.5, targetMin: 7.0, targetMax: 8.0 };
    expect(isBandCompatible(me, them)).toEqual({
      compatible: true,
      perfect: false,
    });
  });
});

describe("claimOrder", () => {
  it("gives two racing users the same order regardless of who is 'me'", () => {
    const a = "1b4e28ba-2fa1-11d2-883f-0016d3cca427";
    const b = "9c5b94b1-35ad-49bb-b118-8e8fc24abf80";
    expect(claimOrder([a, b])).toEqual(claimOrder([b, a]));
    expect(claimOrder([b, a])[0]).toBe(a);
  });

  it("does not mutate its input", () => {
    const ids = ["b", "a"];
    claimOrder(ids);
    expect(ids).toEqual(["b", "a"]);
  });
});

describe("msSince", () => {
  it("measures elapsed time", () => {
    expect(msSince("2026-01-01T00:00:00Z", Date.parse("2026-01-01T00:00:05Z"))).toBe(5000);
  });

  it("treats missing or invalid timestamps as infinitely old", () => {
    expect(msSince(null)).toBe(Number.POSITIVE_INFINITY);
    expect(msSince("garbage")).toBe(Number.POSITIVE_INFINITY);
  });
});
