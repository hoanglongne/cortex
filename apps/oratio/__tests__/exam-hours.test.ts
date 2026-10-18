import { describe, expect, it } from "vitest";
import { examHourStatus } from "@/lib/exam-hours";

// 2026-10-21 is a Wednesday, 2026-10-24 a Saturday
const at = (iso: string) => new Date(iso);

describe("examHourStatus", () => {
  it("is live inside the evening window", () => {
    expect(examHourStatus(at("2026-10-21T21:00:00"))).toMatchObject({ live: true, endsAt: "22:00" });
  });

  it("points to tonight before the window and tomorrow after it", () => {
    expect(examHourStatus(at("2026-10-21T09:00:00")).label).toBe("Giờ thi tiếp theo: 20:30 hôm nay");
    expect(examHourStatus(at("2026-10-21T22:30:00")).label).toBe("Giờ thi tiếp theo: 20:30 ngày mai");
  });

  it("adds a midday window on weekends", () => {
    expect(examHourStatus(at("2026-10-24T12:15:00")).live).toBe(true);
    expect(examHourStatus(at("2026-10-24T09:00:00")).label).toBe("Giờ thi tiếp theo: 12:00 hôm nay");
    expect(examHourStatus(at("2026-10-23T23:00:00")).label).toBe("Giờ thi tiếp theo: 12:00 ngày mai");
  });
});
