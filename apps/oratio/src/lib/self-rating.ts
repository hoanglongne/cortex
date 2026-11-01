/**
 * Guided self-rating (issue #89, from Solilo): the learner rates the four
 * criteria themselves, one band at a time with the descriptor next to it, then
 * sees how far they are from the partners' rating. Pure, unit tested; the
 * ratings stay on the device.
 */
import { CRITERIA, type Criterion } from "@cortex/classroom-oratio";

export type SelfRating = Record<Criterion, number>;

export const DEFAULT_BAND = 5;

export const emptySelf = (): SelfRating => ({ fluency: DEFAULT_BAND, vocabulary: DEFAULT_BAND, grammar: DEFAULT_BAND, pronunciation: DEFAULT_BAND });

/** A whole band from 1 to 9. */
export const clampBand = (n: number): number => Math.min(9, Math.max(1, Math.round(n)));

/** The overall band: the mean of the four, to the nearest half band (as IELTS rounds). */
export function overall(r: SelfRating): number {
  const mean = CRITERIA.reduce((n, c) => n + r[c], 0) / CRITERIA.length;
  return Math.round(mean * 2) / 2;
}

/**
 * How the learner's rating compares with the partners': per criterion, the
 * learner's minus the partners' (positive: they rated themselves higher).
 * Only criteria the partners rated.
 */
export function gap(self: SelfRating, partners: Partial<Record<Criterion | "overall", number>>): Partial<Record<Criterion | "overall", number>> {
  const out: Partial<Record<Criterion | "overall", number>> = {};
  for (const c of CRITERIA) {
    const p = partners[c];
    if (typeof p === "number") out[c] = Math.round((self[c] - p) * 2) / 2;
  }
  if (typeof partners.overall === "number") out.overall = Math.round((overall(self) - partners.overall) * 2) / 2;
  return out;
}

/** One line on what a gap means. */
export function gapLine(g: number | undefined): string {
  if (g === undefined) return "Chưa có bạn chấm để so";
  if (Math.abs(g) < 0.5) return "Bạn tự chấm gần đúng với bạn luyện";
  return g > 0 ? `Bạn tự chấm cao hơn ${g} band so với bạn luyện` : `Bạn tự chấm thấp hơn ${-g} band so với bạn luyện`;
}

const KEY = "oratio-self-ratings";

/** Ratings kept on this device, by answer (the latest 100). */
export function readSelf(): Record<string, SelfRating> {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Record<string, Partial<SelfRating>>;
    const out: Record<string, SelfRating> = {};
    for (const [id, r] of Object.entries(v)) {
      if (r && typeof r === "object") out[id] = { fluency: clampBand(Number(r.fluency)), vocabulary: clampBand(Number(r.vocabulary)), grammar: clampBand(Number(r.grammar)), pronunciation: clampBand(Number(r.pronunciation)) };
    }
    return out;
  } catch {
    return {};
  }
}

export function saveSelf(id: string, r: SelfRating): void {
  try {
    const all = { ...readSelf(), [id]: r };
    const keep = Object.fromEntries(Object.entries(all).slice(-100));
    localStorage.setItem(KEY, JSON.stringify(keep));
  } catch {
    // Private mode.
  }
}
