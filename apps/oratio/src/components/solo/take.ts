import type { SpeechMetrics } from "@/lib/client/speech-metrics";
import type { TranscriptMetrics } from "@/lib/transcript-metrics";
import { formatClock } from "@/components/ui/timer";

/** Aim for the next take, derived from the last one. */
export type Goal = { kind: "pauses"; from: number } | { kind: "word"; word: string } | { kind: "speak"; seconds: number };

/** off: transcription not on; pending: working on it; done / failed */
export type TranscriptState = { status: "off" | "pending" | "done" | "failed"; text?: string; metrics?: TranscriptMetrics };

export type SaveState = "pending" | "saved" | "failed" | "skipped";

export type Take = {
  id: number;
  url: string;
  blob: Blob;
  seconds: number;
  /** undefined while measuring, "failed" if the browser could not decode it */
  metrics?: SpeechMetrics | "failed";
  tx: TranscriptState;
  lexica: string[];
  save: SaveState;
  /** Database id once saved */
  answerId?: string;
  submitted?: boolean;
  goal?: Goal;
  /** 4/3/2: target length of this take in seconds */
  drillTarget?: number;
};

export const DRILL_TARGETS = [120, 90, 60];

export const fmtMs = (ms: number) => formatClock(Math.round(ms / 1000));

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const okMetrics = (t?: Take) => (t?.metrics && t.metrics !== "failed" ? t.metrics : null);
export const txMetrics = (t?: Take) => (t?.tx.status === "done" ? (t.tx.metrics ?? null) : null);

export function goalText(g: Goal) {
  if (g.kind === "pauses") return g.from <= 1 ? "không có quãng ngừng dài nào" : `ít hơn ${g.from} quãng ngừng dài`;
  if (g.kind === "word") return `thử dùng từ ${g.word}`;
  return `nói được ít nhất ${formatClock(g.seconds)}`;
}

/** A concrete goal for the next take, from real numbers of the last one. */
export function deriveGoal(last: Take | undefined, hints: string[], lo: number): Goal | null {
  const m = okMetrics(last);
  if (!last || !m) return null;
  const used = new Set(last.lexica.map((w) => w.toLowerCase()));
  const unused = last.tx.status === "done" ? hints.find((w) => !used.has(w.toLowerCase())) : undefined;
  if (unused && m.longPauses <= 1) return { kind: "word", word: unused };
  if (m.longPauses > 0) return { kind: "pauses", from: m.longPauses };
  if (unused) return { kind: "word", word: unused };
  if (m.speakingMs / 1000 < lo) return { kind: "speak", seconds: lo };
  return null;
}

export type GoalOutcome = { state: "met" | "missed" | "waiting" | "unknown"; detail: string };

export function checkGoal(g: Goal, take: Take, prev: Take | undefined): GoalOutcome {
  const m = okMetrics(take);
  if (g.kind === "word") {
    if (take.tx.status === "pending") return { state: "waiting", detail: "Đang chép lời để kiểm tra." };
    if (take.tx.status !== "done") return { state: "unknown", detail: "Chưa kiểm tra được vì chưa có chép lời." };
    const hit = take.lexica.some((w) => w.toLowerCase() === g.word.toLowerCase());
    return { state: hit ? "met" : "missed", detail: hit ? `Bạn đã dùng "${g.word}".` : `Chưa thấy "${g.word}" trong bài nói.` };
  }
  if (!m) return { state: "unknown", detail: "Chưa đo được bản ghi này." };
  if (g.kind === "pauses") {
    const before = okMetrics(prev)?.longPauses ?? g.from;
    const met = m.longPauses < g.from;
    return { state: met ? "met" : "missed", detail: `${before} → ${m.longPauses} quãng ngừng dài.` };
  }
  const met = m.speakingMs / 1000 >= g.seconds;
  return { state: met ? "met" : "missed", detail: `Bạn nói ${fmtMs(m.speakingMs)}.` };
}
