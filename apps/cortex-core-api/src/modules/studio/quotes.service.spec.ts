import { fakeDb, type Call } from './__testkit__/fake-db';
import { CORPUS_BOOKS } from './corpus/books';
import { isUnpublished, QuotesService } from './quotes.service';
import type { StudioService } from './studio.service';

const studio = {
  listBlocklist: () => Promise.resolve([]),
} as unknown as StudioService;

const CORE = [
  { id: 'v001', word: 'ABUNDANT' },
  { id: 'v002', word: 'DILEMMA' },
  { id: 'v003', word: 'COGNITIVE' },
];

const SENTENCES: Record<string, { book_id: string; text: string }[]> = {
  abundant: [
    {
      book_id: 'pg1342',
      text: 'The harvest was abundant this year in every valley.',
    },
    {
      book_id: 'pg84',
      text: 'Water was abundant, and nobody went thirsty that summer.',
    },
  ],
  dilemma: [
    {
      book_id: 'pg541',
      text: 'It was just like Ellen to place the family in such dilemmas.',
    },
  ],
};

/** A fake Supabase where each table answers from simple in-memory lists. */
function setup(opts: {
  attempts?: { card_id: string; tried_at: string }[];
  books?: {
    id: string;
    sentences: number;
    built_at: string | null;
    error: string | null;
  }[];
  quotes?: Record<string, unknown>[];
  signals?: Record<string, unknown>[];
}) {
  const books = opts.books ?? [
    {
      id: 'pg1342',
      sentences: 100,
      built_at: '2026-10-17T00:00:00Z',
      error: null,
    },
  ];
  const attempts = [...(opts.attempts ?? [])];
  const inserted: Record<string, unknown>[] = [];
  const respond = (c: Call) => {
    if (c.table === 'studio_core_cards') return { data: CORE };
    if (c.table === 'studio_cards') return { data: [] };
    if (c.table === 'studio_corpus_books') return { data: books };
    if (c.table === 'studio_card_quotes') {
      if (c.op === 'insert') {
        inserted.push(...(c.payload as Record<string, unknown>[]));
        return {};
      }
      return { data: opts.quotes ?? [] };
    }
    if (c.table === 'studio_quote_attempts') {
      if (c.op === 'upsert') {
        attempts.push(c.payload as { card_id: string; tried_at: string });
        return {};
      }
      return { data: attempts };
    }
    if (c.table === 'studio_signals') return { data: opts.signals ?? [] };
    if (c.table === 'studio_corpus_sentences' && c.op === 'select') {
      const key = (
        c.filters.find((f) => f[0] === 'contains')?.[2] as string[]
      )[0];
      return { data: SENTENCES[key] ?? [] };
    }
    return {};
  };
  const fake = fakeDb(respond);
  return { ...fake, inserted, attempts, service: new QuotesService(studio) };
}

describe('QuotesService.findQuotes', () => {
  it('searches the corpus by lemma and saves book lines for review', async () => {
    const { db, service, inserted, calls } = setup({});
    const r = await service.findQuotes(db, 2);
    expect(r).toMatchObject({ cards: 2, saved: 3, missed: 0, remaining: 1 });
    const lemmas = calls
      .filter((c) => c.table === 'studio_corpus_sentences')
      .map((c) => c.filters.find((f) => f[0] === 'contains')?.[2]);
    expect(lemmas).toEqual([['abundant'], ['dilemma']]);
    expect(inserted).toContainEqual(
      expect.objectContaining({
        card_id: 'v001',
        kind: 'book',
        status: 'pending',
        source: 'Pride and Prejudice — Jane Austen',
        url: 'https://www.gutenberg.org/ebooks/1342',
      }),
    );
    // "dilemmas" in the book counts for DILEMMA
    expect(inserted.some((q) => q.card_id === 'v002')).toBe(true);
  });

  it('records every card searched, so the next click moves on', async () => {
    const { db, service, attempts } = setup({});
    await service.findQuotes(db, 2);
    expect(attempts.map((a) => a.card_id)).toEqual(['v001', 'v002']);
    // Second click: v001 and v002 were tried after the corpus was built.
    const second = await service.findQuotes(db, 2);
    expect(second).toMatchObject({
      cards: 1,
      saved: 0,
      missed: 1,
      remaining: 0,
    });
    expect(attempts.at(-1)).toMatchObject({ card_id: 'v003', found: 0 });
  });

  it('searches a card again once the corpus has grown since', async () => {
    const { db, service } = setup({
      attempts: [
        { card_id: 'v001', tried_at: '2026-10-01T00:00:00Z' },
        { card_id: 'v002', tried_at: '2026-10-18T00:00:00Z' },
        { card_id: 'v003', tried_at: '2026-10-18T00:00:00Z' },
      ],
    });
    expect(await service.findQuotes(db, 10)).toMatchObject({
      cards: 1,
      saved: 2,
    });
  });

  it('skips cards that already have a book line', async () => {
    const { db, service } = setup({
      quotes: [
        { card_id: 'v001', kind: 'book', text: 'x', status: 'rejected' },
      ],
    });
    const r = await service.findQuotes(db, 1);
    expect(r.cards).toBe(1);
    expect(r).toMatchObject({ saved: 1 }); // v002, not v001
  });

  it('adds a recent headline that has the word', async () => {
    const { db, service, inserted } = setup({
      signals: [
        {
          phrase: 'Rainfall abundant across the north this week',
          url: 'https://news/x',
          studio_sources: { label: 'VnExpress', kind: 'rss' },
        },
        {
          phrase: 'abundant',
          url: null,
          studio_sources: { label: 'Google Trends', kind: 'google_trends' },
        },
      ],
    });
    const r = await service.findQuotes(db, 1);
    expect(r.news).toBe(1);
    expect(inserted.find((q) => q.kind === 'news')).toMatchObject({
      card_id: 'v001',
      source: 'VnExpress',
      url: 'https://news/x',
    });
  });

  it('refuses to search before the corpus is built', async () => {
    const { db, service } = setup({ books: [] });
    await expect(service.findQuotes(db, 5)).rejects.toThrow(/Dựng kho câu/);
  });
});

