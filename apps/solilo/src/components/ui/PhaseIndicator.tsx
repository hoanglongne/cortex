import type { Phase } from '@/types';

const PHASES: { key: Phase; label: string }[] = [
    { key: 'IDLE', label: 'READY' },
    { key: 'PREPARATION', label: 'PREP' },
    { key: 'RECORDING', label: 'REC' },
    { key: 'EVALUATION', label: 'EVAL' },
    { key: 'RESULT', label: 'SCORE' },
];

const PHASE_INDEX: Record<Phase, number> = {
    IDLE: 0,
    PREPARATION: 1,
    RECORDING: 2,
    EVALUATION: 3,
    RESULT: 4,
};

interface PhaseIndicatorProps {
    currentPhase: Phase;
}

export function PhaseIndicator({ currentPhase }: PhaseIndicatorProps) {
    const currentIdx = PHASE_INDEX[currentPhase];

    return (
        <div className="fixed top-0 left-0 right-0 z-40 flex items-center gap-0 h-1" suppressHydrationWarning>
            {PHASES.map((p, i) => {
                const isComplete = i < currentIdx;
                const isActive = i === currentIdx;

                return (
                    <div
                        key={p.key}
                        className={`relative flex-1 h-full transition-colors duration-500 ${isComplete
                            ? 'bg-accent'
                            : isActive
                                ? 'bg-accent/40'
                                : 'bg-surface-light/30'
                            } ${isActive ? 'phase-step-active' : ''}`}
                    >
                        {isActive && (
                            <div className="phase-fill absolute inset-0 bg-accent origin-left" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
