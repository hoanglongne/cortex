'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Pure fillers — sounds that are ALWAYS filler regardless of context.
 * These are also checked against interim results because the Speech API
 * often removes them from final transcripts.
 */
const PURE_FILLER_PATTERNS = [
    /\buh+\b/i,
    /\bu+m+\b/i,         // um, umm, ummm
    /\bu+hm+\b/i,        // uhm, uhmm
    /\ber+m*\b/i,        // er, erm
    /\bah+\b/i,
    /\bh+m+\b/i,         // hm, hmm, hmmm
    /\beh+\b/i,
    /\boh+\b/i,          // oh, ohh
    /\boo+h\b/i,         // ooh
    /\bee+h\b/i,         // eeh
    /\buh+h\b/i,         // uhh
    /\bmm+\b/i,          // mm, mmm
    /\buh-huh\b/i,
    /\buh-uh\b/i,
    /\buy+\b/i,          // uy, uyy (common in some accents)
    /\bar+\b/i,          // ar, arr (British filler)
];

/**
 * Multi-word filler phrases — matched against the full transcript string,
 * not individual words.
 */
const PHRASE_FILLER_PATTERNS = [
    /\byou know\b/i,
    /\bi mean\b/i,
    /\bkind of\b/i,
    /\bsort of\b/i,
    /\bokay so\b/i,
    /\blet me see\b/i,
    /\blet me think\b/i,
    /\bhow can i say\b/i,
    /\bhow do i put it\b/i,
    /\bhow should i say\b/i,
    /\bwhat's the word\b/i,
    /\byou see\b/i,
    /\byou know what i mean\b/i,
    /\bif you will\b/i,
    /\bso to speak\b/i,
    /\bin a way\b/i,
    /\bin some ways\b/i,
    /\bto be honest\b/i,
    /\bto tell you the truth\b/i,
    /\bif i'm being honest\b/i,
    /\bat the end of the day\b/i,
    /\byou could say\b/i,
    /\bi would say\b/i,
    /\bi guess\b/i,
    /\bi suppose\b/i,
    /\bi think\b/i,
    /\bi believe\b/i,
];

/**
 * Contextual fillers — common words that are only fillers when used at
 * the START of a clause (after silence, comma, period, or start of string).
 * "so" in "I love ice cream so much" is NOT a filler.
 * "So... I went there" IS a filler.
 */
const CONTEXTUAL_FILLER_PATTERNS = [
    /(?:^|[.,;!?]\s*)\bso\b(?:\s*[.,;!?…]|\s*$)/i,
    /(?:^|[.,;!?]\s*)\blike\b(?:\s*[.,;!?…]|\s*$)/i,
    /(?:^|[.,;!?]\s*)\bwell\b(?:\s*[.,;!?…]|\s*$)/i,
    /(?:^|[.,;!?]\s*)\bbasically\b/i,
    /(?:^|[.,;!?]\s*)\bactually\b(?:\s*[.,;!?…,])/i,
    /(?:^|[.,;!?]\s*)\banyway\b/i,
    /(?:^|[.,;!?]\s*)\balright\b/i,
    /(?:^|[.,;!?]\s*)\bokay\b/i,
    /(?:^|[.,;!?]\s*)\bright\b(?:\s*[.,;!?…]|\s*$)/i,
    /(?:^|[.,;!?]\s*)\bjust\b(?:\s*[.,;!?…]|\s*$)/i,
    /(?:^|[.,;!?]\s*)\bliterally\b/i,
    /(?:^|[.,;!?]\s*)\bobviously\b/i,
    /(?:^|[.,;!?]\s*)\bclearly\b/i,
    /(?:^|[.,;!?]\s*)\bhonestly\b/i,
    /(?:^|[.,;!?]\s*)\bfrankly\b/i,
];

interface FillerLog {
    word: string;
    time: number; // ms since start
}

interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
    error: string;
}

/**
 * Filler word tracker with optional Web Speech API auto-detection.
 * Falls back to manual-only if speech recognition is not supported.
 */
