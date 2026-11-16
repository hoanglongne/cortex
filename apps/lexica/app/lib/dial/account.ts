/**
 * Núm vặn extension, cross-device link (issue #141). With a Lexica account:
 * - Lexica gives the extension a dial token (it can only read the review
 *   schedule and add tapped words), handed over in the page via postMessage;
 * - taps the extension sent to the API are claimed here and applied.
 */
import { CORTEX_API_URL } from '../cortexConfig';
import { authHeaders, getCortexAuth } from '../cortexAuth';
import type { DialTapRecord } from './bridge';

export const HELLO = 'lexica-dial-hello';
export const TOKEN = 'lexica-dial-token';

export interface DialHello { type: typeof HELLO; tokenUser: string | null }

export function isHello(data: unknown): data is DialHello {
    const d = data as Partial<DialHello> | null;
    return !!d && d.type === HELLO && (d.tokenUser === null || typeof d.tokenUser === 'string');
}

/** A new token for this account, or null when signed out or offline. */
export async function issueDialToken(): Promise<{ token: string; userId: string } | null> {
    const auth = await getCortexAuth();
    if (!auth || !CORTEX_API_URL) return null;
    try {
        const res = await fetch(`${CORTEX_API_URL}/v1/lexica/dial/token`, { method: 'POST', headers: authHeaders(auth) });
        if (!res.ok) return null;
        const body = (await res.json()) as { token?: unknown };
        return typeof body.token === 'string' ? { token: body.token, userId: auth.userId } : null;
    } catch {
        return null;
    }
}

/** Taps the extension sent from any device (removed on the server as they are returned). */
export async function claimDialTaps(): Promise<DialTapRecord[]> {
    const auth = await getCortexAuth();
    if (!auth || !CORTEX_API_URL) return [];
    try {
        const res = await fetch(`${CORTEX_API_URL}/v1/lexica/dial/claim`, { method: 'POST', headers: authHeaders(auth) });
        if (!res.ok) return [];
        const body = (await res.json()) as unknown;
        return Array.isArray(body) ? (body as DialTapRecord[]).filter((t) => typeof t?.cardId === 'string') : [];
    } catch {
        return [];
    }
}
