/**
 * Rating by evidence (issue #130). A rater who does not know what band 5
 * looks like can still answer "did the speaker stop for 3 seconds to find a
 * word?". Each criterion has four questions about what can be heard; the
 * answers give a range of two bands, and the rater picks inside it (or
 * outside it, with a reason). Where the machine measured something it
 * pre-answers the question and says so; the rater can change it.
 * Pure, unit tested. The weights are rules of thumb from the public IELTS
 * descriptors, not fitted to scored recordings.
 */
import type { Criterion } from "@cortex/classroom-oratio";
import type { GrammarProfile } from "@/lib/grammar-check";
import type { LexicalProfile } from "@/lib/lexical-weight";
import type { Mark, Machine } from "@/lib/rating-marks";
import type { SpeechStats } from "@/lib/speech-words";

export type Answer = "yes" | "some" | "no";

export interface Question {
  id: string;
  criterion: Criterion;
  text: string;
  /** Which answer is the good one: for "Có dừng để tìm từ không?" it is "no" */
  good: "yes" | "no";
}

/** What to listen for in this pass, one line per criterion. */
export const FOCUS: Record<Criterion, string> = {
  fluency: "Lần nghe này chỉ chú ý nhịp: chỗ dừng, lặp, tự sửa. Đừng để ý từ hay hay dở.",
  vocabulary: "Lần nghe này chỉ chú ý từ ngữ: từ có cụ thể không, có lặp một từ mãi không.",
  grammar: "Lần nghe này chỉ chú ý câu: chia động từ, thì, câu dài hay ngắn cụt.",
  pronunciation: "Lần nghe này chỉ chú ý âm: có từ nào nghe không ra không, giọng lên xuống hay đều đều.",
};

export const QUESTIONS: Question[] = [
  { id: "f-pause", criterion: "fluency", text: "Có lúc dừng hơn 2 giây để tìm từ hoặc nghĩ câu tiếp không?", good: "no" },
  { id: "f-repair", criterion: "fluency", text: "Có hay lặp từ hoặc tự sửa lại câu giữa chừng không?", good: "no" },
  { id: "f-link", criterion: "fluency", text: "Có nối các ý bằng từ nối (because, so, but, however…) không?", good: "yes" },
  { id: "f-pace", criterion: "fluency", text: "Tốc độ nói có đều, không lúc đứng lại lúc vội không?", good: "yes" },
  { id: "v-repeat", criterion: "vocabulary", text: "Có lặp đi lặp lại cùng một từ (good, very, thing…) không?", good: "no" },
  { id: "v-specific", criterion: "vocabulary", text: "Có dùng từ cụ thể, ít gặp, không chỉ từ đơn giản không?", good: "yes" },
  { id: "v-wrong", criterion: "vocabulary", text: "Có từ dùng sai nghĩa hoặc nghe gượng không?", good: "no" },
  { id: "v-stuck", criterion: "vocabulary", text: "Có chỗ bí từ rồi bỏ lửng câu không?", good: "no" },
  { id: "g-verb", criterion: "grammar", text: "Có lỗi chia động từ hoặc thì (he go, I goed…) không?", good: "no" },
  { id: "g-complex", criterion: "grammar", text: "Có dùng câu dài, có because, which, when, if… không?", good: "yes" },
  { id: "g-whole", criterion: "grammar", text: "Câu có đủ chủ ngữ và động từ, không hay bị cụt không?", good: "yes" },
  { id: "g-blocks", criterion: "grammar", text: "Lỗi có làm bạn khó hiểu ý người nói không?", good: "no" },
  { id: "p-unclear", criterion: "pronunciation", text: "Có từ nào bạn không nghe ra nổi không?", good: "no" },
  { id: "p-intonation", criterion: "pronunciation", text: "Giọng có lên xuống, nhấn từ quan trọng, hay đều đều?", good: "yes" },
  { id: "p-endings", criterion: "pronunciation", text: "Âm cuối (-s, -ed, -t) có nghe được không?", good: "yes" },
  { id: "p-effort", criterion: "pronunciation", text: "Bạn có phải cố gắng nhiều mới hiểu được không?", good: "no" },
];

export const questionsOf = (c: Criterion) => QUESTIONS.filter((q) => q.criterion === c);

export const ANSWER_LABEL: Record<Answer, string> = { yes: "Có", some: "Thỉnh thoảng", no: "Không" };

/** How well one answer says things went: 1 is the good answer, 0.5 in between, 0 the bad one. */
export const goodness = (q: Question, a: Answer): number => (a === "some" ? 0.5 : a === q.good ? 1 : 0);

export const RANGE_MIN = 3;
export const RANGE_MAX = 7;

export interface BandRange {
  low: number;
  high: number;
  /** The middle of the range, to start the band from */
  center: number;
  answered: number;
}

/**
 * The band range from the answers. Four answers: two bands wide, centred on
 * the average (all bad 3, all good 7). Fewer answers: wider, because less is
 * known. Null with no answers.
 */
