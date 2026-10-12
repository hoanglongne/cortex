import { describe, expect, it } from 'vitest';
import { cleanUrl, metricsText, parseShared, prefillTrend, timeAgo, PLACEHOLDER } from './capture';

describe('parseShared', () => {
    it('finds the link inside shared text and drops tracking params', () => {
        expect(parseShared({ text: 'https://www.threads.net/@mai.vy/post/C1xYz?xmt=AQGz' })).toEqual({
            url: 'https://www.threads.net/@mai.vy/post/C1xYz',
            text: '',
        });
    });

    it('keeps real text next to the link', () => {
        expect(parseShared({ title: 'lương chưa về mà bill đã tới', url: 'https://vt.tiktok.com/ZS123/' })).toEqual({
            url: 'https://vt.tiktok.com/ZS123/',
            text: 'lương chưa về mà bill đã tới',
        });
    });

    it('drops the app boilerplate line', () => {
        expect(parseShared({ text: 'Xem bài viết của @a trên Threads\nhttps://www.threads.com/@a/post/1' }).text).toBe('');
    });

    it('works for text only', () => {
        expect(parseShared({ text: 'đi làm vì đam mê, đam mê tiền' })).toEqual({ url: '', text: 'đi làm vì đam mê, đam mê tiền' });
    });
});

describe('helpers', () => {
    it('cleanUrl keeps meaningful params', () => {
        expect(cleanUrl('https://www.facebook.com/story.php?story_fbid=1&id=2&mibextid=abc')).toBe('https://www.facebook.com/story.php?story_fbid=1&id=2');
    });

    it('prefillTrend uses the note and body as context', () => {
        expect(prefillTrend({ phrase: 'bill tới', body: 'bill tới\ntrước lương', note: 'trend dân văn phòng' })).toEqual({
            label: 'bill tới',
            summary: 'trend dân văn phòng\n\nbill tới\ntrước lương',
        });
        expect(prefillTrend({ phrase: PLACEHOLDER, body: null, note: null })).toEqual({ label: '', summary: '' });
    });

    it('formats metrics and time', () => {
        expect(metricsText({ likes: 1200, replies: 87 })).toBe('1.200 thích · 87 trả lời');
        expect(timeAgo('2026-10-10T00:00:00Z', Date.parse('2026-10-10T03:00:00Z'))).toBe('3 giờ trước');
    });
});
