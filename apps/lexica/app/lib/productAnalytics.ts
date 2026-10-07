/**
 * Product analytics for every user, including anonymous ones, so the
 * launch funnel and retention can be measured (see docs/PRELAUNCH_PLAN.md).
 *
 * Sends to PostHog's public capture API without the SDK. Disabled (no-op)
 * unless NEXT_PUBLIC_POSTHOG_KEY is set.
 */

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
const POSTHOG_HOST = (process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com').replace(/\/$/, '');

const ANON_ID_KEY = 'lexica_anon_id';

type Props = Record<string, string | number | boolean | null | undefined>;

export function isProductAnalyticsEnabled(): boolean {
    return Boolean(POSTHOG_KEY);
}

/** Stable per-browser id. Falls back to a per-page id if storage is blocked. */
let memoryId: string | null = null;
export function getAnonymousId(storage: Pick<Storage, 'getItem' | 'setItem'> | null = safeLocalStorage()): string {
    try {
        const existing = storage?.getItem(ANON_ID_KEY);
        if (existing) return existing;
    } catch {
        // storage blocked; fall through
    }
    const id = memoryId ?? newId();
    memoryId = id;
    try {
        storage?.setItem(ANON_ID_KEY, id);
    } catch {
        // keep the in-memory id
    }
    return id;
}

export function buildCapturePayload(
    event: string,
    props: Props | undefined,
    distinctId: string,
    cortexUserId: string | null,
    apiKey = POSTHOG_KEY,
) {
    return {
        api_key: apiKey,
        event,
        distinct_id: distinctId,
        timestamp: new Date().toISOString(),
        properties: {
            ...props,
            app: 'lexica',
            ...(cortexUserId ? { cortex_user_id: cortexUserId } : {}),
        },
    };
}

export function capture(event: string, props?: Props): void {
    if (!POSTHOG_KEY || typeof window === 'undefined') return;

    let cortexUserId: string | null = null;
    try {
        cortexUserId = localStorage.getItem('cortex_user_id');
    } catch {
        // ignore
    }

    const body = JSON.stringify(buildCapturePayload(event, props, getAnonymousId(), cortexUserId));
    fetch(`${POSTHOG_HOST}/capture/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
    }).catch(() => {
        // analytics must never break the app
    });
}

function safeLocalStorage(): Storage | null {
    try {
        return typeof window !== 'undefined' ? window.localStorage : null;
    } catch {
        return null;
    }
}

function newId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
