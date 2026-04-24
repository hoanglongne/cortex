'use client';

import { useSessionMachine } from '@/hooks/useSessionMachine';
import { PhaseIndicator } from '@/components/ui/PhaseIndicator';
import { IdlePanel } from '@/components/panels/IdlePanel';
import { PreparationPanel } from '@/components/panels/PreparationPanel';
import { RecordingPanel } from '@/components/panels/RecordingPanel';
import { EvaluationPanel } from '@/components/panels/EvaluationPanel';
import { ResultPanel } from '@/components/panels/ResultPanel';
import { UserGuide } from '@/components/ui/UserGuide';

export function SessionController() {
    const {
        state,
        start,
        updateNotes,
        beginRecording,
        finishRecording,
        updateRating,
        submitEvaluation,
        reset,
    } = useSessionMachine();

    function renderPanel() {
        switch (state.phase) {
            case 'IDLE':
                return <IdlePanel onStart={start} />;

            case 'PREPARATION':
                return (
                    <PreparationPanel
                        cueCard={state.cueCard}
                        notes={state.notes}
                        onNotesChange={updateNotes}
                        onComplete={beginRecording}
                    />
                );

            case 'RECORDING':
                return (
                    <RecordingPanel
                        cueCard={state.cueCard}
                        notes={state.notes}
                        onComplete={finishRecording}
                    />
                );

            case 'EVALUATION':
                return (
                    <EvaluationPanel
                        cueCard={state.cueCard}
                        audioBlob={state.audioBlob}
                        ratings={state.ratings}
                        onRatingChange={updateRating}
                        onSubmit={submitEvaluation}
                    />
                );

            case 'RESULT':
                return (
                    <ResultPanel
                        cueCard={state.cueCard}
                        ratings={state.ratings}
                        score={state.score}
                        notes={state.notes}
                        transcript={state.transcript}
                        fillerCount={state.fillerCount}
                        onReset={reset}
                    />
                );

            default:
                return null;
        }
    }

    return (
        <>
            <PhaseIndicator currentPhase={state.phase} />
            <div key={state.phase} className="flex flex-1 flex-col panel-enter" suppressHydrationWarning>
                {renderPanel()}
            </div>
            <UserGuide />
        </>
    );
}
