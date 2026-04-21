'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseCountdownOptions {
    /** Total seconds for the countdown */
    seconds: number;
    /** Called once when countdown reaches 0 */
    onComplete?: () => void;
    /** Whether to auto-start the timer */
    autoStart?: boolean;
}

export function useCountdown({ seconds, onComplete, autoStart = true }: UseCountdownOptions) {
    const [remaining, setRemaining] = useState(seconds);
    const [isRunning, setIsRunning] = useState(autoStart);
    const onCompleteRef = useRef(onComplete);
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    const remainingRef = useRef(seconds);

    const start = useCallback(() => {
        remainingRef.current = seconds;
        setRemaining(seconds);
        setIsRunning(true);
    }, [seconds]);

    // Single effect: tick via interval, detect completion inside the callback
    // (setState in a subscription/timer callback is the approved React 19 pattern)
    useEffect(() => {
        if (!isRunning) return;

        const id = setInterval(() => {
            const next = Math.max(remainingRef.current - 1, 0);
            remainingRef.current = next;
            setRemaining(next);

            if (next <= 0) {
                clearInterval(id);
                setIsRunning(false);
                onCompleteRef.current?.();
            }
        }, 1000);

        return () => clearInterval(id);
    }, [isRunning]);

    const isFinished = remaining <= 0;

    return { remaining, isFinished, isRunning, start };
}
