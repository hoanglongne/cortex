import {
  bookSentences,
  buildQuotesMap,
  checkQuote,
  plainTextUrl,
  songMedia,
  youtubeId,
  type QuoteRow,
} from './quotes';

const book = {
  kind: 'book' as const,
  text: 'It is a truth universally acknowledged that a single man in possession of a good fortune must be in want of a wife.',
  source: 'Pride and Prejudice — Jane Austen',
};

describe('checkQuote', () => {
  it('passes a book passage that contains the word', () => {
    expect(checkQuote(book, 'fortune', [])).toEqual([]);
  });

  it('flags a missing word, a missing source and a bad link', () => {
    expect(checkQuote(book, 'abundant', [])).toContain('no_word');
    expect(checkQuote({ ...book, source: ' ' }, 'fortune', [])).toContain(
      'no_source',
    );
    expect(
      checkQuote({ ...book, url: 'javascript:alert(1)' }, 'fortune', []),
    ).toContain('bad_url');
  });

  it('uses per-kind length limits', () => {
    expect(
      checkQuote({ kind: 'book', text: 'fortune', source: 'x' }, 'fortune', []),
    ).toContain('length');
    expect(
      checkQuote(
        { kind: 'news', text: 'Giá vàng tăng fortune', source: 'x' },
        'fortune',
        [],
      ),
    ).toEqual([]);
  });

  it('applies the blocklist', () => {
    const rules = [{ pattern: 'war', kind: 'word' as const }];
    expect(
      checkQuote(
        {
          kind: 'news',
          text: 'The war brought no fortune to anyone',
          source: 'x',
        },
        'fortune',
        rules,
      ),
    ).toContain('blocklist');
  });

  it('matches whole words only', () => {
    expect(
      checkQuote(
        {
          kind: 'news',
          text: 'Fortunes of the family changed overnight',
          source: 'x',
        },
        'fortune',
        [],
      ),
    ).toContain('no_word');
  });
});

describe('buildQuotesMap', () => {
  const row = (over: Partial<QuoteRow>): QuoteRow & { status: string } => ({
    card_id: 'v001',
    kind: 'book',
    text: 'A sentence with the word abundant in it.',
    source: 'Book',
    status: 'approved',
    ...over,
  });

  it('keeps approved quotes only, grouped by card, at most two per card', () => {
    const map = buildQuotesMap([
      row({ text: 'one abundant' }),
      row({ text: 'two abundant' }),
      row({ text: 'three abundant' }),
      row({ card_id: 'v002', status: 'pending' }),
      row({
        card_id: 'v003',
        url: ' https://example.com ',
        translation: ' ok ',
      }),
    ]);
    expect(map.v001.map((q) => q.text)).toEqual([
      'one abundant',
      'two abundant',
    ]);
    expect(map.v002).toBeUndefined();
    expect(map.v003[0]).toMatchObject({
      url: 'https://example.com',
      translation: 'ok',
    });
  });
});

describe('bookSentences', () => {
  it('returns sentences that contain the word, up to the limit', () => {
    const body = [
      'Chapter One. The garden was abundant with roses in the early summer months of that year.',
      'Nothing here matches at all in this short line of text.',
      'Another line says that fortune favours the bold in every story that is ever told to children.',
    ].join('\n');
    const out = bookSentences(body, 'abundant', 3);
    expect(out).toHaveLength(1);
    expect(out[0]).toContain('abundant');
  });
});

describe('plainTextUrl', () => {
  it('finds the plain-text edition', () => {
    expect(
      plainTextUrl({
        'text/html': 'https://x/a.html',
        'text/plain; charset=utf-8': 'https://x/a.txt',
      }),
    ).toBe('https://x/a.txt');
    expect(plainTextUrl({ 'text/html': 'https://x/a.html' })).toBeNull();
    expect(plainTextUrl(undefined)).toBeNull();
  });
});

describe('youtubeId', () => {
  it('reads the id from the usual link shapes', () => {
    const id = 'dQw4w9WgXcQ';
    for (const link of [
      `https://www.youtube.com/watch?v=${id}&t=42s`,
      `https://youtu.be/${id}?si=abc`,
      `https://m.youtube.com/watch?v=${id}`,
      `https://www.youtube.com/shorts/${id}`,
      `https://music.youtube.com/watch?v=${id}`,
    ]) {
      expect(youtubeId(link)).toBe(id);
    }
  });

  it('rejects other sites and malformed ids', () => {
    expect(youtubeId('https://vimeo.com/123')).toBeNull();
    expect(youtubeId('https://www.youtube.com/watch?v=short')).toBeNull();
    expect(youtubeId('not a link')).toBeNull();
  });
});

describe('songMedia', () => {
  it('builds a short clip', () => {
    expect(songMedia('https://youtu.be/dQw4w9WgXcQ', 42, 50)).toEqual({
      provider: 'youtube',
      id: 'dQw4w9WgXcQ',
      start: 42,
      end: 50,
    });
  });

  it('refuses long clips and bad times', () => {
    expect(() => songMedia('https://youtu.be/dQw4w9WgXcQ', 0, 31)).toThrow();
    expect(() => songMedia('https://youtu.be/dQw4w9WgXcQ', 10, 10)).toThrow();
    expect(() => songMedia('https://example.com', 0, 5)).toThrow();
  });

  it('is published with the quote', () => {
    const media = songMedia('https://youtu.be/dQw4w9WgXcQ', 42, 50);
    const map = buildQuotesMap([
      {
        card_id: 'v001',
        kind: 'song',
        text: 'never gonna give you up',
        source: 'Song — Singer',
        status: 'approved',
        media,
      },
    ]);
    expect(map.v001[0].media).toEqual(media);
  });
});
