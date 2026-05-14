'use client';

import { useCallback, useRef, useEffect } from 'react';
import { useLexicaStore } from '../store/lexicaStore';

/**
 * Sound Effects Hook
 * 
 * Generates simple sound effects using Web Audio API
 * No external audio files needed - all sounds generated programmatically
 * 
 * Available sounds:
 * - swipeRight: Positive, ascending tone (correct answer)
 * - swipeLeft: Neutral, short tone (wrong answer)
 * - quizCorrect: Success celebration sound
 * - quizWrong: Subtle error tone
 * - unlock: Achievement unlock fanfare
 * - levelUp: Level up celebration
 * - click: Subtle UI feedback
 */
export function useSoundEffects() {
    const soundEnabled = useLexicaStore(state => state.soundEnabled);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Initialize AudioContext (lazy init to avoid issues)
    useEffect(() => {
        if (typeof window !== 'undefined' && !audioContextRef.current) {
            try {
                const WindowWithWebkit = window as typeof window & { webkitAudioContext?: typeof AudioContext };
                audioContextRef.current = new (window.AudioContext || WindowWithWebkit.webkitAudioContext)();
            } catch {
                console.warn('Web Audio API not supported');
            }
        }
    }, []);

    /**
     * Play a tone with given frequency and duration
     */
    const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
        if (!soundEnabled || !audioContextRef.current) return;

        const ctx = audioContextRef.current;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = type;
        oscillator.frequency.value = frequency;

        // Envelope for smooth sound (attack-decay)
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01); // Attack
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration); // Decay

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    }, [soundEnabled]);

    /**
     * Play a sequence of tones (for melodies)
     */
    const playSequence = useCallback((notes: Array<{ freq: number; duration: number; delay: number }>, volume: number = 0.3) => {
        if (!soundEnabled || !audioContextRef.current) return;

        notes.forEach(note => {
            setTimeout(() => {
                playTone(note.freq, note.duration, 'sine', volume);
            }, note.delay);
        });
    }, [soundEnabled, playTone]);

    // ========================================
    // SOUND EFFECT FUNCTIONS
    // ========================================

    /**
     * Swipe Right (Correct) - Positive ascending tone
     */
    const swipeRight = useCallback(() => {
        playSequence([
            { freq: 523.25, duration: 0.1, delay: 0 },    // C5
            { freq: 659.25, duration: 0.15, delay: 80 },  // E5
        ], 0.25);
    }, [playSequence]);

    /**
     * Swipe Left (Wrong) - Neutral short tone
     */
    const swipeLeft = useCallback(() => {
        playTone(349.23, 0.12, 'sine', 0.2); // F4 - subtle, not harsh
    }, [playTone]);

    /**
     * Quiz Correct - Success celebration (3-note ascending)
     */
    const quizCorrect = useCallback(() => {
        playSequence([
            { freq: 523.25, duration: 0.1, delay: 0 },     // C5
            { freq: 659.25, duration: 0.1, delay: 100 },   // E5
            { freq: 783.99, duration: 0.2, delay: 200 },   // G5
        ], 0.3);
    }, [playSequence]);

    /**
     * Quiz Wrong - Error tone (descending)
     */
    const quizWrong = useCallback(() => {
        playSequence([
            { freq: 392.00, duration: 0.1, delay: 0 },     // G4
            { freq: 349.23, duration: 0.15, delay: 100 },  // F4
        ], 0.25);
    }, [playSequence]);

    /**
     * Story Unlock - Achievement fanfare (4-note celebration)
     */
    const unlock = useCallback(() => {
        playSequence([
            { freq: 523.25, duration: 0.12, delay: 0 },     // C5
            { freq: 659.25, duration: 0.12, delay: 120 },   // E5
            { freq: 783.99, duration: 0.12, delay: 240 },   // G5
            { freq: 1046.50, duration: 0.25, delay: 360 },  // C6
        ], 0.35);
    }, [playSequence]);

    /**
     * Level Up - Celebration melody (5-note ascending)
     */
    const levelUp = useCallback(() => {
        playSequence([
            { freq: 392.00, duration: 0.1, delay: 0 },      // G4
            { freq: 493.88, duration: 0.1, delay: 100 },    // B4
            { freq: 587.33, duration: 0.1, delay: 200 },    // D5
            { freq: 783.99, duration: 0.1, delay: 300 },    // G5
            { freq: 987.77, duration: 0.25, delay: 400 },   // B5
        ], 0.35);
    }, [playSequence]);

    /**
     * UI Click - Subtle feedback
     */
    const click = useCallback(() => {
        playTone(800, 0.05, 'sine', 0.15); // Very short, subtle
    }, [playTone]);

    /**
     * Button Press - Medium feedback
     */
    const buttonPress = useCallback(() => {
        playTone(440, 0.08, 'sine', 0.2); // A4 - slightly longer
    }, [playTone]);

    return {
        // Individual sound effects
        swipeRight,
        swipeLeft,
        quizCorrect,
        quizWrong,
        unlock,
        levelUp,
        click,
        buttonPress,

        // State
        soundEnabled,
    };
}
