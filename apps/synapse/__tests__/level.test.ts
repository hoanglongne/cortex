import { describe, expect, it } from "vitest";
import { applyChoice, nextStage, startState } from "../src/lib/game";
import { emptyProgress, levelOf, type Progress, matchTyped, parseProgress, phraseKey, record, unlocked, weakPhrases, phraseStatus, statusCounts, markScene, markCleared } from "../src/lib/level";
import type { SynapseChoice } from "../src/lib/synapseTypes";

const choices: SynapseChoice[] = [
  { particle: "up", meaning: "lên tiếng", outcome: "ok", isCorrect: true },
  { particle: "out", meaning: "nói ra", outcome: "wrong out", isCorrect: false },
  { particle: "off", meaning: "ngắt lời", outcome: "wrong off", isCorrect: false },
];

describe("game rules", () => {
  it("a right choice adds points and heals only with the matching effect", () => {
    let s = { ...startState(), lives: 2, integrity: 60 };
    s = applyChoice(s, { isCorrect: true });
    expect(s).toMatchObject({ score: 10, lives: 2, integrity: 60 });
    s = applyChoice(s, { isCorrect: true, effect: "restore_life" });
    expect(s.lives).toBe(3);
    s = applyChoice(s, { isCorrect: true, effect: "integrity_boost" });
    expect(s.integrity).toBe(80);
    s = applyChoice({ ...s, integrity: 95 }, { isCorrect: true, effect: "integrity_boost" });
    expect(s.integrity).toBe(100);
  });

  it("a wrong choice costs a life, 25 integrity and 10 points (never below 0), three lives end it", () => {
    let s = startState();
    s = applyChoice(s, { isCorrect: false });
    expect(s).toMatchObject({ score: 0, lives: 2, integrity: 75, over: false });
    s = applyChoice(applyChoice(s, { isCorrect: false }), { isCorrect: false });
    expect(s).toMatchObject({ lives: 0, integrity: 25, over: true });
    expect(applyChoice(s, { isCorrect: true })).toBe(s);
  });

  it("knows the last stage", () => {
    expect(nextStage(2, 5)).toBe(3);
    expect(nextStage(5, 5)).toBeNull();
  });
});

describe("levels", () => {
  it("starts at learn and promotes after enough right answers, resetting the window", () => {
    let p = emptyProgress();
    expect(levelOf(p)).toBe("learn");
    for (let i = 0; i < 6; i++) p = record(p, `v${i} up`, true);
    expect(levelOf(p)).toBe("recall");
    expect(p.recent).toEqual([]);
    for (let i = 0; i < 6; i++) p = record(p, `w${i} up`, true);
    expect(levelOf(p)).toBe("use");
    for (let i = 0; i < 6; i++) p = record(p, `x${i} up`, true);
    expect(levelOf(p)).toBe("use");
  });

  it("goes back down when most answers are wrong, but not below learn", () => {
    let p: Progress = { ...emptyProgress(), auto: "use" };
    for (let i = 0; i < 6; i++) p = record(p, `a${i} up`, false);
    expect(levelOf(p)).toBe("recall");
    for (let i = 0; i < 6; i++) p = record(p, `b${i} up`, false);
    for (let i = 0; i < 6; i++) p = record(p, `c${i} up`, false);
    expect(levelOf(p)).toBe("learn");
  });

  it("a level picked by hand never moves", () => {
    let p: Progress = { ...emptyProgress(), setting: "recall" };
    for (let i = 0; i < 12; i++) p = record(p, `v${i} up`, true);
    expect(levelOf(p)).toBe("recall");
  });

  it("counts unlocked and weak phrases", () => {
    let p = emptyProgress();
    p = record(p, "speak up", true);
    p = record(p, "hold back", false);
    p = record(p, "hold back", false);
    expect(unlocked(p)).toBe(1);
    expect(weakPhrases(p)).toEqual(["hold back"]);
    expect(phraseKey(" Speak ", "UP")).toBe("speak up");
  });

  it("a typed answer finds the option, with or without the verb, else is wrong", () => {
    expect(matchTyped(" Up ", "speak", choices).isCorrect).toBe(true);
    expect(matchTyped("speak up", "speak", choices).particle).toBe("up");
    expect(matchTyped("off", "speak", choices).isCorrect).toBe(false);
    const odd = matchTyped("zzz", "speak", choices);
    expect(odd.isCorrect).toBe(false);
    expect(odd.outcome).toContain("speak zzz");
  });

  it("reads stored progress and survives broken data", () => {
    expect(parseProgress(null)).toEqual(emptyProgress());
    expect(parseProgress("not json")).toEqual(emptyProgress());
    const p = parseProgress(JSON.stringify({ setting: "use", auto: "bogus", recent: [true, 3, false], phrases: {} }));
    expect(p.setting).toBe("use");
    expect(p.auto).toBe("learn");
    expect(p.recent).toEqual([true, false]);
  });

  it("a phrase is solid after three right in a row, missed after a wrong one", () => {
    let p = emptyProgress();
    expect(phraseStatus(p.phrases["___ speak up"])).toBe("new");
    p = record(p, "___ speak up", true);
    expect(phraseStatus(p.phrases["___ speak up"])).toBe("seen");
    p = record(record(p, "___ speak up", true), "___ speak up", true);
    expect(phraseStatus(p.phrases["___ speak up"])).toBe("solid");
    p = record(p, "___ speak up", false);
    expect(phraseStatus(p.phrases["___ speak up"])).toBe("missed");
    expect(weakPhrases(p)).toEqual(["___ speak up"]);
    expect(statusCounts(p)).toEqual({ new: 0, seen: 0, missed: 1, solid: 0 });
  });

  it("progress remembers scenes and cleared missions, and old saves still load", () => {
    let p = markScene(emptyProgress(), "sc-m1:1");
    p = markScene(p, "sc-m1:1");
    expect(p.seenScenes).toEqual(["sc-m1:1"]);
    expect(markScene(p, undefined)).toBe(p);
    expect(markCleared(p, "sc-m1").cleared).toEqual(["sc-m1"]);
    const old = parseProgress(JSON.stringify({ setting: "auto", auto: "recall", recent: [true], phrases: { "___ a b": { seen: 2, right: 1 } } }));
    expect(old.seenScenes).toEqual([]);
    expect(phraseStatus(old.phrases["___ a b"])).toBe("seen");
  });
});
