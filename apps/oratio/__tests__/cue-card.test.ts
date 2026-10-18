import { describe, expect, it } from "vitest";
import { parseCueCard } from "@/lib/cue-card";

describe("parseCueCard", () => {
  it("splits the task and its points, keeping the final 'explain' point", () => {
    expect(
      parseCueCard(
        "Describe a person you admire. You should say: who this person is, how you know them, what qualities they have, and explain why you admire them."
      )
    ).toEqual({
      task: "Describe a person you admire.",
      points: ["Who this person is", "How you know them", "What qualities they have", "Explain why you admire them"],
    });
  });

  it("returns the text as the task when it is not a cue card", () => {
    expect(parseCueCard("Where are you from?")).toEqual({ task: "Where are you from?", points: [] });
  });
});
