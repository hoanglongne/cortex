import { describe, expect, it } from "vitest";
import { examCalendarIcs } from "@/lib/exam-calendar";

describe("examCalendarIcs", () => {
  it("has the evening and weekend-noon windows with a reminder", () => {
    const ics = examCalendarIcs("https://oratio.example", new Date(2026, 9, 19, 9, 0));
    expect(ics).toContain("DTSTART:20261019T203000");
    expect(ics).toContain("RRULE:FREQ=DAILY");
    expect(ics).toContain("RRULE:FREQ=WEEKLY;BYDAY=SA,SU");
    expect(ics.match(/BEGIN:VALARM/g)).toHaveLength(2);
    expect(ics.split("\r\n")[0]).toBe("BEGIN:VCALENDAR");
  });
});
