import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  buildDropPack,
  buildLibraryPack,
  newCardId,
  packPath,
  sha256,
  type Manifest,
  type Pack,
  type PackRef,
} from './pack-builder';
import {
  buildPrompt,
  parseDrafts,
  pickCandidates,
  PROMPT_VERSION,
} from './prompt';
import { StudioLlm } from './studio-llm';
import type {
  BlockRule,
  CardRow,
  DraftRow,
  DropRow,
  Level,
  LexemeRow,
  Lifecycle,
  TrendRow,
  TrendStatus,
} from './studio.types';
import { normalize, validateDraft, warnings } from './validator';

type Db = SupabaseClient<any, any, any>;
type Res = { data: unknown; error: { message: string } | null };

export const BUCKET = 'lexica-content';
export const MANIFEST_PATH = 'packs/manifest.json';

const WORDS_PER_TREND = 3;
const SENTENCES_PER_WORD = 3;
const CANDIDATES = 40;
const DAY_MS = 86_400_000;

function rows<T>(res: Res): T[] {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T[];
}

function one<T>(res: Res, what: string): T {
  if (res.error) throw new Error(res.error.message);
  if (!res.data) throw new NotFoundException(`${what} not found`);
  return res.data as T;
}

function check(res: { error: { message: string } | null }) {
  if (res.error) throw new Error(res.error.message);
}

export interface DraftView extends DraftRow {
  trend_label: string | null;
  level: Level;
  ipa: string | null;
  warnings: string[];
}

@Injectable()
export class StudioService {
  private readonly logger = new Logger(StudioService.name);

  constructor(
    private readonly llm: StudioLlm,
    private readonly config: ConfigService,
  ) {}

  private get maxGenerationsPerDay(): number {
    return Number(this.config.get('STUDIO_MAX_GENERATIONS_PER_DAY') ?? 30);
  }

  // ---------------------------------------------------------------- trends

  async listTrends(db: Db, status?: TrendStatus): Promise<TrendRow[]> {
    let q = db
      .from('studio_trends')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (status) q = q.eq('status', status);
    return rows<TrendRow>(await q);
  }

  async createTrend(
    db: Db,
    userId: string,
    input: {
      label: string;
      summary?: string;
      url?: string;
      tags: string[];
      targetWords: string[];
    },
  ): Promise<TrendRow> {
    const targetWords = input.targetWords.map((w) => w.toLowerCase());
    if (targetWords.length) {
      const known = rows<{ word: string }>(
        await db.from('studio_lexemes').select('word').in('word', targetWords),
      ).map((r) => r.word);
      const unknown = targetWords.filter((w) => !known.includes(w));
      if (unknown.length) {
        throw new BadRequestException(
          `Chưa có trong danh sách từ: ${unknown.join(', ')}`,
        );
      }
    }
    return one<TrendRow>(
      await db
        .from('studio_trends')
        .insert({
          label: input.label,
          summary: input.summary ?? null,
          url: input.url ?? null,
          tags: input.tags,
          target_words: targetWords,
          created_by: userId,
        })
        .select()
        .single(),
      'Trend',
    );
  }

  async updateTrendStatus(
    db: Db,
    id: string,
    status: TrendStatus,
  ): Promise<TrendRow> {
    return one<TrendRow>(
      await db
        .from('studio_trends')
        .update({ status })
        .eq('id', id)
        .select()
        .maybeSingle(),
      'Trend',
    );
  }

  // ------------------------------------------------------------ generation

  async generationsToday(db: Db): Promise<number> {
    const since = new Date(Date.now() - DAY_MS).toISOString();
    const res = await db
      .from('studio_job_runs')
      .select('id', { count: 'exact', head: true })
      .eq('job', 'generate')
      .gte('started_at', since);
    check(res);
    return res.count ?? 0;
  }

