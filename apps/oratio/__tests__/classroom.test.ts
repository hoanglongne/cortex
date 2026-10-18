import { describe, expect, it } from "vitest";
import { studentApp, type BoardStudent } from "@cortex/classroom";
import { assignmentState, oratioModule, progressOf, weekGain } from "@cortex/classroom-oratio";
import { bandAverages, callMinutes, preferredPool } from "@/lib/server/classroom";

const Q = (id: string, part: number, category: string) => ({ id, part, category });
const bank = [Q("a", 1, "Home"), Q("b", 1, "Home"), Q("c", 1, "Work"), Q("d", 2, "Home"), Q("e", 3, "Work")];
const byId = new Map(bank.map((q) => [q.id, q]));

describe("Oratio module", () => {
  it("reads bad data as defaults, never throws", () => {
    expect(oratioModule.parseMetrics("x")).toEqual({ sessions: 0, minutes: 0, ratings: 0, band: null, current_band: null, target_band: null, progress: {} });
    expect(oratioModule.parseMetrics({ band: { fluency: 12, grammar: 6.3 } }).band).toEqual({ grammar: 6.5 });
    expect(oratioModule.parseSettings({ target_band: 3 })).toEqual({ target_band: null });
    expect(oratioModule.parsePayload("topic", null)).toEqual({ kind: "topic", category: "", part: null, sessions: 1 });
    expect(oratioModule.parsePayload("goal", { sessions: 99, minutes: -5 })).toEqual({ kind: "goal", sessions: 50, minutes: 0 });
  });

  it("counts progress per kind: topic calls, questions asked, a goal since it was given", () => {
    const sessions = [
      { ended_at: "2026-10-10T10:00:00Z", minutes: 20, questions: ["a", "e"] },
      { ended_at: "2026-10-12T10:00:00Z", minutes: 15, questions: ["c", "d"] },
      { ended_at: "2026-10-01T10:00:00Z", minutes: 30, questions: ["a", "b"] },
    ];
    const at = "2026-10-05T00:00:00Z";
    const q = (id: string) => byId.get(id);
    expect(progressOf({ kind: "topic", payload: { category: "Home", part: 1, sessions: 2 }, created_at: at }, sessions, q)).toEqual({ sessions: 1, minutes: 20, asked: 0 });
    expect(progressOf({ kind: "topic", payload: { category: "Home", part: null, sessions: 2 }, created_at: at }, sessions, q).sessions).toBe(2);
    expect(progressOf({ kind: "questions", payload: { question_ids: ["a", "b", "c"] }, created_at: at }, sessions, q)).toEqual({ sessions: 2, minutes: 35, asked: 2 });
    const goal = { kind: "goal", payload: oratioModule.parsePayload("goal", { sessions: 2, minutes: 30 }) };
    expect(assignmentState(goal, { sessions: 2, minutes: 35, asked: 0 })).toEqual({ started: true, done: true, line: "2/2 buổi · 30/30 phút" });
    expect(assignmentState({ kind: "questions", payload: oratioModule.parsePayload("questions", { question_ids: ["a", "b"] }) }, undefined).line).toBe("0/2 câu");
  });

  it("the teacher's class view: who finished, praise for effort, a parent line", () => {
    const student = (metrics: object, week_ago: object | null = null): BoardStudent => ({
      user_id: "u", name: "Lan", joined_at: "x", note: null, streak: 0, last_active: null, inactive_days: 0, days: [],
      apps: { oratio: { metrics, last_active: null, week_ago, week_first: null } },
    });
    const a = { id: "t1", app: "oratio", kind: "topic", title: "Home", due_on: null, created_at: "x", payload: oratioModule.parsePayload("topic", { category: "Home", sessions: 2 }) };
    const done = student({ progress: { t1: { sessions: 2 } } });
    expect(oratioModule.assignmentProgress(a, [done, student({ progress: { t1: { sessions: 1 } } }), student({})])).toEqual({ started: 2, done: 1, total: 3 });
    const app = studentApp(oratioModule, student({ sessions: 9, minutes: 140, band: { overall: 6 } }, { sessions: 6, minutes: 95 }))!;
    expect(weekGain(app)).toEqual({ sessions: 3, minutes: 45 });
    expect(oratioModule.praise(app)).toEqual({ why: "45 phút nói tuần này", score: 82.5 });
    expect(oratioModule.parentLine(app)).toBe("Nói: 3 buổi, 45 phút tuần này; bạn luyện chấm gần đây khoảng band 6.0.");
  });
});

describe("Oratio classes on the server", () => {
  it("counts call minutes like the stats trigger", () => {
    expect(callMinutes("2026-10-10T10:00:00Z", "2026-10-10T10:00:50Z")).toBe(0);
    expect(callMinutes("2026-10-10T10:00:00Z", "2026-10-10T10:25:20Z")).toBe(25);
    expect(callMinutes("2026-10-10T10:00:00Z", "2026-10-10T14:00:00Z")).toBe(90);
  });

  it("averages ratings with IELTS rounding", () => {
    const r = bandAverages([{ scores: { fluency: 6, vocabulary: 7, grammar: 6, pronunciation: 7 } }, { scores: { fluency: 7, vocabulary: 7, grammar: 5, pronunciation: 6 } }, { scores: null }]);
    expect(r).toEqual({ count: 2, bands: { fluency: 6.5, vocabulary: 7, grammar: 5.5, pronunciation: 6.5, overall: 6.5 } });
    expect(bandAverages([])).toEqual({ bands: null, count: 0 });
  });

  it("asks assigned questions first, then the assigned topic, then any", () => {
    const work = { questionIds: new Set(["b"]), topics: [{ category: "Work", part: null }] };
    expect(preferredPool(bank, 1, [], work).map((q) => q.id)).toEqual(["b"]);
    expect(preferredPool(bank, 1, ["b"], work).map((q) => q.id)).toEqual(["c"]);
    expect(preferredPool(bank, 2, [], work).map((q) => q.id)).toEqual(["d"]);
    expect(preferredPool(bank, 1, ["a", "b", "c"], { questionIds: new Set(), topics: [] }).map((q) => q.id)).toEqual(["a", "b", "c"]);
  });
});
