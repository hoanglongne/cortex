/**
 * Your own numbers over time (issue #130): after each soi lời nói the few
 * numbers that matter are kept on this device, so the next one can say whether
 * you paused less, not just how many times you paused. Numbers only, no words
 * you said. Pure maths plus a little localStorage.
 */
import type { SpeechStats } from "@/lib/speech-words";

export interface Summary {
  at: number;
  /** The answer this was made from (to keep one entry per recording) */
  key: string;
  words: number;
  midPerMinute: number;
  fillersPerMinute: number;
  repeatsPerMinute: number;
  meanRun: number;
  rate: number;
}

export function summaryOf(key: string, s: SpeechStats, at = Date.now()): Summary {
  return { at, key, words: s.words, midPerMinute: s.midPausesPerMinute, fillersPerMinute: s.fillersPerMinute, repeatsPerMinute: s.repeatsPerMinute, meanRun: s.meanRun, rate: s.articulationRate };
}

export type Direction = "better" | "same" | "worse";

export interface Delta {
  id: "mid" | "fillers" | "repeats" | "run";
  label: string;
  before: number;
  after: number;
  direction: Direction;
}

/** A change counts when it is at least this much of the old value and at least `ABS` in size. */
const REL = 0.2;
const ABS = 0.5;

function direction(before: number, after: number, lowerIsBetter: boolean): Direction {
  const diff = after - before;
  if (Math.abs(diff) < ABS || Math.abs(diff) < REL * Math.max(Math.abs(before), 1)) return "same";
  return (diff < 0) === lowerIsBetter ? "better" : "worse";
}

/** Now against an earlier take of yours. Per minute, so a longer answer is not blamed for having more of everything. */
export function compare(before: Summary, now: Summary): Delta[] {
  return [
    { id: "mid", label: "Dừng giữa ý / phút", before: before.midPerMinute, after: now.midPerMinute, direction: direction(before.midPerMinute, now.midPerMinute, true) },
    { id: "fillers", label: "Từ đệm / phút", before: before.fillersPerMinute, after: now.fillersPerMinute, direction: direction(before.fillersPerMinute, now.fillersPerMinute, true) },
    { id: "repeats", label: "Từ lặp / phút", before: before.repeatsPerMinute, after: now.repeatsPerMinute, direction: direction(before.repeatsPerMinute, now.repeatsPerMinute, true) },
    { id: "run", label: "Độ dài lượt nói", before: before.meanRun, after: now.meanRun, direction: direction(before.meanRun, now.meanRun, false) },
  ];
}

/** One line on the whole comparison. */
export function compareLine(deltas: readonly Delta[]): string {
  const better = deltas.filter((d) => d.direction === "better").length;
  const worse = deltas.filter((d) => d.direction === "worse").length;
  if (better > 0 && worse === 0) return `Tốt hơn lần trước ở ${better} mục.`;
  if (worse > 0 && better === 0) return `Kém hơn lần trước ở ${worse} mục. Mỗi lần nói một khác, đừng vội.`;
  if (better > 0 && worse > 0) return `${better} mục tốt hơn, ${worse} mục kém hơn lần trước.`;
  return "Gần giống lần trước.";
}

const KEY = "oratio-speech-history";
const KEEP = 30;

export function readHistory(): Summary[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]") as unknown;
    return Array.isArray(v) ? (v as Summary[]).filter((s) => s && typeof s.key === "string" && Number.isFinite(s.midPerMinute)) : [];
  } catch {
    return [];
  }
}

/** Keeps the entry for this recording (replacing an older one), the latest 30 in all. */
export function addSummary(s: Summary, list: readonly Summary[] = readHistory()): Summary[] {
  const next = [...list.filter((x) => x.key !== s.key), s].sort((a, b) => a.at - b.at).slice(-KEEP);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // not saved: the comparison still works this time
  }
  return next;
}

/** The take before this one. */
export function previousOf(key: string, list: readonly Summary[]): Summary | null {
  const mine = list.find((x) => x.key === key);
  const earlier = list.filter((x) => x.key !== key && (!mine || x.at < mine.at)).sort((a, b) => b.at - a.at);
  return earlier[0] ?? null;
}
