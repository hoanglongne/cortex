import { describe, expect, it } from "vitest";
import { clock, evidenceLine, mapVerdict, plainLabel, suggestBands, type Mark } from "@/lib/rating-marks";

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
    expect(evidenceLine("fluency", marks("pause", 2), { longPauses: 4 })).toBe("2 lần bạn đánh dấu ngập ngừng · máy thấy 4 chỗ dừng dài");
    expect(evidenceLine("vocabulary", [...marks("good", 1), ...marks("repeat", 2)])).toBe("1 từ hay, 2 chỗ lặp hoặc bí từ");
  });
});

describe("clock", () => {
  it("formats seconds", () => {
    expect(clock(65)).toBe("1:05");
    expect(clock(-3)).toBe("0:00");
  });
});


describe("long pauses the rater already judged", () => {
  it("are not counted twice (once as a tap, once as a machine number)", () => {
    const base = { marks: marks("pause", 2), seconds: 60 };
    const raw = suggestBands({ ...base, machine: { longPauses: 4 } }).fluency;
    const reviewed = suggestBands({ ...base, machine: { longPauses: 4, reviewed: 4 } }).fluency;
    expect(reviewed).toBeGreaterThanOrEqual(raw);
  });
});

describe("mapVerdict", () => {
  it("says it is smooth when there are no long pauses", () => {
    expect(mapVerdict({ voicedShare: 0.82, pauses: 0, searching: 0, thinking: 0 })).toMatch(/liền mạch.*82%/);
  });
  it("asks to listen before anything was judged", () => {
    expect(mapVerdict({ voicedShare: 0.7, pauses: 3, searching: 0, thinking: 0 })).toMatch(/3 chỗ dừng dài.*Nghe thử/);
  });
  it("sums up what was judged and what is left", () => {
    expect(mapVerdict({ voicedShare: 0.7, pauses: 3, searching: 1, thinking: 1 })).toMatch(/1 chỗ là tìm từ, 1 chỗ là nghĩ ý, 1 chỗ chưa nghe/);
  });
});
