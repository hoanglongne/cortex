/**
 * Blend extension bridge (issue #141), browser-local, no server.
 *
 * - The extension's script on the Lexica site reads `lexica-storage` (the
 *   persisted store) for each card's next review, so the extension shows due
 *   words first.
 * - Taps made in the extension wait in the extension; on the Lexica site they
 *   are written to `lexica-dial-taps` and an event is fired. The app applies
 *   them with the store's dialTap and clears the key.
 *
 * Pure parsing here; DialTapBridge applies them.
 */
export const TAPS_KEY = 'lexica-dial-taps';
export const TAPS_EVENT = 'lexica-dial-taps';
const MAX_AGE = 30 * 24 * 60 * 60 * 1000;

export interface DialTapRecord { cardId: string; at: number }

/** Valid, recent, one per card (the latest). */
export function parseTaps(raw: string | null, now = Date.now()): DialTapRecord[] {
    if (!raw) return [];
    let list: unknown;
    try { list = JSON.parse(raw); } catch { return []; }
    if (!Array.isArray(list)) return [];
    const latest = new Map<string, number>();
    for (const t of list.slice(-1000)) {
        if (!t || typeof t !== 'object') continue;
        const { cardId, at } = t as Record<string, unknown>;
        if (typeof cardId !== 'string' || !/^v\d{3,4}$/.test(cardId)) continue;
        if (typeof at !== 'number' || at > now + 60_000 || now - at > MAX_AGE) continue;
        latest.set(cardId, Math.max(at, latest.get(cardId) ?? 0));
    }
    return [...latest].map(([cardId, at]) => ({ cardId, at }));
}

/**
 * Other things done in the extension's tooltip (#163), carried the same way as
 * taps: "Đã thuộc" (known) and 👍/👎 on a rule hit. Old entries without a kind
 * are taps.
 */
export type DialEventKind = 'tap' | 'known' | 'up' | 'down';
export interface DialEvent { kind: DialEventKind; cardId: string; at: number; rule?: string }

export function parseDialEvents(raw: string | null, now = Date.now()): DialEvent[] {
    if (!raw) return [];
    let list: unknown;
    try { list = JSON.parse(raw); } catch { return []; }
    if (!Array.isArray(list)) return [];
    const out: DialEvent[] = [];
    const taps = new Set<string>();
    for (const t of list.slice(-1000)) {
        if (!t || typeof t !== 'object') continue;
        const { cardId, at, kind = 'tap', rule } = t as Record<string, unknown>;
        if (typeof cardId !== 'string' || !/^v\d{3,4}$/.test(cardId)) continue;
        if (typeof at !== 'number' || at > now + 60_000 || now - at > MAX_AGE) continue;
        if (kind !== 'tap' && kind !== 'known' && kind !== 'up' && kind !== 'down') continue;
        if ((kind === 'up' || kind === 'down') && (typeof rule !== 'string' || !rule.startsWith(`${cardId}:`) || rule.length > 120)) continue;
        // One tap per card, as before.
        if (kind === 'tap') {
            if (taps.has(cardId)) continue;
            taps.add(cardId);
        }
        out.push({ kind, cardId, at, ...(typeof rule === 'string' ? { rule } : {}) });
    }
    return out;
}
