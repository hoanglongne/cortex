import type { MyAnswer } from "@/actions/answers";

/**
 * Machine-measured trends from the learner's own answers (docs/ORATIO_REDESIGN.md
 * §5.4). Pure so it can be tested. Nothing here is a band: bands come only from people.
 */

export interface WeekPoint {
  /** ISO week, e.g. "2026-W43" */
  week: string;
  /** Monday of that week, YYYY-MM-DD */
  start: string;
  answers: number;
  /** Average words per minute over answers that have a transcript, else null */
  wpm: number | null;
  /** Long pauses per minute of recording */
  pausesPerMin: number | null;
  /** Average words between two long pauses, else null */
  meanRunWords: number | null;
  /** Minutes of actual speech */
  minutesSpoken: number;
}

export interface LexicaUse {
  word: string;
  count: number;
}

export interface Milestone {
  key: "first-answer" | "first-retake" | "first-band" | "reliable";
  label: string;
  date: string | null;
}

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** ISO 8601 week of a date in local time, plus the Monday it starts on. */
export function isoWeek(date: Date): { week: string; start: string } {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dow = (day.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(day);
  monday.setDate(day.getDate() - dow);
  // The week belongs to the year of its Thursday
  const thursday = new Date(monday);
  thursday.setDate(monday.getDate() + 3);
  const jan1 = new Date(thursday.getFullYear(), 0, 1);
  const n = Math.floor((thursday.getTime() - jan1.getTime()) / 86_400_000 / 7) + 1;
  return { week: `${thursday.getFullYear()}-W${pad(n)}`, start: ymd(monday) };
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

export function weeklyPoints(answers: MyAnswer[]): WeekPoint[] {
  const buckets = new Map<string, { start: string; items: MyAnswer[] }>();
  for (const a of answers) {
    const t = new Date(a.createdAt);
    if (Number.isNaN(t.getTime())) continue;
    const { week, start } = isoWeek(t);
    const b = buckets.get(week) ?? { start, items: [] };
    b.items.push(a);
    buckets.set(week, b);
  }
  return [...buckets.entries()]
    .sort((x, y) => x[1].start.localeCompare(y[1].start))
    .map(([week, { start, items }]) => {
      const totalMs = items.reduce((s, a) => s + a.durationMs, 0);
      const pauses = items.reduce((s, a) => s + a.longPauses, 0);
      return {
        week,
        start,
        answers: items.length,
        wpm: avg(items.filter((a) => a.wpm !== null).map((a) => a.wpm as number)),
        pausesPerMin: totalMs > 0 ? pauses / (totalMs / 60_000) : null,
        meanRunWords: avg(items.filter((a) => a.meanRunWords !== null).map((a) => a.meanRunWords as number)),
        minutesSpoken: items.reduce((s, a) => s + a.speakingMs, 0) / 60_000,
      };
    });
}

/** Distinct Lexica words said in answers, most used first. */
export function lexicaUsed(answers: MyAnswer[]): LexicaUse[] {
  const counts = new Map<string, { word: string; count: number }>();
  for (const a of answers) {
    // One answer counts a word once, even if it was said twice
    for (const w of new Set(a.lexicaWords.map((x) => x.trim().toLowerCase()).filter(Boolean))) {
      const c = counts.get(w) ?? { word: w, count: 0 };
      c.count += 1;
      counts.set(w, c);
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
}

const earliest = (dates: string[]) => dates.filter((d) => !Number.isNaN(Date.parse(d))).sort()[0] ?? null;

export function milestones(answers: MyAnswer[], opts: { reliable?: boolean } = {}): Milestone[] {
  const firstBand = earliest(answers.flatMap((a) => (a.band ? a.reviews.map((r) => r.createdAt) : [])));
  const bandFallback = answers.some((a) => a.band) ? earliest(answers.filter((a) => a.band).map((a) => a.createdAt)) : null;
  return [
    { key: "first-answer", label: "Câu trả lời đầu tiên", date: earliest(answers.map((a) => a.createdAt)) },
    { key: "first-retake", label: "Lần nói lại đầu tiên", date: earliest(answers.filter((a) => a.retakeOf).map((a) => a.createdAt)) },
    { key: "first-band", label: "Lần đầu được người chấm cho band", date: firstBand ?? bandFallback },
    // No date is stored for when trust was earned
    { key: "reliable", label: "Người chấm tin cậy", date: opts.reliable ? "" : null },
  ];
}
