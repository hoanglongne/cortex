/**
 * "Ngoài đời": real quotes that contain a card's word, shown on the back of
 * the card. Book lines come from the public-domain corpus (corpus/), headlines
 * from the RSS signals the trend collector stores; song lines are entered by
 * an editor. Every quote is reviewed before it is published.
 */
import { hasWord } from './corpus/corpus';
import { validateDraft } from './validator';
import type { BlockRule } from './studio.types';

export const QUOTE_KINDS = ['book', 'news', 'song'] as const;
export type QuoteKind = (typeof QUOTE_KINDS)[number];

/** Length limits per kind, in characters. */
const LENGTH: Record<QuoteKind, [number, number]> = {
  book: [30, 300],
  news: [10, 160],
  song: [4, 120],
};
export const MAX_QUOTES_PER_CARD = 2;

/** A short clip of the official video, played only when the learner taps it. */
export interface QuoteMedia {
  provider: 'youtube';
  id: string;
  start: number;
  end: number;
}

/** Longest clip we link to: one line of a song, not the song. */
export const MAX_CLIP_SECONDS = 30;

export interface QuoteInput {
  kind: QuoteKind;
  text: string;
  source: string;
  url?: string | null;
  translation?: string | null;
  media?: QuoteMedia | null;
}

export interface QuoteRow extends QuoteInput {
  card_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  id?: string;
}

/** The entry Lexica downloads, one per quote. */
export interface PublishedQuote {
  kind: QuoteKind;
  text: string;
  source: string;
  url?: string;
  translation?: string;
  media?: QuoteMedia;
}

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/** The video id in a YouTube link (watch, youtu.be, shorts, embed), or null. */
export function youtubeId(link: string): string | null {
  let u: URL;
  try {
    u = new URL(link.trim());
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\.|^m\./, '');
  let id: string | null = null;
  if (host === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
  else if (
    host === 'youtube.com' ||
    host === 'music.youtube.com' ||
    host === 'youtube-nocookie.com'
  ) {
    if (u.pathname === '/watch') id = u.searchParams.get('v');
    else
      id = /^\/(?:shorts|embed|live)\/([^/?#]+)/.exec(u.pathname)?.[1] ?? null;
  }
  return id && YOUTUBE_ID.test(id) ? id : null;
}

/** Builds the clip for a song quote; throws a readable reason when it is unusable. */
export function songMedia(
  link: string,
  start: number,
  end: number,
): QuoteMedia {
  const id = youtubeId(link);
  if (!id) throw new Error('Link YouTube không hợp lệ');
  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end <= start
  ) {
    throw new Error('Giây bắt đầu/kết thúc không hợp lệ');
  }
  if (end - start > MAX_CLIP_SECONDS)
    throw new Error(`Đoạn nhạc tối đa ${MAX_CLIP_SECONDS} giây`);
  return { provider: 'youtube', id, start, end };
}

const isUrl = (s: string) => /^https?:\/\/\S+$/i.test(s);

/**
 * Rules a quote must pass before it is saved. Returns the failed rule names;
 * empty means usable. `word` is the card's base word.
 */
export function checkQuote(
  q: QuoteInput,
  word: string,
  blocklist: readonly BlockRule[],
): string[] {
  const failed: string[] = [];
  const text = q.text.trim();
  const [min, max] = LENGTH[q.kind] ?? LENGTH.book;
  if (text.length < min || text.length > max) failed.push('length');
  const w = word.trim().toLowerCase();
  // Any simple form counts: "dilemmas" is a quote for DILEMMA.
  if (!hasWord(text, w)) failed.push('no_word');
  if (!q.source.trim()) failed.push('no_source');
  if (q.url && !isUrl(q.url.trim())) failed.push('bad_url');
  // Reuse the draft blocklist check (topic and word rules).
  const report = validateDraft(
    { word: w, scenario: text },
    {
      lexicon: new Set([w]),
      blocklist,
      existingScenarios: new Set(),
      sameWordScenarios: [],
      recentWords: new Set(),
    },
  );
  if (!report.rules.blocklist?.pass) failed.push('blocklist');
  return failed;
}

/** Quotes grouped by card for the overlay, approved only, capped per card. */
export function buildQuotesMap(
  rows: readonly (QuoteRow & { status: string })[],
): Record<string, PublishedQuote[]> {
  const out: Record<string, PublishedQuote[]> = {};
  const sorted = [...rows]
    .filter((r) => r.status === 'approved')
    .sort((a, b) => a.card_id.localeCompare(b.card_id));
  for (const r of sorted) {
    const list = (out[r.card_id] ??= []);
    if (list.length >= MAX_QUOTES_PER_CARD) continue;
    list.push({
      kind: r.kind,
      text: r.text.trim(),
      source: r.source.trim(),
      ...(r.url ? { url: r.url.trim() } : {}),
      ...(r.translation ? { translation: r.translation.trim() } : {}),
      ...(r.media ? { media: r.media } : {}),
    });
  }
  return out;
}
