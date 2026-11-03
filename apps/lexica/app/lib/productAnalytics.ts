/**
 * Product analytics for every user, including anonymous ones, so the launch
 * funnel and retention can be measured (see docs/PRELAUNCH_PLAN.md).
 *
 * The sending, the shared event names and the privacy rules live in
 * @cortex/events, the same package Oratio, Teach and Synapse use (issue #61).
 * Disabled (no-op) unless NEXT_PUBLIC_POSTHOG_KEY is set.
 */
import { anonymousId, createTracker, type CortexTrack } from '@cortex/events';

const ANON_ID_KEY = 'lexica_anon_id';

type Props = Record<string, string | number | boolean | null | undefined>;

const tracker = createTracker({
    app: 'lexica',
    key: process.env.NEXT_PUBLIC_POSTHOG_KEY || '',
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    // Kept from before the shared package, so existing visitors stay the same person
    anonKey: ANON_ID_KEY,
    getUserId: () => {
        try {
            return localStorage.getItem('cortex_user_id');
        } catch {
            return null;
        }
    },
});

export function isProductAnalyticsEnabled(): boolean {
    return tracker.enabled;
}

/** Stable per-browser id. Falls back to a per-page id if storage is blocked. */
export function getAnonymousId(storage?: Pick<Storage, 'getItem' | 'setItem'> | null): string {
    return storage === undefined ? anonymousId(ANON_ID_KEY) : anonymousId(ANON_ID_KEY, storage);
}

/** Which learning track an event belongs to, for the shared funnel. */
export function trackOf(event: string): CortexTrack | undefined {
    if (event.startsWith('story_')) return 'story';
    if (event.startsWith('speak_') || event === 'voice_success' || event === 'voice_fail' || event === 'voice_hit' || event === 'oratio_cta_click') return 'speaking';
    if (event.startsWith('class_') || event.startsWith('arena_')) return 'class';
    return 'vocab';
}

/** Sends an event with the app and track attached. Pass `classId` for class events (it is hashed before leaving the device). */
export function capture(event: string, props?: Props, ctx?: { track?: CortexTrack; classId?: string | null }): void {
    tracker.capture(event, props, { track: ctx?.track ?? trackOf(event), classId: ctx?.classId });
}

/** Call after sign-in: joins this browser's earlier anonymous events to the person. */
export function identify(): void {
    tracker.identify();
}
