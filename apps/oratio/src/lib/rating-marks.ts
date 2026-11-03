/**
 * Rating by marking (issue #130): a rater who does not know the IELTS bands
 * can still hear a pause, a good word, a mistake or a word they could not
 * catch. They tap a button when they hear one, and the bands start from those
 * taps (and from what the machine measured, when it did). The rater then only
 * confirms or nudges four numbers. Pure, unit tested.
 */
import type { Criterion } from "@cortex/classroom-oratio";
import type { GrammarProfile } from "@/lib/grammar-check";
import type { LexicalProfile } from "@/lib/lexical-weight";
import type { SpeechStats } from "@/lib/speech-words";

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

/** Bands a start may suggest: the very low and very high bands need a person to decide. */
export const SUGGEST_MIN = 3;
export const SUGGEST_MAX = 7;
/** With no transcript, a learner says about this many words a second (about 100 a minute). */
const WORDS_PER_SECOND = 1.7;
/** Fewer words than this in a take is treated as this many, so two taps in a short answer are not "20 in a hundred". */
const MIN_WORDS = 40;

export interface Machine {
  /** Long pauses the machine counted (measured, not heard) */
  longPauses?: number;
  /** Of those, how many the rater already listened to and judged (they are in the marks, so they are not counted twice) */
  reviewed?: number;
  /** Held "mmm / ừmmm" sounds the machine heard that were not words */
  hums?: number;
}

/** What the words of the answer say about vocabulary and grammar (both optional: they need a transcript). */
export interface Language {
  lexical?: LexicalProfile | null;
  grammar?: GrammarProfile | null;
  /** Words the rater had to correct in the transcript (a soft sign of unclear sounds) */
  corrections?: number;
}

export interface ScoreInput {
  marks: readonly Mark[];
  seconds: number;
  machine?: Machine;
  speech?: SpeechStats | null;
  language?: Language;
}

export interface Scored {
  bands: Record<Criterion, number>;
  /** What moved each band, in plain words, most important first */
  reasons: Record<Criterion, string[]>;
}

const clamp = (n: number) => Math.min(SUGGEST_MAX, Math.max(SUGGEST_MIN, Math.round(n)));
const cap = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const comma = (n: number) => String(Math.round(n * 10) / 10).replace(".", ",");

/**
 * The four bands to start from. Everything is counted per 100 words, not per
 * minute: one slip in a 30-second answer is about one in 75 words, and it
 * should cost about as much as one slip in a 3-minute answer would in 450.
 * Each criterion starts from a plain middle and moves with what was found; the
 * weights are rules of thumb from the research on perceived fluency and the
 * public IELTS descriptors, not fitted to scored recordings, so the rater
 * always has the last word.
 */
