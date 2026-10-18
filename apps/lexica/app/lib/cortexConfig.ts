/**
 * Cortex endpoints. In development they fall back to the local dev servers;
 * in production a missing env var disables the integration instead of
 * silently sending requests to the user's own localhost.
 */
const isDev = process.env.NODE_ENV === 'development';

/**
 * "cortexapi.up.railway.app" (no scheme) would be fetched as a path on this
 * site; add https:// and drop trailing slashes.
 */
export function normalizeBaseUrl(value: string | undefined): string | null {
    const v = value?.trim().replace(/\/+$/, '');
    if (!v) return null;
    return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

export const CORTEX_API_URL: string | null =
    normalizeBaseUrl(process.env.NEXT_PUBLIC_CORTEX_API_URL) ?? (isDev ? 'http://localhost:3001' : null);

export const CORTEX_HUB_URL: string | null =
    normalizeBaseUrl(process.env.NEXT_PUBLIC_CORTEX_HUB_URL) ?? (isDev ? 'http://localhost:3000' : null);

/** The teacher app (apps/lexica-teach), on its own subdomain. */
export const TEACH_URL: string | null = normalizeBaseUrl(process.env.NEXT_PUBLIC_TEACH_URL) ?? (isDev ? 'http://localhost:3010' : null);
