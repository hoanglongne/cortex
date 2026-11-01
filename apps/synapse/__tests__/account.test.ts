import { describe, expect, it } from "vitest";
import { localFor, mergeProgress, sameProgress } from "../src/lib/account";
import { emptyProgress, record } from "../src/lib/level";

describe("account progress", () => {
  it("merges phrases by the record with more answers, and unions scenes, missions and endings", () => {
    let local = emptyProgress();
    local = record(local, "___ speak up", true);
    local = { ...local, seenScenes: ["sc-m1:1"], cleared: ["sc-m1"], endings: ["sc-m1:gold"] };
    const remote = {
      profile: { setting: "learn", auto: "recall", recent: [true, true], seenScenes: ["sc-m2:1"], cleared: ["sc-m2"], endings: ["sc-m2:silver"] },
      phrases: { "___ speak up": { seen: 4, right: 3, last: [true, true, true] }, "___ turn down": { seen: 1, right: 0, last: [false] } },
    };
    const m = mergeProgress(local, remote);
    expect(m.phrases["___ speak up"].seen).toBe(4);
    expect(m.phrases["___ turn down"]).toBeTruthy();
    expect(m.seenScenes.sort()).toEqual(["sc-m1:1", "sc-m2:1"]);
    expect(m.cleared.sort()).toEqual(["sc-m1", "sc-m2"]);
    expect(m.endings.sort()).toEqual(["sc-m1:gold", "sc-m2:silver"]);
    expect(m.setting).toBe("learn");
    expect(m.auto).toBe("recall");
  });

  it("a new account (nothing remote yet) keeps the device's progress", () => {
    const local = record(emptyProgress(), "___ speak up", false);
    const m = mergeProgress(local, { profile: null, phrases: {} });
    expect(sameProgress(m, local)).toBe(true);
  });

  it("a device used by another account starts clean; one from before accounts is kept", () => {
    const mine = record(emptyProgress(), "___ speak up", true);
    expect(localFor("u1", mine, null)).toBe(mine);
    expect(localFor("u1", mine, "u1")).toBe(mine);
    expect(localFor("u2", mine, "u1").phrases).toEqual({});
  });
});
