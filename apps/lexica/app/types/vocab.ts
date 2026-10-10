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

    /** Set on cards published from Lexica Studio (Trend Drops). */
    trend?: { label: string; expiresAt?: string; dropId?: string };
    /** Pre-generated audio clips (see docs/LEXICA_AUDIO_SPEC.md). */
    audio?: { word?: string; meaning?: string; scenario?: string };
    /** Bumped when a published card is edited. */
    revision?: number;

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
