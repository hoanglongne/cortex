import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { classApi } from '@cortex/lexica-classes';

let client: SupabaseClient | null = null;

/** The same Supabase project as Lexica: one account for both apps. */
export function getSupabase(): SupabaseClient | null {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    client ??= createClient(url, key);
    return client;
}

export const api = classApi(getSupabase);
