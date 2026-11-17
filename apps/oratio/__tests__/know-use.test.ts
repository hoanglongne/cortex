import { describe, expect, it } from "vitest";
import type { MyAnswer } from "@/actions/answers";
import { knowUse, upgradesFor } from "@/lib/know-use";

const ans = (createdAt: string, lexicaWords: string[], transcript: string, speakingMs = 120_000) =>
  ({ createdAt, lexicaWords, transcript, speakingMs }) as unknown as MyAnswer;

describe("Biết – Dùng", () => {
  const learned = ["Feasible", "outstanding", "remarkable", "significant", "crucial", "abundant"];
  const answers = [
    ans("2026-11-02T10:00:00Z", ["feasible"], "It is very good and very good again, a feasible plan"),
    ans("2026-11-10T10:00:00Z", ["significant", "unknown"], "This is very good, really important and significant"),
    ans("2026-11-11T10:00:00Z", [], "Very good. It is important."),
  ];

  it("counts learned words said, unused ones and a weekly rate", () => {
    const k = knowUse(learned, answers);
    expect(k.learned).toBe(6);
    expect(k.used).toBe(2);
    expect(k.rate).toBeCloseTo(2 / 6);
    expect(k.minutes).toBeCloseTo(6);
    expect(k.unused).toEqual(["outstanding", "remarkable", "crucial", "abundant"]);
    expect(k.weeks.map((w) => w.used)).toEqual([1, 2]);
  });

  it("suggests only learned, unsaid upgrades for plain words said often", () => {
    const said = new Set(["feasible", "significant"]);
    const ups = upgradesFor(answers, learned, said);
    const vg = ups.find((u) => u.plain === "very good");
    expect(vg).toEqual({ plain: "very good", count: 3, options: ["outstanding", "remarkable"] });
    expect(ups.find((u) => u.plain === "important")).toBeUndefined(); // said in only 2 answers
    expect(upgradesFor(answers, learned, said, 2).find((u) => u.plain === "important")?.options).toEqual(["crucial"]);
  });
});

import { retryTarget } from "@/lib/know-use";

describe("retry target", () => {
  const a = (id: string, createdAt: string, transcript: string) =>
    ({ questionId: id, questionText: `Q ${id}`, createdAt, transcript, lexicaWords: [], speakingMs: 0 }) as unknown as MyAnswer;
  it("picks the latest answer with the plain word, else the latest answer with unused words", () => {
    const answers = [a("q1", "2026-11-01", "very good place"), a("q2", "2026-11-05", "very good food"), a("q3", "2026-11-06", "nothing")];
    const ups = [{ plain: "very good", count: 2, options: ["outstanding"] }];
    expect(retryTarget(answers, ups, [])).toEqual({ questionId: "q2", questionText: "Q q2", words: ["outstanding"], plain: "very good" });
    expect(retryTarget(answers, [], ["crucial", "vague", "abundant", "x"])).toEqual({ questionId: "q3", questionText: "Q q3", words: ["crucial", "vague", "abundant"] });
    expect(retryTarget([], [], ["x"])).toBeNull();
  });
});
