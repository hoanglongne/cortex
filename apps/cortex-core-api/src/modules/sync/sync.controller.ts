import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { BackupRecord, SyncService } from './sync.service';

@Controller('v1/sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  /** Store an app's raw state snapshot (one row per user + app, last write wins). */
  @Post('backup')
  saveBackup(@Body() body: unknown): Promise<BackupRecord> {
    return this.syncService.saveBackup(body);
  }

  @Get('backup/:userId/:appSource')
  async getBackup(
    @Param('userId') userId: string,
    @Param('appSource') appSource: string,
  ): Promise<BackupRecord> {
    const backup = await this.syncService.getBackup(userId, appSource);
    if (!backup) throw new NotFoundException('No backup found');
    return backup;
  }
}
