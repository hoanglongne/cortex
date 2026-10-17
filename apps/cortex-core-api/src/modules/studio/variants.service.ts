import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { StudioLlm } from './studio-llm';
import { buildQuotesMap, type QuoteRow } from './quotes';
import { BUCKET, StudioService } from './studio.service';
import type { CardRow } from './studio.types';
import {
  buildVariantsFile,
  buildVariantsPrompt,
  checkVariant,
  parseVariants,
  VARIANT_ARCHETYPES,
  VARIANT_BATCH,
  VARIANTS_PROMPT_VERSION,
  variantsPath,
  type SourceCard,
  type VariantArchetype,
} from './variants';

type Db = SupabaseClient<any, any, any>;
type Res = { data: unknown; error: { message: string } | null };

const message = (err: unknown) =>
  err instanceof Error ? err.message : String(err);

/** Rows of a query; a failed query surfaces its message instead of a bare 500. */
function rows<T>(res: Res): T[] {
  if (res.error)
    throw new InternalServerErrorException(
      `Lỗi database: ${res.error.message}`,
    );
  return (res.data ?? []) as T[];
}

export type VariantStatus = 'pending' | 'approved' | 'rejected';

export interface VariantRow {
  card_id: string;
  archetype: VariantArchetype;
  scenario: string;
  status: VariantStatus;
  model: string | null;
  created_at: string;
}

export interface VariantGroup {
  card: SourceCard;
  variants: VariantRow[];
}

/** Archetype example sentences: generate, review, publish (variants.ts). */
@Injectable()
export class VariantsService {
  constructor(
    private readonly llm: StudioLlm,
    private readonly studio: StudioService,
  ) {}

  /** Core cards plus live Studio cards: everything a learner can be dealt. */
  private async sourceCards(db: Db): Promise<SourceCard[]> {
    const [core, studio] = await Promise.all([
      db
        .from('studio_core_cards')
        .select('id, word, scenario, translation_hint')
        .order('id'),
      db
        .from('studio_cards')
        .select('id, word, scenario, translation_hint')
        .neq('lifecycle', 'retired')
        .order('created_at'),
    ]);
    return [
      ...rows<SourceCard>(core),
      ...rows<Pick<CardRow, 'id' | 'word' | 'scenario' | 'translation_hint'>>(
        studio,
      ),
    ];
  }

  async coverage(db: Db) {
    const [cards, variants] = await Promise.all([
      this.sourceCards(db),
      db.from('studio_card_variants').select('card_id, status'),
    ]);
    const list = rows<{ card_id: string; status: VariantStatus }>(variants);
    const count = (s: VariantStatus) =>
      list.filter((v) => v.status === s).length;
    const done = new Set(
      list.filter((v) => v.status === 'approved').map((v) => v.card_id),
    );
    return {
      cards: cards.length,
      cardsWithApproved: done.size,
      cardsWithout: cards.filter((c) => !list.some((v) => v.card_id === c.id))
        .length,
      pending: count('pending'),
      approved: count('approved'),
      rejected: count('rejected'),
    };
  }

  /** Writes variants for the next cards that have none yet. */
  async generate(db: Db, limit = VARIANT_BATCH) {
    const n = Math.max(1, Math.min(limit, VARIANT_BATCH));
    const [cards, existing, blocklist] = await Promise.all([
      this.sourceCards(db),
      db.from('studio_card_variants').select('card_id'),
      this.studio.listBlocklist(db),
    ]);
    const has = new Set(
      rows<{ card_id: string }>(existing).map((v) => v.card_id),
    );
    // One card per word: the core list repeats a few words.
    const words = new Set<string>();
    const batch: SourceCard[] = [];
    for (const c of cards) {
      if (has.has(c.id) || words.has(c.word)) continue;
      words.add(c.word);
      batch.push(c);
      if (batch.length === n) break;
    }
    if (batch.length === 0) return { cards: 0, saved: 0, rejected: 0 };

    const byId = new Map(batch.map((c) => [c.id, c]));
    let model: string;
    let raw: ReturnType<typeof parseVariants>;
    try {
      const out = await this.llm.generateJson(
        buildVariantsPrompt(batch, Math.floor(Math.random() * 8)),
      );
      model = out.model;
      raw = parseVariants(out.json, new Set(byId.keys()));
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new BadGatewayException(`Model AI lỗi: ${message(err)}`);
    }

    const keep: Omit<VariantRow, 'created_at'>[] = [];
    let rejected = 0;
    for (const v of raw) {
      const card = byId.get(v.card_id)!;
      const taken = [
        card.scenario,
        ...keep.filter((k) => k.card_id === v.card_id).map((k) => k.scenario),
      ];
      if (checkVariant(v, card, blocklist, taken).length > 0) {
        rejected++;
        continue;
      }
      keep.push({ ...v, status: 'pending', model });
    }
    if (keep.length > 0) {
      const res = await db.from('studio_card_variants').upsert(
        keep.map((k) => ({ ...k, prompt_version: VARIANTS_PROMPT_VERSION })),
        { onConflict: 'card_id,archetype' },
      );
      if (res.error)
        throw new InternalServerErrorException(
          `Không lưu được câu: ${res.error.message}`,
        );
    }
    return { cards: batch.length, saved: keep.length, rejected };
  }

