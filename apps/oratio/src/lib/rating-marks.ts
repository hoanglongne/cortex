/**
 * Rating by marking (issue #130): a rater who does not know the IELTS bands
 * can still hear a pause, a good word, a mistake or a word they could not
 * catch. They tap a button when they hear one, and the bands start from those
 * taps (and from what the machine measured, when it did). The rater then only
 * confirms or nudges four numbers. Pure, unit tested.
 */
import type { Criterion } from "@cortex/classroom-oratio";

export type MarkKind = "pause" | "repeat" | "good" | "grammar" | "unclear";

export interface Mark {
  kind: MarkKind;
  /** Seconds into the recording */
  t: number;
}

export const MARK_KINDS: { kind: MarkKind; label: string; criterion: Criterion; good: boolean }[] = [
  { kind: "pause", label: "Ngập ngừng", criterion: "fluency", good: false },
  { kind: "repeat", label: "Lặp từ / bí từ", criterion: "vocabulary", good: false },
  { kind: "good", label: "Từ hay", criterion: "vocabulary", good: true },
  { kind: "grammar", label: "Sai ngữ pháp", criterion: "grammar", good: false },
  { kind: "unclear", label: "Khó nghe", criterion: "pronunciation", good: false },
];

/** Bands a tap-based start may suggest: the very low and very high bands need a person to decide. */
export const SUGGEST_MIN = 3;
export const SUGGEST_MAX = 7;
/** Recordings shorter than this count as this long, so two taps in 10 seconds are not "12 a minute". */
const MIN_SECONDS = 30;

export interface Machine {
  /** Long pauses the machine counted (measured, not heard) */
  longPauses?: number;
  /** Of those, how many the rater already listened to and judged (they are in the marks, so they are not counted twice) */
  reviewed?: number;
}

const clamp = (n: number) => Math.min(SUGGEST_MAX, Math.max(SUGGEST_MIN, Math.round(n)));

/** The starting band for each criterion. With no marks at all it is a plain middle (6, vocabulary 5). */
export function suggestBands(input: { marks: readonly Mark[]; seconds: number; machine?: Machine }): Record<Criterion, number> {
  const minutes = Math.max(input.seconds, MIN_SECONDS) / 60;
  const per = (kind: MarkKind) => input.marks.filter((m) => m.kind === kind).length / minutes;
  const unreviewed = input.machine?.longPauses != null ? Math.max(0, input.machine.longPauses - (input.machine.reviewed ?? 0)) : 0;
  const machinePauses = unreviewed / minutes;
  return {
    fluency: clamp(6 - 0.9 * (per("pause") + 0.5 * machinePauses)),
    vocabulary: clamp(5 + 0.8 * per("good") - 0.9 * per("repeat")),
    grammar: clamp(6 - 0.9 * per("grammar")),
    pronunciation: clamp(6 - 1.1 * per("unclear")),
  };
}

/** A plain-words label for a band, for people who do not know what band 5 is. */
export function plainLabel(band: number): string {
  if (band <= 3) return "Còn nhiều khó khăn";
  if (band === 4) return "Cần luyện thêm";
  if (band === 5) return "Tạm được";
  if (band === 6) return "Khá";
  return "Tốt";
}

const count = (marks: readonly Mark[], kind: MarkKind) => marks.filter((m) => m.kind === kind).length;

/** What the band is based on, in the rater's own taps and the machine's numbers. */
export function evidenceLine(criterion: Criterion, marks: readonly Mark[], machine?: Machine): string {
  const parts: string[] = [];
  if (criterion === "fluency") {
    parts.push(`${count(marks, "pause")} lần bạn đánh dấu ngập ngừng`);
    if (machine?.longPauses != null) parts.push(`máy thấy ${machine.longPauses} chỗ dừng dài`);
  } else if (criterion === "vocabulary") {
    parts.push(`${count(marks, "good")} từ hay, ${count(marks, "repeat")} chỗ lặp hoặc bí từ`);
  } else if (criterion === "grammar") {
    parts.push(`${count(marks, "grammar")} lỗi ngữ pháp bạn đánh dấu`);
  } else {
    parts.push(`${count(marks, "unclear")} chỗ khó nghe bạn đánh dấu`);
  }
  return parts.join(" · ");
}

/** "1:05" for a time in seconds. */
export function clock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}


/** One sentence on the answer as a whole, from the voice map and what the rater judged about each long pause. */
export function mapVerdict(input: { voicedShare: number; pauses: number; searching: number; thinking: number }): string {
  const share = Math.round(input.voicedShare * 100);
  if (input.pauses === 0) return `Bạn nói liền mạch: ${share}% thời gian có tiếng, không có chỗ dừng dài.`;
  const judged = input.searching + input.thinking;
  const tail =
    judged === 0
      ? "Nghe thử từng chỗ để biết là tìm từ hay chỉ nghĩ ý."
      : `${input.searching} chỗ là tìm từ, ${input.thinking} chỗ là nghĩ ý${judged < input.pauses ? `, ${input.pauses - judged} chỗ chưa nghe` : ""}.`;
  return `${share}% thời gian có tiếng, ${input.pauses} chỗ dừng dài. ${tail}`;
}
