'use client';

import { useReducer, useCallback } from 'react';
import type { SessionState, SessionAction, RatingCriterion, CueCard } from '@/types';
import { DEFAULT_RATINGS } from '@/types';
import { computeBandScore } from '@/lib/scoring';

const initialState: SessionState = { phase: 'IDLE' };

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
    switch (action.type) {
        case 'START':
            if (state.phase !== 'IDLE') return state;
            return { phase: 'PREPARATION', cueCard: action.cueCard, notes: '' };

        case 'UPDATE_NOTES':
            if (state.phase !== 'PREPARATION' && state.phase !== 'RECORDING') return state;
            return { ...state, notes: action.notes };

        case 'BEGIN_RECORDING':
            if (state.phase !== 'PREPARATION') return state;
            return { phase: 'RECORDING', cueCard: state.cueCard, notes: state.notes };

        case 'FINISH_RECORDING':
            if (state.phase !== 'RECORDING') return state;
            return {
                phase: 'EVALUATION',
                cueCard: state.cueCard,
                audioBlob: action.audioBlob,
                ratings: { ...DEFAULT_RATINGS },
            };

        case 'UPDATE_RATING':
            if (state.phase !== 'EVALUATION') return state;
            return {
                ...state,
                ratings: { ...state.ratings, [action.criterion]: action.value },
            };

        case 'SUBMIT_EVALUATION':
            if (state.phase !== 'EVALUATION') return state;
            return {
                phase: 'RESULT',
                cueCard: state.cueCard,
                audioBlob: state.audioBlob,
                ratings: state.ratings,
                score: computeBandScore(state.ratings),
            };

        case 'RESET':
            return { phase: 'IDLE' };

        default:
            return state;
    }
}

export function useSessionMachine() {
    const [state, dispatch] = useReducer(sessionReducer, initialState);

    const start = useCallback(
        (cueCard: CueCard) => dispatch({ type: 'START', cueCard }),
        [],
    );
    const updateNotes = useCallback((notes: string) => dispatch({ type: 'UPDATE_NOTES', notes }), []);
    const beginRecording = useCallback(() => dispatch({ type: 'BEGIN_RECORDING' }), []);
    const finishRecording = useCallback(
        (audioBlob: Blob) => dispatch({ type: 'FINISH_RECORDING', audioBlob }),
        [],
    );
    const updateRating = useCallback(
        (criterion: RatingCriterion, value: number) =>
            dispatch({ type: 'UPDATE_RATING', criterion, value }),
        [],
    );
    const submitEvaluation = useCallback(() => dispatch({ type: 'SUBMIT_EVALUATION' }), []);
    const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

    return {
        state,
        start,
        updateNotes,
        beginRecording,
        finishRecording,
        updateRating,
        submitEvaluation,
        reset,
    };
}
