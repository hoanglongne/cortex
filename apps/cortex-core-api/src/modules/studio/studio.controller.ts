import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { CurrentUserId } from '../auth/current-user';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { EditorGuard, StudioDb } from './editor.guard';
import {
  int,
  isoDate,
  level,
  obj,
  oneOf,
  str,
  strList,
  weekDropId,
} from './input';
import { StudioService } from './studio.service';
import type { DraftRow, Lifecycle, TrendStatus } from './studio.types';

type Db = SupabaseClient<any, any, any>;

const TREND_STATUSES: TrendStatus[] = [
  'new',
  'queued',
  'generated',
  'ignored',
  'blocked',
];
const LIFECYCLES: Lifecycle[] = ['trend', 'evergreen', 'retired'];
const DRAFT_STATUSES: DraftRow['status'][] = [
  'pending',
  'rejected_auto',
  'approved',
  'rejected',
  'edited',
];

/** Lexica Studio back office. Editors only (docs/LEXICA_STUDIO_SPEC.md §7). */
@Controller('studio')
@UseGuards(SupabaseAuthGuard, EditorGuard)
export class StudioController {
  constructor(private readonly studio: StudioService) {}

  @Get('me')
  me(@CurrentUserId() userId: string) {
    return { userId, editor: true };
  }

  @Get('health')
  health(@StudioDb() db: Db) {
    return this.studio.health(db);
  }

  // trends
  @Get('trends')
  listTrends(@StudioDb() db: Db, @Query('status') status?: string) {
    return this.studio.listTrends(
      db,
      oneOf({ status }, 'status', TREND_STATUSES),
    );
  }

  @Post('trends')
  createTrend(
    @StudioDb() db: Db,
    @CurrentUserId() userId: string,
    @Body() body: unknown,
  ) {
    const o = obj(body);
    return this.studio.createTrend(db, userId, {
      label: str(o, 'label', { max: 120 })!,
      summary: str(o, 'summary', { max: 500, optional: true }),
      url: str(o, 'url', { max: 500, optional: true }),
      tags: strList(o, 'tags', 10),
      targetWords: strList(o, 'targetWords', 5),
    });
  }

  @Patch('trends/:id')
  updateTrend(
    @StudioDb() db: Db,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const status = oneOf(obj(body), 'status', TREND_STATUSES);
    if (!status) throw new BadRequestException('status is required');
    return this.studio.updateTrendStatus(db, id, status);
  }

  @Post('trends/:id/generate')
  generate(
    @StudioDb() db: Db,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.studio.generateForTrend(db, userId, id);
  }

  // drafts
  @Get('drafts')
  listDrafts(
    @StudioDb() db: Db,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
  ) {
    return this.studio.listDrafts(
      db,
      oneOf({ status }, 'status', DRAFT_STATUSES) ?? 'pending',
      Math.min(Math.max(Number(limit) || 50, 1), 200),
    );
  }

  @Post('drafts/:id/approve')
  approve(
    @StudioDb() db: Db,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const o = obj(body ?? {});
    return this.studio.approveDraft(db, userId, id, {
      scenario: str(o, 'scenario', { max: 200, optional: true }),
      translationHint: str(o, 'translationHint', {
        max: 80,
        optional: true,
      }),
      level: level(o, 'level'),
      elo: int(o, 'elo', 600, 2000),
    });
  }

  @Post('drafts/:id/reject')
  @HttpCode(204)
  reject(
    @StudioDb() db: Db,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const reason = str(obj(body ?? {}), 'reason', { max: 40, optional: true });
    return this.studio.rejectDraft(db, userId, id, reason ?? 'khác');
  }

  @Post('drafts/:id/reset')
  @HttpCode(204)
  reset(@StudioDb() db: Db, @Param('id') id: string) {
    return this.studio.resetDraft(db, id);
  }

  // cards
  @Get('cards')
  listCards(
    @StudioDb() db: Db,
    @Query('lifecycle') lifecycle?: string,
    @Query('q') q?: string,
    @Query('unassigned') unassigned?: string,
  ) {
    return this.studio.listCards(db, {
      lifecycle: oneOf({ lifecycle }, 'lifecycle', LIFECYCLES),
      q: q?.trim() || undefined,
      unassigned: unassigned === 'true',
    });
  }

  @Patch('cards/:id')
  updateCard(
    @StudioDb() db: Db,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const o = obj(body);
    return this.studio.updateCard(db, id, {
      lifecycle: oneOf(o, 'lifecycle', LIFECYCLES),
      scenario: str(o, 'scenario', { max: 200, optional: true }),
      translationHint: str(o, 'translationHint', {
        max: 80,
        optional: true,
      }),
    });
  }

  // drops
  @Get('drops')
  listDrops(@StudioDb() db: Db) {
    return this.studio.listDrops(db);
  }

  @Get('drops/:id')
  getDrop(@StudioDb() db: Db, @Param('id') id: string) {
    return this.studio.getDrop(db, id);
  }

  @Post('drops')
  createDrop(@StudioDb() db: Db, @Body() body: unknown) {
    const o = obj(body);
    const id = str(o, 'id', { max: 60, optional: true }) ?? weekDropId();
    if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) {
      throw new BadRequestException('id chỉ gồm chữ thường, số và dấu gạch');
    }
    return this.studio.createDrop(db, {
      id,
      title: str(o, 'title', { max: 80 })!,
      expiresAt: isoDate(o, 'expiresAt'),
    });
  }

  @Patch('drops/:id')
  updateDrop(
    @StudioDb() db: Db,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const o = obj(body);
    return this.studio.updateDrop(db, id, {
      title: str(o, 'title', { max: 80, optional: true }),
      expiresAt: isoDate(o, 'expiresAt'),
    });
  }

  @Put('drops/:id/cards')
  @HttpCode(204)
  setDropCards(
    @StudioDb() db: Db,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.studio.setDropCards(db, id, strList(obj(body), 'cardIds', 200));
  }

  @Post('drops/:id/publish')
  publish(
    @StudioDb() db: Db,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.studio.publishDrop(db, userId, id);
  }

  @Post('publish/rollback')
  rollback(@StudioDb() db: Db, @CurrentUserId() userId: string) {
    return this.studio.rollback(db, userId);
  }

  // lexemes
  @Get('lexemes')
  listLexemes(@StudioDb() db: Db, @Query('q') q?: string) {
    return this.studio.listLexemes(db, q?.trim() || undefined);
  }

  @Post('lexemes')
  createLexeme(@StudioDb() db: Db, @Body() body: unknown) {
    const o = obj(body);
    return this.studio.createLexeme(db, {
      word: str(o, 'word', { max: 40 })!,
      ipa: str(o, 'ipa', { max: 60, optional: true }),
      elo: int(o, 'elo', 600, 2000) ?? 1000,
      level: level(o, 'level') ?? 'intermediate',
    });
  }
}
