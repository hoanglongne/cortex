import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';
import {
  CAPTURE_PLACEHOLDER,
  hashToken,
  newCaptureToken,
  parseOpenGraph,
  phraseFrom,
  sourceForUrl,
  TOKEN_PREFIX,
  type CaptureInput,
} from './capture';
import { StudioService } from './studio.service';
import type { TrendRow, TrendStatus } from './studio.types';

type Db = SupabaseClient<any, any, any>;
type Res = { data: unknown; error: { message: string; code?: string } | null };

export const CAPTURE_SOURCES = [
  'capture_threads',
  'capture_facebook',
  'capture_tiktok',
  'capture_web',
];

const DAY_MS = 86_400_000;
const DEDUPE_DAYS = 7;
const MAX_HTML = 500_000;

export type PageFetcher = (url: string) => Promise<string>;

/** Fetches a public page the way link previews do, so it serves OG tags. */
const defaultPageFetcher: PageFetcher = async (url) => {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'facebookexternalhit/1.1 (+LexicaStudio capture)',
      Accept: 'text/html',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(5_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.text()).slice(0, MAX_HTML);
};

export interface CaptureRow {
  id: number;
  source_id: string;
  phrase: string;
  body: string | null;
  author: string | null;
  note: string | null;
  url: string | null;
  metrics: Record<string, number> | null;
  seen_at: string;
  dismissed: boolean;
}

export interface CaptureView extends CaptureRow {
  trend: { id: string; label: string; status: TrendStatus } | null;
}

export interface CaptureToken {
  id: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

const CAPTURE_COLUMNS =
  'id, source_id, phrase, body, author, note, url, metrics, seen_at, dismissed';

function rows<T>(res: Res): T[] {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T[];
}

function one<T>(res: Res, what: string): T {
  if (res.error) throw new Error(res.error.message);
  const data: unknown = Array.isArray(res.data)
    ? (res.data[0] as unknown)
    : res.data;
  if (!data) throw new NotFoundException(`${what} not found`);
  return data as T;
}

/** The fields stored for a capture, from what the client sent. */
export function captureRecord(input: CaptureInput) {
  const text = input.text ?? '';
  return {
    source_id: sourceForUrl(input.url),
    url: input.url ?? null,
    phrase: (text && phraseFrom(text)) || CAPTURE_PLACEHOLDER,
    body: input.text ?? null,
    author: input.author ?? null,
    note: input.note ?? null,
    metrics: input.metrics ?? null,
  };
}

/**
 * Posts saved while browsing (browser extension, Android share, iOS
 * Shortcut). They are signals from the "capture_*" sources and show up in
 * Studio → Radar, where an editor turns them into trends.
 */
@Injectable()
export class CaptureService {
  private readonly logger = new Logger(CaptureService.name);
  fetchPage: PageFetcher = defaultPageFetcher;

  constructor(
    private readonly supabase: SupabaseService,
    private readonly studio: StudioService,
  ) {}

