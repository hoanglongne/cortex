import type { UserArchetype, VocabCardData } from '../../types/vocab';

/** Archetypes a learner can pick, in the order shown. */
export const ARCHETYPE_OPTIONS: { id: UserArchetype; label: string }[] = [
    { id: 'casual', label: 'Đời thường' },
    { id: 'tech', label: 'Dân tech' },
    { id: 'business', label: 'Văn phòng' },
    { id: 'student', label: 'Sinh viên' },
];

/** The card's example sentence for this learner, falling back to its own. */
export function scenarioFor(
    card: Pick<VocabCardData, 'scenario' | 'scenarios'>,
    archetype: UserArchetype | null | undefined,
): string {
    return (archetype && card.scenarios?.[archetype]) || card.scenario || card.scenarios?.casual || '';
}