export function useFillerTracker() {
    const [fillerCount, setFillerCount] = useState(0);
    const [fillerLog, setFillerLog] = useState<FillerLog[]>([]);
    const [justTriggered, setJustTriggered] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [supported, setSupported] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const startTimeRef = useRef<number>(0);
    const processedRef = useRef<Set<string>>(new Set());

    // Check support on mount
    useEffect(() => {
        const w = window as unknown as Record<string, unknown>;
        const SpeechRecognitionCtor = typeof window !== 'undefined'
            ? (w.SpeechRecognition ?? w.webkitSpeechRecognition)
            : null;
        setSupported(!!SpeechRecognitionCtor);
    }, []);

    const triggerFlash = useCallback(() => {
        setJustTriggered(true);
        setTimeout(() => setJustTriggered(false), 400);
    }, []);

    const addFiller = useCallback((word: string) => {
        const elapsed = Date.now() - startTimeRef.current;
        setFillerCount((c) => c + 1);
        setFillerLog((log) => [...log, { word, time: elapsed }]);
        triggerFlash();
    }, [triggerFlash]);

    const increment = useCallback(() => {
        addFiller('manual');
    }, [addFiller]);

    const startListening = useCallback(() => {
        const w = window as unknown as Record<string, unknown>;
        const SpeechRecognitionCtor = typeof window !== 'undefined'
            ? (w.SpeechRecognition ?? w.webkitSpeechRecognition)
            : null;

        if (!SpeechRecognitionCtor) return;

        // Clean up previous instance
        if (recognitionRef.current) {
            recognitionRef.current.abort();
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recognition = new (SpeechRecognitionCtor as any)();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        recognitionRef.current = recognition;
        startTimeRef.current = Date.now();
        processedRef.current = new Set();

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalText = '';
            let tempText = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                const transcript = result[0].transcript.toLowerCase().trim();
                if (!transcript) continue;

                if (result.isFinal) {
                    finalText += transcript + ' ';
                    // Deduplicate final results
                    const key = `f-${i}-${transcript}`;
                    if (processedRef.current.has(key)) continue;
                    processedRef.current.add(key);

                    // 1) Check multi-word phrase fillers against full transcript
                    for (const pattern of PHRASE_FILLER_PATTERNS) {
                        const match = transcript.match(pattern);
                        if (match) addFiller(match[0].trim());
                    }

                    // 2) Check contextual fillers against full transcript
                    for (const pattern of CONTEXTUAL_FILLER_PATTERNS) {
                        const match = transcript.match(pattern);
                        if (match) {
                            // Extract the filler word from the match
                            const word = match[0].replace(/[.,;!?…\s]/g, '');
                            if (word) addFiller(word);
                        }
                    }

                    // 3) Check individual words for pure fillers
                    const words = transcript.split(/\s+/);
                    for (const word of words) {
                        for (const pattern of PURE_FILLER_PATTERNS) {
                            if (pattern.test(word)) {
                                addFiller(word);
                                break;
                            }
                        }
                    }
                } else {
                    tempText += transcript + ' ';
                    // Interim results: only check pure fillers (Speech API
                    // often removes "um", "uh" from final transcripts)
                    const interimKey = `i-${i}`;
                    if (processedRef.current.has(interimKey)) continue;

                    const words = transcript.split(/\s+/);
                    for (const word of words) {
                        for (const pattern of PURE_FILLER_PATTERNS) {
                            if (pattern.test(word)) {
                                processedRef.current.add(interimKey);
                                addFiller(word);
                                break;
                            }
                        }
                        if (processedRef.current.has(interimKey)) break;
                    }
                }
            }

            if (finalText) {
                setTranscript(prev => (prev + ' ' + finalText).trim());
            }
            setInterimTranscript(tempText.trim());
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            // "no-speech" and "aborted" are expected — just restart
            if (event.error === 'no-speech' || event.error === 'aborted') return;
            console.warn('[FillerTracker] Speech recognition error:', event.error);
        };

        recognition.onend = () => {
            // Auto-restart if we're supposed to be listening
            if (recognitionRef.current === recognition) {
                try {
                    recognition.start();
                } catch {
                    // Already started or disposed
                }
            }
        };

        try {
            recognition.start();
            setIsListening(true);
        } catch {
            console.warn('[FillerTracker] Could not start speech recognition');
        }
    }, [addFiller]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            const ref = recognitionRef.current;
            recognitionRef.current = null; // prevent auto-restart
            ref.abort();
            setIsListening(false);
        }
    }, []);

    const resetFillerCount = useCallback(() => {
        setFillerCount(0);
        setFillerLog([]);
        setJustTriggered(false);
        setTranscript('');
        setInterimTranscript('');
        processedRef.current = new Set();
    }, []);

    const removeFiller = useCallback((index: number) => {
        setFillerLog((log) => log.filter((_, i) => i !== index));
        setFillerCount((c) => Math.max(0, c - 1));
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
                recognitionRef.current = null;
            }
        };
    }, []);

    return {
        fillerCount,
        fillerLog,
        justTriggered,
        isListening,
        supported,
        transcript,
        interimTranscript,
        increment,
        removeFiller,
        startListening,
        stopListening,
        resetFillerCount,
    };
}

