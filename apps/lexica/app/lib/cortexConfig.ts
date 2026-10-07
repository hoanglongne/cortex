/**
 * Cortex endpoints. In development they fall back to the local dev servers;
 * in production a missing env var disables the integration instead of
 * silently sending requests to the user's own localhost.
 */
const isDev = process.env.NODE_ENV === 'development';

export const CORTEX_API_URL: string | null =
    process.env.NEXT_PUBLIC_CORTEX_API_URL || (isDev ? 'http://localhost:3001' : null);

export const CORTEX_HUB_URL: string | null =
    process.env.NEXT_PUBLIC_CORTEX_HUB_URL || (isDev ? 'http://localhost:3000' : null);