  /**
   * Fills in text and author from the page when only a link was sent. Only
   * Threads, Facebook and TikTok pages are fetched, so a capture can never
   * make the API request an arbitrary (or internal) address.
   */
  async enrich(input: CaptureInput): Promise<CaptureInput> {
    if (!input.url || (input.text && input.author)) return input;
    if (!input.url.startsWith('https://')) return input;
    if (sourceForUrl(input.url) === 'capture_web') return input;
    try {
      const og = parseOpenGraph(await this.fetchPage(input.url));
      return {
        ...input,
        text: input.text ?? og.text?.slice(0, 2000),
        author: input.author ?? og.author,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Could not read ${input.url}: ${message}`);
      return input;
    }
  }

  // ------------------------------------------------- token (public) captures

  async captureWithToken(
    token: string | undefined,
    input: CaptureInput,
  ): Promise<{ id: number }> {
    if (!token?.startsWith(TOKEN_PREFIX)) {
      throw new UnauthorizedException('Thiếu mã gửi bài (Bearer lxs_…)');
    }
    const client = this.supabase.getClient();
    if (!client)
      throw new ServiceUnavailableException('Supabase chưa cấu hình');
    const record = captureRecord(await this.enrich(input));
    const res = (await client.rpc('studio_capture_with_token', {
      p_token_hash: hashToken(token),
      p_capture: record,
    })) as Res;
    if (res.error) {
      if (
        res.error.code === '28000' ||
        res.error.message.includes('invalid capture token')
      ) {
        throw new UnauthorizedException('Mã gửi bài sai hoặc đã bị thu hồi');
      }
      throw new Error(res.error.message);
    }
    return { id: Number(res.data) };
  }

  /** For the extension's "Kiểm tra" button: the token's name, or 401. */
  async checkToken(token: string | undefined): Promise<{ name: string }> {
    if (!token?.startsWith(TOKEN_PREFIX)) {
      throw new UnauthorizedException('Thiếu mã gửi bài (Bearer lxs_…)');
    }
    const client = this.supabase.getClient();
    if (!client)
      throw new ServiceUnavailableException('Supabase chưa cấu hình');
    const res = (await client.rpc('studio_capture_token_name', {
      p_token_hash: hashToken(token),
    })) as Res;
    if (res.error) throw new Error(res.error.message);
    if (typeof res.data !== 'string') {
      throw new UnauthorizedException('Mã gửi bài sai hoặc đã bị thu hồi');
    }
    return { name: res.data };
  }

  // ------------------------------------------------------ editor captures

  /** Same rules as the token path: one capture per link per week. */
  async createCapture(
    db: Db,
    userId: string,
    input: CaptureInput,
  ): Promise<CaptureRow> {
    const record = captureRecord(await this.enrich(input));
    if (record.url) {
      const since = new Date(Date.now() - DEDUPE_DAYS * DAY_MS).toISOString();
      const existing = rows<CaptureRow>(
        await db
          .from('studio_signals')
          .select(CAPTURE_COLUMNS)
          .eq('url', record.url)
          .eq('captured_by', userId)
          .gte('seen_at', since)
          .order('seen_at', { ascending: false })
          .limit(1),
      )[0];
      if (existing) {
        return one<CaptureRow>(
          await db
            .from('studio_signals')
            .update({
              note: record.note ?? existing.note,
              body: existing.body ?? record.body,
              ...(existing.phrase === CAPTURE_PLACEHOLDER
                ? { phrase: record.phrase }
                : {}),
              dismissed: false,
            })
            .eq('id', existing.id)
            .select(CAPTURE_COLUMNS),
          'Capture',
        );
      }
    }
    return one<CaptureRow>(
      await db
        .from('studio_signals')
        .insert({ ...record, metric: 1, captured_by: userId })
        .select(CAPTURE_COLUMNS),
      'Capture',
    );
  }

  async listCaptures(db: Db, dismissed: boolean): Promise<CaptureView[]> {
    const list = rows<
      CaptureRow & {
        studio_trend_signals?: {
          studio_trends: CaptureView['trend'];
        }[];
      }
    >(
      await db
        .from('studio_signals')
        .select(
          `${CAPTURE_COLUMNS}, studio_trend_signals(studio_trends(id, label, status))`,
        )
        .in('source_id', CAPTURE_SOURCES)
        .eq('dismissed', dismissed)
        .order('seen_at', { ascending: false })
        .limit(200),
    );
    return list.map(({ studio_trend_signals: links, ...c }) => ({
      ...c,
      trend: links?.find((l) => l.studio_trends)?.studio_trends ?? null,
    }));
  }

  async updateCapture(
    db: Db,
    id: number,
    patch: { text?: string; note?: string; dismissed?: boolean },
  ): Promise<CaptureRow> {
    const update: Record<string, unknown> = {};
    if (patch.text !== undefined) {
      update.body = patch.text || null;
      update.phrase =
        (patch.text && phraseFrom(patch.text)) || CAPTURE_PLACEHOLDER;
    }
    if (patch.note !== undefined) update.note = patch.note || null;
    if (patch.dismissed !== undefined) update.dismissed = patch.dismissed;
    if (Object.keys(update).length === 0) {
      throw new BadRequestException('Không có gì để cập nhật');
    }
    return one<CaptureRow>(
      await db
        .from('studio_signals')
        .update(update)
        .eq('id', id)
        .in('source_id', CAPTURE_SOURCES)
        .select(CAPTURE_COLUMNS),
      'Capture',
    );
  }

  /** Makes a trend out of a capture and links them; can generate drafts. */
  async createTrendFromCapture(
    db: Db,
    userId: string,
    id: number,
    input: {
      label: string;
      summary?: string;
      tags: string[];
      targetWords: string[];
      generate: boolean;
    },
  ): Promise<{
    trend: TrendRow;
    generated?: { created: number; rejectedAuto: number };
    generateError?: string;
  }> {
    const capture = one<CaptureRow>(
      await db
        .from('studio_signals')
        .select(CAPTURE_COLUMNS)
        .eq('id', id)
        .in('source_id', CAPTURE_SOURCES)
        .maybeSingle(),
      'Capture',
    );
    const created = await this.studio.createTrend(db, userId, {
      label: input.label,
      summary: input.summary,
      url: capture.url ?? undefined,
      tags: input.tags,
      targetWords: input.targetWords,
    });
    const linked = await db.from('studio_trend_signals').upsert(
      { trend_id: created.id, signal_id: capture.id },
      {
        onConflict: 'trend_id,signal_id',
        ignoreDuplicates: true,
      },
    );
    if (linked.error) throw new Error(linked.error.message);
    const trend = one<TrendRow>(
      await db
        .from('studio_trends')
        .update({
          source: capture.source_id,
          signal_count: 1,
          source_count: 1,
          first_seen_at: capture.seen_at,
          last_seen_at: new Date().toISOString(),
        })
        .eq('id', created.id)
        .select(),
      'Trend',
    );
    if (!input.generate) return { trend };
    try {
      const generated = await this.studio.generateForTrend(
        db,
        userId,
        trend.id,
      );
      return { trend, generated };
    } catch (err) {
      return {
        trend,
        generateError: err instanceof Error ? err.message : String(err),
      };
    }
  }

  // --------------------------------------------------------------- tokens

  async listTokens(db: Db): Promise<CaptureToken[]> {
    return rows<CaptureToken>(
      await db
        .from('studio_capture_tokens')
        .select('id, name, created_at, last_used_at, revoked_at')
        .order('created_at', { ascending: false }),
    );
  }

  /** The raw token is returned once; only its hash is stored. */
  async createToken(
    db: Db,
    userId: string,
    name: string,
  ): Promise<CaptureToken & { token: string }> {
    const token = newCaptureToken();
    const row = one<CaptureToken>(
      await db
        .from('studio_capture_tokens')
        .insert({ user_id: userId, name, token_hash: hashToken(token) })
        .select('id, name, created_at, last_used_at, revoked_at'),
      'Token',
    );
    return { ...row, token };
  }

  async revokeToken(db: Db, id: string): Promise<CaptureToken> {
    return one<CaptureToken>(
      await db
        .from('studio_capture_tokens')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', id)
        .is('revoked_at', null)
        .select('id, name, created_at, last_used_at, revoked_at'),
      'Token',
    );
  }
}
