import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { StudioService } from './studio.service';
import {
  checkQuote,
  QUOTE_KINDS,
  songMedia,
  type QuoteKind,
  type QuoteRow,
} from './quotes';
import {
  bookKey,
  bookPageUrl,
  bookSource,
  bookTextUrl,
  CORPUS_BOOKS,
  type CorpusBook,
} from './corpus/books';
import {
  lemma,
  matchHeadline,
  pickQuotes,
  sentenceLemmas,
  splitSentences,
  stripGutenberg,
  type CorpusHit,
  type Headline,
} from './corpus/corpus';

type Db = SupabaseClient<any, any, any>;
type Res = { data: unknown; error: { message: string } | null };

function rows<T>(res: Res): T[] {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T[];
}

const FETCH_MS = 30_000;
const DAY_MS = 86_400_000;
/** Books downloaded per run (each is 0.2–2 MB). */
export const BOOKS_PER_RUN = 6;
/** Cards searched per "Tìm câu" click; the nightly job does more. */
export const FIND_BATCH = 50;
export const NIGHTLY_FIND = 300;
/** Corpus rows inserted per request. */
const INSERT_CHUNK = 500;
/** Supabase returns at most 1000 rows per select. */
const PAGE = 1000;
/** Headlines older than this are not offered as "Báo" quotes. */
const HEADLINE_DAYS = 30;

export type Fetcher = (url: string) => Promise<string>;

const defaultFetcher: Fetcher = async (url) => {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'LexicaStudio/1.0 (+quote corpus)' },
    signal: AbortSignal.timeout(FETCH_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
};

export interface QuoteWithCard extends QuoteRow {
  id: string;
  word: string;
}

interface QuoteMeta {
  card_id: string;
  kind: QuoteKind;
  text: string;
  status: QuoteRow['status'];
  reviewed_at: string | null;
  published_at: string | null;
}

interface BookRow {
  id: string;
  sentences: number;
  built_at: string | null;
  error: string | null;
}

/** A quote that changed since the last publish (Lexica still has the old state). */
export function isUnpublished(
  q: Pick<QuoteMeta, 'status' | 'reviewed_at' | 'published_at'>,
): boolean {
  if (q.status === 'approved')
    return (
      !q.published_at || (!!q.reviewed_at && q.reviewed_at > q.published_at)
    );
  if (q.status === 'rejected') return !!q.published_at;
  return false;
}

/**
 * "Ngoài đời": the machine finds quotes, editors only review them.
 *
 * - Book lines come from a corpus built once from public-domain books
 *   (corpus/books.ts) and searched by lemma.
 * - Headlines come from RSS signals the trend collector already stored.
 * - Every card searched is recorded, so the next run moves on to new cards.
 */
@Injectable()
export class QuotesService {
  fetcher: Fetcher = defaultFetcher;

  constructor(private readonly studio: StudioService) {}

  /** card id → word, core cards first (in id order), then Studio cards. */
  private async words(db: Db): Promise<Map<string, { word: string }>> {
    const [core, studio] = await Promise.all([
      db.from('studio_core_cards').select('id, word').order('id'),
      db
        .from('studio_cards')
        .select('id, word')
        .neq('lifecycle', 'retired')
        .order('created_at'),
    ]);
    return new Map(
      [
        ...rows<{ id: string; word: string }>(core),
        ...rows<{ id: string; word: string }>(studio),
      ].map((c) => [c.id, { word: c.word }]),
    );
  }

  /** Every row of a select, page by page (Supabase caps one select at 1000). */
  private async all<T>(
    query: () => { range: (from: number, to: number) => PromiseLike<Res> },
  ): Promise<T[]> {
    const out: T[] = [];
    for (let from = 0; ; from += PAGE) {
      const page = rows<T>(await query().range(from, from + PAGE - 1));
      out.push(...page);
      if (page.length < PAGE) return out;
    }
  }

  private quoteMeta(db: Db) {
    return this.all<QuoteMeta>(() =>
      db
        .from('studio_card_quotes')
        .select('card_id, kind, text, status, reviewed_at, published_at')
        .order('created_at'),
    );
  }

  async list(
    db: Db,
    status: QuoteRow['status'],
    limit = 30,
    offset = 0,
  ): Promise<QuoteWithCard[]> {
    const list = rows<QuoteWithCard>(
      await db
        .from('studio_card_quotes')
        .select(
          'id, card_id, kind, text, translation, source, url, media, status, created_at, reviewed_at, published_at',
        )
        .eq('status', status)
        .order(status === 'pending' ? 'created_at' : 'reviewed_at', {
          ascending: status === 'pending',
        })
        .range(offset, offset + limit - 1),
    );
    const words = await this.words(db);
    return list.map((q) => ({
      ...q,
      word: words.get(q.card_id)?.word ?? '(thẻ đã xoá)',
    }));
  }

