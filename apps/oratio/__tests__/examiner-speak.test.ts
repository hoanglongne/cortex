import { describe, expect, it } from "vitest";
import { apiWaitMs } from "@/lib/examiner-speak";
import { voiceFileName } from "@/lib/voice-key";

describe("examiner voice", () => {
  it("names clips exactly as Lexica and the API do", () => {
    // sha256("Kore|0|Hello") first 32 hex: a known fixed point shared with Lexica's voiceKey tests
    expect(voiceFileName({ text: "  Hello  " })).toBe(voiceFileName({ text: "Hello", voice: "Kore" }));
    expect(voiceFileName({ text: "Hello", voice: "Aoede" })).toMatch(/^[0-9a-f]{32}\.wav$/);
    expect(voiceFileName({ text: "Hello", voice: "Aoede" })).not.toBe(voiceFileName({ text: "Hello" }));
  });
  it("gives longer lines more time", () => {
    expect(apiWaitMs("Hi")).toBe(4500);
    expect(apiWaitMs("x".repeat(100))).toBe(8000);
  });
});
