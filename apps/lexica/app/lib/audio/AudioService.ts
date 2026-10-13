import { getCard } from '../content/repository';

/**
 * One place for every sound Lexica speaks (docs/LEXICA_AUDIO_SPEC.md).
 *
 * play(cardId, clip) tries, in order:
 *   1. the pre-generated clip shipped in the content pack (card.audio),
 *   2. the browser's own voice (speechSynthesis).
 * Tier 2 (on-device model) slots in between later without touching callers.
 */

export type Clip = 'word' | 'meaning' | 'scenario';
export type AudioTier = 'file' | 'system' | 'none';

let element: HTMLAudioElement | null = null;
const preloaded = new Map<string, HTMLAudioElement>();

function audioElement(): HTMLAudioElement | null {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') return null;
    element ??= new Audio();
    return element;
}

function speechAvailable(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** Best local voice for a language: prefers on-device, then "enhanced/premium" voices. */
export function pickVoice(voices: SpeechSynthesisVoice[], lang: 'en' | 'vi'): SpeechSynthesisVoice | undefined {
    const matching = voices.filter((v) => v.lang.toLowerCase().startsWith(lang) && v.lang !== 'en-VI');
    const score = (v: SpeechSynthesisVoice) =>
        (v.lang.toLowerCase() === (lang === 'en' ? 'en-us' : 'vi-vn') ? 4 : 0) +
        (/enhanced|premium|natural|neural/i.test(v.name) ? 2 : 0) +
        (v.localService ? 1 : 0);
    return matching.sort((a, b) => score(b) - score(a))[0];
}

/** Speaks text with the system voice. Returns false when the browser has none. */
export function speakWithSystem(text: string, lang: 'en' | 'vi' = 'en', rate = lang === 'en' ? 0.8 : 1): boolean {
    if (!speechAvailable() || !text) return false;
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'en' ? 'en-US' : 'vi-VN';
    utterance.rate = rate;
    const voice = pickVoice(synth.getVoices(), lang);
    if (voice) utterance.voice = voice;
    synth.cancel();
    synth.speak(utterance);
    return true;
}

export function stop() {
    element?.pause();
    if (speechAvailable()) window.speechSynthesis.cancel();
}

function systemFallback(cardId: string, clip: Clip): AudioTier {
    const card = getCard(cardId);
    if (!card) return 'none';
    const text = clip === 'word' ? card.word : clip === 'meaning' ? card.translationHint : card.scenario;
    // Vietnamese system voices read the embedded English word badly, so the
    // scenario only falls back to the word itself.
    if (clip === 'scenario') return speakWithSystem(card.word, 'en') ? 'system' : 'none';
    return speakWithSystem(text ?? '', clip === 'meaning' ? 'vi' : 'en') ? 'system' : 'none';
}

/** Plays one clip of a card; resolves with the tier that was used. */
export async function play(cardId: string, clip: Clip = 'word'): Promise<AudioTier> {
    const url = getCard(cardId)?.audio?.[clip];
    const el = audioElement();
    if (url && el) {
        stop();
        el.src = url;
        try {
            await el.play();
            return 'file';
        } catch {
            // Offline, blocked autoplay or a missing file: use the system voice.
        }
    }
    return systemFallback(cardId, clip);
}

/** Speaks free text (words the user looked up, story passages). */
export function playText(text: string, lang: 'en' | 'vi' = 'en'): AudioTier {
    return speakWithSystem(text, lang) ? 'system' : 'none';
}

/** Warms the cache for the next cards' word clips. */
export function preload(cardIds: string[], clip: Clip = 'word') {
    if (typeof Audio === 'undefined') return;
    for (const id of cardIds) {
        const url = getCard(id)?.audio?.[clip];
        if (!url || preloaded.has(url)) continue;
        const a = new Audio();
        a.preload = 'auto';
        a.src = url;
        preloaded.set(url, a);
        if (preloaded.size > 20) {
            const [oldest] = preloaded.keys();
            preloaded.delete(oldest);
        }
    }
}

export const AudioService = { play, playText, preload, stop };
