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
        const rawWords: string[] = [];

        if (metadata.words && Array.isArray(metadata.words)) {
          rawWords.push(...(metadata.words as string[]));
        } else if (metadata.text && typeof metadata.text === 'string') {
          // Fallback: extract words from text if words array is missing
          const insights = this.linguisticRefiner.extractInsights(
            metadata.text,
          );
          rawWords.push(...insights.uniqueWords);
        }

        if (rawWords.length > 0) {
          this.logger.log(
            `[CortexSync] User ${userId} sent ${rawWords.length} words from ${newLog.appSource}`,
          );

          // ID Mapping & Deduplication logic: ensure we save unique actual words, not IDs
          const learnedWordsSet = new Set<string>();
          const mappingDetails: any[] = [];

          rawWords.forEach((wordOrId: string) => {
            const mapped = this.linguisticRefiner.mapIdToWord(wordOrId);
            const lowerMapped = mapped.toLowerCase().trim();
            learnedWordsSet.add(lowerMapped);

            mappingDetails.push({
              original: wordOrId,
              mapped: mapped,
              isId: /^v\d{3}$/.test(wordOrId),
            });
          });

          const learnedWords = Array.from(learnedWordsSet);
          this.logger.log(
            `[CortexSync] Deduped ${rawWords.length} inputs to ${learnedWords.length} unique words. Full list: ${learnedWords.join(', ')}`,
          );

          if (rawWords.length !== learnedWords.length) {
            this.logger.warn(
              `[CortexSync] Potential data loss: ${rawWords.length} -> ${learnedWords.length}`,
            );
            // Log the first few mapping details for debugging
            this.logger.debug(
              `[CortexSync] Mapping samples: ${JSON.stringify(mappingDetails.slice(0, 10))}`,
            );
          }

          const vocabData = learnedWords.map((word: string) => ({
            user_id: userId,
            word,
          }));

          // If it's a bulk sync, we might want to ensure we're not just adding but reflecting the current state
          if (metadata.isBulkSync) {
            this.logger.log(`Performing bulk sync cleanup for user ${userId}`);
            // Optional: delete existing if we want a 1:1 match, but upsert with onConflict is usually enough
          }

          this.logger.log(
            `Upserting ${vocabData.length} words to user_vocabulary...`,
          );

          // FOR BULK SYNC: We want to ensure 1:1 parity, so we delete then insert
          if (metadata.isBulkSync) {
            this.logger.log(
              `[CortexSync] Bulk sync detected. Clearing old vocab for user ${userId}`,
            );
            await this.supabaseService
              .getClient()
              .from('user_vocabulary')
              .delete()
              .eq('user_id', userId);
          }

          await this.supabaseService.upsertData('user_vocabulary', vocabData);
          this.logger.log(`Finished upserting to user_vocabulary`);
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

    // 3. Process linguistic data (for speaking or learn events)
    try {
      const rawText = metadata.text || metadata.transcript;
      const actionType = newLog.actionType;
      const isLexicaLearn =
        newLog.appSource === 'lexica' && actionType === 'LEARN_VOCABULARY';

      if ((rawText && typeof rawText === 'string') || isLexicaLearn) {
        this.logger.log(`Processing linguistic metrics for user ${userId}...`);

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
          typeof metadata.fillerCount === 'number'
            ? metadata.fillerCount
            : undefined,
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
          this.logger.log(
            `Running bridgeVocab for user ${userId} (Source: ${newLog.appSource})`,
          );

          // Determine which words to use for bridge
          let usedWords: string[] = [];
          if (newLog.appSource !== 'lexica') {
            usedWords = insights.uniqueWords;
          } else {
            // For Lexica events, we use existing words from speaking sessions
            const currentInsights =
              (existingProfile.refined_insights as Record<string, any>) || {};
            usedWords = (currentInsights.uniqueWords as string[]) || [];
          }

          const bridgeResult: BridgeResult =
            await this.linguisticRefiner.bridgeVocab(userId, usedWords);

          this.logger.log(
            `Bridge result for ${userId}: ${bridgeResult.activeCount} active, ${bridgeResult.passiveCount} passive`,
          );

          if (bridgeResult && typeof bridgeResult.activationRate === 'number') {
            profileUpdate.active_vocab_count = bridgeResult.activeCount;
            profileUpdate.passive_vocab_count = bridgeResult.passiveCount;
            profileUpdate.vocabulary_size =
              bridgeResult.activeCount + bridgeResult.passiveCount;
            profileUpdate.passive_vocab_samples =
              bridgeResult.passiveVocabSamples || [];

            // Save active samples inside refined_insights instead of a top-level column to avoid DB errors
            profileUpdate.refined_insights = {
              ...(profileUpdate.refined_insights as Record<string, any>),
              active_vocab_samples: bridgeResult.activeVocabSamples || [],
            };

            if (
              newLog.appSource !== 'lexica' ||
              !existingProfile.difficulty_recommendation
            ) {
              const currentFluency: number =
                (profileUpdate.fluency_score as number) || fluency.score;
              const recommendation = this.linguisticRefiner.recommendDifficulty(
                {
                  fluencyScore: currentFluency,
                  activationRate: bridgeResult.activationRate,
                },
              );
              profileUpdate.difficulty_recommendation = recommendation;
            }
          }

          this.logger.log(
            `Final profile update for ${userId}: ${profileUpdate.active_vocab_count} active, ${profileUpdate.passive_vocab_count} passive, ${profileUpdate.vocabulary_size} total`,
          );

          await this.supabaseService.upsertData('linguistic_profiles', [
            profileUpdate,
          ]);
          this.logger.log(
            `Successfully saved profile for user ${userId}. Vocab size: ${profileUpdate.vocabulary_size}`,
          );
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          this.logger.error(`Failed to update linguistic profile: ${message}`);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process linguistic metrics: ${message}`);
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

  @Post('cleanup-ghost-data/:userId')
  async cleanupGhostData(@Param('userId') userId: string) {
    this.logger.log(`Performing TOTAL VOCAB RESET for user ${userId}`);

    try {
      // 1. Remove ALL vocabulary entries for this user to start fresh
      const { error: vocabError } = await this.supabaseService
        .getClient()
        .from('user_vocabulary')
        .delete()
        .eq('user_id', userId);

      if (vocabError) throw vocabError;

      // 2. Reset the linguistic profile completely
      await this.supabaseService.upsertData('linguistic_profiles', [
        {
          user_id: userId,
          active_vocab_count: 0,
          passive_vocab_count: 0,
          vocabulary_size: 0,
          top_topics: [],
          passive_vocab_samples: [],
          last_updated: new Date(),
          refined_insights: {},
        },
      ]);

      return {
        success: true,
        message: `System reset successful. All old data cleared for user ${userId}.`,
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Reset failed: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  }
}
