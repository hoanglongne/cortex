import type { MyAnswer } from "@/actions/answers";
import { isoWeek } from "@/lib/answer-trends";
import { lexicaWordsIn } from "@/lib/transcript-metrics";

/**
 * Khoảng cách Biết – Dùng (issue #137), pure: the learner's Lexica words
 * against the words they actually said in recorded answers (on-device
 * transcripts, already matched into answers.lexica_words). Numbers only;
 * nothing here leaves the device.
 */

/** Minutes of speech before the numbers are shown, so a first try is not discouraging. */
export const MIN_MINUTES = 10;

export interface KnowUse {
  learned: number;
  used: number;
  /** used / learned, 0–1 */
  rate: number;
  minutes: number;
  /** Learned words never said, most recently learned first (input order). */
  unused: string[];
  /** Cumulative use rate at the end of each week. */
  weeks: { week: string; start: string; used: number; rate: number }[];
}

export function knowUse(learnedWords: string[], answers: MyAnswer[]): KnowUse {
  const learned = [...new Set(learnedWords.map((w) => w.trim().toLowerCase()).filter(Boolean))];
  const learnedSet = new Set(learned);
  const said = new Set<string>();
  const sorted = [...answers].filter((a) => !Number.isNaN(Date.parse(a.createdAt))).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const weeks: KnowUse["weeks"] = [];
  for (const a of sorted) {
    for (const w of a.lexicaWords) {
      const k = w.trim().toLowerCase();
      if (learnedSet.has(k)) said.add(k);
    }
    const { week, start } = isoWeek(new Date(a.createdAt));
    const point = { week, start, used: said.size, rate: learned.length ? said.size / learned.length : 0 };
    if (weeks.length && weeks[weeks.length - 1].week === week) weeks[weeks.length - 1] = point;
    else weeks.push(point);
  }
  const minutes = answers.reduce((s, a) => s + a.speakingMs, 0) / 60_000;
  return {
    learned: learned.length,
    used: said.size,
    rate: learned.length ? said.size / learned.length : 0,
    minutes,
    unused: learned.filter((w) => !said.has(w)),
    weeks,
  };
}

/**
 * Plain words learners lean on, and stronger words from the Lexica deck that
 * can replace them. Only words the learner has learned are ever suggested.
 */
export const UPGRADES: Record<string, string[]> = {
  "very good": ["outstanding", "remarkable", "impressive", "excellent"],
  "very bad": ["detrimental", "harmful", "terrible"],
  "a lot of": ["abundant", "numerous", "considerable", "plenty of"],
  "lots of": ["abundant", "numerous", "considerable"],
  important: ["significant", "crucial", "fundamental", "essential", "indispensable"],
  big: ["massive", "significant", "substantial", "considerable"],
  good: ["beneficial", "valuable", "effective", "worthwhile"],
  bad: ["detrimental", "harmful", "negative"],
  difficult: ["challenging", "arduous", "demanding"],
  hard: ["challenging", "arduous", "demanding"],
  think: ["believe", "perceive", "contemplate"],
  use: ["utilize", "leverage"],
  show: ["reveal", "demonstrate", "highlight"],
  help: ["benefit", "facilitate", "encourage"],
  many: ["numerous", "abundant"],
  clear: ["evident", "obvious", "explicit", "lucid"],
  boring: ["tedious", "monotonous", "mundane"],
  interesting: ["fascinating", "compelling"],
  change: ["transform", "adapt", "modify"],
  get: ["obtain", "acquire"],
  try: ["strive", "attempt"],
  happy: ["delighted", "grateful"],
  sad: ["melancholy", "frustrated"],
  necessary: ["indispensable", "essential"],
};

export interface Upgrade {
  plain: string;
  /** Times said across answers. */
  count: number;
  /** Learned upgrades not yet said. */
  options: string[];
}

/** Plain words said often, each with up to 3 learned, unused upgrades. */
export function upgradesFor(answers: MyAnswer[], learnedWords: string[], said: Set<string>, minCount = 3): Upgrade[] {
  const learned = new Set(learnedWords.map((w) => w.trim().toLowerCase()));
  const out: Upgrade[] = [];
  const text = answers.map((a) => a.transcript ?? "").join(" \n ");
  for (const [plain, candidates] of Object.entries(UPGRADES)) {
    const options = candidates.filter((c) => learned.has(c) && !said.has(c)).slice(0, 3);
    if (!options.length) continue;
    // Count answers that contain the plain word (inflections included).
    const count = answers.filter((a) => a.transcript && lexicaWordsIn(a.transcript, [plain]).length > 0).length;
    if (count >= minCount && text) out.push({ plain, count, options });
  }
  return out.sort((a, b) => b.count - a.count).slice(0, 4);
}
