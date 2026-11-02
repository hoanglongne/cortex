import { describe, expect, it } from 'vitest';
import { perfKey, summarize, type CallSample } from './perf';

const s = (key: string, total: number, server: number | null = null, status = 200): CallSample => ({
    key,
    total,
    server,
    guard: null,
    bytes: 100,
    status,
});

describe('perfKey', () => {
    it('normalises ids and drops the query', () => {
        expect(perfKey('GET', '/cards/123?x=1')).toBe('GET /cards/:id');
        expect(perfKey('PATCH', '/drafts/6f9619ff-8b86-d011-b42d-00c04fc964ff/approve')).toBe('PATCH /drafts/:id/approve');
        expect(perfKey('GET', '/health')).toBe('GET /health');
    });
});

describe('summarize', () => {
    it('groups, takes median/p95 and sorts slowest first', () => {
        const out = summarize([s('a', 100), s('a', 300), s('a', 200), s('b', 900, 700, 500)]);
        expect(out[0].key).toBe('b');
        expect(out[0].errors).toBe(1);
        expect(out[0].medianServer).toBe(700);
        expect(out[1]).toMatchObject({ key: 'a', count: 3, medianTotal: 200, p95Total: 300, medianServer: null });
    });
});
