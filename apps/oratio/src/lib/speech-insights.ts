/**
 * From "what happened" to "why, and what to do" (issue #130). The X-ray shows
 * where the speaker paused; this reads the pattern of where and what came
 * before, and names the likely cause with something concrete to try. Rules,
 * not a model: each one says what it saw so the learner can check it.
 * Pure, unit tested.
 */
import type { Gap, SpeechStats, Token } from "@/lib/speech-words";

export interface Insight {
  id: "retrieval" | "opening" | "fillers" | "repeats" | "slow" | "fast" | "smooth" | "runs";
  tone: "fix" | "good";
  title: string;
  /** What the machine saw, in plain words */
  detail: string;
  /** The words involved, as the learner said them */
  evidence: string[];
  /** What to try */
  fix?: string;
  /** Phrases to say instead of staying silent or saying "um" */
  phrases?: string[];
  /** Words the learner paused in front of: good words to learn next */
  words?: string[];
}

/** Grammar words: a pause right after one means the speaker knows how the sentence goes but is looking for the next word. */
const FUNCTION_WORDS = new Set(["the", "a", "an", "to", "of", "in", "on", "at", "for", "with", "by", "from", "that", "this", "these", "those", "my", "your", "his", "her", "our", "their", "is", "are", "was", "were", "be", "have", "has", "had", "very", "more", "most", "so", "really", "can", "will", "would", "could"]);

export const BRIDGE = {
  retrieval: ["How can I put it…", "What I mean is…", "It's a kind of…", "Let me put it another way…"],
  opening: ["That's an interesting question.", "Let me think about that for a moment.", "Well, I'd say that…"],
  fillers: ["Let me see…", "The thing is…", "Actually…"],
  repeats: ["Let me start again…", "What I'm trying to say is…"],
} as const;

const sec = (n: number) => n.toFixed(1).replace(".", ",");
const quote = (t: Token) => `“${t.text.replace(/[.,;:!?]+$/, "")}”`;

/** The words, in order, that the speaker paused in front of in the middle of an idea. */
function wordsAfterMidGaps(tokens: readonly Token[], gaps: readonly Gap[]) {
  return gaps.filter((g) => g.kind === "mid").map((g) => ({ gap: g, before: tokens[g.after], after: tokens[g.after + 1] }));
}

