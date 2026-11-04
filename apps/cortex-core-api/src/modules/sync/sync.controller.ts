import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CurrentUserId, assertSameUser } from '../auth/current-user';
import type { AuthedRequest } from '../auth/supabase-auth.guard';
import { BackupRecord, SyncService } from './sync.service';

@Controller('v1/sync')
@UseGuards(SupabaseAuthGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  /** Store an app's raw state snapshot (one row per user + app, last write wins). */
  @Post('backup')
  saveBackup(
    @CurrentUserId() callerId: string,
    @Body() body: unknown,
    @Req() req: AuthedRequest,
  ): Promise<BackupRecord> {
    assertSameUser(callerId, (body as { userId?: unknown } | null)?.userId);
    return this.syncService.saveBackup(body, req.accessToken);
  }

  @Get('backup/:userId/:appSource')
  async getBackup(
    @CurrentUserId() callerId: string,
    @Param('userId') userId: string,
    @Param('appSource') appSource: string,
    @Req() req: AuthedRequest,
  ): Promise<BackupRecord> {
    assertSameUser(callerId, userId);
    const backup = await this.syncService.getBackup(
      userId,
      appSource,
      req.accessToken,
    );
    if (!backup) throw new NotFoundException('No backup found');
    return backup;
  }
}
