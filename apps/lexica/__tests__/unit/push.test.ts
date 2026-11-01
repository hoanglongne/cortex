import { describe, expect, it } from 'vitest';
import { urlBase64ToUint8Array } from '../../app/lib/push';

describe('push', () => {
    it('turns a VAPID public key into the bytes the browser wants', () => {
        // 65 bytes for an uncompressed P-256 key: "BA" + 86 url-safe base64 characters
        const key = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
        const bytes = urlBase64ToUint8Array(key);
        expect(bytes).toHaveLength(65);
        expect(bytes[0]).toBe(4);
        expect(urlBase64ToUint8Array('AQID')).toEqual(new Uint8Array([1, 2, 3]));
    });
});
