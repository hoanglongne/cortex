// ── Cue Card ──────────────────────────────────────────────
export interface CueCard {
    id: string;
    topic: string;
    bullets: string[];
    followUp: string;
}

// ── Ratings ───────────────────────────────────────────────
export type RatingCriterion = 'fluency' | 'lexical' | 'grammar' | 'pronunciation';

export interface Ratings {
    fluency: number | null;
    lexical: number | null;
    grammar: number | null;
    pronunciation: number | null;
}

export const DEFAULT_RATINGS: Ratings = {
    fluency: null,
    lexical: null,
    grammar: null,
    pronunciation: null,
};

// ── Session State Machine ─────────────────────────────────
export type SessionState =
    | { phase: 'IDLE' }
    | { phase: 'PREPARATION'; cueCard: CueCard; notes: string }
    | { phase: 'RECORDING'; cueCard: CueCard; notes: string }
    | { phase: 'EVALUATION'; cueCard: CueCard; audioBlob: Blob; ratings: Ratings; notes?: string }
    | { phase: 'RESULT'; cueCard: CueCard; audioBlob: Blob; ratings: Ratings; score: number; notes?: string };

export type SessionAction =
    | { type: 'START'; cueCard: CueCard }
    | { type: 'UPDATE_NOTES'; notes: string }
    | { type: 'BEGIN_RECORDING' }
    | { type: 'FINISH_RECORDING'; audioBlob: Blob }
    | { type: 'UPDATE_RATING'; criterion: RatingCriterion; value: number }
    | { type: 'SUBMIT_EVALUATION' }
    | { type: 'RESET' };

// ── Phase type literal ────────────────────────────────────
export type Phase = SessionState['phase'];
