/**
 * Guided rating (issue #130): instead of asking a non-expert for a band from 1
 * to 9, ask what they heard (does the speaker pause for 3 seconds to find a
 * word?) and suggest a range of bands from the answers. The rater still picks
 * the band; the range only tells them where to look. Pure, unit tested.
 */
import type { Criterion } from "@cortex/classroom-oratio";

export type Answer = "yes" | "some" | "no";

export interface GuideQuestion {
  id: string;
  /** What the rater is asked, about something they can hear */
  text: string;
  /** true: "yes" is a strength; false: "yes" is a weakness */
  positive: boolean;
}

export interface CriterionGuide {
  /** What to listen for this time */
  listenFor: string;
  questions: GuideQuestion[];
  /** What a band 4, 6 and 8 speaker sounds like, in plain words */
  anchors: Record<4 | 6 | 8, string>;
}

export const GUIDE: Record<Criterion, CriterionGuide> = {
  fluency: {
    listenFor: "Chú ý chỗ người nói dừng và cách họ nối các ý.",
    questions: [
      { id: "f1", text: "Có phải dừng hơn 3 giây để tìm từ hoặc nghĩ ý không?", positive: false },
      { id: "f2", text: "Có tự sửa lại giữa câu hoặc bỏ dở câu nhiều lần không?", positive: false },
      { id: "f3", text: "Có nối các ý bằng từ nối (because, so, but, however…) không?", positive: true },
      { id: "f4", text: "Có nói liền được một ý dài hơn hai câu mà không bị đứt không?", positive: true },
    ],
    anchors: {
      4: "Hay dừng lâu giữa câu, trả lời ngắn một hai câu, nhiều chỗ tự sửa hoặc bỏ dở.",
      6: "Nói được dài nhưng đôi lúc dừng để tìm từ; nối ý bằng từ nối đơn giản.",
      8: "Nói liền mạch, hiếm khi dừng; nếu dừng thì để nghĩ ý, không phải để tìm từ.",
    },
  },
  vocabulary: {
    listenFor: "Chú ý từ ngữ: có lặp lại, có cụ thể, có chỗ bí từ không.",
    questions: [
      { id: "v1", text: "Có lặp đi lặp lại vài từ đơn giản (good, very, thing) không?", positive: false },
      { id: "v2", text: "Có dùng từ cụ thể thay cho từ chung chung (vd exhausted thay cho very tired) không?", positive: true },
      { id: "v3", text: "Có chỗ phải nói tiếng Việt hoặc nói vòng vì thiếu từ không?", positive: false },
      { id: "v4", text: "Có diễn đạt một ý bằng cách khác khi cần (nói lại bằng từ khác) không?", positive: true },
    ],
    anchors: {
      4: "Dùng từ cơ bản, lặp nhiều; thiếu từ thì nói vòng hoặc bỏ ý.",
      6: "Đủ từ để nói về chủ đề quen; có vài từ chính xác hơn; đôi khi dùng sai.",
      8: "Dùng từ linh hoạt, có cụm tự nhiên; hiếm khi dùng sai.",
    },
  },
  grammar: {
    listenFor: "Chú ý độ dài câu, thì của động từ và lỗi làm khó hiểu.",
    questions: [
      { id: "g1", text: "Có dùng câu ghép hoặc câu có mệnh đề phụ (although, which, if…) không?", positive: true },
      { id: "g2", text: "Lỗi ngữ pháp có làm bạn khó hiểu ý người nói không?", positive: false },
      { id: "g3", text: "Có hay sai thì của động từ (quá khứ/hiện tại) hoặc quên -s, -ed không?", positive: false },
      { id: "g4", text: "Câu đúng ngữ pháp có nhiều hơn câu sai không?", positive: true },
    ],
    anchors: {
      4: "Chủ yếu câu đơn, hay sai thì và mạo từ; lỗi có thể làm khó hiểu.",
      6: "Dùng được câu phức nhưng vẫn mắc lỗi; lỗi ít làm khó hiểu.",
      8: "Phần lớn câu đúng, câu phức tự nhiên; chỉ có lỗi nhỏ lẻ tẻ.",
    },
  },
  pronunciation: {
    listenFor: "Chú ý xem bạn có hiểu ngay không, và giọng lên xuống có tự nhiên không.",
    questions: [
      { id: "p1", text: "Nghe một lần là hiểu hầu hết các từ, không phải đoán?", positive: true },
      { id: "p2", text: "Có từ bị nghe nhầm thành từ khác (vd ship và sheep) không?", positive: false },
      { id: "p3", text: "Nhấn trọng âm và lên xuống giọng tự nhiên, không đều đều?", positive: true },
      { id: "p4", text: "Có bỏ âm cuối từ (-s, -t, -d) làm khó nghe không?", positive: false },
    ],
    anchors: {
      4: "Nhiều âm sai khiến người nghe phải đoán; giọng đều đều.",
      6: "Hiểu được gần hết; có âm sai nhưng ít gây hiểu nhầm; có nhấn nhá.",
      8: "Dễ hiểu suốt; trọng âm và ngữ điệu tự nhiên; chỉ lệch nhẹ ở vài âm.",
    },
  },
};

/** 0 weak, 1 mixed, 2 strong for one answer. */
export function points(q: GuideQuestion, a: Answer): 0 | 1 | 2 {
  if (a === "some") return 1;
  return (a === "yes") === q.positive ? 2 : 0;
}

/** Answers needed before a range is suggested. "Not sure" is left out of the count. */
export const MIN_ANSWERED = 3;

export interface Suggestion {
  low: number;
  high: number;
  /** How many questions the range is based on */
  answered: number;
}

/**
 * A range of two bands from the answers, or null with too few. All
 * weak answers point to bands 2 to 3, all strong to 7 to 8: the top bands need
 * a person who listens closely, not four answers.
 */
export function suggestBand(criterion: Criterion, answers: Record<string, Answer | undefined>): Suggestion | null {
  const qs = GUIDE[criterion].questions;
  let sum = 0;
  let answered = 0;
  for (const q of qs) {
    const a = answers[q.id];
    if (!a) continue;
    sum += points(q, a);
    answered++;
  }
  if (answered < MIN_ANSWERED) return null;
  const centre = 2.5 + (sum / (2 * answered)) * 5;
  return { low: Math.max(1, Math.round(centre - 0.5)), high: Math.min(9, Math.round(centre + 0.5)), answered };
}

/** One line on a pick that lies outside the suggested range. */
export function outsideNote(band: number, s: Suggestion | null): string | null {
  if (!s) return null;
  if (band < s.low) return `Thấp hơn gợi ý (${s.low} đến ${s.high}). Chắc chưa? Nghe lại đoạn có lỗi nặng nhất.`;
  if (band > s.high) return `Cao hơn gợi ý (${s.low} đến ${s.high}). Chắc chưa? Nghe lại chỗ ngập ngừng hoặc sai.`;
  return null;
}
