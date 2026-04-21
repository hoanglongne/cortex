'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CueCard } from '@/types';
import { getRandomCueCard } from '@/lib/cueCards';
import { useLanguage } from '@/components/LanguageProvider';

interface IdlePanelProps {
    onStart: (cueCard: CueCard) => void;
}

export function IdlePanel({ onStart }: IdlePanelProps) {
    const { t } = useLanguage();
    const [micStatus, setMicStatus] = useState<'checking' | 'granted' | 'denied' | 'prompt'>('checking');

    useEffect(() => {
        navigator.permissions
            .query({ name: 'microphone' as PermissionName })
            .then((result) => {
                setMicStatus(result.state as 'granted' | 'denied' | 'prompt');
                result.onchange = () => setMicStatus(result.state as 'granted' | 'denied' | 'prompt');
            })
            .catch(() => {
                // Permissions API not supported — treat as prompt
                setMicStatus('prompt');
            });
    }, []);

    const handleStart = useCallback(async () => {
        if (micStatus !== 'granted') {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach((t) => t.stop());
                setMicStatus('granted');
            } catch {
                setMicStatus('denied');
                return;
            }
        }
        onStart(getRandomCueCard());
    }, [micStatus, onStart]);

    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 md:gap-8 px-4 stagger" suppressHydrationWarning>
            {/* Title */}
            <div className="flex flex-col items-center gap-2 md:gap-3">
                <h1 className="font-mono text-3xl md:text-5xl tracking-[-0.05em] text-gray-800 dark:text-gray-100">
                    {t.solilo}
                </h1>
                <div className="h-px w-16 bg-accent/40" />
                <p className="font-mono text-[9px] md:text-xs tracking-[0.25em] md:tracking-[0.4em] uppercase text-muted">
                    {t.subtitle}
                </p>
            </div>

            {/* Mic status */}
            <div className="flex items-center gap-2.5 text-sm font-mono">
                <span
                    className={`inline-block h-2 w-2 rounded-full transition-colors duration-500 ${micStatus === 'granted'
                        ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                        : micStatus === 'denied'
                            ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                            : 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)] animate-pulse'
                        }`}
                />
                <span className="text-gray-800 dark:text-gray-200 text-sm">
                    {micStatus === 'checking' && t.micChecking}
                    {micStatus === 'granted' && t.micReady}
                    {micStatus === 'prompt' && t.micNeeded}
                    {micStatus === 'denied' && t.micDenied}
                </span>
            </div>

            {/* Start button */}
            <button
                onClick={handleStart}
                disabled={micStatus === 'denied' || micStatus === 'checking'}
                className="relative font-mono text-sm uppercase tracking-[0.2em] px-8 py-3 bg-accent text-background rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
                <span className="relative z-10">{t.startMockTest}</span>
            </button>

            <p className="max-w-xs text-center text-sm md:text-base text-gray-800 dark:text-gray-300 leading-relaxed">
                {t.prepDuration} {t.speakDuration}
                <br />
                {t.noPausing}
            </p>
        </div>
    );
}
