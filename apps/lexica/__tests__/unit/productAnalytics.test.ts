import { describe, expect, it } from 'vitest';
import { getAnonymousId, trackOf } from '@/app/lib/productAnalytics';

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

    it('returns the stored id (kept from before the shared package)', () => {
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

describe('trackOf', () => {
    it('puts events on their learning track', () => {
        expect(trackOf('story_open')).toBe('story');
        expect(trackOf('speak_attempt')).toBe('speaking');
        expect(trackOf('arena_joined')).toBe('class');
        expect(trackOf('today_start')).toBe('vocab');
    });
});
