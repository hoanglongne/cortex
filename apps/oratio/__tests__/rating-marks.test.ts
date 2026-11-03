import { describe, expect, it } from "vitest";
import { clock, evidenceLine, plainLabel, suggestBands, type Mark } from "@/lib/rating-marks";

const marks = (kind: Mark["kind"], n: number): Mark[] => Array.from({ length: n }, (_, i) => ({ kind, t: i * 10 }));

describe("suggestBands", () => {
  it("is a plain middle when nothing was marked", () => {
    expect(suggestBands({ marks: [], seconds: 60 })).toEqual({ fluency: 6, vocabulary: 5, grammar: 6, pronunciation: 6 });
  });
  it("goes down with more pauses a minute, never below 3", () => {
    const some = suggestBands({ marks: marks("pause", 3), seconds: 60 }).fluency;
    const many = suggestBands({ marks: marks("pause", 30), seconds: 60 }).fluency;
    expect(some).toBeLessThan(6);
    expect(many).toBe(3);
  });
  it("counts marks per minute, not in total", () => {
    const shortTake = suggestBands({ marks: marks("grammar", 3), seconds: 60 }).grammar;
    const longTake = suggestBands({ marks: marks("grammar", 3), seconds: 240 }).grammar;
    expect(longTake).toBeGreaterThan(shortTake);
  });
  it("lifts vocabulary for good words, lowers it for repeats, and stays inside 3 to 7", () => {
    expect(suggestBands({ marks: marks("good", 4), seconds: 60 }).vocabulary).toBeGreaterThan(5);
    expect(suggestBands({ marks: marks("repeat", 4), seconds: 60 }).vocabulary).toBeLessThan(5);
    expect(suggestBands({ marks: marks("good", 40), seconds: 60 }).vocabulary).toBe(7);
  });
  it("uses the machine's long pauses for fluency when it has them", () => {
    const without = suggestBands({ marks: [], seconds: 60 }).fluency;
    const withMachine = suggestBands({ marks: [], seconds: 60, machine: { longPauses: 6 } }).fluency;
    expect(withMachine).toBeLessThan(without);
  });
  it("a very short recording does not turn two taps into twelve a minute", () => {
    expect(suggestBands({ marks: marks("unclear", 2), seconds: 10 }).pronunciation).toBe(suggestBands({ marks: marks("unclear", 2), seconds: 30 }).pronunciation);
  });
});

describe("plainLabel", () => {
  it("names the bands in plain words", () => {
    expect([2, 4, 5, 6, 7].map(plainLabel)).toEqual(["Còn nhiều khó khăn", "Cần luyện thêm", "Tạm được", "Khá", "Tốt"]);
  });
});

describe("evidenceLine", () => {
  it("shows the rater's taps and the machine's number", () => {
    expect(evidenceLine("fluency", marks("pause", 2), { longPauses: 4 })).toBe("2 lần bạn đánh dấu ngập ngừng · máy đo 4 lần dừng dài");
    expect(evidenceLine("vocabulary", [...marks("good", 1), ...marks("repeat", 2)])).toBe("1 từ hay, 2 chỗ lặp hoặc bí từ");
  });
});

describe("clock", () => {
  it("formats seconds", () => {
    expect(clock(65)).toBe("1:05");
    expect(clock(-3)).toBe("0:00");
  });
});
