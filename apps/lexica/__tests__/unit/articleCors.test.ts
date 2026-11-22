import { describe, expect, it } from 'vitest';
import { GET, OPTIONS } from '../../app/api/dial/article/route';

const call = (origin?: string) => new Request('http://x/api/dial/article?url=https://example.com/a', { headers: origin ? { origin } : {} });

describe('article route CORS (packaged app)', () => {
    it('answers the preflight for the app origins only', () => {
        expect(OPTIONS(call('capacitor://localhost')).headers.get('access-control-allow-origin')).toBe('capacitor://localhost');
        expect(OPTIONS(call('https://evil.example')).headers.get('access-control-allow-origin')).toBeNull();
    });
    it('keeps the site allow-list: an unlisted site is refused, with CORS for the app', async () => {
        const ok = await GET(call('https://localhost'));
        expect(ok.status).toBe(400);
        expect(ok.headers.get('access-control-allow-origin')).toBe('https://localhost');
        expect((await GET(call())).headers.get('access-control-allow-origin')).toBeNull();
    });
});
