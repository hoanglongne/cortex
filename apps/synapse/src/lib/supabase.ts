import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** The Cortex account's Supabase project (the same one Lexica uses); null when it is not configured. */
export function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  client ??= createClient(url, key);
  return client;
}

/** Signing in is required whenever the account service is configured. */
export const accountsOn = (): boolean => getSupabaseClient() !== null;
