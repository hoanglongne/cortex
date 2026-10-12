import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const X = require('./extract.js');

describe('postUrl', () => {
    it('keeps only Threads post links, without query', () => {
        expect(X.postUrl('/@mai.vy/post/C1xYz?xmt=1', 'https://www.threads.com/')).toBe('https://www.threads.com/@mai.vy/post/C1xYz');
        expect(X.postUrl('https://www.threads.net/@a_b/post/DA-1/media')).toBe('https://www.threads.net/@a_b/post/DA-1');
        expect(X.postUrl('https://www.threads.com/@mai.vy')).toBeNull();
        expect(X.postUrl('https://evil.com/@a/post/1')).toBeNull();
    });

    it('reads the author from the link', () => {
        expect(X.authorFromUrl('https://www.threads.com/@mai.vy/post/C1')).toBe('@mai.vy');
    });
});

describe('parseCount', () => {
    it('understands English and Vietnamese short counts', () => {
        expect(X.parseCount('87')).toBe(87);
        expect(X.parseCount('1,2K')).toBe(1200);
        expect(X.parseCount('3,4 N')).toBe(3400);
        expect(X.parseCount('2 Tr')).toBe(2000000);
        expect(X.parseCount('Thích')).toBeNull();
    });
});

describe('cleanPostText', () => {
    it('drops the handle, time and buttons and reads trailing counters', () => {
        const inner = ['mai.vy', '2 giờ', 'lương chưa về mà bill đã tới', 'ai cũng vậy hả', 'Dịch', '1,2K', '87', '12', '5'].join('\n');
        expect(X.cleanPostText(inner, '@mai.vy')).toEqual({
            text: 'lương chưa về mà bill đã tới\nai cũng vậy hả',
            metrics: { likes: 1200, replies: 87, reposts: 12, shares: 5 },
        });
    });

    it('works when there are no counters', () => {
        expect(X.cleanPostText('a\n3h\nhello world', '@a')).toEqual({ text: 'hello world', metrics: {} });
    });
});

describe('buildPayload / normalizeApiUrl', () => {
    it('leaves out empty fields', () => {
        expect(X.buildPayload({ url: 'https://x', text: '  ', note: '', metrics: {} })).toEqual({ url: 'https://x' });
    });

    it('adds https and trims slashes', () => {
        expect(X.normalizeApiUrl('api.up.railway.app/')).toBe('https://api.up.railway.app');
        expect(X.normalizeApiUrl('http://localhost:3001')).toBe('http://localhost:3001');
    });
});

describe('cleanPostText header row', () => {
    it('drops "handle time" written on one line', () => {
        expect(X.cleanPostText('b.c 3h\nđi làm vì đam mê', '@b.c').text).toBe('đi làm vì đam mê');
        expect(X.cleanPostText('mai.vy · 2 giờ\nhello', '@mai.vy').text).toBe('hello');
    });
});
