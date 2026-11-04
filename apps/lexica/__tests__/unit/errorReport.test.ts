import { describe, expect, it } from 'vitest';
import { buildEnvelope, parseDsn, parseStack, shouldIgnore } from '../../app/lib/errorReport';

describe('parseDsn', () => {
    it('reads a Sentry address', () => {
        expect(parseDsn('https://abc123@o1.ingest.sentry.io/4501')).toEqual({ key: 'abc123', host: 'o1.ingest.sentry.io', project: '4501', protocol: 'https' });
    });
    it('rejects anything else', () => {
        expect(parseDsn('')).toBeNull();
        expect(parseDsn(undefined)).toBeNull();
        expect(parseDsn('https://o1.ingest.sentry.io/4501')).toBeNull();
        expect(parseDsn('not a url')).toBeNull();
    });
});

describe('parseStack', () => {
    it('reads Chrome and Safari stacks, oldest call first', () => {
        const chrome = 'Error: x\n    at inner (https://a.com/_next/1.js:10:5)\n    at https://a.com/_next/2.js:3:9';
        expect(parseStack(chrome)).toEqual([
            { function: undefined, filename: 'https://a.com/_next/2.js', lineno: 3, colno: 9 },
            { function: 'inner', filename: 'https://a.com/_next/1.js', lineno: 10, colno: 5 },
        ]);
        expect(parseStack('go@https://a.com/x.js:7:2')[0]).toMatchObject({ function: 'go', lineno: 7 });
        expect(parseStack(undefined)).toEqual([]);
    });
});

describe('shouldIgnore', () => {
    it('skips noise that is not the app', () => {
        expect(shouldIgnore('ResizeObserver loop limit exceeded')).toBe(true);
        expect(shouldIgnore('Script error.')).toBe(true);
        expect(shouldIgnore('boom', 'at x (chrome-extension://abc/a.js:1:1)')).toBe(true);
        expect(shouldIgnore('Cannot read properties of undefined')).toBe(false);
    });
});

describe('buildEnvelope', () => {
    it('is three JSON lines with only the page path, no learner data', () => {
        const dsn = parseDsn('https://k@o1.ingest.sentry.io/9')!;
        const body = buildEnvelope(dsn, { name: 'TypeError', message: 'bad', stack: 'at f (https://a.com/x.js:1:1)', path: '/play', userAgent: 'UA', release: 'abc', id: 'a'.repeat(32), now: new Date('2026-11-04T00:00:00Z') });
        const [header, item, event] = body.split('\n').map((l) => JSON.parse(l));
        expect(header.dsn).toBe('https://k@o1.ingest.sentry.io/9');
        expect(item.type).toBe('event');
        expect(event.request.url).toBe('/play');
        expect(event.exception.values[0].type).toBe('TypeError');
        expect(JSON.stringify(event)).not.toMatch(/localStorage|cortex_user_id/);
    });
});
