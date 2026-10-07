/**
 * Two "devices" sharing one fake Cortex API: progress made on device A is
 * restored on a fresh device B, and B opening the app does not overwrite A.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const API = 'https://api.test';
const USER = '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b';

type Store = typeof import('@/app/store/lexicaStore');
type Sync = typeof import('@/app/lib/cloudSync');

let server: Map<string, unknown>;

function fakeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = String(input);
    if (init?.method === 'POST' && url === `${API}/v1/sync/backup`) {
        const body = JSON.parse(String(init.body)) as { userId: string; data: unknown };
        server.set(body.userId, body.data);
        return Promise.resolve(new Response('{}', { status: 201 }));
    }
    const m = url.match(/\/v1\/sync\/backup\/([^/]+)\/lexica$/);
    if (m) {
        const data = server.get(decodeURIComponent(m[1]));
        return Promise.resolve(
            data ? new Response(JSON.stringify({ data }), { status: 200 }) : new Response('{}', { status: 404 }),
        );
    }
    return Promise.reject(new Error(`unexpected ${url}`));
}

/** Fresh module instances = a fresh page load on a device. */
async function bootDevice(): Promise<{ store: Store['useLexicaStore']; sync: Sync }> {
    vi.resetModules();
    const { useLexicaStore } = (await import('@/app/store/lexicaStore')) as Store;
    const sync = (await import('@/app/lib/cloudSync')) as Sync;
    return { store: useLexicaStore, sync };
}

beforeEach(() => {
    server = new Map();
    localStorage.clear();
    vi.stubEnv('NEXT_PUBLIC_CORTEX_API_URL', API);
    vi.stubGlobal('fetch', vi.fn(fakeFetch));
});

afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
});

describe('cloud sync across devices', () => {
    it('restores device A progress on a fresh device B', async () => {
        // Device A: connected user learns a card, then syncs
        localStorage.setItem('cortex_user_id', USER);
        const a = await bootDevice();
        const stop = a.sync.startCloudSync();
        a.store.setState({ cardProgress: { v001: { cardId: 'v001' } as never } });
        await a.sync.syncNow();
        stop();
        expect(server.has(USER)).toBe(true);

        // Device B: empty storage, same Cortex user
        localStorage.clear();
        localStorage.setItem('cortex_user_id', USER);
        const b = await bootDevice();
        expect(Object.keys(b.store.getState().cardProgress)).toHaveLength(0);
        await b.sync.syncNow();
        expect(Object.keys(b.store.getState().cardProgress)).toEqual(['v001']);
    });

    it('does not upload when only non-progress state changes', async () => {
        localStorage.setItem('cortex_user_id', USER);
        server.set(USER, {
            savedAt: '2099-01-01T00:00:00Z',
            state: { state: { cardProgress: { v002: { cardId: 'v002' } } }, version: 0 },
        });
        const dev = await bootDevice();
        const stop = dev.sync.startCloudSync();
        await dev.sync.syncNow(); // restores v002
        (fetch as unknown as ReturnType<typeof vi.fn>).mockClear();

        dev.store.setState({ energy: 5 }); // e.g. daily energy reset on open
        await dev.sync.syncNow();
        stop();

        const posts = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.filter(
            ([, init]) => (init as RequestInit | undefined)?.method === 'POST',
        );
        expect(posts).toHaveLength(0);
        expect((server.get(USER) as { savedAt: string }).savedAt).toBe('2099-01-01T00:00:00Z');
    });

    it('does nothing without a connected Cortex user', async () => {
        const dev = await bootDevice();
        await dev.sync.syncNow();
        expect(fetch).not.toHaveBeenCalled();
    });
});