  /** Cards whose word starts with (then contains) `q`, for the add form. */
  async searchCards(db: Db, q: string, limit = 10) {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    const words = [...(await this.words(db)).entries()].map(([id, c]) => ({
      id,
      word: c.word,
    }));
    const starts = words.filter((c) => c.word.toLowerCase().startsWith(needle));
    const contains = words.filter(
      (c) =>
        !c.word.toLowerCase().startsWith(needle) &&
        c.word.toLowerCase().includes(needle),
    );
    return [...starts, ...contains].slice(0, limit);
  }

  /** Coverage and review counts for the Studio header. */
  async stats(db: Db) {
    const [words, quotes, books, attempts] = await Promise.all([
      this.words(db),
      this.quoteMeta(db),
      db.from('studio_corpus_books').select('id, sentences, built_at, error'),
      db
        .from('studio_quote_attempts')
        .select('card_id', { count: 'exact', head: true }),
    ]);
    const built = rows<BookRow>(books).filter((b) => b.built_at);
    const covered = new Set(
      quotes
        .filter((q) => q.status === 'approved' && words.has(q.card_id))
        .map((q) => q.card_id),
    );
    const count = (s: QuoteRow['status']) =>
      quotes.filter((q) => q.status === s).length;
    return {
      cards: words.size,
      covered: covered.size,
      pending: count('pending'),
      approved: count('approved'),
      rejected: count('rejected'),
      unpublished: quotes.filter(isUnpublished).length,
      searched: (attempts as { count?: number | null }).count ?? 0,
      corpus: {
        books: CORPUS_BOOKS.length,
        built: built.length,
        sentences: built.reduce((n, b) => n + b.sentences, 0),
        failed: rows<BookRow>(books)
          .filter((b) => b.error)
          .map((b) => ({ id: b.id, error: b.error })),
      },
    };
  }

  /** Editor adds a quote by hand (headline, song line, or a book passage). */
  async add(
    db: Db,
    cardId: string,
    input: {
      kind: QuoteKind;
      text: string;
      source: string;
      url?: string;
      translation?: string;
      /** Songs only: YouTube link and the seconds of the line. */
      clip?: { link: string; start: number; end: number };
    },
  ) {
    if (!QUOTE_KINDS.includes(input.kind))
      throw new BadRequestException('Loại câu không hợp lệ');
    const card = (await this.words(db)).get(cardId);
    if (!card) throw new BadRequestException('Không tìm thấy thẻ');
    const quote = {
      kind: input.kind,
      text: input.text.trim(),
      source: input.source.trim(),
      url: input.url?.trim() || null,
      translation: input.translation?.trim() || null,
      media: null as ReturnType<typeof songMedia> | null,
    };
    if (input.clip) {
      if (input.kind !== 'song')
        throw new BadRequestException('Chỉ bài hát mới có đoạn nhạc');
      try {
        quote.media = songMedia(
          input.clip.link,
          input.clip.start,
          input.clip.end,
        );
      } catch (err) {
        throw new BadRequestException((err as Error).message);
      }
      // The video is the source link unless the editor gave another one.
      quote.url ??= input.clip.link.trim();
    }
    const failed = checkQuote(
      quote,
      card.word,
      await this.studio.listBlocklist(db),
    );
    if (failed.length > 0)
      throw new BadRequestException(`Câu chưa đạt: ${describe(failed)}`);
    const res = await db
      .from('studio_card_quotes')
      .insert({ card_id: cardId, ...quote, status: 'pending' })
      .select('id')
      .single();
    if (res.error) throw new Error(res.error.message);
    return { id: (res.data as { id: string }).id, saved: 1 };
  }

  /** Approve (optionally edited text) or reject one quote. */
  async review(
    db: Db,
    userId: string,
    id: string,
    action: 'approve' | 'reject',
    text?: string,
  ) {
    const row = rows<QuoteWithCard & { card_id: string }>(
      await db.from('studio_card_quotes').select('*').eq('id', id).limit(1),
    )[0];
    if (!row) throw new NotFoundException('Không tìm thấy câu trích');
    const patch: Record<string, unknown> = {
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewer_id: userId,
      reviewed_at: new Date().toISOString(),
    };
    if (action === 'approve' && text !== undefined) {
      const word = (await this.words(db)).get(row.card_id)?.word ?? '';
      const failed = checkQuote(
        { ...row, text },
        word,
        await this.studio.listBlocklist(db),
      );
      if (failed.length > 0)
        throw new BadRequestException(`Câu chưa đạt: ${describe(failed)}`);
      patch.text = text.trim();
    }
    const res = await db.from('studio_card_quotes').update(patch).eq('id', id);
    if (res.error) throw new Error(res.error.message);
    return { id, status: patch.status };
  }

