import { Controller, Get, Param, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('insights')
export class LinguisticsController {
  private readonly logger = new Logger(LinguisticsController.name);

  constructor(private supabaseService: SupabaseService) {}

  @Get(':userId')
  async getUserInsights(@Param('userId') userId: string): Promise<any> {
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

  @Get()
  async getAllInsights(): Promise<any[]> {
    this.logger.log('Fetching all linguistic insights');
    try {
      const data = await this.supabaseService.getData('linguistic_profiles');
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to fetch all insights: ${message}`);
      return [];
    }
  }
}
