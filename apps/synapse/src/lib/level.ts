/**
 * How much help the player gets (docs/SYNAPSE_PLAN.md section 4.1):
 *   learn  the Vietnamese meaning is on every option (read, then match the scene);
 *   recall only the phrases show; meanings come after the choice;
 *   use    no options at all: type the particle.
 * "auto" moves between them by how the last answers went. Pure, unit tested.
 */
import type { SynapseChoice } from "./synapseTypes";

export type Level = "learn" | "recall" | "use";
export type LevelSetting = Level | "auto";

export const LEVELS: Level[] = ["learn", "recall", "use"];
export const LEVEL_LABEL: Record<Level, string> = { learn: "Học", recall: "Nhớ", use: "Dùng" };
export const LEVEL_HINT: Record<Level, string> = {
  learn: "Có nghĩa tiếng Việt trên từng lựa chọn",
  recall: "Chỉ hiện cụm, nghĩa hiện sau khi chọn",
  use: "Tự gõ tiểu từ, không gợi ý",
};

/** The latest answers considered when the level moves. */
export const WINDOW = 10;
/** Answers needed before the level may move. */
export const MIN_ANSWERS = 6;
export const PROMOTE_AT = 0.8;
export const DEMOTE_BELOW = 0.5;

export interface PhraseRecord {
  seen: number;
  right: number;
}

export interface Progress {
  setting: LevelSetting;
  /** The level "auto" is at. */
  auto: Level;
  /** Latest answers, true for right, oldest first. */
  recent: boolean[];
  phrases: Record<string, PhraseRecord>;
}

export const emptyProgress = (): Progress => ({ setting: "auto", auto: "learn", recent: [], phrases: {} });

export const levelOf = (p: Progress): Level => (p.setting === "auto" ? p.auto : p.setting);

export const phraseKey = (baseVerb: string, particle: string) => `${baseVerb.trim().toLowerCase()} ${particle.trim().toLowerCase()}`;

/** A scene was answered: `key` is the phrase the scene was about, `correct` whether the player got it. */
export function record(p: Progress, key: string, correct: boolean): Progress {
  const prev = p.phrases[key] ?? { seen: 0, right: 0 };
  const recent = [...p.recent, correct].slice(-WINDOW);
  const next: Progress = { ...p, recent, phrases: { ...p.phrases, [key]: { seen: prev.seen + 1, right: prev.right + (correct ? 1 : 0) } } };
  if (p.setting !== "auto" || recent.length < MIN_ANSWERS) return next;
  const acc = recent.filter(Boolean).length / recent.length;
  const i = LEVELS.indexOf(p.auto);
  if (acc >= PROMOTE_AT && i < LEVELS.length - 1) return { ...next, auto: LEVELS[i + 1], recent: [] };
  if (acc < DEMOTE_BELOW && i > 0) return { ...next, auto: LEVELS[i - 1], recent: [] };
  return next;
}

/** Phrases the player keeps missing: seen at least twice, under half right. */
export const weakPhrases = (p: Progress): string[] =>
  Object.entries(p.phrases)
    .filter(([, r]) => r.seen >= 2 && r.right / r.seen < 0.5)
    .map(([k]) => k);

/** Number of phrases the player has right at least once. */
export const unlocked = (p: Progress): number => Object.values(p.phrases).filter((r) => r.right > 0).length;

const clean = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

/**
 * What a typed answer means at the "use" level: the option with that particle
 * when there is one, else a made-up wrong choice that says so.
 */
export function matchTyped(typed: string, baseVerb: string, choices: readonly SynapseChoice[]): SynapseChoice {
  const t = clean(typed);
  const hit = choices.find((c) => clean(c.particle) === t || clean(`${baseVerb} ${c.particle}`) === t);
  if (hit) return hit;
  return {
    particle: typed.trim(),
    meaning: "",
    outcome: `"${baseVerb} ${typed.trim()}" không phải cụm cần dùng ở đây, và tình huống không đổi theo ý bạn.`,
    isCorrect: false,
  };
}

export const PROGRESS_KEY = "synapse-progress-v1";

/** Reads stored progress, tolerating anything odd. */
export function parseProgress(raw: string | null): Progress {
  if (!raw) return emptyProgress();
  try {
    const v = JSON.parse(raw) as Partial<Progress>;
    const level = (x: unknown): x is Level => LEVELS.includes(x as Level);
    return {
      setting: v.setting === "auto" || level(v.setting) ? (v.setting as LevelSetting) : "auto",
      auto: level(v.auto) ? v.auto : "learn",
      recent: Array.isArray(v.recent) ? v.recent.filter((x) => typeof x === "boolean").slice(-WINDOW) : [],
      phrases: v.phrases && typeof v.phrases === "object" ? (v.phrases as Record<string, PhraseRecord>) : {},
    };
  } catch {
    return emptyProgress();
  }
}
