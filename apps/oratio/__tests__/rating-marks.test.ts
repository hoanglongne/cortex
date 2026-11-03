import { describe, expect, it } from "vitest";
import type { GrammarProfile } from "@/lib/grammar-check";
import type { LexicalProfile } from "@/lib/lexical-weight";
import { clock, evidenceLine, mapVerdict, plainLabel, scoreBands, suggestBands, type Mark } from "@/lib/rating-marks";
import type { SpeechStats } from "@/lib/speech-words";

const marks = (kind: Mark["kind"], n: number): Mark[] => Array.from({ length: n }, (_, i) => ({ kind, t: i * 10 }));

describe("suggestBands", () => {
  it("is a plain middle when nothing was marked", () => {
    expect(suggestBands({ marks: [], seconds: 60 })).toEqual({ fluency: 6, vocabulary: 5, grammar: 6, pronunciation: 6 });
  });
  it("goes down with more pauses, never below 3", () => {
    const some = suggestBands({ marks: marks("pause", 8), seconds: 60 }).fluency;
    const many = suggestBands({ marks: marks("pause", 60), seconds: 60 }).fluency;
    expect(some).toBeLessThan(6);
    expect(many).toBe(3);
  });
  it("counts marks per 100 words, so a longer answer can hold more of them", () => {
    const shortTake = suggestBands({ marks: marks("grammar", 3), seconds: 60 }).grammar;
    const longTake = suggestBands({ marks: marks("grammar", 3), seconds: 240 }).grammar;
    expect(longTake).toBeGreaterThan(shortTake);
  });
  it("one grammar slip in a 30 second answer does not drop grammar to 4", () => {
    expect(suggestBands({ marks: marks("grammar", 1), seconds: 30 }).grammar).toBeGreaterThanOrEqual(5);
  });
  it("lifts vocabulary for good words, lowers it for repeats, and stays inside 3 to 7", () => {
    expect(suggestBands({ marks: marks("good", 4), seconds: 60 }).vocabulary).toBeGreaterThan(5);
    expect(suggestBands({ marks: marks("repeat", 4), seconds: 60 }).vocabulary).toBeLessThan(5);
    expect(suggestBands({ marks: marks("good", 40), seconds: 60 }).vocabulary).toBe(7);
  });
  it("uses the machine's long pauses for fluency when there is no transcript", () => {
    const without = suggestBands({ marks: [], seconds: 60 }).fluency;
    const withMachine = suggestBands({ marks: [], seconds: 60, machine: { longPauses: 20 } }).fluency;
    expect(withMachine).toBeLessThan(without);
  });
  it("a very short recording does not turn two taps into twenty in a hundred words", () => {
    expect(suggestBands({ marks: marks("unclear", 2), seconds: 10 }).pronunciation).toBe(suggestBands({ marks: marks("unclear", 2), seconds: 20 }).pronunciation);
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
    expect(evidenceLine("vocabulary", [...marks("good", 1), ...marks("repeat", 2)])).toBe("1 từ hay, 2 chỗ lặp hoặc bí từ bạn đánh dấu");
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


describe("fluency from the words and their timing", () => {
  const speech = (o: Partial<SpeechStats> = {}): SpeechStats => ({
    words: 120, span: 60, wordsPerMinute: 120, articulationRate: 140, meanRun: 6, medianRun: 8, midPauses: 0, boundaryPauses: 6, fillers: 0, markers: 0, repeats: 0, stretches: 0, midPausesPerMinute: 0, fillersPerMinute: 0, repeatsPerMinute: 0, ...o,
  });
  it("gives fluent speech with no stumbling a good band, not a middling one", () => {
    expect(suggestBands({ marks: [], seconds: 60, speech: speech() }).fluency).toBe(7);
  });
  it("does not mark down pauses between ideas", () => {
    const calm = suggestBands({ marks: [], seconds: 60, speech: speech({ boundaryPauses: 12 }) }).fluency;
    const stumbling = suggestBands({ marks: [], seconds: 60, speech: speech({ midPauses: 12 }) }).fluency;
    expect(calm).toBeGreaterThanOrEqual(6);
    expect(stumbling).toBeLessThan(calm);
  });
  it("counts fillers and repeats", () => {
    const base = suggestBands({ marks: [], seconds: 60, speech: speech() }).fluency;
    expect(suggestBands({ marks: [], seconds: 60, speech: speech({ fillers: 12, repeats: 8 }) }).fluency).toBeLessThan(base);
  });
  it("does not praise an answer made of hums and long, slow stretches", () => {
    const humming = suggestBands({ marks: [], seconds: 60, speech: speech({ words: 45, wordsPerMinute: 45, medianRun: 3, midPauses: 4, stretches: 2 }), machine: { hums: 9 } }).fluency;
    expect(humming).toBeLessThanOrEqual(4);
  });
  it("falls back to the taps when there are too few words", () => {
    expect(suggestBands({ marks: [], seconds: 60, speech: speech({ words: 3 }) }).fluency).toBe(6);
  });
  it("says what it is based on, without strange phrases", () => {
    const line = evidenceLine("fluency", [], { hums: 2 }, speech({ midPauses: 3, fillers: 2 }));
    expect(line).toBe("120 từ/phút · 3 chỗ dừng giữa ý · 2 từ đệm · 2 lần ậm ừ kéo dài");
    expect(line).not.toMatch(/nói liền/);
  });
});

describe("vocabulary and grammar from the words", () => {
  const lex = (o: Partial<LexicalProfile> = {}): LexicalProfile => ({ content: 60, advancedShare: 0.25, rareShare: 0.05, variety: 0.8, examples: [], repeated: [], ...o });
  const gram = (o: Partial<GrammarProfile> = {}): GrammarProfile => ({ words: 100, structures: ["past", "subordinate"], sentences: 6, candidates: [], ...o });
  it("rewards uncommon words and variety, and lowers for plain repetitive speech", () => {
    const mid = suggestBands({ marks: [], seconds: 60, language: { lexical: lex() } }).vocabulary;
    const rich = suggestBands({ marks: [], seconds: 60, language: { lexical: lex({ advancedShare: 0.45, variety: 0.9 }) } }).vocabulary;
    const plain = suggestBands({ marks: [], seconds: 60, language: { lexical: lex({ advancedShare: 0.1, variety: 0.6, repeated: [{ word: "good", count: 5 }] }) } }).vocabulary;
    expect(rich).toBeGreaterThan(mid);
    expect(plain).toBeLessThan(mid);
  });
  it("rewards a range of structures and lowers for the ones the machine doubts", () => {
    const base = suggestBands({ marks: [], seconds: 60, language: { grammar: gram() } }).grammar;
    const varied = suggestBands({ marks: [], seconds: 60, language: { grammar: gram({ structures: ["past", "perfect", "passive", "relative", "conditional"] }) } }).grammar;
    const doubtful = suggestBands({ marks: [], seconds: 60, language: { grammar: gram({ candidates: Array.from({ length: 6 }, () => ({ rule: "r", snippet: "s", hint: "h", at: 0 })) }) } }).grammar;
    expect(varied).toBeGreaterThan(base);
    expect(doubtful).toBeLessThan(base);
  });
  it("lists why a band moved", () => {
    const r = scoreBands({ marks: marks("grammar", 2), seconds: 60 });
    expect(r.reasons.grammar[0]).toMatch(/2 lỗi/);
  });
});
