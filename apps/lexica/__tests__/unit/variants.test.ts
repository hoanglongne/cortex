import { afterEach, describe, expect, it } from "vitest";
import {
  parseManifest,
  parseQuotes,
  parseVariants,
} from "../../app/lib/content/pack";
import {
  applyRemoteContent,
  getCard,
  getQuotes,
  resetContent,
  withVariants,
} from "../../app/lib/content/repository";
import { scenarioFor } from "../../app/lib/content/persona";

const card = {
  id: "x1",
  word: "FRUGAL",
  elo: 1000,
  level: "intermediate" as const,
  scenario: "Cuối tháng sống FRUGAL tới mức ăn mì gói ba bữa.",
  translationHint: "Tiết kiệm",
};

afterEach(() => resetContent());

describe("parseVariants", () => {
  it("keeps known archetypes with text", () => {
    expect(
      parseVariants({
        schema: 1,
        variants: {
          v001: { tech: "a", casual: "x", student: "" },
          v002: "bad",
        },
      }),
    ).toEqual({ v001: { tech: "a" } });
  });
  it("rejects other schemas", () => {
    expect(parseVariants({ schema: 2, variants: {} })).toBeNull();
  });
  it("the manifest carries the variants ref", () => {
    const m = parseManifest({
      schema: 1,
      updatedAt: "x",
      current: null,
      library: null,
      retired: [],
      variants: { id: "variants", url: "https://cdn/v.json", sha256: "abc" },
    });
    expect(m?.variants?.url).toBe("https://cdn/v.json");
    expect(parseManifest({ schema: 1, updatedAt: "x" })?.variants).toBeNull();
  });
});

describe("withVariants", () => {
  it("adds archetype sentences next to the card own one", () => {
    const out = withVariants(card, { tech: "Server rẻ nhất cho FRUGAL dev." });
    expect(out.scenarios).toEqual({
      casual: card.scenario,
      tech: "Server rẻ nhất cho FRUGAL dev.",
    });
  });
  it("drops sentences that lost the word", () => {
    expect(withVariants(card, { tech: "Không có từ nào ở đây cả." })).toBe(
      card,
    );
  });
});

describe("scenarioFor", () => {
  it("uses the learner archetype, else the card own sentence", () => {
    const c = withVariants(card, { student: "Sinh viên FRUGAL cuối kỳ." });
    expect(scenarioFor(c, "student")).toBe("Sinh viên FRUGAL cuối kỳ.");
    expect(scenarioFor(c, "tech")).toBe(card.scenario);
    expect(scenarioFor(c, null)).toBe(card.scenario);
  });
});

describe("repository", () => {
  it("lays the overlay over core cards", () => {
    const v001 = getCard("v001")!;
    const sentence = `Code review mà toàn comment ${v001.word} thì ai chịu nổi.`;
    applyRemoteContent({
      packs: [],
      retired: [],
      currentDropId: null,
      variants: { v001: { tech: sentence } },
    });
    expect(getCard("v001")?.scenarios?.tech).toBe(sentence);
    resetContent();
    expect(getCard("v001")?.scenarios).toBeUndefined();
  });
});

describe("parseQuotes", () => {
  it("keeps well-formed quotes, at most two per card", () => {
    const out = parseQuotes({
      schema: 1,
      quotes: {
        v001: [
          { kind: "book", text: "a", source: "Book" },
          {
            kind: "news",
            text: "b",
            source: "VnExpress",
            url: "https://vnexpress.net/x",
          },
          { kind: "song", text: "c", source: "Song" },
        ],
        v002: [
          { kind: "podcast", text: "x", source: "y" },
          { kind: "book", text: "", source: "y" },
        ],
        v003: "bad",
      },
    });
    expect(out.v001).toHaveLength(2);
    expect(out.v001[1]).toMatchObject({
      kind: "news",
      url: "https://vnexpress.net/x",
    });
    expect(out.v002).toBeUndefined();
    expect(out.v003).toBeUndefined();
  });
  it("is empty when the overlay has no quotes", () => {
    expect(parseQuotes({ schema: 1, variants: {} })).toEqual({});
  });
});

describe("repository quotes", () => {
  it("serves quotes per card and clears them on reset", () => {
    applyRemoteContent({
      packs: [],
      retired: [],
      currentDropId: null,
      quotes: { v001: [{ kind: "book", text: "ABUNDANT", source: "Book" }] },
    });
    expect(getQuotes("v001")[0].source).toBe("Book");
    expect(getQuotes("v002")).toEqual([]);
    resetContent();
    expect(getQuotes("v001")).toEqual([]);
  });
});
