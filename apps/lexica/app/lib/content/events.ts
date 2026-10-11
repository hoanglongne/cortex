import { CORTEX_API_URL } from '../cortexConfig';

/**
 * Anonymous feedback on Studio cards (docs/LEXICA_STUDIO_SPEC.md §5.8).
 * Only card ids and event kinds are sent, never user ids. Core cards (v###)
 * are ignored. Events are batched and flushed every 20 events, every 30 s,
 * and when the page is hidden.
 */
export type CardEventKind =
    | 'impression'
    | 'reveal'
    | 'known'
    | 'unknown'
    | 'share'
    | 'report'
    | 'review_correct'
    | 'review_wrong';

interface CardEvent {
    cardId: string;
    kind: CardEventKind;
    dwellMs?: number;
}

const FLUSH_AT = 20;
const FLUSH_EVERY_MS = 30_000;

const queue: CardEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let listening = false;

export const isStudioCard = (cardId: string) => /^t[0-9a-z]+$/.test(cardId);

function endpoint(): string | null {
    return CORTEX_API_URL ? `${CORTEX_API_URL}/content/events` : null;
}

export function flushCardEvents(useBeacon = false) {
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }
    const url = endpoint();
    if (!url || queue.length === 0) return;
    const body = JSON.stringify({ events: queue.splice(0, 100) });
    try {
        if (useBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
            navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
        } else {
            void fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
        }
    } catch {
        // Feedback is best effort.
    }
}

function listen() {
    if (listening || typeof document === 'undefined') return;
    listening = true;
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') flushCardEvents(true);
    });
}

export function trackCardEvent(cardId: string, kind: CardEventKind, dwellMs?: number) {
    if (!isStudioCard(cardId) || !endpoint()) return;
    listen();
    queue.push({ cardId, kind, ...(dwellMs !== undefined ? { dwellMs: Math.round(dwellMs) } : {}) });
    if (queue.length >= FLUSH_AT) flushCardEvents();
    else if (!timer) timer = setTimeout(() => flushCardEvents(), FLUSH_EVERY_MS);
}

/** Test helper */
export function pendingCardEvents(): readonly CardEvent[] {
    return queue;
}
