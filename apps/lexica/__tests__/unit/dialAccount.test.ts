import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../app/lib/cortexConfig', () => ({ CORTEX_API_URL: 'https://api.test' }));
vi.mock('../../app/lib/cortexAuth', () => ({
    getCortexAuth: vi.fn(async () => ({ userId: 'u1', token: 'jwt' })),
    authHeaders: (a: { token: string }) => ({ Authorization: `Bearer ${a.token}` }),
}));

import { claimDialTaps, isHello, issueDialToken } from '../../app/lib/dial/account';

afterEach(() => vi.unstubAllGlobals());

describe('dial account link', () => {
    it('recognises only a well-formed hello', () => {
        expect(isHello({ type: 'lexica-dial-hello', tokenUser: null })).toBe(true);
        expect(isHello({ type: 'lexica-dial-hello', tokenUser: 5 })).toBe(false);
        expect(isHello({ type: 'other' })).toBe(false);
        expect(isHello(null)).toBe(false);
    });

    it('issues a token with the session', async () => {
        const fetchMock = vi.fn(async () => new Response(JSON.stringify({ token: 'lxd_abc' }), { status: 200 }));
        vi.stubGlobal('fetch', fetchMock);
        await expect(issueDialToken()).resolves.toEqual({ token: 'lxd_abc', userId: 'u1' });
        expect(fetchMock).toHaveBeenCalledWith('https://api.test/v1/lexica/dial/token', { method: 'POST', headers: { Authorization: 'Bearer jwt' } });
    });

    it('claims taps and survives errors', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify([{ cardId: 'v004', at: 1 }, { nope: 1 }]), { status: 200 })));
        await expect(claimDialTaps()).resolves.toEqual([{ cardId: 'v004', at: 1 }]);
        vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
        await expect(claimDialTaps()).resolves.toEqual([]);
    });
});
