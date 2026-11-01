/**
 * What the examiner reads aloud in "Thi thử một mình" (issue #90): the question
 * as an examiner would say it, in English. Part 2 is the cue card: the task, the
 * points, and the minute to think. Pure, unit tested; the voice comes from the
 * browser's own speech (a natural voice from Lexica's cache can replace it later).
 */
import { parseCueCard } from "@cortex/classroom-oratio";

/** The words the examiner says for a question of this part. */
export function examinerSpeech(part: number, text: string): string {
  if (part === 2) {
    const { task, points } = parseCueCard(text);
    const say = points.length ? ` You should say: ${points.map((p) => p.replace(/[.]$/, "")).join(", ")}.` : "";
    return `${task.replace(/\.$/, "")}.${say} You have one minute to think, and then I would like you to talk for one to two minutes.`;
  }
  return text.replace(/\s+/g, " ").trim();
}

/** Voice names that sound like an examiner: a British voice first, then any English one. */
export function pickExaminerVoice(voices: readonly { name: string; lang: string }[]): number {
  const en = voices.map((v, i) => ({ v, i })).filter(({ v }) => v.lang.toLowerCase().startsWith("en"));
  const score = ({ v }: { v: { name: string; lang: string } }) => (v.lang.toLowerCase().startsWith("en-gb") ? 3 : 0) + (/natural|neural|online|enhanced|premium|google|daniel|serena|kate/i.test(v.name) ? 2 : 0) - (/espeak|compact|fred|albert/i.test(v.name) ? 5 : 0);
  return en.sort((a, b) => score(b) - score(a))[0]?.i ?? -1;
}
