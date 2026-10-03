import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { RedisService } from '../redis/redis.service';

export type DependencyStatus = {
  status: 'up' | 'down';
  latencyMs?: number;
  error?: string;
};

export type HealthReport = {
  status: 'ok' | 'degraded';
  uptimeSeconds: number;
  timestamp: string;
  dependencies: {
    supabase: DependencyStatus;
    redis: DependencyStatus;
  };
};

const CHECK_TIMEOUT_MS = 3000;

@Injectable()
export class HealthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
  ) {}

  async check(): Promise<HealthReport> {
    const [supabase, redis] = await Promise.all([
      this.probe(() => this.pingSupabase()),
      this.probe(() => this.pingRedis()),
    ]);

    return {
      status:
        supabase.status === 'up' && redis.status === 'up' ? 'ok' : 'degraded',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      dependencies: { supabase, redis },
    };
  }

  private async pingSupabase(): Promise<void> {
    const client = this.supabaseService.getClient();
    if (!client) throw new Error('Supabase client not initialized');
    const { error } = await client
      .from('action_logs')
      .select('id', { head: true, count: 'exact' })
      .limit(1);
    if (error) throw new Error(error.message);
  }

  private async pingRedis(): Promise<void> {
    const result = await this.redisService.getClient().ping();
    if (result !== 'PONG')
      throw new Error(`Unexpected ping reply: ${String(result)}`);
  }

  private async probe(fn: () => Promise<void>): Promise<DependencyStatus> {
    const start = Date.now();
    let timer: NodeJS.Timeout | undefined;
    try {
      await Promise.race([
        fn(),
        new Promise<never>((_, reject) => {
          timer = setTimeout(
            () => reject(new Error(`Timed out after ${CHECK_TIMEOUT_MS}ms`)),
            CHECK_TIMEOUT_MS,
          );
        }),
      ]);
      return { status: 'up', latencyMs: Date.now() - start };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { status: 'down', latencyMs: Date.now() - start, error: message };
    } finally {
      clearTimeout(timer);
    }
  }
}