export function insightsFor(tokens: readonly Token[], gaps: readonly Gap[], stats: SpeechStats): Insight[] {
  if (stats.words < 8) return [];
  const out: Insight[] = [];
  const mids = wordsAfterMidGaps(tokens, gaps).filter((m) => m.before && m.after);

  // 1. Pausing right after a grammar word: looking for the next word
  const afterFunction = mids.filter((m) => FUNCTION_WORDS.has(m.before.clean));
  if (afterFunction.length >= 2 || (afterFunction.length >= 1 && afterFunction.length * 2 >= mids.length)) {
    const worst = [...afterFunction].sort((a, b) => b.gap.seconds - a.gap.seconds).slice(0, 3);
    out.push({
      id: "retrieval",
      tone: "fix",
      title: "Bạn hay dừng khi đang tìm từ tiếp theo",
      detail: `${afterFunction.length} lần bạn dừng ngay sau một từ ngữ pháp (${[...new Set(afterFunction.map((m) => `“${m.before.clean}”`))].slice(0, 3).join(", ")}…). Bạn biết câu sẽ đi thế nào nhưng chưa nhớ ra từ cần dùng.`,
      evidence: worst.map((m) => `${quote(m.before)} … ${quote(m.after)} (${sec(m.gap.seconds)}s)`),
      fix: "Khi bí từ, đừng im lặng: nói một cụm kéo dài thời gian, hoặc diễn đạt bằng từ dễ hơn rồi giải thích thêm.",
      phrases: [...BRIDGE.retrieval],
      words: [...new Set(worst.map((m) => m.after.clean).filter((w) => w.length >= 4))],
    });
  }

  // 2. A slow start
  const first = tokens[0];
  const startGaps = mids.filter((m) => m.gap.start < (first?.start ?? 0) + 8);
  if (first && (first.start >= 2.5 || startGaps.length >= 2)) {
    out.push({
      id: "opening",
      tone: "fix",
      title: "Bạn mất thời gian mở đầu",
      detail: first.start >= 2.5 ? `Từ đầu tiên đến sau ${sec(first.start)} giây.` : `${startGaps.length} chỗ dừng giữa ý ngay trong 8 giây đầu.`,
      evidence: [],
      fix: "Chuẩn bị sẵn một câu mở để nói ngay trong lúc nghĩ ý chính. Người nghe thấy bạn bắt đầu liền sẽ cảm nhận bạn trôi chảy hơn.",
      phrases: [...BRIDGE.opening],
    });
  }

  // 3. Filler sounds
  if (stats.fillers >= 3 || stats.fillersPerMinute >= 4) {
    const atStart = tokens.filter((t, i) => t.filler && (i === 0 || gaps.some((g) => g.after === i - 1))).length;
    out.push({
      id: "fillers",
      tone: "fix",
      title: `Bạn dùng ${stats.fillers} từ đệm (um, uh…)`,
      detail: atStart * 2 >= stats.fillers ? `${atStart} trong số đó nằm ngay sau một chỗ dừng: bạn đang nghĩ ý và dùng “um” để giữ lượt nói.` : "Từ đệm nằm rải rác giữa câu, thường là lúc nhớ từ.",
      evidence: tokens.filter((t) => t.filler).slice(0, 4).map((t) => `“${t.text}”`),
      fix: "Thay “um” bằng một khoảng lặng ngắn hoặc một cụm có nghĩa. Khoảng lặng ngắn ở ranh giới giữa hai ý nghe tự nhiên hơn “um”.",
      phrases: [...BRIDGE.fillers],
    });
  }

  // 4. Starting a phrase again
  if (stats.repeats >= 2) {
    out.push({
      id: "repeats",
      tone: "fix",
      title: `Bạn nói lại từ hoặc cụm ${stats.repeats} lần`,
      detail: "Nói lại thường là lúc đang lên kế hoạch cho câu tiếp theo mà miệng đã chạy trước.",
      evidence: tokens.filter((t) => t.repeat).slice(0, 4).map((t) => `“${t.text}”`),
      fix: "Chậm lại một nhịp ở đầu câu để câu đi một mạch, thay vì mở đầu rồi sửa.",
      phrases: [...BRIDGE.repeats],
    });
  }

  // 5. Pace
  if (stats.articulationRate > 0 && stats.articulationRate < 90) {
    out.push({ id: "slow", tone: "fix", title: "Bạn nói khá chậm khi đang nói", detail: `${stats.articulationRate} từ mỗi phút (đã trừ chỗ dừng). Người nói trôi chảy thường khoảng 120 đến 160.`, evidence: [], fix: "Thử nói các cụm quen thuộc liền một hơi (như “a lot of people”) để tăng tốc mà không vội." });
  } else if (stats.articulationRate > 190) {
    out.push({ id: "fast", tone: "fix", title: "Bạn nói khá nhanh", detail: `${stats.articulationRate} từ mỗi phút khi đang nói. Quá nhanh dễ nuốt âm và khó nghe.`, evidence: [], fix: "Ngắt ở ranh giới giữa hai ý một nhịp ngắn để người nghe kịp theo." });
  }

  // What went well
  if (stats.midPauses === 0 && stats.words >= 20) {
    out.push({ id: "smooth", tone: "good", title: "Không có chỗ dừng giữa chừng một ý", detail: `Các chỗ dừng (${stats.boundaryPauses}) đều ở ranh giới giữa hai ý, nên nghe tự nhiên.`, evidence: [] });
  }
  if (stats.medianRun >= 8) {
    out.push({ id: "runs", tone: "good", title: "Bạn giữ được những lượt nói dài", detail: `Thường bạn nói khoảng ${stats.medianRun} từ trước khi ngắt. Ngắt đúng chỗ giữa các ý là cách người nói trôi chảy làm.`, evidence: [] });
  }
  return out;
}
