/**
 * The rules of one mission, apart from the screen: what a choice does to the
 * score, the lives and the integrity. Pure, unit tested.
 */
import type { SynapseChoice } from "./synapseTypes";

export const MAX_LIVES = 3;
export const MAX_INTEGRITY = 100;

export interface GameState {
  score: number;
  lives: number;
  integrity: number;
  over: boolean;
}

export const startState = (): GameState => ({ score: 0, lives: MAX_LIVES, integrity: MAX_INTEGRITY, over: false });

/** What choosing `choice` does: right adds points (and may heal), wrong costs a life and integrity. */
export function applyChoice(s: GameState, choice: Pick<SynapseChoice, "isCorrect" | "effect">): GameState {
  if (s.over) return s;
  if (choice.isCorrect) {
    return {
      ...s,
      score: s.score + 10,
      lives: choice.effect === "restore_life" ? Math.min(MAX_LIVES, s.lives + 1) : s.lives,
      integrity: choice.effect === "integrity_boost" ? Math.min(MAX_INTEGRITY, s.integrity + 20) : s.integrity,
    };
  }
  const lives = s.lives - 1;
  return { score: Math.max(0, s.score - 10), lives, integrity: Math.max(0, s.integrity - 25), over: lives <= 0 };
}

/** The stage after this one, or null when the mission is cleared. */
export const nextStage = (stage: number, maxStages: number): number | null => (stage >= maxStages ? null : stage + 1);
