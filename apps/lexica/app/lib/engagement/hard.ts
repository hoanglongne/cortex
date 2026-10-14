import type { UserCardProgress } from '../eloAlgorithm';
import type { VocabCardData } from '../../types/vocab';

/**
 * "Từ khó của bạn": words this learner keeps getting wrong. They are asked
 * more often, come back within the session when missed, show a memory aid,
 * and beating one is called out. Pure, unit tested.
 */

/** Missed at least 3 times, or missed more often than recalled (2+ misses). */
export function isHard(p: UserCardProgress | undefined): boolean {
    if (!p || p.state === 'mastered') return false;
    return p.wrongCount >= 3 || (p.wrongCount >= 2 && p.wrongCount > p.reviewCount);
}

/** Hard words, most-missed first. */
export function hardWords(progress: Record<string, UserCardProgress>): UserCardProgress[] {
    return Object.values(progress)
        .filter(isHard)
        .sort((a, b) => b.wrongCount - a.wrongCount || a.nextReviewAt - b.nextReviewAt);
}

/** Hard words review sooner: half the usual wait, never under a day. */
export function hardInterval(normalMs: number): number {
    const DAY = 24 * 60 * 60 * 1000;
    return Math.max(DAY, Math.round(normalMs / 2));
}

/** "ab- rời đi · und- sóng · -ant hậu tố tạo tính từ", from the word's parts. */
export function mnemonic(card: Pick<VocabCardData, 'surgeryModule'> | undefined): string | null {
    const s = card?.surgeryModule;
    if (!s) return null;
    const parts = [s.prefix, s.prefix2, s.root, s.root2, s.suffix].filter(
        (p): p is NonNullable<typeof p> => Boolean(p?.text && p.meaning),
    );
    if (parts.length < 2) return null;
    return parts.map((p) => `${p.text} ${p.meaning}`).join(' · ');
}
