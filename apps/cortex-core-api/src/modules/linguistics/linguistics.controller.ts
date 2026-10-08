import { Controller, Get, Param, Logger, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CurrentUserId, assertSameUser } from '../auth/current-user';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('insights')
@UseGuards(SupabaseAuthGuard)
export class LinguisticsController {
  private readonly logger = new Logger(LinguisticsController.name);

  constructor(private supabaseService: SupabaseService) {}

  @Get(':userId')
  async getUserInsights(
    @CurrentUserId() callerId: string,
    @Param('userId') userId: string,
  ): Promise<any> {
    assertSameUser(callerId, userId);
    this.logger.log(`Fetching insights for user ${userId}`);

    try {
      const data = await this.supabaseService.getData('linguistic_profiles', {
        userId,
      });

      return data[0] || { message: 'No profile found for this user' };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to fetch insights: ${message}`);
      return { error: 'Failed to fetch insights' };
    }
  }
}