export function scoreBands(input: ScoreInput): Scored {
  const { marks, seconds, machine, speech, language } = input;
  const hasWords = !!speech && speech.words >= 8;
  const words = Math.max(MIN_WORDS, hasWords ? speech!.words : Math.round(seconds * WORDS_PER_SECOND));
  const per100 = (n: number) => (n * 100) / words;
  const taps = (kind: MarkKind) => marks.filter((m) => m.kind === kind).length;
  const reasons: Record<Criterion, string[]> = { fluency: [], vocabulary: [], grammar: [], pronunciation: [] };

  // Fluency
  let fluency: number;
  if (hasWords) {
    const sp = speech!;
    const hums = Math.max(0, (machine?.hums ?? 0) - sp.stretches);
    const trouble = per100(sp.midPauses + 0.7 * sp.fillers + 0.5 * sp.repeats + hums + 0.5 * taps("pause"));
    const wpm = sp.wordsPerMinute;
    const pace = wpm < 60 ? -1.5 : wpm < 80 ? -1 : wpm < 100 ? -0.5 : wpm >= 110 ? 0.5 : 0;
    const run = sp.medianRun >= 8 ? 0.5 : sp.medianRun <= 3 ? -0.5 : 0;
    fluency = 6 + pace + run - 0.3 * trouble;
    if (trouble >= 3) reasons.fluency.push(`${comma(trouble)} chỗ ngập ngừng trên 100 từ (dừng giữa ý, từ đệm, ậm ừ kéo dài, lặp từ)`);
    if (pace < 0) reasons.fluency.push(`tốc độ ${wpm} từ/phút, chậm`);
    if (pace > 0) reasons.fluency.push(`tốc độ ${wpm} từ/phút, tự nhiên`);
    if (run < 0) reasons.fluency.push("các lượt nói rất ngắn");
    if (trouble < 3 && pace >= 0) reasons.fluency.push("ít ngập ngừng giữa ý");
  } else {
    const unreviewed = machine?.longPauses != null ? Math.max(0, machine.longPauses - (machine.reviewed ?? 0)) : 0;
    const trouble = per100(taps("pause") + 0.5 * unreviewed + (machine?.hums ?? 0));
    fluency = 6 - 0.5 * trouble;
    reasons.fluency.push("chưa có phần chép lời nên chỉ dựa trên chỗ ngừng bạn đánh dấu và máy đo");
  }

  // Vocabulary
  const lex = language?.lexical && language.lexical.content >= 15 ? language.lexical : null;
  let vocabulary = 5;
  if (lex) {
    const variety = lex.variety >= 0.85 ? 0.5 : lex.variety < 0.65 ? -1 : lex.variety < 0.75 ? -0.5 : 0;
    const rich = lex.advancedShare >= 0.4 ? 1 : lex.advancedShare >= 0.3 ? 0.5 : lex.advancedShare < 0.15 ? -0.5 : 0;
    const again = -Math.min(0.6, 0.3 * lex.repeated.length);
    vocabulary += variety + rich + again;
    if (rich > 0) reasons.vocabulary.push(`${Math.round(lex.advancedShare * 100)}% từ ít gặp`);
    if (rich < 0) reasons.vocabulary.push("hầu như chỉ dùng từ quen thuộc");
    if (variety < 0) reasons.vocabulary.push("nhiều từ bị nhắc lại");
    if (variety > 0) reasons.vocabulary.push("từ ngữ đa dạng");
    if (again < 0) reasons.vocabulary.push(`lặp "${lex.repeated[0].word}" ${lex.repeated[0].count} lần`);
  }
  const good = cap(0.5 * per100(taps("good")), 0, 1.5);
  const stuck = cap(0.6 * per100(taps("repeat")), 0, 1.5);
  vocabulary += good - stuck;
  if (good > 0) reasons.vocabulary.push(`${taps("good")} từ hay bạn đánh dấu`);
  if (stuck > 0) reasons.vocabulary.push(`${taps("repeat")} chỗ lặp hoặc bí từ bạn đánh dấu`);

  // Grammar
  const gr = language?.grammar && language.grammar.words >= 25 ? language.grammar : null;
  let grammar = 6;
  const errors = cap(0.6 * per100(taps("grammar")), 0, 3);
  grammar -= errors;
  if (errors > 0) reasons.grammar.push(`${taps("grammar")} lỗi bạn đánh dấu, tính trên 100 từ`);
  if (gr) {
    const guess = cap(0.3 * per100(gr.candidates.length), 0, 1);
    const range = gr.words >= 40 ? (gr.structures.length >= 5 ? 1 : gr.structures.length >= 3 ? 0.5 : gr.structures.length <= 1 ? -0.5 : 0) : 0;
    grammar += range - guess;
    if (range > 0) reasons.grammar.push(`dùng ${gr.structures.length} loại cấu trúc khác nhau`);
    if (range < 0) reasons.grammar.push("hầu như chỉ dùng câu đơn");
    if (guess > 0) reasons.grammar.push(`máy ngờ ${gr.candidates.length} chỗ sai`);
  }

  // Pronunciation
  const unclear = cap(0.7 * per100(taps("unclear")), 0, 3);
  const fixes = cap(0.25 * per100(language?.corrections ?? 0), 0, 1);
  const pronunciation = 6 - unclear - fixes;
  if (unclear > 0) reasons.pronunciation.push(`${taps("unclear")} chỗ khó nghe bạn đánh dấu`);
  if (fixes > 0) reasons.pronunciation.push(`${language?.corrections} từ máy nghe sai phải sửa (có thể do máy)`);

  return { bands: { fluency: clamp(fluency), vocabulary: clamp(vocabulary), grammar: clamp(grammar), pronunciation: clamp(pronunciation) }, reasons };
}

