/**
 * The model voice as samples, to measure it like the learner's attempt
 * (docs/LEXICA_PRONUNCIATION_DESIGN.md, 6.3–6.4): the natural voice the
 * Cortex API already generates and caches for the drill. The system voice
 * (speechSynthesis) cannot be recorded, so without the API there is none.
 */
import { naturalVoiceUrl } from '../audio/AudioService';
import { RATE } from './prosody';

const cache = new Map<string, Promise<Float32Array | null>>();

/** 16 kHz mono samples of `text` in the first natural voice, or null. */
export function modelVoiceSamples(text: string): Promise<Float32Array | null> {
    const url = naturalVoiceUrl(text);
    if (!url || typeof OfflineAudioContext === 'undefined') return Promise.resolve(null);
    let hit = cache.get(url);
    if (!hit) {
        hit = (async () => {
            try {
                const res = await fetch(url);
                if (!res.ok) return null;
                const buf = await res.arrayBuffer();
                // Decoding into a 16 kHz context resamples on the way.
                const ctx = new OfflineAudioContext(1, RATE, RATE);
                const audio = await ctx.decodeAudioData(buf);
                return Float32Array.from(audio.getChannelData(0));
            } catch {
                return null;
            }
        })();
        cache.set(url, hit);
        void hit.then((v) => v === null && cache.delete(url));
    }
    return hit;
}
