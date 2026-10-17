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
import { parseCaptureInput } from './capture';
import { CaptureService } from './capture.service';
import { JOBS, PipelineService } from './pipeline.service';
import { StudioService } from './studio.service';
import { VARIANT_ARCHETYPES } from './variants';
import { VariantsService, type VariantStatus } from './variants.service';
import { QuotesService } from './quotes.service';
import { PassagesService, type PassageStatus } from './passages.service';
import { QUOTE_KINDS, type QuoteKind } from './quotes';
import type {
  BlockRule,
  DraftRow,
  Lifecycle,
  TrendStatus,
} from './studio.types';

type Db = SupabaseClient<any, any, any>;

const TREND_STATUSES: TrendStatus[] = [
  'new',
  'queued',
  'generated',
  'ignored',
  'blocked',
];
const LIFECYCLES: Lifecycle[] = ['trend', 'evergreen', 'retired'];
const VARIANT_STATUSES: VariantStatus[] = ['pending', 'approved', 'rejected'];
const BLOCK_KINDS: BlockRule['kind'][] = ['word', 'regex', 'person', 'topic'];
const DRAFT_STATUSES: DraftRow['status'][] = [
  'pending',
  'rejected_auto',
  'approved',
  'rejected',
  'edited',
];

function captureId(id: string): number {
  const n = Number(id);
  if (!Number.isSafeInteger(n) || n <= 0) {
    throw new BadRequestException('Invalid capture id');
  }
  return n;
}

