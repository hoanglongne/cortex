import { BadRequestException } from '@nestjs/common';
import { MAX_BACKUP_BYTES, SyncService } from './sync.service';
import type { SupabaseService } from '../supabase/supabase.service';

const USER = '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b';

function makeSupabase(result: { data?: unknown; error: unknown }) {
  const query = {
    upsert: jest.fn().mockResolvedValue({ error: result.error }),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue(result),
  };
  const from = jest.fn().mockReturnValue(query);
  const supabase = {
    getClient: () => ({ from }),
  } as unknown as SupabaseService;
  return { supabase, from, query };
}

describe('SyncService', () => {
  it('upserts one row per user + app', async () => {
    const { supabase, from, query } = makeSupabase({ error: null });
    const service = new SyncService(supabase);

    const saved = await service.saveBackup({
      userId: USER,
      appSource: 'lexica',
      data: { cards: [1, 2] },
    });

    expect(from).toHaveBeenCalledWith('app_backups');
    expect(query.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: USER,
        app_source: 'lexica',
        raw_data: { cards: [1, 2] },
      }),
      { onConflict: 'user_id,app_source' },
    );
    expect(saved).toMatchObject({ userId: USER, appSource: 'lexica' });
  });

  it.each([
    [{ appSource: 'lexica', data: {} }, 'userId'],
    [{ userId: 'not-a-uuid', appSource: 'lexica', data: {} }, 'userId'],
    [{ userId: USER, appSource: 'myspace', data: {} }, 'appSource'],
    [{ userId: USER, appSource: 'lexica' }, 'data'],
  ])('rejects invalid body %#', async (body, field) => {
    const service = new SyncService(makeSupabase({ error: null }).supabase);
    await expect(service.saveBackup(body)).rejects.toThrow(field);
  });

  it('rejects backups over the size limit', async () => {
    const service = new SyncService(makeSupabase({ error: null }).supabase);
    const data = 'x'.repeat(MAX_BACKUP_BYTES + 1);
    await expect(
      service.saveBackup({ userId: USER, appSource: 'lexica', data }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('propagates Supabase errors on save', async () => {
    const service = new SyncService(
      makeSupabase({ error: new Error('db down') }).supabase,
    );
    await expect(
      service.saveBackup({ userId: USER, appSource: 'oratio', data: {} }),
    ).rejects.toThrow('db down');
  });

  it('returns the stored backup', async () => {
    const service = new SyncService(
      makeSupabase({
        data: { raw_data: { a: 1 }, updated_at: '2026-01-01T00:00:00Z' },
        error: null,
      }).supabase,
    );
    await expect(service.getBackup(USER, 'lexica')).resolves.toEqual({
      userId: USER,
      appSource: 'lexica',
      data: { a: 1 },
      updatedAt: '2026-01-01T00:00:00Z',
    });
  });

  it('returns null when there is no backup', async () => {
    const service = new SyncService(
      makeSupabase({ data: null, error: null }).supabase,
    );
    await expect(service.getBackup(USER, 'lexica')).resolves.toBeNull();
  });
});
