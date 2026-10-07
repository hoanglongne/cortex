import { afterEach, describe, expect, it, vi } from 'vitest';

async function load() {
    vi.resetModules();
    return import('@/app/lib/speechAvailability');
}

afterEach(() => {
    delete (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    delete (window as unknown as Record<string, unknown>).SpeechRecognition;
});

describe('isVoiceAvailable', () => {
    it('is false when the browser has no SpeechRecognition (e.g. Firefox)', async () => {
        const m = await load();
        expect(m.isVoiceAvailable()).toBe(false);
    });

    it('is true with webkitSpeechRecognition until the mic is denied', async () => {
        (window as unknown as Record<string, unknown>).webkitSpeechRecognition = function () {};
        const m = await load();
        expect(m.isVoiceAvailable()).toBe(true);
        m.markMicPermissionDenied();
        expect(m.isVoiceAvailable()).toBe(false);
    });
});
