export type CardState = 'seed' | 'sprout' | 'gold' | 'mastered';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type UserArchetype = 'casual' | 'tech' | 'business' | 'student';

export interface VocabCardData {
    id: string;
    word: string;
    ipa?: string;
    elo: number;
    level: DifficultyLevel;
    // OLD FORMAT (deprecated): Single scenario string
    scenario?: string;
    // NEW FORMAT: Multiple scenarios by user archetype
    scenarios?: Record<UserArchetype, string>;
    translationHint: string;
    state: CardState;
    isBossCard?: boolean;

    upgradeModule?: {
        simpleSentence: string;
        targetSlot: string;
        academicOptions: {
            text: string;
            nuance: string;
            formalityScore: number;
        }[];
    };

    surgeryModule?: {
        prefix?: { text: string; meaning: string; relatedWords?: { word: string; meaning: string }[] };
        prefix2?: { text: string; meaning: string; relatedWords?: { word: string; meaning: string }[] };
        root: { text: string; meaning: string; relatedWords?: { word: string; meaning: string }[] };
        root2?: { text: string; meaning: string; relatedWords?: { word: string; meaning: string }[] };
        suffix?: { text: string; meaning: string; relatedWords?: { word: string; meaning: string }[] };
    };
}
