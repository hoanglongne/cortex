import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';
import { PushService } from './push.service';
import {
  asksPayload,
  datePayload,
  giftsPayload,
  groupBy,
  isQuietHour,
} from './push-rules';

/** How far ahead of the start a study date is announced. */
const DATE_AHEAD_MS = 12 * 60_000;
/** A gift or question older than this is no longer announced. */
const KEEP_MS = 12 * 3_600_000;

/**
 * Every minute: a study date about to start, gifts and questions waiting.
 * Off unless LEXICA_PUSH_CRON=on, the service-role key and the VAPID keys are
 * set. Each row is marked as sent first, so a restart never sends twice.
 */
@Injectable()
export class PushScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PushScheduler.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    private readonly config: ConfigService,
    private readonly supabase: SupabaseService,
    private readonly push: PushService,
  ) {}

  onModuleInit() {
    if (this.config.get<string>('LEXICA_PUSH_CRON') !== 'on') return;
    if (!this.supabase.serviceClient() || !this.push.enabled()) {
      this.logger.warn(
        'LEXICA_PUSH_CRON=on but the service-role key or the VAPID keys are missing; push disabled',
      );
      return;
    }
    this.logger.log('Push scheduler enabled');
    this.timer = setInterval(() => void this.tick(), 60_000);
    void this.tick();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async tick(now = Date.now()) {
    if (this.running) return;
    const db = this.supabase.serviceClient();
    if (!db) return;
    this.running = true;
    try {
      await this.dates(db, now);
      if (!isQuietHour(now)) {
        await this.gifts(db, now);
        await this.asks(db, now);
      }
    } catch (e) {
      this.logger.error(`Push tick failed: ${String(e)}`);
    } finally {
      this.running = false;
    }
  }

  private async names(
    db: SupabaseClient<any, any, any>,
    ids: string[],
  ): Promise<Map<string, string | null>> {
    if (ids.length === 0) return new Map();
    const { data } = await db
      .from('profiles')
      .select('id, nickname')
      .in('id', ids);
    return new Map(
      ((data ?? []) as { id: string; nickname: string | null }[]).map((p) => [
        p.id,
        p.nickname,
      ]),
    );
  }

  /** Study dates starting within 12 minutes (or begun in the last 5) that nobody was told about. */
  private async dates(db: SupabaseClient<any, any, any>, now: number) {
    const { data } = await db
      .from('lexica_study_dates')
      .select('id, creator, buddy, at, kind')
      .eq('canceled', false)
      .is('notified_at', null)
      .lte('at', new Date(now + DATE_AHEAD_MS).toISOString())
      .gte('at', new Date(now - 5 * 60_000).toISOString());
    for (const d of (data ?? []) as {
      id: string;
      creator: string;
      kind: string;
      buddy: string;
      at: string;
    }[]) {
      // Mark first: only the run that wins the update sends
      const { data: won } = await db
        .from('lexica_study_dates')
        .update({ notified_at: new Date(now).toISOString() })
        .eq('id', d.id)
        .is('notified_at', null)
        .select('id');
      if (!won?.length) continue;
      const names = await this.names(db, [d.creator, d.buddy]);
      await this.push.sendTo(
        db,
        d.creator,
        datePayload(d.id, names.get(d.buddy) ?? null, d.at, d.kind),
      );
      await this.push.sendTo(
        db,
        d.buddy,
        datePayload(d.id, names.get(d.creator) ?? null, d.at, d.kind),
      );
    }
  }

  private async gifts(db: SupabaseClient<any, any, any>, now: number) {
    const { data } = await db
      .from('lexica_gifts')
      .select('id, from_user, to_user')
      .is('pushed_at', null)
      .is('opened_at', null)
      .gte('created_at', new Date(now - KEEP_MS).toISOString());
    const rows = (data ?? []) as {
      id: string;
      from_user: string;
      to_user: string;
    }[];
    for (const [to, mine] of groupBy(rows, (r) => r.to_user)) {
      const { data: won } = await db
        .from('lexica_gifts')
        .update({ pushed_at: new Date(now).toISOString() })
        .in(
          'id',
          mine.map((m) => m.id),
        )
        .is('pushed_at', null)
        .select('id, from_user');
      if (!won?.length) continue;
      const names = await this.names(db, [
        ...new Set((won as { from_user: string }[]).map((w) => w.from_user)),
      ]);
      await this.push.sendTo(
        db,
        to,
        giftsPayload(
          (won as { from_user: string }[]).map(
            (w) => names.get(w.from_user) ?? null,
          ),
        ),
      );
    }
  }

  private async asks(db: SupabaseClient<any, any, any>, now: number) {
    const { data } = await db
      .from('lexica_asks')
      .select('id, asker, helper')
      .is('pushed_at', null)
      .is('answered_at', null)
      .gte('created_at', new Date(now - KEEP_MS).toISOString());
    const rows = (data ?? []) as {
      id: string;
      asker: string;
      helper: string;
    }[];
    for (const [to, mine] of groupBy(rows, (r) => r.helper)) {
      const { data: won } = await db
        .from('lexica_asks')
        .update({ pushed_at: new Date(now).toISOString() })
        .in(
          'id',
          mine.map((m) => m.id),
        )
        .is('pushed_at', null)
        .select('id, asker');
      if (!won?.length) continue;
      const names = await this.names(db, [
        ...new Set((won as { asker: string }[]).map((w) => w.asker)),
      ]);
      await this.push.sendTo(
        db,
        to,
        asksPayload(
          (won as { asker: string }[]).map((w) => names.get(w.asker) ?? null),
        ),
      );
    }
  }
}