describe('QuotesService.buildCorpus', () => {
  const book = (title: string) =>
    `Header text with a licence.\n*** START OF THE PROJECT GUTENBERG EBOOK ${title} ***\n\nThe harvest was abundant this year, and the whole valley sang about it.\n\n*** END OF THE PROJECT GUTENBERG EBOOK ${title} ***\nLicence text here.`;

  it('stores sentences from the book body only, with their lemmas', async () => {
    const { db, calls, service } = setup({ books: [] });
    service.fetcher = () => Promise.resolve(book('X'));
    const r = await service.buildCorpus(db, 1);
    expect(r.failed).toEqual([]);
    expect(r.built).toEqual([{ title: CORPUS_BOOKS[0].title, sentences: 1 }]);
    expect(r.remaining).toBe(CORPUS_BOOKS.length - 1);
    const rowsIn = calls
      .filter((c) => c.table === 'studio_corpus_sentences' && c.op === 'insert')
      .flatMap((c) => c.payload as { text: string; lemmas: string[] }[]);
    expect(rowsIn).toHaveLength(1);
    expect(rowsIn[0].text).not.toMatch(/licence|gutenberg/i);
    expect(rowsIn[0].lemmas).toContain('abundant');
  });

  it('tells a download failure apart from a bad file', async () => {
    const { db, service } = setup({ books: [] });
    let n = 0;
    service.fetcher = () =>
      n++ === 0
        ? Promise.reject(new Error('HTTP 503'))
        : Promise.resolve('no markers');
    const r = await service.buildCorpus(db, 2);
    expect(r.failed.map((f) => f.network)).toEqual([true, false]);
    expect(r.failed[0].error).toContain('HTTP 503');
    expect(r.failed[1].error).toContain('START');
    expect(r.built).toEqual([]);
  });
});

describe('isUnpublished', () => {
  it('counts approved rows not yet live and rejected rows still live', () => {
    expect(
      isUnpublished({
        status: 'approved',
        reviewed_at: '2',
        published_at: null,
      }),
    ).toBe(true);
    expect(
      isUnpublished({
        status: 'approved',
        reviewed_at: '3',
        published_at: '2',
      }),
    ).toBe(true);
    expect(
      isUnpublished({
        status: 'approved',
        reviewed_at: '1',
        published_at: '2',
      }),
    ).toBe(false);
    expect(
      isUnpublished({
        status: 'rejected',
        reviewed_at: '1',
        published_at: '2',
      }),
    ).toBe(true);
    expect(
      isUnpublished({
        status: 'pending',
        reviewed_at: null,
        published_at: null,
      }),
    ).toBe(false);
  });
});

describe('QuotesService.searchCards', () => {
  it('lists words that start with the query first', async () => {
    const { db, service } = setup({});
    expect(await service.searchCards(db, 'cog')).toEqual([
      { id: 'v003', word: 'COGNITIVE' },
    ]);
    // Words that start with the query come before words that only contain it.
    expect(await service.searchCards(db, 'n')).toEqual([
      { id: 'v001', word: 'ABUNDANT' },
      { id: 'v003', word: 'COGNITIVE' },
    ]);
    expect(await service.searchCards(db, 'dil')).toEqual([
      { id: 'v002', word: 'DILEMMA' },
    ]);
    expect(await service.searchCards(db, ' ')).toEqual([]);
  });
});
