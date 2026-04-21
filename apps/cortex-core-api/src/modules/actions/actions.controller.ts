import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ActionLog } from '@cortex/types';

@Controller('actions')
export class ActionsController {
  private readonly actionLogs: ActionLog[] = [];

  @Post('log')
  createLog(@Body() logData: Omit<ActionLog, 'id' | 'timestamp'>): ActionLog {
    const newLog: ActionLog = {
      ...logData,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
    };
    
    this.actionLogs.push(newLog);
    console.log(`[ActionLog] New activity from ${newLog.appSource}: ${newLog.actionType}`);
    
    return newLog;
  }

  @Get()
  getAllLogs(): ActionLog[] {
    return this.actionLogs;
  }

  @Get('user/:userId')
  getUserLogs(@Param('userId') userId: string): ActionLog[] {
    return this.actionLogs.filter(log => log.userId === userId);
  }
}
