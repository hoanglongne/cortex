import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { StudioService } from './studio.service';
import {
  bookSentences,
  checkQuote,
  plainTextUrl,
  QUOTE_KINDS,
  type QuoteKind,
  type QuoteRow,
} from './quotes';

type Db = SupabaseClient<any, any, any>;
type Res = { data: unknown; error: { message: string } | null };

function rows<T>(res: Res): T[] {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T[];
}

/** Gutendex (Project Gutenberg catalogue): public-domain books only. */
const GUTENDEX = 'https://gutendex.com/books/';
const FETCH_MS = 15_000;
/** Cards looked up per "Tìm trong sách" click. */
export const BOOK_BATCH = 10;

interface GutendexBook {
  id: number;
  title: string;
  authors: { name: string }[];
  formats: Record<string, string>;
}

export interface QuoteWithCard extends QuoteRow {
  id: string;
  word: string;
}

/** "Ngoài đời": finds, lists and reviews real quotes for cards. */
@Injectable()
export class QuotesService {
  constructor(private readonly studio: StudioService) {}

  /** card id → word, across core and Studio cards. */
  private async words(db: Db): Promise<Map<string, { word: string }>> {
    const [core, studio] = await Promise.all([
      db.from('studio_core_cards').select('id, word'),
      db.from('studio_cards').select('id, word').neq('lifecycle', 'retired'),
    ]);
    return new Map(
      [
        ...rows<{ id: string; word: string }>(core),
        ...rows<{ id: string; word: string }>(studio),
      ].map((c) => [c.id, { word: c.word }]),
    );
  }

  async list(
    db: Db,
    status: QuoteRow['status'],
    limit = 30,
  ): Promise<QuoteWithCard[]> {
    const list = rows<QuoteWithCard>(
      await db
        .from('studio_card_quotes')
        .select(
          'id, card_id, kind, text, translation, source, url, status, created_at',
        )
        .eq('status', status)
        .order('created_at')
        .limit(limit),
    );
    const words = await this.words(db);
    return list
      .map((q) => ({ ...q, word: words.get(q.card_id)?.word ?? '?' }))
      .filter((q) => q.word !== '?');
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
    },
  ) {
    if (!QUOTE_KINDS.includes(input.kind))
      throw new BadRequestException('kind không hợp lệ');
    const card = (await this.words(db)).get(cardId);
    if (!card) throw new BadRequestException('Không tìm thấy thẻ');
    const quote = {
      kind: input.kind,
      text: input.text.trim(),
      source: input.source.trim(),
      url: input.url?.trim() || null,
      translation: input.translation?.trim() || null,
    };
    const failed = checkQuote(
      quote,
      card.word,
      await this.studio.listBlocklist(db),
    );
    if (failed.length > 0)
      throw new BadRequestException(`Câu chưa đạt: ${failed.join(', ')}`);
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
        throw new BadRequestException(`Câu chưa đạt: ${failed.join(', ')}`);
      patch.text = text.trim();
    }
    const res = await db.from('studio_card_quotes').update(patch).eq('id', id);
    if (res.error) throw new Error(res.error.message);
    return { id, status: patch.status };
  }

  /**
   * Looks up public-domain books for cards that have no book quote yet, and
   * saves the matching sentences as pending. One book per card; the first
   * Gutendex hit with a plain-text edition is used.
   */
  async findBooks(db: Db, limit = BOOK_BATCH) {
    const n = Math.max(1, Math.min(limit, BOOK_BATCH));
    const words = await this.words(db);
    const existing = rows<{ card_id: string; text: string }>(
      await db.from('studio_card_quotes').select('card_id, text'),
    );
    const hasBook = new Set(
      rows<{ card_id: string }>(
        await db
          .from('studio_card_quotes')
          .select('card_id')
          .eq('kind', 'book'),
      ).map((r) => r.card_id),
    );
    const seen = new Set(existing.map((r) => r.text));
    const blocklist = await this.studio.listBlocklist(db);
    const todo = [...words.entries()]
      .filter(([id]) => !hasBook.has(id))
      .slice(0, n);

    let saved = 0;
    let rejected = 0;
    let missed = 0;
    for (const [cardId, { word }] of todo) {
      const hit = await this.bookHit(word).catch(() => null);
      if (!hit) {
        missed++;
        continue;
      }
      for (const text of hit.sentences) {
        if (seen.has(text)) continue;
        const quote = {
          kind: 'book' as const,
          text,
          source: hit.source,
          url: hit.url,
          translation: null,
        };
        if (checkQuote(quote, word, blocklist).length > 0) {
          rejected++;
          continue;
        }
        seen.add(text);
        const res = await db
          .from('studio_card_quotes')
          .insert({ card_id: cardId, ...quote, status: 'pending' });
        if (res.error) throw new Error(res.error.message);
        saved++;
      }
    }
    return { cards: todo.length, saved, rejected, missed };
  }

  /** First public-domain book (plain text) that has sentences with the word. */
  private async bookHit(word: string) {
    const search = await getJson<{ results: GutendexBook[] }>(
      `${GUTENDEX}?search=${encodeURIComponent(word)}&languages=en`,
    );
    for (const book of search.results.slice(0, 5)) {
      const url = plainTextUrl(book.formats);
      if (!url) continue;
      const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_MS) });
      if (!res.ok) continue;
      const sentences = bookSentences(await res.text(), word);
      if (sentences.length === 0) continue;
      const authors = book.authors.map((a) => a.name).join(', ');
      return {
        sentences,
        source: authors ? `${book.title} — ${authors}` : book.title,
        url: `https://www.gutenberg.org/ebooks/${book.id}`,
      };
    }
    return null;
  }
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_MS) });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return (await res.json()) as T;
}
