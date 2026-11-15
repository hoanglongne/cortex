import { createHash, randomBytes } from 'node:crypto';

/** Núm vặn extension tokens (issue #141). Only the hash is stored. */
export const DIAL_TOKEN_PREFIX = 'lxd_';

export function newDialToken(): string {
  return DIAL_TOKEN_PREFIX + randomBytes(24).toString('base64url');
}

export function hashDialToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

export function dialBearer(header: string | undefined): string | null {
  const t = header?.match(/^Bearer\s+(\S+)$/i)?.[1];
  return t && t.startsWith(DIAL_TOKEN_PREFIX) && t.length < 100 ? t : null;
}

export interface DialTap {
  cardId: string;
  at: number;
}

/** Valid taps from a request body, at most 200, one per card (the latest). */
export function parseDialTaps(body: unknown, now = Date.now()): DialTap[] {
  const list = (body as { taps?: unknown } | null)?.taps;
  if (!Array.isArray(list)) return [];
  const latest = new Map<string, number>();
  for (const t of list.slice(0, 500)) {
    const cardId = (t as { cardId?: unknown })?.cardId;
    const at = (t as { at?: unknown })?.at;
    if (typeof cardId !== 'string' || !/^v\d{3,4}$/.test(cardId)) continue;
    if (typeof at !== 'number' || !Number.isFinite(at)) continue;
    if (at > now + 60_000 || now - at > 30 * 86_400_000) continue;
    latest.set(cardId, Math.max(at, latest.get(cardId) ?? 0));
  }
  return [...latest]
    .slice(0, 200)
    .map(([cardId, at]) => ({ cardId, at: Math.round(at) }));
}
