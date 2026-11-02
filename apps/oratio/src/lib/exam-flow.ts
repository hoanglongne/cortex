/**
 * The scripted run of "Thi thử có giám khảo" (issue #90): what the examiner
 * says before each question and how long each answer may run. Pure and unit
 * tested; the browser parts (speech, recording) live in the screen.
 */
import { examinerMoment } from "@/lib/examiner-script";
import { examinerSpeech } from "@/lib/examiner-voice";

interface Q {
  part: number;
  question_text: string;
}

/** Longest one answer may run before the recording stops by itself (seconds). */
export function examMaxSeconds(part: number): number {
  return part === 2 ? 120 : part === 3 ? 90 : 45;
}

/** Seconds to think before Part 2, as in the real test. */
export const PREP_SECONDS = 60;

/** What the examiner says at question `index`: the part's opening line (first question of a part), then the question. */
export function examLines(questions: readonly Q[], index: number): string[] {
  const q = questions[index];
  if (!q) return [];
  const questionInTurn = questions.slice(0, index).filter((x) => x.part === q.part).length + 1;
  const moment = examinerMoment({ part: q.part, questionInTurn, turnInPart: 1, hasQuestion: true, completed: false });
  // Part 2's brief already ends with "Here is your topic."
  return [...(moment ? [moment.line] : []), examinerSpeech(q.part, q.question_text)];
}

/**
 * Cuts lines into short spoken parts (whole sentences, grouped up to `max`
 * characters). The voice makes a short part in seconds, and the same fixed
 * sentences ("Now I'm going to give you a topic...") are shared by every exam,
 * so each is made once and then played from the cache.
 */
export function sentenceChunks(lines: readonly string[], max = 140): string[] {
  const out: string[] = [];
  for (const line of lines) {
    const sentences = line.replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]*["')\]]*\s*/g) ?? [];
    let cur = "";
    for (const sentence of sentences.map((x) => x.trim()).filter(Boolean)) {
      if (cur && cur.length + 1 + sentence.length > max) {
        out.push(cur);
        cur = sentence;
      } else cur = cur ? `${cur} ${sentence}` : sentence;
    }
    if (cur) out.push(cur);
  }
  return out;
}

export function examClosingLine(): string {
  return examinerMoment({ part: 3, questionInTurn: 1, turnInPart: 1, hasQuestion: true, completed: true })?.line ?? "";
}
