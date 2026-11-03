import { beforeEach, describe, expect, it } from "vitest";
import { recoverFromCrash } from "@/lib/client/whisper";

const store = new Map<string, string>();
beforeEach(() => {
  store.clear();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
});

describe("recoverFromCrash", () => {
  it("does nothing after a normal visit", () => {
    expect(recoverFromCrash()).toBeNull();
  });
  it("steps down one model when the page was closed while it worked", () => {
    store.set("oratio-whisper-busy", "small");
    expect(recoverFromCrash()).toMatch(/nhẹ hơn/);
    expect(store.get("oratio-whisper-model")).toBe("base");
    expect(store.has("oratio-whisper-busy")).toBe(false);
    store.set("oratio-whisper-busy", "base");
    recoverFromCrash();
    expect(store.get("oratio-whisper-model")).toBe("tiny");
  });
  it("turns transcription off when even the lightest model failed", () => {
    store.set("oratio-whisper-busy", "tiny");
    expect(recoverFromCrash()).toMatch(/tắt chép lời/);
    expect(store.get("oratio-transcribe")).toBe("off");
  });
});
