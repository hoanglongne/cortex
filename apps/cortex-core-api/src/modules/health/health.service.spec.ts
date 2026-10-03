import { HealthService } from './health.service';
import type { SupabaseService } from '../supabase/supabase.service';
import type { RedisService } from '../redis/redis.service';

function makeSupabase(error: { message: string } | null) {
  const query = {
    select: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue({ error }),
  };
  return {
    getClient: () => ({ from: jest.fn().mockReturnValue(query) }),
  } as unknown as SupabaseService;
}

function makeRedis(ping: () => Promise<string>) {
  return { getClient: () => ({ ping }) } as unknown as RedisService;
}

describe('HealthService', () => {
  it('reports ok when both dependencies respond', async () => {
    const service = new HealthService(
      makeSupabase(null),
      makeRedis(() => Promise.resolve('PONG')),
    );
    const report = await service.check();
    expect(report.status).toBe('ok');
    expect(report.dependencies.supabase.status).toBe('up');
    expect(report.dependencies.redis.status).toBe('up');
  });

  it('reports degraded with the error when a dependency fails', async () => {
    const service = new HealthService(
      makeSupabase({ message: 'relation does not exist' }),
      makeRedis(() => Promise.reject(new Error('ECONNREFUSED'))),
    );
    const report = await service.check();
    expect(report.status).toBe('degraded');
    expect(report.dependencies.supabase).toMatchObject({
      status: 'down',
      error: 'relation does not exist',
    });
    expect(report.dependencies.redis).toMatchObject({
      status: 'down',
      error: 'ECONNREFUSED',
    });
  });

  it('treats a missing Supabase client as down', async () => {
    const supabase = {
      getClient: () => undefined,
    } as unknown as SupabaseService;
    const service = new HealthService(
      supabase,
      makeRedis(() => Promise.resolve('PONG')),
    );
    const report = await service.check();
    expect(report.dependencies.supabase.status).toBe('down');
  });
});
