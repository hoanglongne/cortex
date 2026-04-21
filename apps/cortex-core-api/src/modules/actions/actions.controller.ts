import { Controller, Get, Post, Body, Param, Logger } from '@nestjs/common';
import type { ActionLog } from '@cortex/types';
import { RewardHelper } from '../shared/reward-helper.service';
import { SupabaseService } from '../supabase/supabase.service';
import { LinguisticRefinerService } from '../linguistics/linguistic-refiner.service';

interface LogMetadata {
  text?: string;
  transcript?: string;
  isMastery?: boolean;
  xpEarned?: number;
  [key: string]: any;
}

@Controller('actions')
export class ActionsController {
  private readonly logger = new Logger(ActionsController.name);
  private readonly actionLogs: ActionLog[] = [];

  constructor(
    private rewardHelper: RewardHelper,
    private supabaseService: SupabaseService,
    private linguisticRefiner: LinguisticRefinerService,
  ) {}

  @Post('log')
  async createLog(@Body() logData: any): Promise<any> {
    const newLog: ActionLog = {
      ...logData,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
    } as ActionLog;

    const metadata = (newLog.metadata || {}) as LogMetadata;

    // 1. Persist to Supabase
    try {
      await this.supabaseService.upsertData('action_logs', [
        {
          id: newLog.id,
          user_id: newLog.userId,
          app_source: newLog.appSource,
          action_type: newLog.actionType,
          metadata: newLog.metadata,
          timestamp: newLog.timestamp,
        },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to save log to Supabase: ${message}`);
    }

    // 2. Trigger rewards if applicable
    if (newLog.actionType.includes('COMPLETE') || metadata.isMastery) {
      this.rewardHelper.triggerMilestoneReward(
        newLog.userId,
        newLog.actionType,
        metadata.xpEarned || 10,
      );
    }

    // 3. Process linguistic data if text is present
    const rawText = metadata.text || metadata.transcript;
    if (rawText && typeof rawText === 'string') {
      this.logger.log(`Processing linguistic data for user ${newLog.userId}`);
      const insights = this.linguisticRefiner.extractInsights(rawText);
      const fluency = this.linguisticRefiner.analyzeFluency(rawText);

      // Update Linguistic Profile in Supabase
      try {
        await this.supabaseService.upsertData('linguistic_profiles', [
          {
            user_id: newLog.userId,
            last_updated: new Date(),
            vocabulary_size: insights.uniqueWords,
            fluency_score: fluency.score,
            top_topics: insights.topics,
            refined_insights: {
              ...insights,
              ...fluency,
              last_app_source: newLog.appSource,
            },
          },
        ]);
        this.logger.log(`Updated linguistic profile for user ${newLog.userId}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to update linguistic profile: ${message}`);
      }
    }

    this.logger.log(
      `[ActionLog] New activity from ${newLog.appSource}: ${newLog.actionType}`,
    );

    return newLog;
  }

  @Get()
  getAllLogs(): ActionLog[] {
    return this.actionLogs;
  }

  @Get('user/:userId')
  getUserLogs(@Param('userId') userId: string): ActionLog[] {
    return this.actionLogs.filter((log) => log.userId === userId);
  }
}
