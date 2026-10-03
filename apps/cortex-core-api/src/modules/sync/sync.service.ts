import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import type { AppSource } from '@cortex/types';
import { SupabaseService } from '../supabase/supabase.service';

export const SYNC_APP_SOURCES = [
  'lexica',
  'solilo',
  'dialecta',
  'oratio',
  'synapse',
] as const satisfies readonly AppSource[];

export type SyncAppSource = (typeof SYNC_APP_SOURCES)[number];

/** Upper bound for one app's serialized backup. */
export const MAX_BACKUP_BYTES = 512 * 1024;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type BackupRecord = {
  userId: string;
  appSource: SyncAppSource;
  data: unknown;
  updatedAt: string;
};

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async saveBackup(body: unknown): Promise<BackupRecord> {
    const { userId, appSource, data } = this.validateBackupBody(body);
    const updatedAt = new Date().toISOString();

    const { error } = await this.client().from('app_backups').upsert(
      {
        user_id: userId,
        app_source: appSource,
        raw_data: data,
        updated_at: updatedAt,
      },
      { onConflict: 'user_id,app_source' },
    );
    if (error) {
      this.logger.error(`Backup upsert failed: ${error.message}`);
      throw error;
    }

    this.logger.log(`[Sync] Saved ${appSource} backup for ${userId}`);
    return { userId, appSource, data, updatedAt };
  }

  async getBackup(
    userId: string,
    appSource: string,
  ): Promise<BackupRecord | null> {
    this.assertUserId(userId);
    this.assertAppSource(appSource);

    const { data, error } = await this.client()
      .from('app_backups')
      .select('raw_data, updated_at')
      .eq('user_id', userId)
      .eq('app_source', appSource)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    const row = data as { raw_data: unknown; updated_at: string };
    return {
      userId,
      appSource,
      data: row.raw_data,
      updatedAt: row.updated_at,
    };
  }

  private validateBackupBody(body: unknown): {
    userId: string;
    appSource: SyncAppSource;
    data: unknown;
  } {
    if (!body || typeof body !== 'object') {
      throw new BadRequestException('Body must be a JSON object');
    }
    const { userId, appSource, data } = body as Record<string, unknown>;
    this.assertUserId(userId);
    this.assertAppSource(appSource);
    if (data === undefined || data === null) {
      throw new BadRequestException('`data` is required');
    }
    const size = Buffer.byteLength(JSON.stringify(data), 'utf8');
    if (size > MAX_BACKUP_BYTES) {
      throw new BadRequestException(
        `Backup is ${size} bytes; limit is ${MAX_BACKUP_BYTES}`,
      );
    }
    return { userId, appSource, data };
  }

  private assertUserId(userId: unknown): asserts userId is string {
    if (typeof userId !== 'string' || !UUID_RE.test(userId)) {
      throw new BadRequestException('`userId` must be a UUID');
    }
  }

  private assertAppSource(
    appSource: unknown,
  ): asserts appSource is SyncAppSource {
    if (!SYNC_APP_SOURCES.includes(appSource as SyncAppSource)) {
      throw new BadRequestException(
        `\`appSource\` must be one of: ${SYNC_APP_SOURCES.join(', ')}`,
      );
    }
  }

  private client() {
    const client = this.supabaseService.getClient();
    if (!client) throw new Error('Supabase client not initialized');
    return client;
  }
}
