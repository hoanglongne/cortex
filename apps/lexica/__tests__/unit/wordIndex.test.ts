import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
});

describe('word index for the teacher app', () => {
    it('adds the cards Studio published, minus retired ones', async () => {
        vi.stubEnv('NEXT_PUBLIC_CONTENT_MANIFEST_URL', 'https://cdn.example/manifest.json');
        const card = (id: string, word: string) => ({ id, word, elo: 900, level: 'beginner', scenario: 'x', translationHint: 'nghĩa' });
        const files: Record<string, unknown> = {
            'https://cdn.example/manifest.json': { schema: 1, updatedAt: 'x', current: { id: 'd1', url: 'https://cdn.example/d1.json', sha256: 'a' }, library: null, retired: ['t2'], variants: null, passages: null, talk: { id: 'tk', url: 'https://cdn.example/tk.json', sha256: 'b' } },
            'https://cdn.example/d1.json': { schema: 1, id: 'd1', cards: [card('t1', 'serendipity'), card('t2', 'gone')] },
            'https://cdn.example/tk.json': { schema: 1, id: 'tk', cards: [card('t3', 'catch up')] },
        };
        vi.stubGlobal('fetch', async (url: string) => ({ json: async () => files[url] }));
        const { GET } = await import('../../app/api/word-index/route');
        const { cards } = (await (await GET()).json()) as { cards: { id: string; word: string; branch: string }[] };
        const byId = new Map(cards.map((c) => [c.id, c]));
        expect(byId.get('t1')?.word).toBe('serendipity');
        expect(byId.has('t2')).toBe(false);
        expect(byId.get('t3')?.branch).toBe('talk');
        expect(byId.get('v001')).toBeTruthy();
    });

    it('falls back to the bundled deck when Studio is down', async () => {
        vi.stubEnv('NEXT_PUBLIC_CONTENT_MANIFEST_URL', 'https://cdn.example/manifest.json');
        vi.stubGlobal('fetch', async () => {
            throw new Error('down');
        });
        const { GET } = await import('../../app/api/word-index/route');
        const { cards } = (await (await GET()).json()) as { cards: unknown[] };
        expect(cards.length).toBeGreaterThan(500);
    });
});