/** Lexica Studio back office. Editors only (docs/LEXICA_STUDIO_SPEC.md §7). */
@Controller('studio')
@UseGuards(SupabaseAuthGuard, EditorGuard)
export class StudioController {
  constructor(
    private readonly studio: StudioService,
    private readonly pipeline: PipelineService,
    private readonly captures: CaptureService,
    private readonly variants: VariantsService,
    private readonly quotes: QuotesService,
    private readonly passages: PassagesService,
  ) {}

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
  listTrends(
    @StudioDb() db: Db,
    @Query('status') status?: string,
    @Query('sort') sort?: string,
  ) {
    return this.studio.listTrends(
      db,
      oneOf({ status }, 'status', TREND_STATUSES),
      sort === 'hot' ? 'hot' : 'recent',
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

  // captures (Radar) and capture tokens
  @Get('captures')
  listCaptures(@StudioDb() db: Db, @Query('dismissed') dismissed?: string) {
    return this.captures.listCaptures(db, dismissed === 'true');
  }

  @Post('captures')
  createCapture(
    @StudioDb() db: Db,
    @CurrentUserId() userId: string,
    @Body() body: unknown,
  ) {
    return this.captures.createCapture(db, userId, parseCaptureInput(body));
  }

  @Patch('captures/:id')
  updateCapture(
    @StudioDb() db: Db,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const o = obj(body);
    const dismissed = o.dismissed;
    if (dismissed !== undefined && typeof dismissed !== 'boolean') {
      throw new BadRequestException('dismissed must be a boolean');
    }
    const text =
      o.text === '' ? '' : str(o, 'text', { max: 2000, optional: true });
    const note =
      o.note === '' ? '' : str(o, 'note', { max: 500, optional: true });
    return this.captures.updateCapture(db, captureId(id), {
      text,
      note,
      dismissed,
    });
  }

  @Post('captures/:id/trend')
  trendFromCapture(
    @StudioDb() db: Db,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const o = obj(body);
    return this.captures.createTrendFromCapture(db, userId, captureId(id), {
      label: str(o, 'label', { max: 120 })!,
      summary: str(o, 'summary', { max: 500, optional: true }),
      tags: strList(o, 'tags', 10),
      targetWords: strList(o, 'targetWords', 5),
      generate: o.generate === true,
    });
  }

  @Get('capture-tokens')
  listCaptureTokens(@StudioDb() db: Db) {
    return this.captures.listTokens(db);
  }

  @Post('capture-tokens')
  createCaptureToken(
    @StudioDb() db: Db,
    @CurrentUserId() userId: string,
    @Body() body: unknown,
  ) {
    const name = str(obj(body), 'name', { max: 60 })!;
    return this.captures.createToken(db, userId, name);
  }

  @Post('capture-tokens/:id/revoke')
  revokeCaptureToken(@StudioDb() db: Db, @Param('id') id: string) {
    return this.captures.revokeToken(db, id);
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
  // pipeline jobs (also run by the scheduler)
  @Post('jobs/:job')
  runJob(
    @StudioDb() db: Db,
    @CurrentUserId() userId: string,
    @Param('job') job: string,
  ) {
    const name = oneOf({ job }, 'job', JOBS);
    if (!name) throw new BadRequestException('job is required');
    return this.pipeline.run(db, name, userId);
  }

  // sources & blocklist
  @Get('sources')
  listSources(@StudioDb() db: Db) {
    return this.studio.listSources(db);
  }

  @Patch('sources/:id')
  updateSource(
    @StudioDb() db: Db,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const o = obj(body);
    const enabled = o.enabled;
    if (enabled !== undefined && typeof enabled !== 'boolean') {
      throw new BadRequestException('enabled must be a boolean');
    }
    const weight = o.weight;
    if (
      weight !== undefined &&
      (typeof weight !== 'number' || weight < 0 || weight > 5)
    ) {
      throw new BadRequestException('weight must be a number 0–5');
    }
    const feeds = o.feeds === undefined ? undefined : strList(o, 'feeds', 30);
    if (feeds?.some((f) => !/^https?:\/\//.test(f))) {
      throw new BadRequestException('feeds must be http(s) URLs');
    }
    return this.studio.updateSource(db, id, { enabled, weight, feeds });
  }

  // ---------------------------------------------- archetype variants

  @Get('variants/coverage')
  variantsCoverage(@StudioDb() db: Db) {
    return this.variants.coverage(db);
  }

  @Get('variants')
  listVariants(
    @StudioDb() db: Db,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
  ) {
    return this.variants.list(
      db,
      oneOf({ status }, 'status', VARIANT_STATUSES) ?? 'pending',
      Math.min(Math.max(Number(limit) || 20, 1), 100),
    );
  }

  @Post('variants/generate')
  generateVariants(@StudioDb() db: Db, @Body() body: unknown) {
    return this.variants.generate(db, int(obj(body ?? {}), 'limit', 1, 10));
  }

  @Post('variants/publish')
  publishVariants(@StudioDb() db: Db, @CurrentUserId() userId: string) {
    return this.variants.publish(db, userId);
  }

  // ------------------------------------------- "Ngoài đời" quotes
  @Get('quotes')
  listQuotes(
    @StudioDb() db: Db,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const s = VARIANT_STATUSES.includes(status as VariantStatus)
      ? (status as VariantStatus)
      : 'pending';
    const n = Math.min(100, Math.max(1, Number(limit) || 30));
    const from = Math.max(0, Number(offset) || 0);
    return this.quotes.list(db, s, n, from);
  }

  @Get('quotes/stats')
  quoteStats(@StudioDb() db: Db) {
    return this.quotes.stats(db);
  }

  @Post('quotes/build-corpus')
  buildQuoteCorpus(@StudioDb() db: Db, @Body() body: unknown) {
    return this.quotes.buildCorpus(db, int(obj(body ?? {}), 'books', 1, 10));
  }

  @Post('quotes/find')
  findQuotes(@StudioDb() db: Db, @Body() body: unknown) {
    return this.quotes.findQuotes(db, int(obj(body ?? {}), 'limit', 1, 100));
  }

  // ------------------------------------------------ "Đọc" passages
  @Get('passages')
  listPassages(@StudioDb() db: Db, @Query('status') status?: string) {
    const s: PassageStatus =
      status === 'approved' || status === 'rejected' ? status : 'pending';
    return this.passages.list(db, s);
  }

  @Get('passages/stats')
  passageStats(@StudioDb() db: Db) {
    return this.passages.stats(db);
  }

  @Post('passages/generate')
  generatePassage(
    @StudioDb() db: Db,
    @CurrentUserId() userId: string,
    @Body() body: unknown,
  ) {
    const o = obj(body ?? {});
    return this.passages.generate(db, userId, {
      level: str(o, 'level') ?? '',
      topic: str(o, 'topic') ?? '',
      words: int(o, 'words', 3, 5),
    });
  }

  @Post('passages/publish')
  publishPassages(@StudioDb() db: Db, @CurrentUserId() userId: string) {
    return this.passages.publish(db, userId);
  }

  @Post('passages/:id/:action')
  reviewPassage(
    @StudioDb() db: Db,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Param('action') action: string,
    @Body() body: unknown,
  ) {
    if (action !== 'approve' && action !== 'reject')
      throw new BadRequestException('action must be approve or reject');
    const o = obj(body ?? {});
    return this.passages.review(db, userId, id, action, {
      title: str(o, 'title', { optional: true }),
      text: str(o, 'text', { optional: true }),
      translation: str(o, 'translation', { optional: true }),
    });
  }

  @Get('cards/search')
  searchCards(@StudioDb() db: Db, @Query('q') q?: string) {
    return this.quotes.searchCards(db, (q ?? '').slice(0, 40));
  }

  @Post('quotes')
  addQuote(@StudioDb() db: Db, @Body() body: unknown) {
    const o = obj(body);
    const kind = str(o, 'kind') ?? '';
    if (!QUOTE_KINDS.includes(kind as QuoteKind))
      throw new BadRequestException('kind không hợp lệ');
    return this.quotes.add(db, str(o, 'card_id') ?? '', {
      kind: kind as QuoteKind,
      text: str(o, 'text') ?? '',
      source: str(o, 'source') ?? '',
      url: str(o, 'url', { optional: true }),
      translation: str(o, 'translation', { optional: true }),
      clip: str(o, 'youtube', { optional: true })
        ? {
            link: str(o, 'youtube') ?? '',
            start: Number(o.start),
            end: Number(o.end),
          }
        : undefined,
    });
  }

  @Post('quotes/:id/:action')
  reviewQuote(
    @StudioDb() db: Db,
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Param('action') action: string,
    @Body() body: unknown,
  ) {
    if (action !== 'approve' && action !== 'reject')
      throw new BadRequestException('action must be approve or reject');
    const o = obj(body ?? {});
    return this.quotes.review(
      db,
      userId,
      id,
      action,
      typeof o.text === 'string' ? o.text : undefined,
    );
  }

  @Post('variants/:cardId/:archetype')
  @HttpCode(204)
  reviewVariant(
    @StudioDb() db: Db,
    @CurrentUserId() userId: string,
    @Param('cardId') cardId: string,
    @Param('archetype') archetype: string,
    @Body() body: unknown,
  ) {
    const o = obj(body);
    const arch = oneOf({ archetype }, 'archetype', VARIANT_ARCHETYPES);
    if (!arch || !/^[a-z0-9]{2,12}$/.test(cardId)) {
      throw new BadRequestException('Invalid variant');
    }
    return this.variants.review(
      db,
      userId,
      cardId,
      arch,
      oneOf(o, 'action', ['approve', 'reject'] as const) ?? 'approve',
      str(o, 'scenario', { max: 200, optional: true }),
    );
  }

  @Get('blocklist')
  listBlocklist(@StudioDb() db: Db) {
    return this.studio.listBlocklist(db);
  }

  @Post('blocklist')
  @HttpCode(204)
  addBlockRule(@StudioDb() db: Db, @Body() body: unknown) {
    const o = obj(body);
    return this.studio.addBlockRule(db, {
      pattern: str(o, 'pattern', { max: 120 })!,
      kind: oneOf(o, 'kind', BLOCK_KINDS) ?? 'word',
      note: str(o, 'note', { max: 120, optional: true }),
    });
  }

  @Post('blocklist/remove')
  @HttpCode(204)
  removeBlockRule(@StudioDb() db: Db, @Body() body: unknown) {
    return this.studio.removeBlockRule(db, str(obj(body), 'pattern')!);
  }
}
