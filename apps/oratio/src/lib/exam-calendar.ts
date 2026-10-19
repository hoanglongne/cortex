/**
 * Giờ thi as a calendar file (.ics) for devices without web push (iPhone not
 * installed as an app, or notifications blocked). Floating local times, so it
 * follows the device clock like lib/exam-hours.ts.
 */
export function examCalendarIcs(url: string, now: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const day = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const event = (uid: string, start: string, end: string, rule: string) => [
    "BEGIN:VEVENT",
    `UID:${uid}@oratio`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${day}T${start}`,
    `DTEND:${day}T${end}`,
    `RRULE:${rule}`,
    "SUMMARY:Giờ thi Oratio",
    `DESCRIPTION:Thi thử IELTS Speaking với người thật. ${url}`,
    `URL:${url}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Giờ thi Oratio sắp mở",
    "END:VALARM",
    "END:VEVENT",
  ];
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Oratio//Gio thi//VI",
    "CALSCALE:GREGORIAN",
    ...event("evening", "203000", "220000", "FREQ=DAILY"),
    ...event("weekend-noon", "120000", "130000", "FREQ=WEEKLY;BYDAY=SA,SU"),
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
