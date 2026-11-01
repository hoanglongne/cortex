import {
  Controller,
  Get,
  Param,
  Header,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { SynapseService } from './synapse.service';
import { ActionLog, SynapseScenario, StoryArc } from '@cortex/types';
import { authoredMissions, buildStaticArc } from './static-arc';
import { WORLD_BIBLES } from './world-bibles';

@Controller('synapse')
export class SynapseController {
  private readonly logger = new Logger(SynapseController.name);

  constructor(private readonly synapseService: SynapseService) {}

  @Post('scenario')
  async generateScenario(
    @Body()
    body: {
      sessionId: string;
      stage: number;
      loreId?: string;
      missionId?: string;
      sessionHistory?: ActionLog[];
    },
  ): Promise<SynapseScenario> {
    if (!body.sessionId || !body.stage) {
      throw new HttpException(
        'Missing sessionId or stage',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const scenario = await this.synapseService.generateScenario(
        body.sessionId,
        body.stage,
        body.sessionHistory,
        body.loreId,
        body.missionId,
      );
      return scenario;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error generating scenario: ${errorMessage}`);
      throw new HttpException(
        'Failed to generate scenario',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('story-arc')
  async generateStoryArc(
    @Body()
    body: {
      loreId?: string;
      missionId?: string;
      mode?: string;
    },
  ): Promise<StoryArc> {
    try {
      return await this.synapseService.generateStoryArc(
        body.loreId || 'cyberpunk-01',
        body.missionId,
        body.mode === 'ai' ? 'ai' : undefined,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error generating story arc: ${errorMessage}`);
      throw new HttpException(
        'Failed to generate story arc',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /** Missions that play with no AI (authored scenes). */
  @Get('missions')
  @Header('Cache-Control', 'public, max-age=3600')
  listMissions() {
    return authoredMissions();
  }

  /** One authored mission, for the classroom projector (Teach): the same scenes, no AI. */
  @Get('arc/:loreId/:missionId')
  @Header('Cache-Control', 'public, max-age=300')
  // eslint-disable-next-line @typescript-eslint/require-await
  async arc(
    @Param('loreId') loreId: string,
    @Param('missionId') missionId: string,
  ): Promise<StoryArc> {
    const lore = WORLD_BIBLES[loreId];
    const arc = lore ? buildStaticArc(lore, missionId) : null;
    if (!arc)
      throw new HttpException('No such authored mission', HttpStatus.NOT_FOUND);
    return arc;
  }

  /** "Ôn bằng truyện": up to three scenes for the phrases the player keeps missing. */
  @Post('review')
  // eslint-disable-next-line @typescript-eslint/require-await
  async review(
    @Body() body: { phrases?: string[]; seen?: string[] },
  ): Promise<StoryArc> {
    const phrases = Array.isArray(body.phrases)
      ? body.phrases.filter((p) => typeof p === 'string').slice(0, 12)
      : [];
    const seen = Array.isArray(body.seen)
      ? body.seen.filter((p) => typeof p === 'string').slice(0, 200)
      : [];
    const arc = this.synapseService.reviewArc(phrases, seen);
    if (!arc)
      throw new HttpException(
        'No scenes for these phrases',
        HttpStatus.NOT_FOUND,
      );
    return arc;
  }

  /** "Báo cảnh có vấn đề". */
  @Post('report')
  async report(
    @Body() body: { missionId?: string; stage?: number; note?: string },
  ): Promise<{ ok: boolean }> {
    if (!body.missionId)
      throw new HttpException('Missing missionId', HttpStatus.BAD_REQUEST);
    await this.synapseService.reportScene(
      body.missionId,
      Number(body.stage) || 0,
      String(body.note ?? ''),
    );
    return { ok: true };
  }
}
