import { describe, expect, it } from "vitest";
import { clipUrls, PROBE_MS, speakLines } from "@/lib/examiner-speak";
import { voiceFileName } from "@/lib/voice-key";

describe("examiner voice", () => {
  it("names clips exactly as Lexica and the API do", () => {
    expect(voiceFileName({ text: "  Hello  " })).toBe(voiceFileName({ text: "Hello", voice: "Kore" }));
    expect(voiceFileName({ text: "Hello", voice: "Aoede" })).toMatch(/^[0-9a-f]{32}\.wav$/);
    expect(voiceFileName({ text: "Hello", voice: "Aoede" })).not.toBe(voiceFileName({ text: "Hello" }));
  });

  it("never asks about an empty or very long line", () => {
    expect(clipUrls("  ")).toEqual({ stored: null, api: null });
    expect(clipUrls("x".repeat(1300))).toEqual({ stored: null, api: null });
  });

  it("checks for a made clip in about a second, never ten", () => {
    expect(PROBE_MS).toBeLessThanOrEqual(1500);
  });

  it("finishes at once when there is nothing to say or it is cancelled", async () => {
    await expect(speakLines([]).done).resolves.toBeUndefined();
    const run = speakLines(["Hello there."]);
    run.cancel();
    await expect(run.done).resolves.toBeUndefined();
  });
});
