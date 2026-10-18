import { describe, expect, it } from "vitest";
import { practiceLine } from "@/lib/character-lines";

const base = { name: "Long", examLive: false, waiting: 0, sessions: 5, streak: 0, lastComment: null, hour: 15 };

describe("practiceLine", () => {
  it("reassures a first-timer", () => {
    expect(practiceLine({ ...base, sessions: 0 }).mood).toBe("nervous");
  });

  it("points to the exam room only when people are actually waiting", () => {
    expect(practiceLine({ ...base, examLive: true, waiting: 3 }).text).toContain("3 người");
    expect(practiceLine({ ...base, examLive: true, waiting: 0 }).text).not.toContain("người đang chờ");
  });

  it("quotes the last real comment", () => {
    expect(practiceLine({ ...base, lastComment: "Nói chậm lại" }).text).toContain("Nói chậm lại");
  });

  it("celebrates a streak", () => {
    expect(practiceLine({ ...base, streak: 4 })).toEqual({ mood: "happy", text: expect.stringContaining("4 ngày") });
  });
});
