'use client';

/**
 * Lexica's model voices for the teacher's slides: the clips Lexica made
 * ahead (Kokoro, in Supabase Storage, named like Lexica's voiceKey.ts:
 * sha256 of "voice|slow|text", 32 hex), else the browser's English voice.
 */
const CACHE = (() => {
    const own = process.env.NEXT_PUBLIC_VOICE_CACHE_URL?.trim().replace(/\/+$/, '');
    if (own) return own;
    const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, '');
    return supabase ? `${supabase}/storage/v1/object/public/lexica-content/cache/tts` : null;
})();

async function fileName(text: string, slow: boolean): Promise<string> {
    const input = `Kore|${slow ? 1 : 0}|${text.replace(/\p{Cc}/gu, ' ').replace(/\s+/g, ' ').trim()}`;
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
    return `${[...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32)}.wav`;
}

let current: HTMLAudioElement | null = null;

/** Says `text` (lowercased, as Lexica stores word clips). One voice at a time. */
export async function say(text: string, slow = false): Promise<void> {
    current?.pause();
    window.speechSynthesis?.cancel();
    const words = text.toLowerCase();
    if (CACHE && crypto?.subtle) {
        try {
            const audio = new Audio(`${CACHE}/${await fileName(words, slow)}`);
            current = audio;
            await audio.play();
            return;
        } catch {
            // not made yet: the browser voice below
        }
    }
    const u = new SpeechSynthesisUtterance(words);
    u.lang = 'en-US';
    u.rate = slow ? 0.7 : 0.95;
    window.speechSynthesis?.speak(u);
}

export function hush(): void {
    current?.pause();
    window.speechSynthesis?.cancel();
}
