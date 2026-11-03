/**
 * Word weight ("trọng số của từ"): how common or how rare the words an
 * answer uses are, and how much they vary. Rare words that are used correctly
 * are one of the things the IELTS vocabulary band describes ("less common
 * lexical items"); the same word said again and again is the opposite.
 *
 * Frequency comes from wordfreq (see lexical-data.ts for the credit). This is
 * a rough proxy: a rare word can be wrong or misheard, and a common word can be
 * used very well. It supports a person's judgement and does not replace it.
 * Pure, unit tested.
 */
import { BAND_WORDS } from "@/lib/lexical-data";

export type WordLevel = "basic" | "common" | "uncommon" | "advanced" | "rare" | "name";

const LEVELS = new Map<string, WordLevel>();
function fill() {
  if (LEVELS.size) return;
  const map: [keyof typeof BAND_WORDS, WordLevel][] = [
    ["a", "basic"],
    ["b", "common"],
    ["c", "uncommon"],
    ["d", "advanced"],
  ];
  for (const [band, level] of map) for (const w of BAND_WORDS[band].split(" ")) if (w) LEVELS.set(w, level);
}

const FUNCTION_WORDS = new Set("that this with have they there what when were been from will would your about because just like very also into then them than some more much really which their could should these those other where while".split(" "));
const ORDER: WordLevel[] = ["basic", "common", "uncommon", "advanced", "rare"];

/** Plain base forms of an inflected word, longest cut first ("studies" gives "study", "running" gives "run"). */
function bases(w: string): string[] {
  const out: string[] = [];
  const add = (s: string) => s.length >= 3 && out.push(s);
  if (w.endsWith("ies")) add(w.slice(0, -3) + "y");
  if (w.endsWith("ied")) add(w.slice(0, -3) + "y");
  if (w.endsWith("ing")) {
    add(w.slice(0, -3));
    add(w.slice(0, -3) + "e");
    if (/(.)\1$/.test(w.slice(0, -3))) add(w.slice(0, -4));
  }
  if (w.endsWith("ed")) {
    add(w.slice(0, -2));
    add(w.slice(0, -1));
    if (/(.)\1$/.test(w.slice(0, -2))) add(w.slice(0, -3));
  }
  if (w.endsWith("es")) add(w.slice(0, -2));
  if (w.endsWith("s")) add(w.slice(0, -1));
  if (w.endsWith("ly")) add(w.slice(0, -2));
  if (w.endsWith("er")) add(w.slice(0, -2));
  return out;
}

/** How common a word is. An unknown word is "rare" (a rare word, a name, or a word the machine misheard). */
export function wordLevel(word: string): WordLevel {
  fill();
  const w = word.toLowerCase().replace(/^'+|'+$/g, "");
  const own = LEVELS.get(w);
  if (own) return own;
  // "walking" counts as "walk"
  let best: WordLevel | undefined;
  for (const b of bases(w)) {
    const l = LEVELS.get(b);
    if (l && (!best || ORDER.indexOf(l) < ORDER.indexOf(best))) best = l;
  }
  return best ?? "rare";
}

export interface LexicalProfile {
  /** Words that carry meaning (the commonest function words, names and very short words left out) */
  content: number;
  /** Share of the content words that are uncommon, advanced or rare (0 to 1) */
  advancedShare: number;
  /** Share of the content words that are rare or unknown to the list (names left out) */
  rareShare: number;
  /** How much the words vary, 0 to 1 (moving-average type-token ratio over content words; window 20) */
  variety: number;
  /** Up to six advanced words, for the rater to listen to and judge */
  examples: string[];
  /** The content words said most often, three times or more */
  repeated: { word: string; count: number }[];
}

export interface LexicalToken {
  text: string;
  clean: string;
}

/** Moving-average type-token ratio: the share of different words in every window, averaged. Not changed by length the way plain TTR is. */
export function mattr(words: readonly string[], window = 20): number {
  if (words.length === 0) return 0;
  if (words.length <= window) return new Set(words).size / words.length;
  const counts = new Map<string, number>();
  let distinct = 0;
  let total = 0;
  for (let i = 0; i < words.length; i++) {
    counts.set(words[i], (counts.get(words[i]) ?? 0) + 1);
    if (counts.get(words[i]) === 1) distinct++;
    if (i >= window) {
      const out = words[i - window];
      counts.set(out, (counts.get(out) ?? 1) - 1);
      if (counts.get(out) === 0) distinct--;
    }
    if (i >= window - 1) total += distinct / window;
  }
  return total / (words.length - window + 1);
}

/**
 * `tokens` are the words of the answer in order, with their original spelling
 * (a capital letter in the middle of a sentence marks a name).
 */
export function lexicalProfile(tokens: readonly LexicalToken[]): LexicalProfile {
  fill();
  const content: string[] = [];
  const advanced: string[] = [];
  let rare = 0;
  tokens.forEach((t, i) => {
    const w = t.clean;
    if (w.length < 3 || /'/.test(w)) return;
    const level = wordLevel(w);
    if (level === "basic") return;
    // A capital letter in the middle of a sentence marks a name
    const prev = tokens[i - 1]?.text ?? ".";
    const name = /^[A-Z]/.test(t.text) && !/[.!?]["')\]]?$/.test(prev) && i > 0;
    if (name) return;
    content.push(w);
    if (level === "rare") rare++;
    if (level === "uncommon" || level === "advanced" || level === "rare") advanced.push(w);
  });
  // Said again and again: any word of four letters or more that is not a plain function word
  const counts = new Map<string, number>();
  for (const t of tokens) if (t.clean.length >= 4 && !FUNCTION_WORDS.has(t.clean)) counts.set(t.clean, (counts.get(t.clean) ?? 0) + 1);
  const seen = new Set<string>();
  const examples: string[] = [];
  for (const w of advanced) if (!seen.has(w) && examples.length < 6) {
      seen.add(w);
      examples.push(w);
    }
  return {
    content: content.length,
    advancedShare: content.length ? advanced.length / content.length : 0,
    rareShare: content.length ? rare / content.length : 0,
    variety: mattr(content),
    examples,
    repeated: [...counts].filter(([, n]) => n >= 3).map(([word, count]) => ({ word, count })).sort((a, b) => b.count - a.count).slice(0, 3),
  };
}