  // ------------------------------------------------------------ corpus

  /**
   * Downloads and indexes the next books that are not in the corpus yet (or
   * failed last time). A book whose START/END markers are missing is refused,
   * so no Gutenberg header or licence text is ever stored.
   */
  async buildCorpus(db: Db, maxBooks = BOOKS_PER_RUN) {
    const done = new Set(
      rows<BookRow>(
        await db
          .from('studio_corpus_books')
          .select('id, sentences, built_at, error'),
      )
        .filter((b) => b.built_at && !b.error)
        .map((b) => b.id),
    );
    const todo = CORPUS_BOOKS.filter((b) => !done.has(bookKey(b.id)));
    const batch = todo.slice(0, Math.max(1, maxBooks));
    const built: { title: string; sentences: number }[] = [];
    const failed: { title: string; error: string; network: boolean }[] = [];
    for (const book of batch) {
      try {
        built.push({
          title: book.title,
          sentences: await this.buildBook(db, book),
        });
      } catch (err) {
        const network = err instanceof NetworkError;
        const message = err instanceof Error ? err.message : String(err);
        failed.push({ title: book.title, error: message, network });
        await db.from('studio_corpus_books').upsert({
          id: bookKey(book.id),
          gutenberg_id: book.id,
          title: book.title,
          author: book.author,
          error: message.slice(0, 300),
        });
      }
    }
    return {
      built,
      failed,
      remaining: todo.length - built.length,
      total: CORPUS_BOOKS.length,
    };
  }

  private async buildBook(db: Db, book: CorpusBook): Promise<number> {
    let raw: string;
    try {
      raw = await this.fetcher(bookTextUrl(book.id));
    } catch (err) {
      throw new NetworkError(
        `Không tải được sách (${err instanceof Error ? err.message : String(err)})`,
      );
    }
    const sentences = splitSentences(stripGutenberg(raw));
    if (sentences.length === 0) throw new Error('Không tách được câu nào');
    const id = bookKey(book.id);
    // The book row first (sentences reference it), then replace its sentences.
    check(
      await db.from('studio_corpus_books').upsert({
        id,
        gutenberg_id: book.id,
        title: book.title,
        author: book.author,
        sentences: 0,
        built_at: null,
        error: null,
      }),
    );
    check(await db.from('studio_corpus_sentences').delete().eq('book_id', id));
    for (let i = 0; i < sentences.length; i += INSERT_CHUNK) {
      check(
        await db.from('studio_corpus_sentences').insert(
          sentences.slice(i, i + INSERT_CHUNK).map((text) => ({
            book_id: id,
            text,
            lemmas: sentenceLemmas(text),
          })),
        ),
      );
    }
    check(
      await db
        .from('studio_corpus_books')
        .update({
          sentences: sentences.length,
          built_at: new Date().toISOString(),
          error: null,
        })
        .eq('id', id),
    );
    return sentences.length;
  }

  // ------------------------------------------------------------- search

