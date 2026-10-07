import { describe, expect, it } from 'vitest';
import { buildCapturePayload, getAnonymousId } from '@/app/lib/productAnalytics';

function memoryStorage(initial: Record<string, string> = {}) {
    const data = { ...initial };
    return {
        getItem: (k: string) => data[k] ?? null,
        setItem: (k: string, v: string) => {
            data[k] = v;
        },
        data,
    };
}

describe('getAnonymousId', () => {
    it('creates an id once and reuses it', () => {
        const storage = memoryStorage();
        const first = getAnonymousId(storage);
        expect(first).toBeTruthy();
        expect(getAnonymousId(storage)).toBe(first);
        expect(storage.data.lexica_anon_id).toBe(first);
    });

    it('returns the stored id', () => {
        expect(getAnonymousId(memoryStorage({ lexica_anon_id: 'abc' }))).toBe('abc');
    });

    it('still works when storage throws', () => {
        const broken = {
            getItem: () => {
                throw new Error('blocked');
            },
            setItem: () => {
                throw new Error('blocked');
            },
        };
        const id = getAnonymousId(broken);
        expect(id).toBeTruthy();
        expect(getAnonymousId(broken)).toBe(id);
    });
});

describe('buildCapturePayload', () => {
    it('tags the app and attaches the Cortex user when signed in', () => {
        const payload = buildCapturePayload('swipe', { direction: 'right' }, 'anon-1', 'user-9', 'key');
        expect(payload).toMatchObject({
            api_key: 'key',
            event: 'swipe',
            distinct_id: 'anon-1',
            properties: { direction: 'right', app: 'lexica', cortex_user_id: 'user-9' },
        });
    });

    it('omits cortex_user_id for anonymous users', () => {
        const payload = buildCapturePayload('app_open', undefined, 'anon-1', null, 'key');
        expect(payload.properties).toEqual({ app: 'lexica' });
    });
});
