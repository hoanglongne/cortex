import { describe, expect, it } from "vitest";
import { examinerMoment, paceStatus, partTarget } from "@/lib/examiner-script";

const pos = (part: number, questionInTurn: number, turnInPart: 1 | 2 = 1, extra = {}) => ({
  part,
  questionInTurn,
  turnInPart,
  hasQuestion: true,
  completed: false,
  ...extra,
});

describe("examinerMoment", () => {
  it("opens Part 1 before the first question", () => {
    expect(examinerMoment(pos(1, 1, 1, { hasQuestion: false }))?.id).toBe("p1-open");
  });
  it("only speaks at the start of a turn in Parts 1 and 3", () => {
    expect(examinerMoment(pos(1, 1))?.id).toBe("p1-open");
    expect(examinerMoment(pos(1, 3))).toBeNull();
    expect(examinerMoment(pos(1, 1, 2))?.id).toBe("p1-next");
    expect(examinerMoment(pos(3, 1))?.id).toBe("p3-open");
    expect(examinerMoment(pos(3, 2))).toBeNull();
    expect(examinerMoment(pos(3, 1, 2))?.id).toBe("p3-next");
  });
  it("briefs Part 2 on the cue card and closes it after the talk", () => {
    expect(examinerMoment(pos(2, 1))?.id).toBe("p2-brief");
    expect(examinerMoment(pos(2, 2))?.id).toBe("p2-after");
  });
  it("closes when everything was asked", () => {
    expect(examinerMoment(pos(3, 3, 2, { completed: true }))?.id).toBe("closing");
  });
});

describe("paceStatus", () => {
  it("compares elapsed time with the part window", () => {
    expect(paceStatus(1, 100)).toBe("under");
    expect(paceStatus(1, 240)).toBe("on");
    expect(paceStatus(3, 301)).toBe("over");
    expect(paceStatus(2, 179)).toBe("under");
    expect(paceStatus(2, 180)).toBe("on");
  });
  it("targets match the real test", () => {
    expect(partTarget(2).prepS).toBe(60);
    expect(partTarget(1).label).toBe("4–5 phút");
  });
});
