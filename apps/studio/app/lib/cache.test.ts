import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('./supabase', () => ({
    getSupabase: () => ({ auth: { getSession: async () => ({ data: { session: { access_token: 't' } } }) } }),
}));

let mod: typeof import('./api');
const fetchMock = vi.fn(async (_url: string, init?: { method?: string }) => new Response(JSON.stringify({ method: init?.method ?? 'GET' }), { status: 200 }));

beforeAll(async () => {
    vi.stubEnv('NEXT_PUBLIC_CORTEX_API_URL', 'https://api.test');
    vi.stubGlobal('fetch', fetchMock);
    mod = await import('./api');
});

describe('GET cache', () => {
    it('keeps the last answer to each GET until something is written', async () => {
        expect(mod.cached('/cards?')).toBeUndefined();
        await mod.api('/cards?');
        expect(mod.cached('/cards?')).toEqual({ method: 'GET' });
        await mod.api('/cards/1', { method: 'PATCH', body: {} });
        expect(mod.cached('/cards?')).toBeUndefined();
        expect(mod.cached('/cards/1')).toBeUndefined();
    });

    it('forgets everything on sign-out', async () => {
        await mod.api('/drops');
        mod.clearCache();
        expect(mod.cached('/drops')).toBeUndefined();
    });
});
