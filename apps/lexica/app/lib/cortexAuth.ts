import { getSupabaseClient } from './supabase';

/**
 * Identity for Cortex Core API calls: the user's Lexica Supabase session
 * (same Supabase project as Cortex). The API rejects requests without a
 * valid access token and only lets a user touch their own data.
 */
export type CortexAuth = { userId: string; token: string };

const USER_KEY = 'cortex_user_id';

/** Current session, refreshed by supabase-js if the token expired. Null when signed out. */
export async function getCortexAuth(): Promise<CortexAuth | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (!session) return null;

    try {
        // Other parts of the app read this to know the user is connected
        localStorage.setItem(USER_KEY, session.user.id);
    } catch {
        // ignore
    }
    return { userId: session.user.id, token: session.access_token };
}

export function authHeaders(auth: CortexAuth): Record<string, string> {
    return { Authorization: `Bearer ${auth.token}` };
}
