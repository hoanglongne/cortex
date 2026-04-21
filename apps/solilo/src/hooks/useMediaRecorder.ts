'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

interface UseMediaRecorderReturn {
    /** Start recording audio from the microphone */
    startRecording: () => Promise<void>;
    /** Stop recording and return the audio blob */
    stopRecording: () => void;
    /** The recorded audio Blob (available after stop) */
    audioBlob: Blob | null;
    /** Whether we are currently recording */
    isRecording: boolean;
    /** The live MediaStream (for visualizer hookup) */
    stream: MediaStream | null;
    /** Any error that occurred */
    error: string | null;
}

export function useMediaRecorder(): UseMediaRecorderReturn {
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    const startRecording = useCallback(async () => {
        try {
            setError(null);
            setAudioBlob(null);
            chunksRef.current = [];

            const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setStream(mediaStream);

            const recorder = new MediaRecorder(mediaStream);
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                setIsRecording(false);
                // Stop all tracks to release the mic
                mediaStream.getTracks().forEach((t) => t.stop());
                setStream(null);
            };

            recorder.start();
            setIsRecording(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to access microphone');
            setIsRecording(false);
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    return { startRecording, stopRecording, audioBlob, isRecording, stream, error };
}