  /**
   * Finds quotes for the next cards that were not searched since the corpus
   * last changed: up to 3 book lines from different books, plus a recent
   * headline when one has the word. Results wait for review.
   */
  async findQuotes(db: Db, limit = FIND_BATCH) {
    const books = rows<BookRow>(
      await db
        .from('studio_corpus_books')
        .select('id, sentences, built_at, error'),
    ).filter((b) => b.built_at);
    if (books.length === 0)
      throw new BadRequestException(
        'Kho câu chưa được dựng. Bấm "Dựng kho câu" trước.',
      );
    const corpusAt = books
      .map((b) => b.built_at as string)
      .sort()
      .at(-1) as string;

    const [words, quotes, attempts, blocklist, headlines] = await Promise.all([
      this.words(db),
      this.quoteMeta(db),
      this.all<{ card_id: string; tried_at: string }>(() =>
        db
          .from('studio_quote_attempts')
          .select('card_id, tried_at')
          .order('card_id'),
      ),
      this.studio.listBlocklist(db),
      this.headlines(db),
    ]);
    const tried = new Map(attempts.map((a) => [a.card_id, a.tried_at]));
    const has = (cardId: string, kind: QuoteKind) =>
      quotes.some((q) => q.card_id === cardId && q.kind === kind);
    const seen = new Set(quotes.map((q) => q.text));
    const queue = [...words.entries()].filter(([id]) => {
      if (has(id, 'book')) return false;
      const at = tried.get(id);
      return !at || at < corpusAt;
    });
    const todo = queue.slice(0, Math.max(1, limit));
    const titles = new Map(CORPUS_BOOKS.map((b) => [bookKey(b.id), b]));

    let saved = 0;
    let news = 0;
    let rejected = 0;
    let missed = 0;
    for (const [cardId, { word }] of todo) {
      const hits = rows<CorpusHit>(
        await db
          .from('studio_corpus_sentences')
          .select('book_id, text')
          .contains('lemmas', [lemma(word)])
          .limit(80),
      );
      const found: Record<string, unknown>[] = [];
      for (const hit of pickQuotes(hits, word)) {
        const book = titles.get(hit.book_id);
        if (!book || seen.has(hit.text)) continue;
        const quote = {
          kind: 'book' as const,
          text: hit.text,
          source: bookSource(book),
          url: bookPageUrl(book.id),
          translation: null,
        };
        if (checkQuote(quote, word, blocklist).length > 0) {
          rejected++;
          continue;
        }
        seen.add(hit.text);
        found.push(quote);
      }
      const headline = has(cardId, 'news')
        ? null
        : matchHeadline(headlines, word);
      if (headline && !seen.has(headline.phrase)) {
        const quote = {
          kind: 'news' as const,
          text: headline.phrase,
          source: headline.source,
          url: headline.url,
          translation: null,
        };
        if (checkQuote(quote, word, blocklist).length === 0) {
          seen.add(headline.phrase);
          found.push(quote);
          news++;
        }
      }
      if (found.length > 0) {
        check(
          await db
            .from('studio_card_quotes')
            .insert(
              found.map((q) => ({ card_id: cardId, ...q, status: 'pending' })),
            ),
        );
        saved += found.length;
      } else {
        missed++;
      }
      check(
        await db.from('studio_quote_attempts').upsert({
          card_id: cardId,
          tried_at: new Date().toISOString(),
          found: found.length,
        }),
      );
    }
    return {
      cards: todo.length,
      saved,
      news,
      rejected,
      missed,
      remaining: queue.length - todo.length,
    };
  }

  /** Recent RSS headlines (news sources only), newest first. */
  private async headlines(db: Db): Promise<Headline[]> {
    const since = new Date(Date.now() - HEADLINE_DAYS * DAY_MS).toISOString();
    const list = rows<{
      phrase: string;
      url: string | null;
      studio_sources: { label: string; kind: string } | null;
    }>(
      await db
        .from('studio_signals')
        .select('phrase, url, studio_sources(label, kind)')
        .gte('seen_at', since)
        .order('seen_at', { ascending: false })
        .limit(PAGE),
    );
    return list
      .filter((s) => s.studio_sources?.kind === 'rss')
      .map((s) => ({
        phrase: s.phrase,
        url: s.url,
        source: s.studio_sources?.label ?? 'Báo',
      }));
  }

  /** The nightly job: a few more books if any are missing, then a search pass. */
  async nightly(db: Db) {
    const corpus = await this.buildCorpus(db, BOOKS_PER_RUN);
    const builtAny = rows<BookRow>(
      await db
        .from('studio_corpus_books')
        .select('id, sentences, built_at, error'),
    ).some((b) => b.built_at);
    const find = builtAny ? await this.findQuotes(db, NIGHTLY_FIND) : null;
    return {
      booksBuilt: corpus.built.length,
      booksFailed: corpus.failed.length,
      booksRemaining: corpus.remaining,
      ...(find ?? { cards: 0 }),
    };
  }
}

/** A download failure, told apart from "no quote found" in the UI. */
export class NetworkError extends Error {}

function check(res: { error: { message: string } | null }) {
  if (res.error) throw new Error(res.error.message);
}

const RULE_TEXT: Record<string, string> = {
  length: 'độ dài không hợp lệ',
  no_word: 'không chứa từ của thẻ',
  no_source: 'thiếu nguồn',
  bad_url: 'link không hợp lệ',
  blocklist: 'chạm danh sách chặn',
};

/** Failed rule names in Vietnamese, for error messages. */
export function describe(failed: readonly string[]): string {
  return failed.map((f) => RULE_TEXT[f] ?? f).join(', ');
}
