import { BadRequestException } from '@nestjs/common';
import {
  hashToken,
  newCaptureToken,
  parseCaptureInput,
  parseOpenGraph,
  phraseFrom,
  sourceForUrl,
} from './capture';

describe('capture helpers', () => {
  it('maps links to sources', () => {
    expect(sourceForUrl('https://www.threads.com/@a/post/1')).toBe(
      'capture_threads',
    );
    expect(sourceForUrl('https://threads.net/@a/post/1')).toBe(
      'capture_threads',
    );
    expect(sourceForUrl('https://m.facebook.com/story.php?id=1')).toBe(
      'capture_facebook',
    );
    expect(sourceForUrl('https://vt.tiktok.com/abc')).toBe('capture_tiktok');
    expect(sourceForUrl('https://example.com')).toBe('capture_web');
    expect(sourceForUrl('nope')).toBe('capture_web');
    expect(sourceForUrl(undefined)).toBe('capture_web');
  });

  it('builds a short phrase from the first line or sentence', () => {
    expect(
      phraseFrom('\n  lương chưa về   mà bill đã tới. Còn gì nữa đâu\nline 2'),
    ).toBe('lương chưa về mà bill đã tới.');
    expect(phraseFrom('ủa? sao kì vậy ta')).toBe('ủa? sao kì vậy ta');
    expect(phraseFrom('x'.repeat(300))).toHaveLength(160);
  });

  it('validates input', () => {
    expect(
      parseCaptureInput({ url: 'https://threads.net/x', note: ' hay ' }),
    ).toEqual({
      url: 'https://threads.net/x',
      note: 'hay',
    });
    expect(
      parseCaptureInput({ text: 'abc', metrics: { likes: 12, bad: 'x' } }),
    ).toEqual({
      text: 'abc',
      metrics: { likes: 12 },
    });
    expect(() => parseCaptureInput({})).toThrow(BadRequestException);
    expect(parseCaptureInput({ text: 'y'.repeat(5000) }).text).toHaveLength(
      2000,
    );
  });

  it('reads Open Graph tags', () => {
    const html = `<head><meta property="og:title" content="Linh (@linh.dev) on Threads">
      <meta content="lương chưa về mà bill đã tới &#x1f62d; &amp; còn nợ" property="og:description"></head>`;
    expect(parseOpenGraph(html)).toEqual({
      text: 'lương chưa về mà bill đã tới 😭 & còn nợ',
      author: '@linh.dev',
    });
    expect(parseOpenGraph('<html></html>')).toEqual({});
  });

  it('makes opaque tokens and stable hashes', () => {
    const t = newCaptureToken();
    expect(t).toMatch(/^lxs_[\w-]{32}$/);
    expect(hashToken(t)).toHaveLength(64);
    expect(hashToken(t)).toBe(hashToken(t));
    expect(newCaptureToken()).not.toBe(t);
  });
});

describe('cleanUrl', () => {
  it('drops tracking parameters', () => {
    expect(
      parseCaptureInput({
        url: 'https://www.threads.net/@a/post/C1?xmt=AQ&utm_source=ig',
      }).url,
    ).toBe('https://www.threads.net/@a/post/C1');
  });
});

describe('parseCaptureInput with shared text', () => {
  it('pulls the link out of text sent as url', () => {
    expect(
      parseCaptureInput({
        url: 'Xem bài của @a trên Threads https://www.threads.net/@a/post/C1?xmt=1',
      }),
    ).toEqual({
      url: 'https://www.threads.net/@a/post/C1',
      text: 'Xem bài của @a trên Threads',
    });
  });

  it('keeps text without a link, and ignores non-http links', () => {
    expect(parseCaptureInput({ url: 'đi làm vì đam mê' })).toEqual({
      text: 'đi làm vì đam mê',
    });
    expect(
      parseCaptureInput({ url: 'javascript:alert(1)' }).url,
    ).toBeUndefined();
  });
});
