import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Ip,
  Post,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;
const MAX_EVENTS = 100;
const KINDS = new Set([
  'impression',
  'reveal',
  'known',
  'unknown',
  'share',
  'report',
  'review_correct',
  'review_wrong',
]);

export interface CardEvent {
  cardId: string;
  kind: string;
  dwellMs?: number;
}

/** Keeps only well-formed events for Studio cards (ids start with "t"). */
export function sanitizeEvents(body: unknown): CardEvent[] {
  const list = (body as { events?: unknown } | null)?.events;
  if (!Array.isArray(list)) throw new BadRequestException('events[] required');
  return list
    .slice(0, MAX_EVENTS)
    .filter(
      (e): e is CardEvent =>
        typeof e === 'object' &&
        e !== null &&
        typeof (e as CardEvent).cardId === 'string' &&
        /^t[0-9a-z]{1,15}$/.test((e as CardEvent).cardId) &&
        KINDS.has((e as CardEvent).kind),
    )
    .map((e) => ({
      cardId: e.cardId,
      kind: e.kind,
      ...(typeof e.dwellMs === 'number' && Number.isFinite(e.dwellMs)
        ? { dwellMs: Math.round(e.dwellMs) }
        : {}),
    }));
}

/**
 * Public, anonymous feedback from Lexica (spec §5.8). Aggregated counters
 * only; no user ids are sent or stored.
 */
@Controller('content')
export class ContentController {
  private readonly hits = new Map<string, { start: number; count: number }>();

  constructor(private readonly supabase: SupabaseService) {}

  private limit(ip: string) {
    const now = Date.now();
    const entry = this.hits.get(ip);
    if (!entry || now - entry.start > WINDOW_MS) {
      if (this.hits.size > 10_000) this.hits.clear();
      this.hits.set(ip, { start: now, count: 1 });
      return;
    }
    entry.count++;
    if (entry.count > MAX_REQUESTS_PER_WINDOW) {
      throw new HttpException(
        'Too many requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  @Post('events')
  @HttpCode(202)
  async events(@Ip() ip: string, @Body() body: unknown) {
    this.limit(ip);
    const events = sanitizeEvents(body);
    if (events.length === 0) return { accepted: 0 };
    const client = this.supabase.getClient();
    if (!client) return { accepted: 0 };
    const res = await client.rpc('studio_record_events', { events });
    if (res.error) throw new Error(res.error.message);
    const accepted: unknown = res.data;
    return { accepted: typeof accepted === 'number' ? accepted : 0 };
  }
}
