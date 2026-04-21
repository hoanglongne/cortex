import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import type { ActionLog } from '@cortex/types';
import { RewardHelper } from '../shared/reward-helper.service';

@Controller('actions')
export class ActionsController {
  private readonly actionLogs: ActionLog[] = [];

  constructor(private rewardHelper: RewardHelper) {}

  @Post('log')
  createLog(@Body() logData: any): any {
    const newLog: ActionLog = {
      ...logData,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
    } as ActionLog;

    this.actionLogs.push(newLog);

    // Example logic: if it's a "completion" action, trigger a reward
    if (
      newLog.actionType.includes('COMPLETE') ||
      (newLog.metadata && newLog.metadata.isMastery)
    ) {
      this.rewardHelper.triggerMilestoneReward(
        newLog.userId,
        newLog.actionType,
        (newLog.metadata?.xpEarned as number) || 10,
      );
    }

    console.log(
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
