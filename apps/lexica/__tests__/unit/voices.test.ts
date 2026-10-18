import { describe, expect, it } from 'vitest';
import { naturalVoiceUrl, pickVoice, voiceQuality } from '../../app/lib/audio/AudioService';
import { downsample, encodeWav, listenOnce } from '../../app/lib/pronunciation/speech';

const voice = (name: string, lang: string) => ({ name, lang, localService: true, default: false, voiceURI: name }) as SpeechSynthesisVoice;

describe('Voices', () => {
    it('picks natural voices over robotic or novelty ones', () => {
        const voices = [voice('eSpeak English', 'en-US'), voice('Fred', 'en-US'), voice('Microsoft Aria Online (Natural)', 'en-US'), voice('Daniel', 'en-GB')];
        expect(pickVoice(voices, 'en')?.name).toBe('Microsoft Aria Online (Natural)');
        expect(voiceQuality(voice('Google US English', 'en-US'))).toBeGreaterThan(voiceQuality(voice('Albert', 'en-US')));
        expect(pickVoice([voice('Linh', 'vi-VN'), voice('Fred', 'en-US')], 'vi')?.name).toBe('Linh');
    });

    it('asks the API only when it is configured', () => {
        expect(naturalVoiceUrl('hello')).toBeNull(); // no NEXT_PUBLIC_CORTEX_API_URL in tests
    });
});

describe('Recording', () => {
    it('downsamples to 16 kHz and writes a playable WAV', () => {
        const chunk = new Float32Array(4800).fill(0.5);
        const out = downsample([chunk, chunk], 48000, 16000);
        expect(out.length).toBe(3200);
        expect(out[10]).toBeCloseTo(0.5);
        const wav = encodeWav(out, 16000);
        expect(wav.size).toBe(44 + 3200 * 2);
        expect(wav.type).toBe('audio/wav');
    });

    it('says so when it can neither recognise nor transcribe', async () => {
        expect((await listenOnce({ target: 'believe' })).error).toBe('unsupported');
    });
});
