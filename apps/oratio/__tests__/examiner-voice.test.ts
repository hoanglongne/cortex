import { describe, expect, it } from "vitest";
import { examinerSpeech, pickExaminerVoice } from "../src/lib/examiner-voice";

describe("examiner voice", () => {
  it("reads a Part 1 or 3 question as written", () => {
    expect(examinerSpeech(1, "Do you work  or study?\n")).toBe("Do you work or study?");
  });
  it("reads a Part 2 card with its points and the minute to think", () => {
    const s = examinerSpeech(2, "Describe a teacher who has influenced you. You should say: who the teacher was, what subject they taught, and explain why they were special.");
    expect(s).toContain("Describe a teacher who has influenced you.");
    expect(s).toContain("You should say: Who the teacher was, What subject they taught");
    expect(s).toContain("one minute to think");
  });
  it("prefers a British or natural English voice, never a robotic one, and -1 with no English voice", () => {
    const voices = [
      { name: "Daniel", lang: "en-GB" },
      { name: "Samantha", lang: "en-US" },
      { name: "eSpeak", lang: "en-GB" },
      { name: "Linh", lang: "vi-VN" },
    ];
    expect(pickExaminerVoice(voices)).toBe(0);
    expect(pickExaminerVoice([{ name: "Linh", lang: "vi-VN" }])).toBe(-1);
  });
});
