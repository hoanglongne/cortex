import { describe, expect, it } from 'vitest';
import { chooseConfig, FIT_RTF, isFit, KOKORO_VOICE, Lru, rtfOf, wavBlob } from '../../app/lib/audio/deviceVoice';

describe('on-device voice', () => {
    it('offers WebGPU first, else WASM q4 (the speed test judges it), and nothing on a very small device', () => {
        expect(chooseConfig({ webgpu: true, isolated: false, cores: 4 })).toMatchObject({ device: 'webgpu', dtype: 'fp32' });
        expect(chooseConfig({ webgpu: false, isolated: true, cores: 8 })).toMatchObject({ device: 'wasm', dtype: 'q4' });
        expect(chooseConfig({ webgpu: false, isolated: false, cores: 6 })).toMatchObject({ device: 'wasm', dtype: 'q4' });
        expect(chooseConfig({ webgpu: false, isolated: false, cores: 2 })).toBeNull();
    });

    it('a device is fit when it makes speech faster than the time it takes to hear it', () => {
        expect(rtfOf(900, 5)).toBeCloseTo(0.18);
        expect(isFit(0.18)).toBe(true);
        expect(isFit(FIT_RTF)).toBe(true);
        expect(isFit(1.67)).toBe(false);
        expect(isFit(rtfOf(100, 0))).toBe(false);
    });

    it('uses the same voices as the clips made in advance', () => {
        expect(KOKORO_VOICE).toMatchObject({ Kore: 'af_heart', Puck: 'am_michael', Aoede: 'bf_emma' });
    });

    it('makes a WAV with a header and 16-bit samples', async () => {
        const blob = wavBlob(new Float32Array([0, 0.5, -0.5, 1]), 24000);
        expect(blob.size).toBe(44 + 8);
        expect(blob.type).toBe('audio/wav');
        const v = new DataView(await blob.arrayBuffer());
        expect(String.fromCharCode(v.getUint8(0), v.getUint8(1), v.getUint8(2), v.getUint8(3))).toBe('RIFF');
        expect(v.getUint32(24, true)).toBe(24000);
        expect(v.getInt16(46, true)).toBe(Math.trunc(0.5 * 0x7fff));
        expect(v.getInt16(50, true)).toBe(0x7fff);
    });

    it('the cache keeps the most recently used and drops the oldest', () => {
        const c = new Lru<number>(2);
        c.set('a', 1);
        c.set('b', 2);
        c.get('a');
        c.set('c', 3);
        expect(c.get('b')).toBeUndefined();
        expect(c.get('a')).toBe(1);
        expect(c.size).toBe(2);
        c.clear();
        expect(c.size).toBe(0);
    });
});
