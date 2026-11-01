import { describe, expect, it } from "vitest";
import { metricsOf, settleRun, workLine } from "../src/lib/classes";
import { emptyProgress, record } from "../src/lib/level";
import { mergeProgress } from "../src/lib/account";

const mission = { id: "a1", kind: "mission", payload: { kind: "mission", lore_id: "school-01", mission_id: "sc-m1", name: "X" }, created_at: "2026-11-01T00:00:00Z" };
const review = { id: "a2", kind: "review", payload: { kind: "review" }, created_at: "2026-11-01T00:00:00Z" };
const run = (over = {}) => ({ mission_id: "sc-m1", review: false, ending: "silver" as const, at: "2026-11-02T00:00:00Z", ...over });

describe("class work", () => {
  it("a cleared mission finishes its assignment and counts as a run", () => {
    const p = settleRun(emptyProgress(), [mission, review], run());
    expect(p.runs).toBe(1);
    expect(p.homework.a1).toEqual({ done: true, best: "silver", tries: 1 });
    expect(p.homework.a2).toBeUndefined();
    expect(workLine(mission, p)).toEqual({ text: "Đã xong", done: true });
  });

  it("a mission lost is a try, not done; the review work answers to a review run", () => {
    let p = settleRun(emptyProgress(), [mission, review], run({ ending: "fail" }));
    expect(p.homework.a1).toEqual({ done: false, best: "fail", tries: 1 });
    expect(workLine(mission, p).text).toBe("Đã thử 1 lần");
    p = settleRun(p, [mission, review], { mission_id: "review", review: true, ending: "bronze", at: "2026-11-03T00:00:00Z" });
    expect(p.homework.a2.done).toBe(true);
    expect(p.homework.a1.tries).toBe(1);
    expect(workLine(review, emptyProgress()).text).toBe("Chưa chơi");
  });

  it("what is reported is numbers and phrase names", () => {
    let p = record(emptyProgress(), "___ speak up", false);
    p = record(p, "___ speak up", false);
    p = settleRun(p, [mission], run());
    const m = metricsOf(p);
    expect(m).toMatchObject({ runs: 1, cleared: 0, solid: 0, weak: ["___ speak up"] });
    expect(m.progress.a1.done).toBe(true);
  });

  it("runs and class work survive a new device", () => {
    const remote = { profile: { setting: "auto", auto: "learn", recent: [], seenScenes: [], cleared: [], endings: [], extra: { runs: 7, homework: { a1: { done: true, best: "gold", tries: 3 } } } }, phrases: {} };
    const local = settleRun(emptyProgress(), [mission], run({ ending: "fail" }));
    const m = mergeProgress(local, remote);
    expect(m.runs).toBe(7);
    expect(m.homework.a1).toEqual({ done: true, best: "gold", tries: 3 });
  });
});
