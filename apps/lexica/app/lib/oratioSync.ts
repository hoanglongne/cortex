/**
 * Oratio → Lexica (docs/ORATIO_REDESIGN.md §5.5): a Lexica word the learner
 * said in an Oratio answer reaches Dùng. Oratio saves those words in
 * public.answers.lexica_words (same Supabase project; the learner reads
 * their own rows). We read what is newer than the last sync and apply it.
 */
import { useLexicaStore } from '../store/lexicaStore';
import { getSupabaseClient } from './supabase';

const KEY = 'lexica-oratio-sync';
const MAX_ROWS = 500;

function readLastSync(): string | null {
    try {
        return localStorage.getItem(KEY);
    } catch {
        return null;
    }
}

function writeLastSync(at: string) {
    try {
        localStorage.setItem(KEY, at);
    } catch {
        // Private mode: the next visit just reads the rows again, which changes nothing.
    }
}

/** Distinct words from rows of answers; ignores anything that is not text. */
export function wordsFromAnswers(rows: { lexica_words?: unknown }[]): string[] {
    const out = new Set<string>();
    for (const row of rows) {
        if (!Array.isArray(row.lexica_words)) continue;
        for (const w of row.lexica_words) {
            if (typeof w === 'string' && w.trim()) out.add(w.trim().toLowerCase());
        }
    }
    return [...out];
}

/** Reads new answers and moves their words to Dùng. Never throws. */
export async function syncOratioWords(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
        const client = getSupabaseClient();
        if (!client) return;
        const { data: session } = await client.auth.getSession();
        const userId = session.session?.user.id;
        if (!userId) return;

        let query = client
            .from('answers')
            .select('lexica_words, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: true })
            .limit(MAX_ROWS);
        const since = readLastSync();
        if (since) query = query.gt('created_at', since);
        const { data, error } = await query;
        // No Oratio tables in this project, or offline: try again next visit
        if (error || !data || data.length === 0) return;

        const words = wordsFromAnswers(data);
        if (words.length > 0) useLexicaStore.getState().markSaidInOratio(words);
        const newest = data[data.length - 1]?.created_at;
        if (typeof newest === 'string') writeLastSync(newest);
    } catch {
        // Best effort: Lexica works the same without Oratio.
    }
}
