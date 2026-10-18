/**
 * Giờ thi chung (docs/ORATIO_REDESIGN.md §5.3): fixed windows when people
 * gather for live mock tests, so matching works. Local time of the device
 * (the audience is in Vietnam).
 *   Every day 20:30–22:00; Saturday and Sunday also 12:00–13:00.
 */
type Window = { start: number; end: number }; // minutes since midnight

const DAILY: Window[] = [{ start: 20 * 60 + 30, end: 22 * 60 }];
const WEEKEND: Window[] = [{ start: 12 * 60, end: 13 * 60 }, ...DAILY];

const windowsFor = (d: Date) => (d.getDay() === 0 || d.getDay() === 6 ? WEEKEND : DAILY);
const minutesOf = (d: Date) => d.getHours() * 60 + d.getMinutes();
const clock = (m: number) => `${Math.floor(m / 60)}:${(m % 60).toString().padStart(2, "0")}`;

export type ExamHourStatus =
  | { live: true; endsAt: string; label: string }
  | { live: false; startsAt: Date; label: string };

export function examHourStatus(now: Date = new Date()): ExamHourStatus {
  const m = minutesOf(now);
  const current = windowsFor(now).find((w) => m >= w.start && m < w.end);
  if (current) {
    return { live: true, endsAt: clock(current.end), label: `Đang trong giờ thi, tới ${clock(current.end)}` };
  }
  for (let dayOffset = 0; dayOffset < 8; dayOffset++) {
    const day = new Date(now);
    day.setDate(now.getDate() + dayOffset);
    for (const w of windowsFor(day)) {
      if (dayOffset === 0 && w.start <= m) continue;
      const startsAt = new Date(day);
      startsAt.setHours(Math.floor(w.start / 60), w.start % 60, 0, 0);
      const when = dayOffset === 0 ? "hôm nay" : dayOffset === 1 ? "ngày mai" : startsAt.toLocaleDateString("vi-VN", { weekday: "long" });
      return { live: false, startsAt, label: `Giờ thi tiếp theo: ${clock(w.start)} ${when}` };
    }
  }
  return { live: false, startsAt: now, label: "" };
}
