import { useSyncExternalStore } from 'react';

/**
 * Whether voice swiping can work in this browser right now. When it can't
 * (no SpeechRecognition API, e.g. Firefox and some iOS contexts, or the mic
 * permission was denied), voice mode must fall back to touch swiping or the
 * user can never mark a word as known.
 */

let micDenied = false;
const listeners = new Set<() => void>();

export function speechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
    return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function markMicPermissionDenied() {
    if (micDenied) return;
    micDenied = true;
    listeners.forEach((l) => l());
}

export function isVoiceAvailable(): boolean {
    return speechRecognitionSupported() && !micDenied;
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

/** Server render assumes available, so hydration matches; the client corrects it. */
export function useVoiceAvailable(): boolean {
    return useSyncExternalStore(subscribe, isVoiceAvailable, () => true);
}