/** The starting band for each criterion. With no marks and no transcript it is a plain middle. */
export function suggestBands(input: ScoreInput): Record<Criterion, number> {
  return scoreBands(input).bands;
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

/** What the band is based on: what was counted in the answer, and in the rater's own taps. */
export function evidenceLine(criterion: Criterion, marks: readonly Mark[], machine?: Machine, speech?: SpeechStats | null, language?: Language): string {
  const parts: string[] = [];
  const lex = language?.lexical && language.lexical.content >= 15 ? language.lexical : null;
  const gr = language?.grammar && language.grammar.words >= 25 ? language.grammar : null;
  if (criterion === "fluency" && speech && speech.words >= 8) {
    parts.push(`${speech.wordsPerMinute} từ/phút`);
    parts.push(`${speech.midPauses} chỗ dừng giữa ý`);
    if (speech.fillers > 0) parts.push(`${speech.fillers} từ đệm`);
    const hums = Math.max(machine?.hums ?? 0, speech.stretches);
    if (hums > 0) parts.push(`${hums} lần ậm ừ kéo dài`);
    if (speech.repeats > 0) parts.push(`${speech.repeats} từ lặp`);
    const taps = count(marks, "pause");
    if (taps > 0) parts.push(`${taps} chỗ bạn đánh dấu`);
  } else if (criterion === "fluency") {
    parts.push(`${count(marks, "pause")} lần bạn đánh dấu ngập ngừng`);
    if (machine?.longPauses != null) parts.push(`máy thấy ${machine.longPauses} chỗ dừng dài`);
    if (machine?.hums) parts.push(`${machine.hums} lần ậm ừ kéo dài`);
  } else if (criterion === "vocabulary") {
    if (lex) {
      parts.push(`${Math.round(lex.advancedShare * 100)}% từ ít gặp`);
      if (lex.examples.length) parts.push(`như ${lex.examples.slice(0, 3).join(", ")}`);
    }
    parts.push(`${count(marks, "good")} từ hay, ${count(marks, "repeat")} chỗ lặp hoặc bí từ bạn đánh dấu`);
  } else if (criterion === "grammar") {
    if (gr) parts.push(`${gr.structures.length} loại cấu trúc`);
    if (gr && gr.candidates.length) parts.push(`máy ngờ ${gr.candidates.length} chỗ sai`);
    parts.push(`${count(marks, "grammar")} lỗi bạn đánh dấu`);
  } else {
    parts.push(`${count(marks, "unclear")} chỗ khó nghe bạn đánh dấu`);
    if (language?.corrections) parts.push(`${language.corrections} từ máy nghe sai`);
  }
  return parts.join(" · ");
}

/** "1:05" for a time in seconds. */
export function clock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}


/** One sentence on the answer as a whole, from the voice map and what the rater judged about each long pause. */
export function mapVerdict(input: { voicedShare: number; pauses: number; searching: number; thinking: number; hums?: number }): string {
  const share = Math.round(input.voicedShare * 100);
  const hums = input.hums ?? 0;
  if (input.pauses === 0 && hums > 0) return `Máy nghe thấy ${hums} lần ngân dài “mmm” không thành từ (đã tính là lúc ngừng, không tính là nói). Nghe lại những chỗ đó để xem bạn đang tìm từ hay nghĩ ý.`;
  if (input.pauses === 0) return `Bạn nói liền mạch: ${share}% thời gian có tiếng, không có chỗ dừng dài.`;
  const judged = input.searching + input.thinking;
  const tail =
    judged === 0
      ? "Nghe thử từng chỗ để biết là tìm từ hay chỉ nghĩ ý."
      : `${input.searching} chỗ là tìm từ, ${input.thinking} chỗ là nghĩ ý${judged < input.pauses ? `, ${input.pauses - judged} chỗ chưa nghe` : ""}.`;
  return `${share}% thời gian có tiếng, ${input.pauses} chỗ dừng dài. ${tail}`;
}
