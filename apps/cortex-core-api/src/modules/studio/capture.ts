import { createHash, randomBytes } from 'node:crypto';
import { BadRequestException } from '@nestjs/common';

/** What a browser extension, share sheet or Shortcut sends. */
export interface CaptureInput {
  url?: string;
  text?: string;
  author?: string;
  note?: string;
  metrics?: Record<string, number>;
}

export const TOKEN_PREFIX = 'lxs_';

export function newCaptureToken(): string {
  return TOKEN_PREFIX + randomBytes(24).toString('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

/** Maps a link to a capture source (studio_sources.id). */
export function sourceForUrl(url: string | undefined): string {
  if (!url) return 'capture_web';
  let host = '';
  try {
    host = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'capture_web';
  }
  if (host === 'threads.net' || host === 'threads.com')
    return 'capture_threads';
  if (host.endsWith('facebook.com') || host === 'fb.com' || host === 'fb.watch')
    return 'capture_facebook';
  if (host.endsWith('tiktok.com')) return 'capture_tiktok';
  return 'capture_web';
}

const clean = (s: string) => s.replace(/\s+/g, ' ').trim();

/** Short label for a capture: its first line or sentence, ≤ 160 chars. */
export function phraseFrom(text: string): string {
  const firstLine =
    text
      .split(/\n+/)
      .map(clean)
      .find((l) => l.length > 0) ?? '';
  const sentence = firstLine.split(/(?<=[.!?…])\s/)[0] ?? firstLine;
  const pick = sentence.length >= 12 ? sentence : firstLine;
  return pick.length > 160 ? `${pick.slice(0, 159).trimEnd()}…` : pick;
}

function str(v: unknown, key: string, max: number): string | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  if (typeof v !== 'string')
    throw new BadRequestException(`${key} must be a string`);
  const t = v.trim();
  if (!t) return undefined;
  return t.length > max ? t.slice(0, max) : t;
}

/** Validates and trims a capture body. Needs at least a link or some text. */
export function parseCaptureInput(body: unknown): CaptureInput {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new BadRequestException('Body must be a JSON object');
  }
  const o = body as Record<string, unknown>;
  const url = str(o.url, 'url', 500);
  if (url && !/^https?:\/\//i.test(url)) {
    throw new BadRequestException('url must be http(s)');
  }
  const text = str(o.text, 'text', 2000);
  if (!url && !text) throw new BadRequestException('Cần link hoặc nội dung');
  let metrics: Record<string, number> | undefined;
  if (
    typeof o.metrics === 'object' &&
    o.metrics !== null &&
    !Array.isArray(o.metrics)
  ) {
    metrics = {};
    for (const [k, v] of Object.entries(
      o.metrics as Record<string, unknown>,
    ).slice(0, 10)) {
      if (typeof v === 'number' && Number.isFinite(v))
        metrics[k.slice(0, 20)] = v;
    }
  }
  return {
    url,
    text,
    author: str(o.author, 'author', 100),
    note: str(o.note, 'note', 500),
    ...(metrics && Object.keys(metrics).length ? { metrics } : {}),
  };
}

function decode(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) =>
      String.fromCodePoint(parseInt(h, 16)),
    )
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function meta(html: string, prop: string): string | undefined {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${prop}["']`,
    'i',
  );
  const m = re.exec(html);
  const v = m?.[1] ?? m?.[2];
  return v ? clean(decode(v)) : undefined;
}

/**
 * Reads the post text and author from a public page's Open Graph tags, for
 * captures that only carry a link (iOS share sheet). Threads titles look like
 * "Name (@handle) on Threads".
 */
export function parseOpenGraph(html: string): {
  text?: string;
  author?: string;
} {
  const text = meta(html, 'og:description') ?? meta(html, 'description');
  const title = meta(html, 'og:title');
  const handle = title?.match(/\(@([\w.]+)\)/)?.[1];
  return {
    ...(text ? { text } : {}),
    ...(handle
      ? { author: `@${handle}` }
      : title
        ? { author: title.slice(0, 100) }
        : {}),
  };
}

/** Phrase the database stores when a capture has no text yet. */
export const CAPTURE_PLACEHOLDER = '(chưa có nội dung)';
