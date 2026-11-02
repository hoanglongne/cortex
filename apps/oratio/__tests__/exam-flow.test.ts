import { describe, expect, it } from "vitest";
import { examClosingLine, examLines, examMaxSeconds } from "@/lib/exam-flow";

const qs = [
  { part: 1, question_text: "Do you work or study?" },
  { part: 1, question_text: "Where do you live?" },
  { part: 2, question_text: "Describe a place you visited.\nYou should say:\n- where it was\n- when you went" },
  { part: 3, question_text: "Why do people travel?" },
  { part: 3, question_text: "Is tourism good?" },
];

describe("examLines", () => {
  it("opens each part once, then reads the question", () => {
    expect(examLines(qs, 0)).toHaveLength(2);
    expect(examLines(qs, 0)[0]).toMatch(/Good evening/);
    expect(examLines(qs, 1)).toEqual(["Where do you live?"]);
    expect(examLines(qs, 2)[0]).toMatch(/one minute to think/);
    expect(examLines(qs, 3)[0]).toMatch(/general questions/);
    expect(examLines(qs, 4)).toEqual(["Is tourism good?"]);
  });
  it("is empty past the end", () => {
    expect(examLines(qs, 9)).toEqual([]);
  });
});

describe("limits", () => {
  it("gives Part 2 the longest answer", () => {
    expect(examMaxSeconds(2)).toBe(120);
    expect(examMaxSeconds(1)).toBeLessThan(examMaxSeconds(3));
  });
  it("has a closing line", () => {
    expect(examClosingLine()).toMatch(/end of the speaking test/);
  });
});