  async generateForTrend(
    db: Db,
    userId: string,
    trendId: string,
  ): Promise<{ created: number; rejectedAuto: number; model: string }> {
    if ((await this.generationsToday(db)) >= this.maxGenerationsPerDay) {
      throw new HttpException(
        `Đã chạm trần ${this.maxGenerationsPerDay} lượt sinh trong 24 giờ`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const trend = one<TrendRow>(
      await db
        .from('studio_trends')
        .select('*')
        .eq('id', trendId)
        .maybeSingle(),
      'Trend',
    );
    if (trend.status === 'blocked' || trend.status === 'ignored') {
      throw new BadRequestException(`Trend đang ở trạng thái ${trend.status}`);
    }

    const lexemes = rows<LexemeRow>(
      await db
        .from('studio_lexemes')
        .select('*')
        .order('times_used', { ascending: true })
        .order('last_used_at', { ascending: true, nullsFirst: true })
        .limit(1000),
    );
    const lexicon = new Set(lexemes.map((l) => l.word));
    const forced = trend.target_words.filter((w) => lexicon.has(w));

    const run = one<{ id: number }>(
      await db
        .from('studio_job_runs')
        .insert({ job: 'generate', created_by: userId, stats: { trendId } })
        .select('id')
        .single(),
      'Job run',
    );

    try {
      const prompt = buildPrompt({
        trend,
        candidates: forced.length ? [] : pickCandidates(lexemes, CANDIDATES),
        forcedWords: forced,
        wordsPerTrend: WORDS_PER_TREND,
        sentencesPerWord: SENTENCES_PER_WORD,
      });
      const { json, model } = await this.llm.generateJson(prompt);
      const raw = parseDrafts(json).filter(
        (d) => !forced.length || forced.includes(d.word),
      );

      const ctx = await this.validationContext(db, lexicon);
      // FK on word: drop words the model invented outside the lexicon.
      const usable = raw.filter((d) => lexicon.has(d.word));
      const valid = usable.map((d) => {
        const report = validateDraft(d, {
          ...ctx,
          sameWordScenarios: ctx.scenariosByWord.get(d.word) ?? [],
        });
        // Later drafts in the same batch must not duplicate earlier ones.
        ctx.existingScenarios.add(normalize(d.scenario));
        return {
          trend_id: trend.id,
          word: d.word,
          scenario: d.scenario,
          translation_hint: d.translation_hint,
          archetype: d.archetype,
          tone: d.tone,
          model,
          prompt_version: PROMPT_VERSION,
          validation: report,
          status: report.ok ? 'pending' : 'rejected_auto',
        };
      });
      if (valid.length) check(await db.from('studio_drafts').insert(valid));

      const created = valid.filter((v) => v.status === 'pending').length;
      const rejectedAuto = raw.length - created;
      check(
        await db
          .from('studio_trends')
          .update({
            status: 'generated',
            generated_at: new Date().toISOString(),
          })
          .eq('id', trend.id),
      );
      check(
        await db
          .from('studio_job_runs')
          .update({
            finished_at: new Date().toISOString(),
            ok: true,
            stats: { trendId, model, created, rejectedAuto },
          })
          .eq('id', run.id),
      );
      return { created, rejectedAuto, model };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Generation failed for trend ${trendId}: ${message}`);
      await db
        .from('studio_job_runs')
        .update({
          finished_at: new Date().toISOString(),
          ok: false,
          error: message,
        })
        .eq('id', run.id);
      if (err instanceof HttpException) throw err;
      throw new UnprocessableEntityException(`Sinh nháp thất bại: ${message}`);
    }
  }

  private async validationContext(db: Db, lexicon: Set<string>) {
    const [blocklist, cards, drafts] = await Promise.all([
      db.from('studio_blocklist').select('pattern, kind'),
      db.from('studio_cards').select('word, scenario, created_at'),
      db
        .from('studio_drafts')
        .select('scenario')
        .in('status', ['pending', 'approved', 'edited']),
    ]);
    const cardRows =
      rows<Pick<CardRow, 'word' | 'scenario' | 'created_at'>>(cards);
    const scenariosByWord = new Map<string, string[]>();
    for (const c of cardRows) {
      const list = scenariosByWord.get(c.word) ?? [];
      list.push(c.scenario);
      scenariosByWord.set(c.word, list);
    }
    const recentCutoff = Date.now() - 14 * DAY_MS;
    return {
      lexicon,
      blocklist: rows<BlockRule>(blocklist),
      existingScenarios: new Set(
        [...cardRows, ...rows<{ scenario: string }>(drafts)].map((r) =>
          normalize(r.scenario),
        ),
      ),
      scenariosByWord,
      recentWords: new Set(
        cardRows
          .filter((c) => Date.parse(c.created_at) >= recentCutoff)
          .map((c) => c.word),
      ),
    };
  }

  // ---------------------------------------------------------------- drafts

  async listDrafts(
    db: Db,
    status: DraftRow['status'],
    limit: number,
  ): Promise<DraftView[]> {
    const drafts = rows<
      DraftRow & {
        studio_trends: { label: string } | null;
        studio_lexemes: { level: Level; ipa: string | null } | null;
      }
    >(
      await db
        .from('studio_drafts')
        .select('*, studio_trends(label), studio_lexemes(level, ipa)')
        .eq('status', status)
        // Drafts of one trend are inserted together, so they stay adjacent
        .order('created_at', { ascending: true })
        .limit(limit),
    );
    return drafts.map(({ studio_trends, studio_lexemes, ...d }) => ({
      ...d,
      trend_label: studio_trends?.label ?? null,
      level: studio_lexemes?.level ?? 'intermediate',
      ipa: studio_lexemes?.ipa ?? null,
      warnings: warnings(d.validation),
    }));
  }

  async approveDraft(
    db: Db,
    userId: string,
    draftId: string,
    edits: {
      scenario?: string;
      translationHint?: string;
      level?: Level;
      elo?: number;
    },
  ): Promise<CardRow> {
    const draft = one<DraftRow>(
      await db
        .from('studio_drafts')
        .select('*')
        .eq('id', draftId)
        .maybeSingle(),
      'Draft',
    );
    if (draft.status !== 'pending' && draft.status !== 'rejected_auto') {
      throw new ConflictException(`Draft is already ${draft.status}`);
    }
    const lexeme = one<LexemeRow>(
      await db
        .from('studio_lexemes')
        .select('*')
        .eq('word', draft.word)
        .maybeSingle(),
      'Lexeme',
    );

    const scenario = edits.scenario ?? draft.scenario;
    const translationHint = edits.translationHint ?? draft.translation_hint;
    const edited =
      scenario !== draft.scenario || translationHint !== draft.translation_hint;

    if (edited || draft.status === 'rejected_auto') {
      const ctx = await this.validationContext(db, new Set([draft.word]));
      ctx.existingScenarios.delete(normalize(draft.scenario));
      const report = validateDraft(
        { word: draft.word, scenario },
        { ...ctx, sameWordScenarios: [] },
      );
      if (!report.ok) {
        throw new UnprocessableEntityException({
          message: 'Câu chưa qua kiểm tra',
          validation: report,
        });
      }
    }

    let trendLabel: string | null = null;
    if (draft.trend_id) {
      const t = await db
        .from('studio_trends')
        .select('label')
        .eq('id', draft.trend_id)
        .maybeSingle();
      trendLabel = (t.data as { label: string } | null)?.label ?? null;
    }

    const base = {
      draft_id: draft.id,
      word: draft.word,
      ipa: lexeme.ipa,
      elo: edits.elo ?? lexeme.elo,
      level: edits.level ?? lexeme.level,
      scenario,
      translation_hint: translationHint,
      trend_label: trendLabel,
    };
    let card: CardRow | null = null;
    for (let attempt = 0; attempt < 3 && !card; attempt++) {
      const res = await db
        .from('studio_cards')
        .insert({ id: newCardId(), ...base })
        .select()
        .single();
      if (!res.error) card = res.data as CardRow;
      else if (!res.error.message.includes('duplicate key')) {
        throw new Error(res.error.message);
      }
    }
    if (!card) throw new Error('Could not allocate a card id');

    check(
      await db
        .from('studio_drafts')
        .update({
          status: edited ? 'edited' : 'approved',
          scenario,
          translation_hint: translationHint,
          reviewer_id: userId,
          reviewed_at: new Date().toISOString(),
          card_id: card.id,
        })
        .eq('id', draft.id),
    );
    check(
      await db
        .from('studio_lexemes')
        .update({
          times_used: lexeme.times_used + 1,
          last_used_at: new Date().toISOString(),
        })
        .eq('word', lexeme.word),
    );
    return card;
  }

  async rejectDraft(
    db: Db,
    userId: string,
    draftId: string,
    reason: string,
  ): Promise<void> {
    const res = await db
      .from('studio_drafts')
      .update({
        status: 'rejected',
        reject_reason: reason,
        reviewer_id: userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', draftId)
      .in('status', ['pending', 'rejected_auto'])
      .select('id');
    if (rows(res).length === 0) {
      throw new ConflictException('Draft is not waiting for review');
    }
  }

  /** Undo a review decision. Refused once the card has been published. */
  async resetDraft(db: Db, draftId: string): Promise<void> {
    const draft = one<DraftRow>(
      await db
        .from('studio_drafts')
        .select('*')
        .eq('id', draftId)
        .maybeSingle(),
      'Draft',
    );
    if (draft.card_id) {
      const published = rows<{ drop_id: string }>(
        await db
          .from('studio_drop_cards')
          .select('drop_id, studio_drops!inner(status)')
          .eq('card_id', draft.card_id)
          .in('studio_drops.status', ['published', 'archived']),
      );
      if (published.length) {
        throw new ConflictException(
          'Thẻ đã được phát hành, hãy retire thẻ thay vì hoàn tác',
        );
      }
      check(await db.from('studio_cards').delete().eq('id', draft.card_id));
      const lex = await db
        .from('studio_lexemes')
        .select('times_used')
        .eq('word', draft.word)
        .maybeSingle();
      const used = (lex.data as { times_used: number } | null)?.times_used ?? 1;
      check(
        await db
          .from('studio_lexemes')
          .update({ times_used: Math.max(0, used - 1) })
          .eq('word', draft.word),
      );
    }
    check(
      await db
        .from('studio_drafts')
        .update({
          status: draft.validation.ok ? 'pending' : 'rejected_auto',
          reviewer_id: null,
          reviewed_at: null,
          reject_reason: null,
          card_id: null,
        })
        .eq('id', draftId),
    );
  }

  // ----------------------------------------------------------------- cards

  async listCards(
    db: Db,
    filter: { lifecycle?: Lifecycle; q?: string; unassigned?: boolean },
  ): Promise<(CardRow & { drops: string[] })[]> {
    let q = db
      .from('studio_cards')
      .select('*, studio_drop_cards(drop_id)')
      .order('created_at', { ascending: false })
      .limit(300);
    if (filter.lifecycle) q = q.eq('lifecycle', filter.lifecycle);
    if (filter.q) q = q.ilike('word', `%${filter.q.toLowerCase()}%`);
    const list = rows<CardRow & { studio_drop_cards: { drop_id: string }[] }>(
      await q,
    ).map(({ studio_drop_cards, ...c }) => ({
      ...c,
      drops: studio_drop_cards.map((d) => d.drop_id),
    }));
    return filter.unassigned ? list.filter((c) => c.drops.length === 0) : list;
  }

  async updateCard(
    db: Db,
    id: string,
    patch: {
      lifecycle?: Lifecycle;
      scenario?: string;
      translationHint?: string;
    },
  ): Promise<CardRow> {
    const card = one<CardRow>(
      await db.from('studio_cards').select('*').eq('id', id).maybeSingle(),
      'Card',
    );
    const update: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (patch.lifecycle) update.lifecycle = patch.lifecycle;
    const textChanged =
      (patch.scenario && patch.scenario !== card.scenario) ||
      (patch.translationHint &&
        patch.translationHint !== card.translation_hint);
    if (textChanged) {
      const scenario = patch.scenario ?? card.scenario;
      const ctx = await this.validationContext(db, new Set([card.word]));
      ctx.existingScenarios.delete(normalize(card.scenario));
      const report = validateDraft(
        { word: card.word, scenario },
        { ...ctx, sameWordScenarios: [] },
      );
      if (!report.ok) {
        throw new UnprocessableEntityException({
          message: 'Câu chưa qua kiểm tra',
          validation: report,
        });
      }
      update.scenario = scenario;
      update.translation_hint = patch.translationHint ?? card.translation_hint;
      update.revision = card.revision + 1;
    }
    return one<CardRow>(
      await db
        .from('studio_cards')
        .update(update)
        .eq('id', id)
        .select()
        .single(),
      'Card',
    );
  }

  // ----------------------------------------------------------------- drops

  async listDrops(db: Db): Promise<(DropRow & { card_count: number })[]> {
    return rows<DropRow & { studio_drop_cards: { count: number }[] }>(
      await db
        .from('studio_drops')
        .select('*, studio_drop_cards(count)')
        .order('created_at', { ascending: false })
        .limit(50),
    ).map(({ studio_drop_cards, ...d }) => ({
      ...d,
      card_count: studio_drop_cards[0]?.count ?? 0,
    }));
  }

  async getDrop(db: Db, id: string): Promise<DropRow & { cards: CardRow[] }> {
    const drop = one<DropRow>(
      await db.from('studio_drops').select('*').eq('id', id).maybeSingle(),
      'Drop',
    );
    return { ...drop, cards: await this.dropCards(db, id) };
  }

  private async dropCards(db: Db, dropId: string): Promise<CardRow[]> {
    return rows<{ position: number; studio_cards: CardRow }>(
      await db
        .from('studio_drop_cards')
        .select('position, studio_cards(*)')
        .eq('drop_id', dropId)
        .order('position', { ascending: true }),
    ).map((r) => r.studio_cards);
  }

  async createDrop(
    db: Db,
    input: { id: string; title: string; expiresAt?: string },
  ): Promise<DropRow> {
    const res = await db
      .from('studio_drops')
      .insert({
        id: input.id,
        title: input.title,
        expires_at:
          input.expiresAt ?? new Date(Date.now() + 14 * DAY_MS).toISOString(),
      })
      .select()
      .single();
    if (res.error?.message.includes('duplicate key')) {
      throw new ConflictException(`Drop ${input.id} đã tồn tại`);
    }
    return one<DropRow>(res, 'Drop');
  }

  async updateDrop(
    db: Db,
    id: string,
    patch: { title?: string; expiresAt?: string },
  ): Promise<DropRow> {
    const update: Record<string, unknown> = {};
    if (patch.title) update.title = patch.title;
    if (patch.expiresAt) update.expires_at = patch.expiresAt;
    return one<DropRow>(
      await db
        .from('studio_drops')
        .update(update)
        .eq('id', id)
        .select()
        .maybeSingle(),
      'Drop',
    );
  }

  async setDropCards(db: Db, id: string, cardIds: string[]): Promise<void> {
    one<DropRow>(
      await db.from('studio_drops').select('id').eq('id', id).maybeSingle(),
      'Drop',
    );
    const unique = [...new Set(cardIds)];
    if (unique.length) {
      const found = rows<{ id: string }>(
        await db.from('studio_cards').select('id').in('id', unique),
      ).map((r) => r.id);
      const missing = unique.filter((c) => !found.includes(c));
      if (missing.length) {
        throw new BadRequestException(`Unknown cards: ${missing.join(', ')}`);
      }
    }
    check(await db.from('studio_drop_cards').delete().eq('drop_id', id));
    if (unique.length) {
      check(
        await db.from('studio_drop_cards').insert(
          unique.map((cardId, position) => ({
            drop_id: id,
            card_id: cardId,
            position,
          })),
        ),
      );
    }
  }

  // --------------------------------------------------------------- publish

  private async upload(
    db: Db,
    path: string,
    body: string,
    cacheSeconds: number,
  ): Promise<string> {
    const { error } = await db.storage.from(BUCKET).upload(path, body, {
      contentType: 'application/json; charset=utf-8',
      cacheControl: String(cacheSeconds),
      upsert: true,
    });
    if (error) throw new Error(`Upload ${path} failed: ${error.message}`);
    return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  private async uploadPack(db: Db, pack: Pack): Promise<PackRef> {
    const body = JSON.stringify(pack);
    const hash = sha256(body);
    const url = await this.upload(
      db,
      packPath(pack.id, hash),
      body,
      31_536_000,
    );
    return { id: pack.id, url, sha256: hash };
  }

  async publishDrop(
    db: Db,
    userId: string,
    dropId: string,
  ): Promise<{ manifest: Manifest; manifestUrl: string }> {
    const drop = one<DropRow>(
      await db.from('studio_drops').select('*').eq('id', dropId).maybeSingle(),
      'Drop',
    );
    const cards = await this.dropCards(db, dropId);
    if (!cards.some((c) => c.lifecycle !== 'retired')) {
      throw new BadRequestException('Drop chưa có thẻ nào');
    }

    const publishedAt = new Date().toISOString();
    const dropPack = buildDropPack(drop, cards, publishedAt);
    const inDrop = new Set(dropPack.cards.map((c) => c.id));

    // Everything learners may already have: cards of earlier drops, plus
    // retired cards of this one.
    const earlier = rows<{ studio_cards: CardRow }>(
      await db
        .from('studio_drop_cards')
        .select('studio_cards(*), studio_drops!inner(status)')
        .in('studio_drops.status', ['published', 'archived']),
    ).map((r) => r.studio_cards);
    const libraryCards = new Map<string, CardRow>();
    for (const c of [...earlier, ...cards]) {
      if (!inDrop.has(c.id)) libraryCards.set(c.id, c);
    }
    const library = buildLibraryPack(
      [...libraryCards.values()],
      publishedAt,
      publishedAt,
    );

    const current = await this.uploadPack(db, dropPack);
    const libraryRef = library.cards.length
      ? await this.uploadPack(db, library)
      : null;
    const manifest: Manifest = {
      schema: 1,
      updatedAt: publishedAt,
      current,
      library: libraryRef,
      retired: [
        ...new Set(
          [...libraryCards.values(), ...cards]
            .filter((c) => c.lifecycle === 'retired')
            .map((c) => c.id),
        ),
      ],
    };
    const manifestUrl = await this.writeManifest(db, userId, manifest, {
      dropId,
    });

    check(
      await db
        .from('studio_drops')
        .update({ status: 'archived' })
        .eq('status', 'published')
        .neq('id', dropId),
    );
    check(
      await db
        .from('studio_drops')
        .update({
          status: 'published',
          published_at: publishedAt,
          pack_url: current.url,
          pack_sha256: current.sha256,
        })
        .eq('id', dropId),
    );
    return { manifest, manifestUrl };
  }

  private async writeManifest(
    db: Db,
    userId: string,
    manifest: Manifest,
    stats: Record<string, unknown>,
  ): Promise<string> {
    const url = await this.upload(
      db,
      MANIFEST_PATH,
      JSON.stringify(manifest),
      60,
    );
    check(
      await db.from('studio_job_runs').insert({
        job: 'publish',
        created_by: userId,
        finished_at: new Date().toISOString(),
        ok: true,
        stats: { ...stats, manifest },
      }),
    );
    return url;
  }

  /** Points the manifest back at the previous live drop. */
  async rollback(
    db: Db,
    userId: string,
  ): Promise<{ manifest: Manifest; manifestUrl: string }> {
    const runs = rows<{ stats: { manifest?: Manifest } }>(
      await db
        .from('studio_job_runs')
        .select('stats')
        .eq('job', 'publish')
        .eq('ok', true)
        .order('started_at', { ascending: false })
        .limit(20),
    )
      .map((r) => r.stats.manifest)
      .filter((m): m is Manifest => !!m);
    const live = runs[0];
    const previous = runs.find(
      (m) => m.current?.id !== live?.current?.id && m.current,
    );
    if (!live || !previous?.current) {
      throw new ConflictException('Không có bản phát hành trước để quay lại');
    }

    const manifest: Manifest = {
      ...previous,
      updatedAt: new Date().toISOString(),
    };
    const manifestUrl = await this.writeManifest(db, userId, manifest, {
      rollbackFrom: live.current?.id,
      dropId: previous.current.id,
    });
    if (live.current) {
      check(
        await db
          .from('studio_drops')
          .update({ status: 'draft' })
          .eq('id', live.current.id),
      );
    }
    check(
      await db
        .from('studio_drops')
        .update({ status: 'published' })
        .eq('id', previous.current.id),
    );
    return { manifest, manifestUrl };
  }

  // --------------------------------------------------------------- lexemes

  async listLexemes(db: Db, q?: string): Promise<LexemeRow[]> {
    let query = db
      .from('studio_lexemes')
      .select('*')
      .order('word', { ascending: true })
      .limit(50);
    if (q) query = query.ilike('word', `${q.toLowerCase()}%`);
    return rows<LexemeRow>(await query);
  }

  async createLexeme(
    db: Db,
    input: { word: string; ipa?: string; elo: number; level: Level },
  ): Promise<LexemeRow> {
    const word = input.word.toLowerCase();
    if (!/^[a-z][a-z'-]*[a-z]$/.test(word)) {
      throw new BadRequestException('Từ chỉ gồm chữ cái tiếng Anh');
    }
    const res = await db
      .from('studio_lexemes')
      .insert({
        word,
        ipa: input.ipa ?? null,
        elo: input.elo,
        level: input.level,
      })
      .select()
      .single();
    if (res.error?.message.includes('duplicate key')) {
      throw new ConflictException(`"${word}" đã có`);
    }
    return one<LexemeRow>(res, 'Lexeme');
  }

  // ---------------------------------------------------------------- health

  async health(db: Db) {
    const [runs, pending, generations] = await Promise.all([
      db
        .from('studio_job_runs')
        .select('id, job, started_at, finished_at, ok, error, stats')
        .order('started_at', { ascending: false })
        .limit(20),
      db
        .from('studio_drafts')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      this.generationsToday(db),
    ]);
    check(pending);
    return {
      pendingDrafts: pending.count ?? 0,
      generationsLast24h: generations,
      maxGenerationsPerDay: this.maxGenerationsPerDay,
      recentRuns: rows<Record<string, unknown>>(runs).map((r) => {
        // Manifests are large; the health page only needs the summary.
        const stats = { ...((r.stats ?? {}) as Record<string, unknown>) };
        delete stats.manifest;
        return { ...r, stats };
      }),
    };
  }
}
