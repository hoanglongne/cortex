import { describe, expect, it } from "vitest";
import { BAND_DESCRIPTORS } from "@/lib/band-descriptors";
import { CRITERIA } from "@/lib/feedback";

describe("BAND_DESCRIPTORS", () => {
  it("has a descriptor for every band 1-9 of every criterion", () => {
    for (const c of CRITERIA) {
      for (let band = 1; band <= 9; band++) {
        expect(BAND_DESCRIPTORS[c][band]?.length ?? 0).toBeGreaterThan(0);
      }
    }
  });
});
