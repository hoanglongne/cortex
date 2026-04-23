import { Controller, Get, Post, Body, Param, Logger } from '@nestjs/common';
import type { ActionLog } from '@cortex/types';
import { RewardHelper } from '../shared/reward-helper.service';
import { SupabaseService } from '../supabase/supabase.service';
import {
  LinguisticRefinerService,
  BridgeResult,
} from '../linguistics/linguistic-refiner.service';

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
  async createLog(@Body() logData: Record<string, any>): Promise<any> {
    const isUuid = (id: string): boolean =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      );

    const rawUserId = (logData.userId as string) || 'test_user_cortex';
    const userId: string = isUuid(rawUserId)
      ? rawUserId
      : '00000000-0000-0000-0000-000000000000';

    const newLog: ActionLog = {
      ...logData,
      userId,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
    } as ActionLog;

    const metadata = (newLog.metadata || {}) as LogMetadata;

    // 1. Persist to Supabase
    try {
      await this.supabaseService.upsertData('action_logs', [
        {
          user_id: userId,
          app_source: newLog.appSource,
          action_type: newLog.actionType,
          metadata: newLog.metadata,
          timestamp: newLog.timestamp,
        },
      ]);

      // NEW: If this is a Lexica log, save learned words to user_vocabulary
      if (newLog.appSource === 'lexica') {
        const learnedWords: string[] = [];

        if (metadata.words && Array.isArray(metadata.words)) {
          learnedWords.push(...(metadata.words as string[]));
        } else if (metadata.text && typeof metadata.text === 'string') {
          // Fallback: extract words from text if words array is missing
          const insights = this.linguisticRefiner.extractInsights(
            metadata.text,
          );
          learnedWords.push(...insights.uniqueWords);
        }

        if (learnedWords.length > 0) {
          this.logger.log(
            `Saving ${learnedWords.length} learned words for user ${userId}`,
          );
          const vocabData = learnedWords.map((word: string) => ({
            user_id: userId,
            word: word.toLowerCase().trim(),
          }));
          await this.supabaseService.upsertData('user_vocabulary', vocabData);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to save log to Supabase: ${message}`);
    }

    // 2. Trigger rewards if applicable
    if (newLog.actionType.includes('COMPLETE') || metadata.isMastery) {
      this.rewardHelper.triggerMilestoneReward(
        userId,
        newLog.actionType,
        metadata.xpEarned || 10,
      );
    }

    // 3. Process linguistic data if text is present OR if it's a Lexica learn event
    const rawText = metadata.text || metadata.transcript;
    const actionType = newLog.actionType;
    const isLexicaLearn =
      newLog.appSource === 'lexica' && actionType === 'LEARN_VOCABULARY';

    if ((rawText && typeof rawText === 'string') || isLexicaLearn) {
      this.logger.log(`Processing linguistic data for user ${userId}`);

      // If no text but it's a Lexica learn, we use the first word or fallback
      let processingText = 'New vocabulary learned';
      if (rawText && typeof rawText === 'string') {
        processingText = rawText;
      } else if (
        metadata.words &&
        Array.isArray(metadata.words) &&
        metadata.words.length > 0
      ) {
        processingText = String(metadata.words[0]);
      }

      const insights = this.linguisticRefiner.extractInsights(
        typeof processingText === 'string' ? processingText : 'New word',
      );
      const fluency = this.linguisticRefiner.analyzeFluency(
        typeof processingText === 'string' ? processingText : '',
      );

      this.logger.log(
        `Calculated score: ${fluency.score}, unique words: ${insights.uniqueWords.length}`,
      );

      // Update Linguistic Profile in Supabase
      try {
        // Fetch existing profile first to avoid overwriting bridge data
        const existingProfiles = await this.supabaseService.getData(
          'linguistic_profiles',
          { userId },
        );
        const existingProfile =
          existingProfiles.length > 0
            ? (existingProfiles[0] as Record<string, any>)
            : {};

        // 3a. Prepare base profile update
        const profileUpdate: Record<string, any> = {
          ...existingProfile,
          user_id: userId,
          last_updated: new Date(),
        };

        // 3b. Update vocabulary_size and fluency only for speaking apps
        // For Lexica, we DON'T update these as it would overwrite the speaking session stats
        if (newLog.appSource !== 'lexica') {
          profileUpdate.vocabulary_size = insights.uniqueWords.length;
          profileUpdate.fluency_score = fluency.score;
          profileUpdate.top_topics = insights.topics;
          profileUpdate.refined_insights = {
            ...insights,
            ...fluency,
            last_app_source: newLog.appSource,
          };
        } else {
          // If Lexica, we still update refined_insights but only the last_app_source
          const currentInsights =
            (existingProfile.refined_insights as Record<string, any>) || {};
          profileUpdate.refined_insights = {
            ...currentInsights,
            last_app_source: newLog.appSource,
          };
        }

        // 4. Active Vocab Bridge
        this.logger.log(`Running bridgeVocab for ${newLog.appSource}`);
        const bridgeResult: BridgeResult =
          await this.linguisticRefiner.bridgeVocab(
            userId,
            newLog.appSource !== 'lexica'
              ? insights.uniqueWords
              : (existingProfile.refined_insights as Record<string, any>)
                  ?.uniqueWords || [],
          );

        this.logger.log(`Bridge result: ${JSON.stringify(bridgeResult)}`);

        if (bridgeResult && typeof bridgeResult.activationRate === 'number') {
          profileUpdate.active_vocab_count = bridgeResult.activeCount;
          profileUpdate.passive_vocab_count = bridgeResult.passiveCount;
          profileUpdate.passive_vocab_samples =
            bridgeResult.passiveVocabSamples || [];

          if (
            newLog.appSource !== 'lexica' ||
            !existingProfile.difficulty_recommendation
          ) {
            const currentFluency: number =
              (profileUpdate.fluency_score as number) || fluency.score;
            const recommendation = this.linguisticRefiner.recommendDifficulty({
              fluencyScore: currentFluency,
              activationRate: bridgeResult.activationRate,
            });
            profileUpdate.difficulty_recommendation = recommendation;
          }
        }

        await this.supabaseService.upsertData('linguistic_profiles', [
          profileUpdate,
        ]);
        this.logger.log(
          `Updated linguistic profile for user ${userId} with full metrics`,
        );
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

  @Get('vocab/:userId')
  async getUserVocab(@Param('userId') userId: string): Promise<any[]> {
    return this.supabaseService.getData('user_vocabulary', { userId });
  }
}
