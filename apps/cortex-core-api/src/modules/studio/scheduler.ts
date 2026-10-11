import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { PipelineService, type JobName } from './pipeline.service';

/** Vietnam time (UTC+7) hour at which each job runs (spec §5). */
export const SCHEDULE: { job: JobName; hours: number[] }[] = [
  { job: 'collect', hours: [6, 12, 18, 23] },
  { job: 'cluster', hours: [6, 12, 18, 23] },
  { job: 'score', hours: [6, 12, 18, 23] },
  { job: 'generate', hours: [1] },
  { job: 'lifecycle', hours: [3] },
];

const VN_OFFSET_MS = 7 * 3_600_000;

/** Start of the current slot for `hours` in VN time, or null if none today yet. */
export function currentSlot(now: number, hours: number[]): number | null {
  const vn = new Date(now + VN_OFFSET_MS);
  const hour = vn.getUTCHours();
  const due = hours.filter((h) => h <= hour).sort((a, b) => b - a)[0];
  if (due === undefined) return null;
  const start = Date.UTC(
    vn.getUTCFullYear(),
    vn.getUTCMonth(),
    vn.getUTCDate(),
    due,
  );
  return start - VN_OFFSET_MS;
}

/**
 * Runs the Studio pipeline on a timer. Off unless STUDIO_CRON=on and
 * SUPABASE_SERVICE_ROLE_KEY is set (jobs have no editor session). Every
 * step can also be run by hand from Studio → Hệ thống.
 */
@Injectable()
export class StudioScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(StudioScheduler.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    private readonly config: ConfigService,
    private readonly supabase: SupabaseService,
    private readonly pipeline: PipelineService,
  ) {}

  onModuleInit() {
    if (this.config.get<string>('STUDIO_CRON') !== 'on') return;
    if (!this.supabase.serviceClient()) {
      this.logger.warn(
        'STUDIO_CRON=on but SUPABASE_SERVICE_ROLE_KEY is missing; scheduler disabled',
      );
      return;
    }
    this.logger.log('Studio scheduler enabled');
    this.timer = setInterval(() => void this.tick(), 10 * 60_000);
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
      for (const { job, hours } of SCHEDULE) {
        const slot = currentSlot(now, hours);
        if (slot === null) continue;
        const { count } = await db
          .from('studio_job_runs')
          .select('id', { count: 'exact', head: true })
          .eq('job', job)
          .is('created_by', null)
          .gte('started_at', new Date(slot).toISOString());
        if ((count ?? 0) > 0) continue;
        if (job === 'generate') {
          // generate logs per trend; mark the slot so it runs once
          await db.from('studio_job_runs').insert({
            job,
            ok: true,
            finished_at: new Date().toISOString(),
            stats: { scheduled: true },
          });
        }
        try {
          await this.pipeline.run(db, job, null);
        } catch (err) {
          this.logger.error(`Scheduled ${job} failed: ${String(err)}`);
        }
      }
    } finally {
      this.running = false;
    }
  }
}
