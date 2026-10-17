import type { DifficultyLevel, VocabCardData } from '../types/vocab';
import type { UserCardProgress } from './eloAlgorithm';

/**
 * The four levels, defined once (docs/LEXICA_FEEDBACK_TASKS.md T4). The
 * placement test, the level picker and the test result all read these, so
 * the ELO bands and word counts can't drift apart again. Word counts are
 * always counted from the deck, never typed in.
 */

export interface LevelDef {
    id: DifficultyLevel;
    label: string;
    /** CEFR equivalent, roughly. */
    cefr: string;
    /** IELTS band it suits. */
    band: string;
    /** ELO band of the placement test: [min, max). The last level is open-ended. */
    eloMin: number;
    eloMax: number;
    description: string;
}

/** Lowest and highest ELO shown on the scale. */
export const ELO_FLOOR = 800;
export const ELO_CEIL = 1500;

export const LEVELS: readonly LevelDef[] = [
    { id: 'beginner', label: 'Cơ bản', cefr: 'A2–B1', band: 'IELTS 4.5–5.5', eloMin: ELO_FLOOR, eloMax: 950, description: 'Từ thông dụng, nền cho mọi bài thi' },
    { id: 'intermediate', label: 'Trung cấp', cefr: 'B1–B2', band: 'IELTS 5.5–6.5', eloMin: 950, eloMax: 1150, description: 'Từ hay gặp trong đề IELTS' },
    { id: 'advanced', label: 'Nâng cao', cefr: 'B2–C1', band: 'IELTS 6.5–7.5', eloMin: 1150, eloMax: 1350, description: 'Từ học thuật cho Writing và Reading' },
    { id: 'expert', label: 'Chuyên gia', cefr: 'C1', band: 'IELTS 7.5+', eloMin: 1350, eloMax: ELO_CEIL, description: 'Từ hiếm, giúp bài viết nổi bật' },
];

export function levelDef(id: DifficultyLevel): LevelDef {
    return LEVELS.find((l) => l.id === id) ?? LEVELS[0];
}

/** The level whose ELO band holds `elo` (the placement test's recommendation). */
export function levelForElo(elo: number): DifficultyLevel {
    for (const l of LEVELS) if (elo < l.eloMax) return l.id;
    return LEVELS[LEVELS.length - 1].id;
}

/** "ELO 950–1150", or "ELO 1350+" for the top level. */
export function eloRangeText(l: LevelDef): string {
    return l.id === LEVELS[LEVELS.length - 1].id ? `ELO ${l.eloMin}+` : `ELO ${l.eloMin}–${l.eloMax}`;
}

/** Where `elo` sits on the ELO_FLOOR…ELO_CEIL scale, 0–1. */
export function scalePosition(elo: number): number {
    return Math.min(1, Math.max(0, (elo - ELO_FLOOR) / (ELO_CEIL - ELO_FLOOR)));
}

export interface LevelStats {
    total: number;
    /** Cards of the level the learner remembered at least once. */
    remembered: number;
    /** Three words across the level, easy to hard. */
    samples: string[];
}

type Card = Pick<VocabCardData, 'id' | 'word' | 'elo' | 'level'>;

/** Counts per level from the real deck (each card id once). */
export function levelStats(cards: readonly Card[], progress: Record<string, UserCardProgress | undefined>): Record<DifficultyLevel, LevelStats> {
    const unique = [...new Map(cards.map((c) => [c.id, c])).values()];
    const out = {} as Record<DifficultyLevel, LevelStats>;
    for (const l of LEVELS) {
        const own = unique.filter((c) => c.level === l.id).sort((a, b) => a.elo - b.elo || a.id.localeCompare(b.id));
        const pick = own.length <= 3 ? own : [own[Math.floor(own.length * 0.15)], own[Math.floor(own.length * 0.5)], own[Math.floor(own.length * 0.85)]];
        out[l.id] = {
            total: own.length,
            remembered: own.filter((c) => (progress[c.id]?.reviewCount ?? 0) >= 1).length,
            samples: pick.map((c) => c.word.toLowerCase()),
        };
    }
    return out;
}

/** Total unique cards in the deck. */
export function deckSize(cards: readonly Pick<Card, 'id'>[]): number {
    return new Set(cards.map((c) => c.id)).size;
}

/**
 * The level to suggest: from the learner's ELO once they have swiped enough
 * for it to mean something, otherwise from the placement test.
 */
export function suggestedLevel(input: { elo: number; swipes: number; tested: DifficultyLevel | null }): DifficultyLevel {
    if (input.swipes >= 20 || !input.tested) return levelForElo(input.elo);
    return input.tested;
}