  /** Variants grouped by card, oldest first. */
  async list(
    db: Db,
    status: VariantStatus,
    limit = 20,
  ): Promise<VariantGroup[]> {
    const variants = rows<VariantRow>(
      await db
        .from('studio_card_variants')
        .select('card_id, archetype, scenario, status, model, created_at')
        .eq('status', status)
        .order('created_at')
        .limit(limit * VARIANT_ARCHETYPES.length),
    );
    const cards = new Map((await this.sourceCards(db)).map((c) => [c.id, c]));
    const groups = new Map<string, VariantGroup>();
    for (const v of variants) {
      const card = cards.get(v.card_id);
      if (!card) continue;
      const g = groups.get(v.card_id) ?? { card, variants: [] };
      g.variants.push(v);
      groups.set(v.card_id, g);
    }
    return [...groups.values()].slice(0, limit);
  }

  /** Approve (optionally edited) or reject one variant. */
  async review(
    db: Db,
    userId: string,
    cardId: string,
    archetype: VariantArchetype,
    action: 'approve' | 'reject',
    scenario?: string,
  ) {
    const patch: Record<string, unknown> = {
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewer_id: userId,
      reviewed_at: new Date().toISOString(),
    };
    if (action === 'approve' && scenario !== undefined) {
      const card = (await this.sourceCards(db)).find((c) => c.id === cardId);
      if (!card) throw new BadRequestException('Không tìm thấy thẻ');
      const failed = checkVariant(
        { scenario },
        card,
        await this.studio.listBlocklist(db),
        [card.scenario],
      );
      if (failed.length > 0) {
        throw new BadRequestException(`Câu chưa đạt: ${failed.join(', ')}`);
      }
      patch.scenario = scenario.trim();
    }
    const res = await db
      .from('studio_card_variants')
      .update(patch)
      .eq('card_id', cardId)
      .eq('archetype', archetype);
    if (res.error) throw new Error(res.error.message);
  }

  /** Uploads approved variants and points the manifest at them. */
  async publish(db: Db, userId: string) {
    const approved = rows<{
      card_id: string;
      archetype: VariantArchetype;
      scenario: string;
    }>(
      await db
        .from('studio_card_variants')
        .select('card_id, archetype, scenario')
        .eq('status', 'approved'),
    );
    const quoteRows = rows<QuoteRow>(
      await db
        .from('studio_card_quotes')
        .select('card_id, kind, text, translation, source, url, media, status')
        .eq('status', 'approved'),
    );
    if (approved.length === 0 && quoteRows.length === 0) {
      throw new BadRequestException('Chưa có câu nào được duyệt');
    }
    const publishedAt = new Date().toISOString();
    const quotes = buildQuotesMap(quoteRows);
    const file = buildVariantsFile(approved, publishedAt, quotes);
    const body = JSON.stringify(file);
    const { path, hash } = variantsPath(body);
    const { error } = await db.storage.from(BUCKET).upload(path, body, {
      contentType: 'application/json; charset=utf-8',
      cacheControl: '31536000',
      upsert: true,
    });
    if (error) throw new Error(`Upload ${path} failed: ${error.message}`);
    const url = db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

    const current = await this.studio.readManifest(db);
    const manifest = {
      schema: 1 as const,
      current: null,
      library: null,
      retired: [],
      ...current,
      updatedAt: publishedAt,
      variants: { id: 'variants', url, sha256: hash },
    };
    const manifestUrl = await this.studio.writeManifest(
      db,
      userId,
      manifest,
      {
        variants: approved.length,
        quotes: quoteRows.length,
        cards: new Set([...Object.keys(file.variants), ...Object.keys(quotes)])
          .size,
      },
      'publish_variants',
    );
    // Lexica now has exactly the approved quotes (studio "chưa xuất bản" count).
    const quotesRes = await db
      .from('studio_card_quotes')
      .update({ published_at: publishedAt })
      .eq('status', 'approved');
    if (quotesRes.error) throw new Error(quotesRes.error.message);
    const rejectedRes = await db
      .from('studio_card_quotes')
      .update({ published_at: null })
      .eq('status', 'rejected');
    if (rejectedRes.error) throw new Error(rejectedRes.error.message);
    return {
      manifestUrl,
      variants: approved.length,
      quotes: quoteRows.length,
      cards: new Set([...Object.keys(file.variants), ...Object.keys(quotes)])
        .size,
    };
  }
}