export function rangeFor(criterion: Criterion, answers: Partial<Record<string, Answer>>): BandRange | null {
  const qs = questionsOf(criterion).filter((q) => answers[q.id] != null);
  if (qs.length === 0) return null;
  const s = qs.reduce((n, q) => n + goodness(q, answers[q.id] as Answer), 0) / qs.length;
  const centerRaw = RANGE_MIN + (RANGE_MAX - RANGE_MIN) * s;
  const half = qs.length >= 4 ? 0.5 : qs.length === 3 ? 0.75 : qs.length === 2 ? 1 : 1.25;
  const clamp = (n: number) => Math.min(RANGE_MAX, Math.max(RANGE_MIN, n));
  let low = clamp(Math.round(centerRaw - half));
  let high = clamp(Math.round(centerRaw + half));
  // With all four answered the range is exactly two bands, also at the ends of the scale
  if (qs.length >= 4) {
    high = clamp(low + 1);
    low = Math.min(low, high - 1);
  }
  return { low, high: Math.max(low, high), center: clamp(Math.round(centerRaw)), answered: qs.length };
}

export const inRange = (band: number, r: BandRange | null) => !r || (band >= r.low && band <= r.high);

/** Reasons a rater may give for a band outside the range. */
export const REASONS = ["Tôi nghe thấy điều khác với các câu trả lời", "Máy đo chưa đúng ở chỗ này", "Một chỗ nổi bật làm tôi đổi ý"] as const;

export interface MachineEvidence {
  marks: readonly Mark[];
  speech?: SpeechStats | null;
  machine?: Machine;
  lexical?: LexicalProfile | null;
  grammar?: GrammarProfile | null;
  corrections?: number;
  /** Connectors the transcript has (and, but, so, because, however…) */
  connectors?: number;
}

export interface Preset {
  answer: Answer;
  /** What the machine saw, in plain words, shown next to the question */
  note: string;
}

const tri = (v: number, some: number, yes: number): Answer => (v >= yes ? "yes" : v >= some ? "some" : "no");

/**
 * What the machine can answer for the rater, with the numbers behind it. Only
 * questions it has something real to say about; the rest stay for the rater.
 */
export function presets(e: MachineEvidence): Partial<Record<string, Preset>> {
  const out: Partial<Record<string, Preset>> = {};
  const taps = (k: Mark["kind"]) => e.marks.filter((m) => m.kind === k).length;
  const sp = e.speech && e.speech.words >= 8 ? e.speech : null;
  if (sp) {
    const words = Math.max(40, sp.words);
    const stalls = sp.midPauses + (e.machine?.hums ?? sp.stretches) + taps("pause");
    const per100 = (stalls * 100) / words;
    out["f-pause"] = { answer: tri(per100, 1, 3), note: `máy đếm ${stalls} chỗ dừng giữa ý hoặc ậm ừ kéo dài` };
    const repair = sp.repeats + sp.fillers;
    out["f-repair"] = { answer: tri((repair * 100) / words, 1, 4), note: `${sp.repeats} từ lặp, ${sp.fillers} từ đệm` };
    out["f-pace"] = { answer: sp.wordsPerMinute >= 100 ? "yes" : sp.wordsPerMinute >= 75 ? "some" : "no", note: `${sp.wordsPerMinute} từ/phút` };
    if (e.connectors != null) out["f-link"] = { answer: e.connectors >= 4 ? "yes" : e.connectors >= 1 ? "some" : "no", note: `${e.connectors} từ nối trong bài` };
  }
  const lex = e.lexical && e.lexical.content >= 15 ? e.lexical : null;
  if (lex) {
    out["v-repeat"] = { answer: lex.repeated.length >= 2 ? "yes" : lex.repeated.length === 1 ? "some" : "no", note: lex.repeated.length ? `“${lex.repeated[0].word}” ${lex.repeated[0].count} lần` : "không từ nào lặp 3 lần" };
    out["v-specific"] = { answer: tri(lex.advancedShare, 0.2, 0.35), note: `${Math.round(lex.advancedShare * 100)}% từ ít gặp` };
  }
  const gr = e.grammar && e.grammar.words >= 25 ? e.grammar : null;
  if (gr) {
    const slips = gr.candidates.length + taps("grammar");
    out["g-verb"] = { answer: tri(slips, 1, 3), note: `máy ngờ ${gr.candidates.length} chỗ, bạn đánh dấu ${taps("grammar")} (máy hay tự sửa ngữ pháp khi chép nên ít hơn thật)` };
    out["g-complex"] = { answer: tri(gr.structures.length, 2, 4), note: `${gr.structures.length} loại cấu trúc` };
  } else if (taps("grammar") > 0) {
    out["g-verb"] = { answer: tri(taps("grammar"), 1, 3), note: `bạn đánh dấu ${taps("grammar")} lỗi` };
  }
  const unclear = taps("unclear") + (e.corrections ?? 0);
  if (taps("unclear") > 0 || (e.corrections ?? 0) > 0) out["p-unclear"] = { answer: tri(unclear, 1, 4), note: `${taps("unclear")} chỗ bạn đánh dấu khó nghe, ${e.corrections ?? 0} từ máy nghe sai` };
  return out;
}

const CONNECTORS = new Set(["and", "but", "so", "because", "however", "although", "though", "while", "whereas", "therefore", "then", "also", "which", "when", "if", "since", "unless", "moreover", "besides"]);

/** Connectors among the words of the answer. */
export function countConnectors(words: readonly string[]): number {
  return words.filter((w) => CONNECTORS.has(w.toLowerCase().replace(/[^a-z]/g, ""))).length;
}
