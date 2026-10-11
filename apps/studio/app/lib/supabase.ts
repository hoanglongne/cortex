import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    // PKCE: the magic link returns a one-time ?code= that is exchanged in this
    // browser, instead of putting access/refresh tokens in the URL hash where
    // history and browser extensions can read them.
    client ??= createClient(url, key, { auth: { flowType: 'pkce' } });
    return client;
}
