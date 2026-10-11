/**
 * Parsers for trend sources (spec §5.1). Pure: the collector fetches, these
 * turn responses into short signals. Only phrases, a link and a 0..1 metric
 * are kept; article bodies are never stored.
 */
export interface RawSignal {
  phrase: string;
  context?: string;
  url?: string;
  metric: number;
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

export function decodeXml(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) =>
      String.fromCodePoint(parseInt(n, 16)),
    )
    .replace(/&([a-z]+);/gi, (m, name: string) => ENTITIES[name] ?? m)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tag(xml: string, name: string): string | undefined {
  const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i');
  const m = re.exec(xml);
  return m ? decodeXml(m[1]) : undefined;
}

function items(xml: string): string[] {
  return xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? [];
}

const clip = (s: string, n: number) =>
  s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s;

/** Generic RSS 2.0: headline as phrase. Newer items rank higher. */
export function parseRss(xml: string): RawSignal[] {
  const list = items(xml);
  return list
    .map((item, i) => {
      const title = tag(item, 'title');
      if (!title) return null;
      const description = tag(item, 'description');
      return {
        phrase: clip(title, 160),
        ...(description ? { context: clip(description, 300) } : {}),
        ...(tag(item, 'link') ? { url: tag(item, 'link') } : {}),
        metric: 1 - (i / Math.max(list.length, 1)) * 0.5,
      };
    })
    .filter((s): s is RawSignal => s !== null);
}

/** "20.000+" / "2,000+" / "500+" → number */
export function parseTraffic(text: string | undefined): number {
  if (!text) return 0;
  const n = Number(text.replace(/[^\d]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

/** Google Trends daily RSS: search term + traffic + first related headline. */
export function parseGoogleTrends(xml: string): RawSignal[] {
  return items(xml)
    .map((item) => {
      const title = tag(item, 'title');
      if (!title) return null;
      const traffic = parseTraffic(tag(item, 'ht:approx_traffic'));
      const headline = tag(item, 'ht:news_item_title');
      const newsUrl = tag(item, 'ht:news_item_url');
      return {
        phrase: clip(title, 160),
        ...(headline ? { context: clip(headline, 300) } : {}),
        ...(newsUrl ? { url: newsUrl } : {}),
        // 1k searches ≈ 0.5, 100k+ ≈ 1
        metric: Math.min(1, Math.max(0.1, Math.log10(traffic + 1) / 5)),
      };
    })
    .filter((s): s is RawSignal => s !== null);
}

interface YoutubeVideo {
  id?: string;
  snippet?: { title?: string; channelTitle?: string; tags?: string[] };
  statistics?: { viewCount?: string };
}

/** YouTube Data API videos.list?chart=mostPopular response. */
export function parseYoutube(json: unknown): RawSignal[] {
  const list = (json as { items?: YoutubeVideo[] } | null)?.items ?? [];
  return list
    .map((v) => {
      const title = v.snippet?.title?.trim();
      if (!title) return null;
      const views = Number(v.statistics?.viewCount ?? 0);
      return {
        phrase: clip(title, 160),
        ...(v.snippet?.channelTitle
          ? { context: clip(v.snippet.channelTitle, 300) }
          : {}),
        ...(v.id ? { url: `https://www.youtube.com/watch?v=${v.id}` } : {}),
        metric: Math.min(1, Math.max(0.1, Math.log10(views + 1) / 7)),
      };
    })
    .filter((s): s is RawSignal => s !== null);
}
