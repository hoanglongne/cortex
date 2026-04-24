'use client';

import { useEffect, useState, useMemo } from 'react';
import type { CueCard as CueCardType } from '@/types';
import { CueCard } from '@/components/ui/CueCard';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { AudioVisualizer } from '@/components/ui/AudioVisualizer';
import { FillerFlash } from '@/components/ui/FillerFlash';
import { useCountdown } from '@/hooks/useCountdown';
import { useMediaRecorder } from '@/hooks/useMediaRecorder';
import { useAudioVisualizer } from '@/hooks/useAudioVisualizer';
import { useFillerTracker } from '@/hooks/useFillerTracker';
import { useLanguage } from '@/components/LanguageProvider';
import { RECORD_DURATION_S } from '@/lib/constants';

interface RecordingPanelProps {
    cueCard: CueCardType;
    notes: string;
    onComplete: (audioBlob: Blob, transcript?: string, fillerCount?: number) => void;
}

export function RecordingPanel({ cueCard, notes, onComplete }: RecordingPanelProps) {
    const { t } = useLanguage();
    const { startRecording, stopRecording, audioBlob, stream, error } = useMediaRecorder();
    const { attachCanvas } = useAudioVisualizer(stream);
    const { fillerCount, fillerLog, justTriggered, transcript, interimTranscript, increment, removeFiller, startListening, stopListening, supported } = useFillerTracker();
    const [checkedNotes, setCheckedNotes] = useState<Set<number>>(new Set());

    const noteItems = useMemo(
        () => notes.split('\n').map(s => s.trim()).filter(Boolean),
        [notes]
    );

    const toggleNote = (idx: number) => {
        setCheckedNotes(prev => {
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx);
            else next.add(idx);
            return next;
        });
    };

    // Check if a word in the transcript is a filler
    const isFillerWord = (word: string): boolean => {
        const lowerWord = word.toLowerCase();
        // Check against pure filler patterns from useFillerTracker
        const fillerWords = ['um', 'uh', 'er', 'ah', 'hmm', 'eh', 'oh', 'ooh', 'eeh', 'uhh', 'mm', 'uh-huh', 'uh-uh', 'uhm', 'erm'];
        return fillerWords.includes(lowerWord);
    };

    const renderTranscript = () => {
        if (!transcript && !interimTranscript) return null;

        const words = transcript.split(/\s+/).filter(w => w);
        return (
            <>
                {words.map((word, i) => {
                    const isFiller = isFillerWord(word);
                    return (
                        <span
                            key={i}
                            className={isFiller ? 'underline decoration-accent decoration-2 text-accent' : ''}
                        >
                            {word}{' '}
                        </span>
                    );
                })}
                {interimTranscript && (
                    <span className="text-gray-500 dark:text-gray-400 italic">
                        {interimTranscript}
                    </span>
                )}
            </>
        );
    };

    // Auto-start recording + speech recognition on mount
    useEffect(() => {
        startRecording();
        startListening();
        return () => {
            stopListening();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCountdownComplete = () => {
        stopRecording();
        stopListening();
    };

    // When audioBlob is ready after stopping, transition
    useEffect(() => {
        if (audioBlob) {
            onComplete(audioBlob, transcript, fillerCount);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioBlob, transcript, fillerCount]);

    // Spacebar to add filler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && e.target === document.body) {
                e.preventDefault();
                increment();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [increment]);

    const { remaining } = useCountdown({
        seconds: RECORD_DURATION_S,
        onComplete: handleCountdownComplete,
    });

    return (
        <div className="flex flex-1 flex-col items-center gap-5 px-4 py-8 stagger" suppressHydrationWarning>
            <FillerFlash active={justTriggered} />

            {/* Recording indicator */}
            <div className="flex items-center gap-3">
                <span className="rec-dot relative inline-block h-3 w-3 rounded-full bg-accent" />
                <p className="font-mono text-xs tracking-[0.4em] uppercase text-accent">
                    {t.recording}
                </p>
            </div>

            <CountdownTimer remaining={remaining} total={RECORD_DURATION_S} label={t.recLabel} />

            {error && (
                <p className="text-sm text-red-400 font-mono">{error}</p>
            )}

            {/* Topic reminder */}
            <CueCard card={cueCard} compact />

            <AudioVisualizer canvasRef={attachCanvas} />

            {/* Two-column layout: Notes left, Transcript right */}
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Notes — interactive checklist cards */}
                <div className="w-full flex flex-col gap-1.5">
                    <p className="font-mono text-sm text-gray-800 dark:text-gray-200 uppercase tracking-[0.2em] mb-0.5">
                        {t.talkingPoints}
                    </p>
                    <div className="flex flex-col gap-1.5 h-[200px] overflow-y-auto">
                        {noteItems.length > 0 ? (
                            noteItems.map((note, i) => {
                                const done = checkedNotes.has(i);
                                return (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => toggleNote(i)}
                                        className={`group flex items-start gap-3 text-left px-3 py-2 rounded-md border transition-all duration-200 ${done
                                            ? 'border-accent/20 bg-accent/5'
                                            : 'border-surface-light bg-surface hover:border-muted/40'
                                            }`}
                                    >
                                        <span className={`mt-0.5 shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 ${done
                                            ? 'border-accent bg-accent text-background'
                                            : 'border-muted/30 group-hover:border-muted/50'
                                            }`}>
                                            {done && (
                                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                    <path d="M2 5l2.5 2.5L8 3" />
                                                </svg>
                                            )}
                                        </span>
                                        <span className={`font-mono text-xs leading-relaxed transition-all duration-200 ${done
                                            ? 'text-gray-400 dark:text-gray-500 line-through'
                                            : 'text-foreground'
                                            }`}>
                                            {note}
                                        </span>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                                    {t.noNotes}
                                </p>
                            </div>
                        )}
                    </div>
                    <p className="font-mono text-xs text-gray-800 dark:text-gray-300 text-center mt-0.5">
                        {checkedNotes.size}/{noteItems.length} {t.covered}
                    </p>
                </div>

                {/* Real-time transcript */}
                <div className="w-full flex flex-col gap-2">
                    <p className="font-mono text-sm text-gray-800 dark:text-gray-200 uppercase tracking-[0.2em]">
                        {t.transcript}
                    </p>
                    <div className="bg-surface border border-surface-light rounded-lg px-4 py-3 h-[200px] overflow-y-auto">
                        {(transcript || interimTranscript) ? (
                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                {renderTranscript()}
                            </p>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                                    {t.startSpeaking}
                                </p>
                            </div>
                        )}
                    </div>
                    <p className="font-mono text-xs text-gray-800 dark:text-gray-300 text-center">
                        {t.pressSpace}
                    </p>
                </div>
            </div>

            {/* Filler tracker */}
            <div className="w-full max-w-4xl flex flex-col items-center gap-2">
                <div className="flex items-center gap-3">
                    <span className={`font-mono text-lg tabular-nums transition-colors ${fillerCount > 0 ? 'text-accent' : 'text-muted'}`}>
                        {fillerCount}
                    </span>
                    <span className="font-mono text-xs text-gray-800 dark:text-gray-300 uppercase tracking-widest">
                        {t.fillersDetected}
                    </span>
                    {supported && (
                        <span className="relative flex h-2 w-2" title="Speech recognition active">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                        </span>
                    )}
                    <button
                        onClick={increment}
                        className="font-mono text-xs uppercase tracking-widest border border-surface-light px-2 py-1 rounded text-gray-800 dark:text-gray-200 hover:text-accent hover:border-accent/50 transition-all duration-200 active:scale-95"
                        aria-label="Mark filler word manually"
                        type="button"
                    >
                        {t.addFiller}
                    </button>
                </div>
                {/* Recent filler log */}
                {fillerLog.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 justify-center max-w-xs">
                        {fillerLog.slice(-8).map((f, i) => {
                            const actualIndex = fillerLog.length - 8 + i;
                            const displayIndex = actualIndex < 0 ? i : actualIndex;
                            return (
                                <button
                                    key={`${f.time}-${i}`}
                                    onClick={() => removeFiller(displayIndex)}
                                    className="group font-mono text-xs bg-accent/10 text-accent/70 border border-accent/20 rounded pl-1.5 pr-1 py-0.5 panel-enter hover:bg-accent/20 hover:border-accent/40 transition-all duration-150 active:scale-95 flex items-center gap-1"
                                    title="Remove this filler"
                                    type="button"
                                >
                                    <span>{f.word}</span>
                                    <span className="opacity-0 group-hover:opacity-100 text-accent text-xs transition-opacity">×</span>
                                </button>
                            );
                        })}
                    </div>
                )}
                {!supported && (
                    <p className="text-xs text-gray-800 dark:text-gray-300 font-mono">
                        Speech detection not supported — use manual button
                    </p>
                )}
            </div>
        </div>
    );
}
