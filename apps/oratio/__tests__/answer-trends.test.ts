import { describe, expect, it } from "vitest";
import type { MyAnswer } from "@/actions/answers";
import { isoWeek, lexicaUsed, milestones, weeklyPoints } from "@/lib/answer-trends";

const base: MyAnswer = {
  id: "a",
  questionText: "q",
  part: 1,
  mode: "solo",
  retakeOf: null,
  createdAt: "2026-10-19T09:00:00",
  durationMs: 60_000,
  speakingMs: 45_000,
  longPauses: 2,
  longestPauseMs: 1500,
  transcript: null,
  wordCount: null,
  wpm: null,
  meanRunWords: null,
  fillers: null,
  lexicalDiversity: null,
  lexicaWords: [],
  submittedAt: null,
  band: null,
  reviews: [],
};
const ans = (o: Partial<MyAnswer>): MyAnswer => ({ ...base, ...o });

describe("isoWeek", () => {
  it("uses Monday as the start and the Thursday's year", () => {
    expect(isoWeek(new Date(2026, 9, 19)).start).toBe("2026-10-19");
    expect(isoWeek(new Date(2026, 9, 25)).start).toBe("2026-10-19");
    expect(isoWeek(new Date(2026, 9, 19)).week).toBe("2026-W43");
    expect(isoWeek(new Date(2027, 0, 1)).week).toBe("2026-W53");
  });
});

describe("weeklyPoints", () => {
  it("groups by week, oldest first, and averages what exists", () => {
    const pts = weeklyPoints([
      ans({ id: "1", createdAt: "2026-10-20T09:00:00", wpm: 100, meanRunWords: 6 }),
      ans({ id: "2", createdAt: "2026-10-21T09:00:00", wpm: 120, meanRunWords: 8, longPauses: 4 }),
      ans({ id: "3", createdAt: "2026-10-13T09:00:00" }),
    ]);
    expect(pts.map((p) => p.start)).toEqual(["2026-10-12", "2026-10-19"]);
    expect(pts[0].wpm).toBeNull();
    expect(pts[1].wpm).toBe(110);
    expect(pts[1].meanRunWords).toBe(7);
    expect(pts[1].pausesPerMin).toBeCloseTo(3);
    expect(pts[1].minutesSpoken).toBeCloseTo(1.5);
  });
  it("is empty without answers", () => {
    expect(weeklyPoints([])).toEqual([]);
  });
});

describe("lexicaUsed", () => {
  it("counts each word once per answer, most used first", () => {
    const out = lexicaUsed([
      ans({ lexicaWords: ["mitigate", "mitigate", "Robust"] }),
      ans({ lexicaWords: ["mitigate"] }),
    ]);
    expect(out).toEqual([
      { word: "mitigate", count: 2 },
      { word: "robust", count: 1 },
    ]);
  });
});

describe("milestones", () => {
  it("has no dates before anything happens", () => {
    expect(milestones([]).every((m) => m.date === null)).toBe(true);
  });
  it("finds first answer, retake and band", () => {
    const m = milestones(
      [
        ans({ id: "2", createdAt: "2026-10-20T09:00:00", retakeOf: "1" }),
        ans({
          id: "1",
          createdAt: "2026-10-19T09:00:00",
          band: { low: 6, high: 6.5, raters: 2, criteria: { fluency: 6, vocabulary: 6, grammar: 6, pronunciation: 6 } },
          reviews: [{ scores: { fluency: 6, vocabulary: 6, grammar: 6, pronunciation: 6 }, tags: [], comment: null, createdAt: "2026-10-21T10:00:00Z" }],
        }),
      ],
      { reliable: true }
    );
    const by = Object.fromEntries(m.map((x) => [x.key, x.date]));
    expect(by["first-answer"]).toBe("2026-10-19T09:00:00");
    expect(by["first-retake"]).toBe("2026-10-20T09:00:00");
    expect(by["first-band"]).toBe("2026-10-21T10:00:00Z");
    expect(by["reliable"]).not.toBeNull();
  });
});
