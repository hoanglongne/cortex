'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface CustomAudioPlayerProps {
    audioBlob: Blob;
}

export function CustomAudioPlayer({ audioBlob }: CustomAudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [audioUrl, setAudioUrl] = useState<string>('');

    useEffect(() => {
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [audioBlob]);

    const formatTime = (t: number) => {
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const togglePlay = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
    }, [isPlaying]);

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = Number(e.target.value);
    };

    return (
        <div className="w-full rounded-lg border border-surface-light bg-surface p-4">
            <audio
                ref={audioRef}
                src={audioUrl}
                onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
                onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                preload="metadata"
            />

            <div className="flex items-center gap-4">
                {/* Play/Pause */}
                <button
                    onClick={togglePlay}
                    className="shrink-0 w-10 h-10 rounded-full border border-accent flex items-center justify-center text-accent transition-all hover:bg-accent hover:text-background hover:scale-110 active:scale-95"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                    {isPlaying ? (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                            <rect x="2" y="1" width="3.5" height="12" rx="1" />
                            <rect x="8.5" y="1" width="3.5" height="12" rx="1" />
                        </svg>
                    ) : (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                            <path d="M3 1.5v11l9-5.5z" />
                        </svg>
                    )}
                </button>

                {/* Time + Scrubber */}
                <div className="flex-1 flex flex-col gap-1">
                    <input
                        type="range"
                        min={0}
                        max={duration || 0}
                        step={0.1}
                        value={currentTime}
                        onChange={handleSeek}
                        className="audio-progress-bar"
                        aria-label="Seek audio"
                    />
                    <div className="flex justify-between font-mono text-xs text-gray-800 dark:text-gray-300 tabular-nums">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
