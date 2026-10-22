/**
 * The model-voice clips a card needs, exactly as the app asks for them
 * (text, voice and speed are the cache key of the Cortex API's /v1/lexica/tts).
 * One list for two users: the speaking drill loads them ahead, and
 * scripts/pregen-tts.ts makes them in advance with Kokoro so the API serves
 * them from its cache instead of calling Gemini (docs/LEXICA_TTS_RESEARCH.md).
 */
import type { CardQuote, ContentCard } from '../content/pack';
import { shadowable } from '../pronunciation/variety';
import { NATURAL_VOICES } from './AudioService';
import { voiceKeyInput } from './voiceKey';

export interface Clip {
    text: string;
    /** A natural voice name; none means the API's default (Kore). */
    voice?: string;
    slow?: boolean;
}

/** A real quote with the word, short enough to say back ("Nói theo câu thật"), or null. */
export function shadowQuote(quotes: readonly CardQuote[], word: string): CardQuote | null {
    const w = word.toLowerCase();
    return quotes.find((q) => shadowable(q.text) && q.text.toLowerCase().includes(w)) ?? null;
}

/** Every clip of one card: the word (as tapped on a card, and in the drill), slow, in three voices; its phrases, situation and quote. */
export function cardClips(card: Pick<ContentCard, 'word' | 'collocations' | 'situation'>, quotes: readonly CardQuote[] = []): Clip[] {
    const w = card.word.toLowerCase();
    const quote = shadowQuote(quotes, w);
    const clips: Clip[] = [
        { text: card.word },
        { text: w },
        { text: w, slow: true },
        ...NATURAL_VOICES.map((voice) => ({ text: w, voice })),
        ...(card.collocations ?? []).map((c) => ({ text: c.toLowerCase() })),
        ...(card.situation ? [{ text: card.situation.model }] : []),
        ...(quote ? [{ text: quote.text }, { text: quote.text, slow: true }] : []),
    ];
    const seen = new Set<string>();
    return clips.filter((c) => {
        const k = clipKey(c);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    });
}

export { DEFAULT_VOICE, normalizeClipText } from './voiceKey';

/** What the API hashes into its cache file name (ttsKey): `voice|slow|text`. */
export const clipKey = voiceKeyInput;
