/**
 * Blend implicit signals (issue #142), pure.
 *
 * - "Seen": a swapped word stayed on screen long enough to be read without a
 *   tap. Weak evidence: logged with a small weight, never moves a memory
 *   (model.ts UPDATE_WEIGHT) and never touches the recall/produce facets.
 * - Weekly check: a few words the learner only "saw" are asked for real. The
 *   share answered right sets how much "seen" is worth from then on.
 * - Experiment (off by default): words split at random into "card" and
 *   "dial" groups, to compare recall at 14 and 30 days.
 */
import type { EvidenceRow, LearnerState } from './model';

export const SEEN_MIN_MS = 1500;
export const CHECK_EVERY_DAYS = 7;
export const CHECK_SIZE = 6;
const DAY = 86_400_000;

export interface DialCalibration { asked: number; correct: number; lastCheck?: number }

/** Weight of a "seen" signal: small until checked; near zero if checks show it means little. */
export function seenWeight(c: DialCalibration | undefined): number {
    if (!c || c.asked < 10) return 0.2;
    const acc = c.correct / c.asked;
    if (acc < 0.7) return 0.02;
    return Math.round(Math.min(0.3, ((acc - 0.7) / 0.3) * 0.3) * 100) / 100;
}

/** Words to ask this week: seen in the last 7 days, not tapped or missed since, newest first. */
export function checkCandidates(log: EvidenceRow[], now: number, size = CHECK_SIZE): string[] {
    const lastSeen = new Map<string, number>();
    const lastBad = new Map<string, number>();
    const lastChecked = new Map<string, number>();
    for (const [id, , source, outcome, , at] of log) {
        if (outcome === 'seen' && source === 'dial') lastSeen.set(id, Math.max(at, lastSeen.get(id) ?? 0));
        if (outcome === 'wrong') lastBad.set(id, Math.max(at, lastBad.get(id) ?? 0));
        if (source === 'check') lastChecked.set(id, Math.max(at, lastChecked.get(id) ?? 0));
    }
    return [...lastSeen]
        .filter(([id, at]) => now - at <= 7 * DAY && (lastBad.get(id) ?? 0) < at && (lastChecked.get(id) ?? 0) < at)
        .sort((a, b) => b[1] - a[1])
        .slice(0, size)
        .map(([id]) => id);
}

export function checkDue(c: DialCalibration | undefined, candidates: number, now: number): boolean {
    if (candidates < 3) return false;
    return !c?.lastCheck || now - c.lastCheck >= CHECK_EVERY_DAYS * DAY;
}

export function calibrate(c: DialCalibration | undefined, asked: number, correct: number, now: number): DialCalibration {
    return { asked: (c?.asked ?? 0) + asked, correct: (c?.correct ?? 0) + correct, lastCheck: now };
}

/** Experiment flag: when on, "dial" words are left to Blend alone and compared with "card" words. */
export const DIAL_EXPERIMENT = false;

/** Stable 50/50 split of words per learner. */
export function dialGroup(cardId: string, seed: string): 'dial' | 'card' {
    let h = 2166136261;
    for (const ch of `${seed}:${cardId}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    return (h >>> 0) % 2 === 0 ? 'dial' : 'card';
}

/** Recall on graded answers 14 and 30 days (±3) after a word was first met, per group. */
export function experimentReport(state: Pick<LearnerState, 'log'>, seed: string): Record<'dial' | 'card', { d14: [number, number]; d30: [number, number] }> {
    const first = new Map<string, number>();
    for (const [id, , , , , at] of state.log) if (!first.has(id)) first.set(id, at);
    const out = { dial: { d14: [0, 0] as [number, number], d30: [0, 0] as [number, number] }, card: { d14: [0, 0] as [number, number], d30: [0, 0] as [number, number] } };
    for (const [id, , , outcome, weight, at] of state.log) {
        if (weight < 1 || outcome === 'seen') continue;
        const age = (at - (first.get(id) ?? at)) / DAY;
        const g = out[dialGroup(id, seed)];
        const slot = Math.abs(age - 14) <= 3 ? g.d14 : Math.abs(age - 30) <= 3 ? g.d30 : null;
        if (slot) { slot[1]++; if (outcome === 'right') slot[0]++; }
    }
    return out;
}
