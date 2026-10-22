/**
 * The model-voice clips a card needs, exactly as the app asks for them
 * (text, voice and speed are the cache key of the Cortex API's /v1/lexica/tts).
 * One list for two users: the speaking drill loads them ahead, and
 * scripts/pregen-tts.ts makes them in advance with Kokoro so the API serves
 * them from its cache instead of calling Gemini (docs/LEXICA_TTS_RESEARCH.md).
 */
import type { CardQuote, ContentCard } from '../content/pack';
import { speakerOf } from '../content/dialogue';
import type { Passage } from '../content/passages';
import { MINIMAL_PAIRS, nearSound } from '../pronunciation/pairs';
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
export function cardClips(card: Pick<ContentCard, 'word' | 'collocations' | 'situation'> & { ipa?: string }, quotes: readonly CardQuote[] = []): Clip[] {
    const w = card.word.toLowerCase();
    const quote = shadowQuote(quotes, w);
    // "Bạn nghe thấy từ nào?": the near-sound made-up word, in the three voices like the word.
    const near = nearSound(card.word, card.ipa);
    const clips: Clip[] = [
        { text: card.word },
        { text: w },
        { text: w, slow: true },
        ...NATURAL_VOICES.map((voice) => ({ text: w, voice })),
        ...(card.collocations ?? []).map((c) => ({ text: c.toLowerCase() })),
        ...(card.situation ? [{ text: card.situation.model }] : []),
        ...(quote ? [{ text: quote.text }, { text: quote.text, slow: true }] : []),
        ...(near ? NATURAL_VOICES.map((voice) => ({ text: near.distractor, voice })) : []),
    ];
    const seen = new Set<string>();
    return clips.filter((c) => {
        const k = clipKey(c);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    });
}

/** Every word of the minimal pairs (listening rounds, sound tips): the three voices and slow. */
export function pairClips(): Clip[] {
    const words = [...new Set(Object.values(MINIMAL_PAIRS).flatMap((pairs) => pairs.flat()))];
    return words.flatMap((text) => [...NATURAL_VOICES.map((voice) => ({ text, voice })), { text, slow: true }]);
}

/** A reading as PassageReader plays it (the whole text, normal and slow) and, for a dialogue, each turn in its speaker's voice. */
export function passageClips(passage: Pick<Passage, 'text' | 'kind'>): Clip[] {
    const dialogue = passage.kind === 'dialogue';
    const turns = dialogue ? passage.text.split(/\n+/).map(speakerOf) : [];
    const whole = (dialogue ? turns.map((t) => t.line) : passage.text.split(/\n\s*\n/)).join(' ');
    // As DialogueScene: each speaker keeps a voice, in order of first appearance.
    const speakers = [...new Set(turns.map((t) => t.speaker).filter(Boolean))];
    return [
        ...(whole.trim().length <= 1200 ? [{ text: whole }, { text: whole, slow: true }] : []),
        ...turns.filter((t) => t.line.trim()).map((t) => ({ text: t.line, voice: NATURAL_VOICES[Math.max(0, speakers.indexOf(t.speaker)) % NATURAL_VOICES.length] })),
    ];
}

export { DEFAULT_VOICE, normalizeClipText } from './voiceKey';

/** What the API hashes into its cache file name (ttsKey): `voice|slow|text`. */
export const clipKey = voiceKeyInput;
