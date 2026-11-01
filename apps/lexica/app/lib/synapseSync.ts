/**
 * Phrases the player has got right in Synapse become cards in the Today queue
 * when the deck has the same phrase (docs/SYNAPSE_PLAN.md S2: Synapse is where
 * a phrase is met and understood, Lexica is where it is remembered). Only
 * phrases the Lexica deck already has are queued; the rest stay in Synapse.
 */
import { getSupabaseClient } from './supabase';
import { getCardByWord } from './content/repository';
import { localDate } from './engagement/ghost';

const KEY = 'lexica-synapse-sync';

/** "___ speak up" → "speak up". */
export const phraseWord = (key: string): string => key.replace(/^_{3}\s*/, '').trim().toLowerCase();

/** Card ids in the deck for the phrases, each once. */
export function cardsFor(phrases: readonly string[], find: (word: string) => { id: string } | undefined): string[] {
    return [...new Set(phrases.map((p) => find(phraseWord(p))?.id).filter((id): id is string => Boolean(id)))];
}

/** Once a day, for a signed-in player: asks the account for the unlocked phrases and queues the cards it finds. Returns how many were queued. */
export async function syncSynapsePhrases(queue: (ids: string[]) => number): Promise<number> {
    try {
        if (localStorage.getItem(KEY) === localDate()) return 0;
    } catch {
        // Storage can be blocked: ask anyway, once per load.
    }
    const supabase = getSupabaseClient();
    if (!supabase) return 0;
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return 0;
    const { data, error } = await supabase.rpc('synapse_unlocked');
    if (error || !Array.isArray(data)) return 0;
    try {
        localStorage.setItem(KEY, localDate());
    } catch {
        // Fine.
    }
    return queue(cardsFor(data as string[], getCardByWord));
}
