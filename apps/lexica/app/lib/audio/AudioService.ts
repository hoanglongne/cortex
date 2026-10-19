import { getCard } from '../content/repository';
import { CORTEX_API_URL } from '../cortexConfig';

/**
 * One place for every sound Lexica speaks (docs/LEXICA_AUDIO_SPEC.md).
 *
 * play(cardId, clip) tries, in order:
 *   1. the pre-generated clip shipped in the content pack (card.audio),
 *   2. for English, a natural voice from the Cortex API (GET /v1/lexica/tts,
 *      generated once per text and cached by the server and the browser),
 *   3. the browser's own voice (speechSynthesis), the best one on the device.
 */

export type Clip = 'word' | 'meaning' | 'scenario';
export type AudioTier = 'file' | 'natural' | 'system' | 'none';

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

const GOOD_VOICE = /natural|neural|online|enhanced|premium|wavenet|siri/i;
const KNOWN_GOOD = /google|samantha|ava|allison|susan|zoe|evan|nathan|daniel|serena|karen|moira|tessa|aria|jenny|guy|linh|hoaimy|namminh/i;
const ROBOTIC = /espeak|compact|eloquence|fred|albert|bad news|bells|boing|bubbles|cellos|jester|organ|superstar|trinoids|whisper|wobble|zarvox|junior|ralph|kathy|bahh|grandma|grandpa|rocko|shelley|reed|sandy|flo/i;

/** How natural a system voice sounds, from its name: neural and well-known voices first, novelty voices last. */
export function voiceQuality(v: SpeechSynthesisVoice, lang: 'en' | 'vi' = 'en'): number {
    const l = v.lang.toLowerCase().replace('_', '-');
    return (
        (l === (lang === 'en' ? 'en-us' : 'vi-vn') ? 3 : l === 'en-gb' || l === 'en-au' ? 2 : 0) +
        (GOOD_VOICE.test(v.name) ? 5 : 0) +
        (KNOWN_GOOD.test(v.name) ? 3 : 0) -
        (ROBOTIC.test(v.name) ? 20 : 0)
    );
}

/** Best local voice for a language. */
export function pickVoice(voices: SpeechSynthesisVoice[], lang: 'en' | 'vi'): SpeechSynthesisVoice | undefined {
    const matching = voices.filter((v) => v.lang.toLowerCase().startsWith(lang) && v.lang !== 'en-VI');
    return matching.sort((a, b) => voiceQuality(b, lang) - voiceQuality(a, lang))[0];
}

/** Speaks text with the system voice. Returns false when the browser has none. */
export function speakWithSystem(text: string, lang: 'en' | 'vi' = 'en', rate = lang === 'en' ? 0.9 : 1): boolean {
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

/** Bumped by every play and stop, so a slow clip never starts after the learner moved on. */
let seq = 0;

export function stop() {
    seq++;
    element?.pause();
    if (speechAvailable()) window.speechSynthesis.cancel();
}

// ─── Natural voices (Cortex API) ─────────────────────────────────────────

export const NATURAL_VOICES = ['Kore', 'Puck', 'Aoede'] as const;
/** Off for the session after the API fails once, so every tap does not wait for it again. */
let cloudOff = false;
let slowCalls = 0;

export function naturalVoiceUrl(text: string, opts: { slow?: boolean; voice?: string } = {}): string | null {
    const t = text.trim();
    if (!CORTEX_API_URL || cloudOff || !t || t.length > 1200) return null;
    const q = new URLSearchParams({ text: t });
    if (opts.slow) q.set('slow', '1');
    if (opts.voice) q.set('voice', opts.voice);
    return `${CORTEX_API_URL}/v1/lexica/tts?${q}`;
}

/**
 * Plays English text in a natural voice. Resolves true once it plays (or,
 * with `wait`, once it has finished), false when it cannot: then the caller
 * uses the system voice. `rate` is the system-voice rate the caller wanted.
 */
export async function speakNatural(text: string, opts: { slow?: boolean; voice?: string; rate?: number; wait?: boolean } = {}): Promise<boolean> {
    const url = naturalVoiceUrl(text, opts);
    const el = audioElement();
    if (!url || !el) return false;
    stop();
    const mine = seq;
    el.src = url;
    el.playbackRate = opts.rate ? Math.min(1.3, Math.max(0.6, opts.rate / 0.9)) : 1;
    // A long text is generated on first request; do not keep the learner waiting forever.
    // A word should sound at once: if the natural voice is not ready quickly, the system voice speaks
    // (and the natural one is fetched in the background for next time).
    const waitMs = text.length <= 40 && !preloaded.has(url) ? 2000 : 6000 + text.length * 20;
    const timeout = new Promise<'timeout'>((r) => setTimeout(() => r('timeout'), waitMs));
    try {
        const started = await Promise.race([el.play().then(() => 'ok' as const), timeout]);
        if (mine !== seq) return true; // stopped meanwhile: nothing else should play
        if (started === 'timeout') {
            el.pause();
            warm(url);
            // Twice too slow: the system voice for the rest of the visit.
            if (++slowCalls >= 2) cloudOff = true;
            return false;
        }
    } catch (e) {
        if (mine !== seq) return true;
        // Autoplay rules are not the API's fault; anything else turns it off for the session.
        if (!(e instanceof DOMException && e.name === 'NotAllowedError')) cloudOff = true;
        return false;
    }
    if (opts.wait)
        await new Promise<void>((r) => {
            el.addEventListener('ended', () => r(), { once: true });
            el.addEventListener('pause', () => r(), { once: true });
        });
    return true;
}

async function fallback(cardId: string, clip: Clip): Promise<AudioTier> {
    const card = getCard(cardId);
    if (card && clip === 'word' && (await speakNatural(card.word))) return 'natural';
    return systemFallback(cardId, clip);
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
            // Offline, blocked autoplay or a missing file: use another voice.
        }
    }
    return fallback(cardId, clip);
}

/** Speaks free text (words the user looked up, "Đọc" passages); `rate` defaults per language. */
export async function playText(text: string, lang: 'en' | 'vi' = 'en', rate?: number): Promise<AudioTier> {
    if (lang === 'en' && (await speakNatural(text, { rate, slow: rate !== undefined && rate < 0.8 }))) return 'natural';
    return speakWithSystem(text, lang, rate) ? 'system' : 'none';
}

/** Starts loading an audio URL so playing it later is instant (the browser keeps it cached). */
function warm(url: string) {
    if (typeof Audio === 'undefined' || preloaded.has(url)) return;
    const a = new Audio();
    a.preload = 'auto';
    a.src = url;
    preloaded.set(url, a);
    if (preloaded.size > 30) {
        const [oldest] = preloaded.keys();
        preloaded.delete(oldest);
    }
}

/**
 * Warms the cache for the next cards' word clips: the card's own file, or
 * else the natural voice the API makes (generated on first request, which
 * was the slow part when a learner tapped to listen).
 */
export function preload(cardIds: string[], clip: Clip = 'word') {
    for (const id of cardIds) {
        const card = getCard(id);
        const url = card?.audio?.[clip] ?? (card && clip === 'word' ? naturalVoiceUrl(card.word) : null);
        if (url) warm(url);
    }
}

export const AudioService = { play, playText, preload, stop };
