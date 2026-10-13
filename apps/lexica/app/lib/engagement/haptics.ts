/**
 * Light vibration feedback on Android (iOS Safari has no Vibration API).
 * Follows the sound setting, so one switch turns feedback off.
 */
export function vibrate(pattern: number | readonly number[], enabled = true) {
    if (!enabled || typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
    try {
        navigator.vibrate(typeof pattern === 'number' ? pattern : [...pattern]);
    } catch {
        // Some browsers throw when called without a recent user gesture.
    }
}

export const HAPTIC = {
    known: 12,
    unknown: 6,
    milestone: [18, 40, 18],
    lucky: [10, 30, 10, 30, 24],
} as const;
