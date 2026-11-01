import { describe, expect, it } from "vitest";
import { chapterOfWeek, endingText, endingsSeen, markEnding, tierOf, weekKey, WRITTEN_ENDINGS, TIERS } from "../src/lib/endings";
import { emptyProgress, parseProgress } from "../src/lib/level";

describe("endings", () => {
  it("the tier follows the lives left, and a mission not cleared is unfinished", () => {
    expect(tierOf(3, true)).toBe("gold");
    expect(tierOf(2, true)).toBe("silver");
    expect(tierOf(1, true)).toBe("bronze");
    expect(tierOf(0, false)).toBe("fail");
    expect(tierOf(2, false)).toBe("fail");
  });

  it("every written mission has all four endings; others use the general lines", () => {
    for (const m of WRITTEN_ENDINGS) for (const t of TIERS) expect(endingText(m, t).length).toBeGreaterThan(20);
    expect(endingText("ur-m1", "gold")).toContain("không sai");
  });

  it("an ending is kept once and counted against the written ones", () => {
    let p = markEnding(emptyProgress(), "sc-m1", "gold");
    p = markEnding(p, "sc-m1", "gold");
    p = markEnding(p, "ur-m1", "gold");
    expect(p.endings).toEqual(["sc-m1:gold", "ur-m1:gold"]);
    expect(endingsSeen(p)).toEqual({ seen: 1, total: WRITTEN_ENDINGS.length * 4 });
    expect(parseProgress(JSON.stringify({ endings: ["a:b", 3] })).endings).toEqual(["a:b"]);
    expect(parseProgress(null).endings).toEqual([]);
  });

  it("the chapter changes each Monday, not each day, and cleared missions wait", () => {
    expect(weekKey(new Date(2026, 10, 1))).toBe("2026-10-26"); // a Sunday
    expect(weekKey(new Date(2026, 10, 2))).toBe("2026-11-02"); // the Monday
    const ms = ["a", "b", "c"];
    expect(chapterOfWeek(new Date(2026, 10, 3), ms, [])).toBe(chapterOfWeek(new Date(2026, 10, 8), ms, []));
    expect(chapterOfWeek(new Date(2026, 10, 3), ms, [])).not.toBe(chapterOfWeek(new Date(2026, 10, 10), ms, []));
    const first = chapterOfWeek(new Date(2026, 10, 3), ms, []);
    expect(chapterOfWeek(new Date(2026, 10, 3), ms, [first!])).not.toBe(first);
    expect(chapterOfWeek(new Date(2026, 10, 3), [], [])).toBeNull();
    expect(chapterOfWeek(new Date(2026, 10, 3), ms, ms)).not.toBeNull();
  });
});
