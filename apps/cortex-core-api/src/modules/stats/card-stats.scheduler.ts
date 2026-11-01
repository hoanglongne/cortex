import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';

const VN_OFFSET_MS = 7 * 3_600_000;

/** The Vietnam date and hour of a moment. */
export function vnDay(now: number): { day: string; hour: number } {
  const d = new Date(now + VN_OFFSET_MS);
  return { day: d.toISOString().slice(0, 10), hour: d.getUTCHours() };
}

/**
 * Once a night (from 03:00 Vietnam time) puts the card numbers together
 * (cortex_card_stats_refresh, supabase/migration_card_stats.sql). Off unless
 * CARD_STATS_CRON=on and the service-role key is set. The refresh is safe to
 * run twice, so a restart in the same night does no harm.
 */
@Injectable()
export class CardStatsScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CardStatsScheduler.name);
  private timer: NodeJS.Timeout | null = null;
  private lastDay = '';

  constructor(
    private readonly config: ConfigService,
    private readonly supabase: SupabaseService,
  ) {}

  onModuleInit() {
    if (this.config.get<string>('CARD_STATS_CRON') !== 'on') return;
    if (!this.supabase.serviceClient()) {
      this.logger.warn(
        'CARD_STATS_CRON=on but SUPABASE_SERVICE_ROLE_KEY is missing; disabled',
      );
      return;
    }
    this.logger.log('Card stats scheduler enabled');
    this.timer = setInterval(() => void this.tick(), 15 * 60_000);
    void this.tick();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async tick(now = Date.now()) {
    const { day, hour } = vnDay(now);
    if (hour < 3 || this.lastDay === day) return;
    const db = this.supabase.serviceClient();
    if (!db) return;
    const res: { data: unknown; error: { message: string } | null } =
      await db.rpc('cortex_card_stats_refresh');
    const { data, error } = res;
    if (error) {
      this.logger.error(`Card stats refresh failed: ${error.message}`);
      return;
    }
    this.lastDay = day;
    this.logger.log(`Card stats refreshed: ${String(data)} cards`);
  }
}
