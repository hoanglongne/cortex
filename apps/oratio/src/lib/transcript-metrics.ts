/**
 * Metrics from a transcript (docs/ORATIO_REDESIGN.md §5.1). Pure, no band:
 * the machine measures, people score.
 */

export interface TranscriptMetrics {
  wordCount: number;
  /** Words per minute over the whole answer */
  wpm: number;
  /** Mean words between long pauses (a common fluency measure) */
  meanRunWords: number;
  /** um, uh, er… (Whisper drops many of these, so it is a floor) */
  fillers: number;
  /** Moving-average type/token ratio, 0–1 */
  lexicalDiversity: number;
}

const FILLERS = new Set(["um", "umm", "uh", "uhm", "er", "erm", "ah", "hmm", "mm"]);
const FILLER_PHRASES = ["you know", "i mean"];

export function words(text: string): string[] {
  return (text.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) ?? []);
}

/** Type/token ratio averaged over a moving window, so long answers aren't penalised. */
export function mattr(tokens: string[], window = 25): number {
  if (tokens.length === 0) return 0;
  if (tokens.length <= window) return new Set(tokens).size / tokens.length;
  let sum = 0;
  const n = tokens.length - window + 1;
  for (let i = 0; i < n; i++) sum += new Set(tokens.slice(i, i + window)).size / window;
  return sum / n;
}

export function transcriptMetrics(text: string, durationMs: number, longPauses: number): TranscriptMetrics {
  const tokens = words(text);
  const content = tokens.filter((w) => !FILLERS.has(w));
  const lower = ` ${tokens.join(" ")} `;
  const phraseFillers = FILLER_PHRASES.reduce((n, p) => n + (lower.split(` ${p} `).length - 1), 0);
  const minutes = durationMs / 60000;
  return {
    wordCount: content.length,
    wpm: minutes > 0 ? Math.round((content.length / minutes) * 10) / 10 : 0,
    meanRunWords: Math.round((content.length / (longPauses + 1)) * 10) / 10,
    fillers: tokens.length - content.length + phraseFillers,
    lexicalDiversity: Math.round(mattr(content) * 1000) / 1000,
  };
}

/** Forms a word commonly takes in speech: plural, past, -ing, -ly. */
export function inflections(word: string): string[] {
  const w = word.toLowerCase();
  const forms = new Set([w, `${w}s`, `${w}es`, `${w}ed`, `${w}d`, `${w}ing`, `${w}ly`]);
  if (w.endsWith("y")) {
    const stem = w.slice(0, -1);
    forms.add(`${stem}ies`).add(`${stem}ied`).add(`${stem}ily`);
  }
  if (w.endsWith("e")) forms.add(`${w.slice(0, -1)}ing`);
  // Doubled final consonant: plan → planned, planning
  if (/[^aeiou][aeiou][bdgmnprt]$/.test(w)) {
    const last = w[w.length - 1];
    forms.add(`${w}${last}ed`).add(`${w}${last}ing`);
  }
  return [...forms];
}

/** The learner's Lexica words (single words or phrases) that appear in the transcript. */
export function lexicaWordsIn(text: string, vocabulary: string[]): string[] {
  const tokens = words(text);
  const joined = ` ${tokens.join(" ")} `;
  const tokenSet = new Set(tokens);
  const found: string[] = [];
  for (const entry of vocabulary) {
    const parts = words(entry);
    if (parts.length === 0) continue;
    const hit =
      parts.length === 1
        ? inflections(parts[0]).some((f) => tokenSet.has(f))
        : // Phrases: inflect only the first word ("take off" → "took off" is not caught)
          inflections(parts[0]).some((f) => joined.includes(` ${[f, ...parts.slice(1)].join(" ")} `));
    if (hit) found.push(entry);
  }
  return [...new Set(found)];
}
