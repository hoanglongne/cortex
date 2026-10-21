import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { StudioLlm } from './studio-llm';
import { BUCKET, StudioService } from './studio.service';
import {
  buildPassagePrompt,
  buildPassagesFile,
  checkPassage,
  deckWordsIn,
  DIALOGUE_WORDS,
  NEW_WORDS,
  nextFromPlan,
  PASSAGE_KINDS,
  PASSAGE_PLAN,
  PASSAGE_WORDS,
  planCells,
  topicCounts,
  parsePassageReply,
  PASSAGE_LEVELS,
  PASSAGE_PROMPT_VERSION,
  PASSAGE_TOPICS,
  passagesPath,
  pickNewWords,
  type LexiconCard,
  type PassageKind,
  type PassageLevel,
  type PassageRow,
} from './passages';

type Db = SupabaseClient<any, any, any>;
type Res = { data: unknown; error: { message: string } | null };

function rows<T>(res: Res): T[] {
  if (res.error)
    throw new InternalServerErrorException(
      `Lỗi database: ${res.error.message}`,
    );
  return (res.data ?? []) as T[];
}

const message = (err: unknown) =>
  err instanceof Error ? err.message : String(err);

const RULE_TEXT: Record<string, string> = {
  translation: 'thiếu bản dịch',
  title: 'thiếu tiêu đề',
  blocklist: 'chạm danh sách chặn',
  dialogue: 'không đúng dạng hội thoại "Tên: câu nói"',
};
const describe = (failed: string[], kind: PassageKind) =>
  failed
    .map((f) =>
      f.startsWith('missing:')
        ? `thiếu từ ${f.slice(8).replace(/\//g, ', ')}`
        : f === 'length'
          ? `độ dài phải ${(kind === 'dialogue' ? DIALOGUE_WORDS : PASSAGE_WORDS).join('–')} từ`
          : (RULE_TEXT[f] ?? f),
    )
    .join(', ');

export type PassageStatus = PassageRow['status'];

export interface PassageView extends PassageRow {
  new_word_list: { id: string; word: string }[];
  created_at: string;
  published_at: string | null;
}

/** "Đọc" passages: generate, review, publish (passages.ts). */
@Injectable()
export class PassagesService {
  constructor(
    private readonly llm: StudioLlm,
    private readonly studio: StudioService,
  ) {}

  /** Dialogues teach Giao tiếp phrases (studio_talk_cards, core ones included); passages teach deck words. */
  private async lexiconFor(db: Db, kind: PassageKind): Promise<LexiconCard[]> {
    if (kind === 'text') return this.lexicon(db);
    const talk = rows<{
      card_id: string;
      phrase: string;
      level: string;
      translation_hint: string;
    }>(
      await db
        .from('studio_talk_cards')
        .select('card_id, phrase, level, translation_hint')
        .eq('status', 'approved')
        .order('card_id'),
    );
    return talk.map((t) => ({
      id: t.card_id,
      word: t.phrase,
      level: t.level,
      translation_hint: t.translation_hint,
    }));
  }

  private async lexicon(db: Db): Promise<LexiconCard[]> {
    const [core, studio] = await Promise.all([
      db
        .from('studio_core_cards')
        .select('id, word, level, translation_hint')
        .order('id'),
      db
        .from('studio_cards')
        .select('id, word, level, translation_hint')
        .neq('lifecycle', 'retired')
        .order('created_at'),
    ]);
    return [...rows<LexiconCard>(core), ...rows<LexiconCard>(studio)];
  }

  /** Writes one passage for a level and topic; it waits for review. */
  async generate(
    db: Db,
    userId: string | null,
    input: { level: string; topic: string; words?: number; kind?: string },
  ) {
    const kind: PassageKind = PASSAGE_KINDS.includes(input.kind as PassageKind)
      ? (input.kind as PassageKind)
      : 'text';
    if (!PASSAGE_LEVELS.includes(input.level as PassageLevel))
      throw new BadRequestException('Level không hợp lệ');
    if (!(PASSAGE_TOPICS as readonly string[]).includes(input.topic))
      throw new BadRequestException('Chủ đề không hợp lệ');
    const level = input.level as PassageLevel;
    const n = Math.min(NEW_WORDS[1], Math.max(NEW_WORDS[0], input.words ?? 4));

    const [cards, used, blocklist] = await Promise.all([
      this.lexiconFor(db, kind),
      db.from('studio_passages').select('new_words').neq('status', 'rejected'),
      this.studio.listBlocklist(db),
    ]);
    const usedCount = new Map<string, number>();
    for (const r of rows<{ new_words: string[] }>(used))
      for (const id of r.new_words)
        usedCount.set(id, (usedCount.get(id) ?? 0) + 1);
    const newWords = pickNewWords(cards, usedCount, level, n, Date.now());
    if (newWords.length < NEW_WORDS[0])
      throw new BadRequestException('Không đủ từ ở level này');
    const known = cards
      .filter((c) => c.level === level && !newWords.includes(c))
      .slice(0, 40)
      .map((c) => c.word.toLowerCase());

    let draft: ReturnType<typeof parsePassageReply>;
    let model: string;
    try {
      const out = await this.llm.generateJson(
        buildPassagePrompt({
          level,
          topic: input.topic,
          newWords,
          knownWords: known,
          kind,
        }),
      );
      model = out.model;
      draft = parsePassageReply(out.json);
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new BadGatewayException(`Model AI lỗi: ${message(err)}`);
    }
    if (!draft) throw new BadGatewayException('Model AI trả về sai định dạng');

    const words = newWords.map((c) => c.word);
    const failed = checkPassage(draft, words, blocklist, kind);
    // Saved anyway when only the length is a little off: the editor can fix it.
    if (failed.some((f) => f !== 'length'))
      return { saved: 0, failed: describe(failed, kind) };
    const res = await db
      .from('studio_passages')
      .insert({
        level,
        kind,
        topic: input.topic,
        title: draft.title,
        text: draft.text,
        translation: draft.translation,
        questions: draft.questions,
        new_words: newWords.map((c) => c.id),
        words: deckWordsIn(
          draft.text,
          cards,
          newWords.map((c) => c.id),
        ),
        status: 'pending',
        model,
        prompt_version: PASSAGE_PROMPT_VERSION,
        created_by: userId,
      })
      .select('id')
      .single();
    if (res.error)
      throw new InternalServerErrorException(
        `Không lưu được đoạn văn: ${res.error.message}`,
      );
    return {
      saved: 1,
      id: (res.data as { id: string }).id,
      ...(failed.length > 0 ? { note: describe(failed, kind) } : {}),
    };
  }

  async list(
    db: Db,
    status: PassageStatus,
    limit = 20,
  ): Promise<PassageView[]> {
    const list = rows<PassageView>(
      await db
        .from('studio_passages')
        .select(
          'id, level, kind, topic, title, text, translation, questions, new_words, words, status, created_at, published_at',
        )
        .eq('status', status)
        .order('created_at', { ascending: status === 'pending' })
        .limit(limit),
    );
    const words = new Map(
      [
        ...(await this.lexicon(db)),
        ...(await this.lexiconFor(db, 'dialogue')),
      ].map((c) => [c.id, c.word]),
    );
    return list.map((p) => ({
      ...p,
      new_word_list: p.new_words.map((id) => ({
        id,
        word: words.get(id) ?? id,
      })),
    }));
  }

  /** Approve (optionally with edited text) or reject one passage. */
  async review(
    db: Db,
    userId: string,
    id: string,
    action: 'approve' | 'reject',
    edits?: { title?: string; text?: string; translation?: string },
  ) {
    const row = rows<PassageRow>(
      await db.from('studio_passages').select('*').eq('id', id).limit(1),
    )[0];
    if (!row) throw new NotFoundException('Không tìm thấy đoạn văn');
    const patch: Record<string, unknown> = {
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewer_id: userId,
      reviewed_at: new Date().toISOString(),
    };
    if (action === 'approve') {
      const next = {
        title: edits?.title?.trim() || row.title,
        text: edits?.text?.trim() || row.text,
        translation: edits?.translation?.trim() || row.translation,
      };
      const kind = row.kind ?? 'text';
      const cards = await this.lexiconFor(db, kind);
      const byId = new Map(cards.map((c) => [c.id, c.word]));
      const failed = checkPassage(
        next,
        row.new_words.map((w) => byId.get(w) ?? w),
        await this.studio.listBlocklist(db),
        kind,
      );
      if (failed.length > 0)
        throw new BadRequestException(
          `Đoạn văn chưa đạt: ${describe(failed, kind)}`,
        );
      Object.assign(patch, next, {
        words: deckWordsIn(next.text, cards, row.new_words),
      });
    }
    const res = await db.from('studio_passages').update(patch).eq('id', id);
    if (res.error) throw new Error(res.error.message);
    return { id, status: patch.status };
  }

  async stats(db: Db) {
    const list = rows<{
      status: PassageStatus;
      level: string;
      published_at: string | null;
    }>(await db.from('studio_passages').select('status, level, published_at'));
    const count = (s: PassageStatus) =>
      list.filter((p) => p.status === s).length;
    return {
      pending: count('pending'),
      approved: count('approved'),
      rejected: count('rejected'),
      unpublished: list.filter(
        (p) => p.status === 'approved' && !p.published_at,
      ).length,
      byLevel: Object.fromEntries(
        PASSAGE_LEVELS.map((l) => [
          l,
          list.filter((p) => p.status === 'approved' && p.level === l).length,
        ]),
      ),
    };
  }

  /** Passages saved in the last 24 hours plus card generations: the shared daily cap. */
  private async usedToday(db: Db): Promise<number> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const [cards, passages] = await Promise.all([
      this.studio.generationsToday(db),
      db
        .from('studio_passages')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', since),
    ]);
    if (passages.error)
      throw new InternalServerErrorException(
        `Lỗi database: ${passages.error.message}`,
      );
    return cards + (passages.count ?? 0);
  }

  private async planRows(db: Db) {
    return rows<Pick<PassageRow, 'kind' | 'level' | 'topic' | 'status'>>(
      await db
        .from('studio_passages')
        .select('kind, level, topic, status')
        .neq('status', 'rejected'),
    );
  }

  /** The 100-passage plan (docs/LEXICA_READING_PLAN.md): each cell, topics per kind, today's cap. */
  async plan(db: Db) {
    const [stored, used] = await Promise.all([
      this.planRows(db),
      this.usedToday(db),
    ]);
    const cells = planCells(stored);
    const sum = (f: (c: (typeof cells)[number]) => number) =>
      cells.reduce((n, c) => n + f(c), 0);
    return {
      cells,
      total: {
        target: sum((c) => c.target),
        done: sum((c) => c.bundled + c.approved),
        pending: sum((c) => c.pending),
        missing: sum((c) => c.missing),
      },
      topics: Object.fromEntries(
        PASSAGE_KINDS.map((k) => [k, topicCounts(stored, k)]),
      ),
      next: nextFromPlan(stored, 5),
      usedToday: used,
      maxPerDay: this.studio.maxGenerationsPerDay,
      levels: PASSAGE_PLAN,
    };
  }

  /**
   * Writes the next `count` passages the plan is missing, one by one, and
   * stops at the daily cap. A failed one is reported and the rest go on.
   */
  async generateFromPlan(db: Db, userId: string | null, count: number) {
    const n = Math.min(5, Math.max(1, Math.floor(count) || 1));
    const [stored, used] = await Promise.all([
      this.planRows(db),
      this.usedToday(db),
    ]);
    const picks = nextFromPlan(stored, n);
    const left = this.studio.maxGenerationsPerDay - used;
    const results: ({
      kind: PassageKind;
      level: PassageLevel;
      topic: string;
    } & (
      | { saved: 1; id: string; note?: string }
      | { saved: 0; failed: string }
    ))[] = [];
    for (const [i, pick] of picks.entries()) {
      if (i >= left) break;
      try {
        const r = await this.generate(db, userId, pick);
        results.push({ ...pick, ...r } as (typeof results)[number]);
      } catch (err) {
        results.push({ ...pick, saved: 0, failed: message(err) });
      }
    }
    return {
      results,
      saved: results.filter((r) => r.saved === 1).length,
      ...(picks.length > Math.max(0, left)
        ? {
            stopped: `Đã chạm trần ${this.studio.maxGenerationsPerDay} lượt viết trong 24 giờ`,
          }
        : {}),
      ...(picks.length === 0 ? { stopped: 'Kế hoạch đã đủ bài' } : {}),
    };
  }

  /** Uploads approved passages as a pack and points the manifest at it. */
  async publish(db: Db, userId: string) {
    const approved = rows<PassageRow>(
      await db
        .from('studio_passages')
        .select('*')
        .eq('status', 'approved')
        .order('created_at'),
    );
    if (approved.length === 0)
      throw new BadRequestException('Chưa có đoạn văn nào được duyệt');
    const publishedAt = new Date().toISOString();
    const body = JSON.stringify(buildPassagesFile(approved, publishedAt));
    const { path, hash } = passagesPath(body);
    const { error } = await db.storage.from(BUCKET).upload(path, body, {
      contentType: 'application/json; charset=utf-8',
      cacheControl: '31536000',
      upsert: true,
    });
    if (error) throw new Error(`Upload ${path} failed: ${error.message}`);
    const url = db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    const current = await this.studio.readManifest(db);
    const manifestUrl = await this.studio.writeManifest(
      db,
      userId,
      {
        schema: 1,
        current: null,
        library: null,
        retired: [],
        ...current,
        updatedAt: publishedAt,
        passages: { id: 'passages', url, sha256: hash },
      },
      { passages: approved.length },
      'publish_passages',
    );
    const res = await db
      .from('studio_passages')
      .update({ published_at: publishedAt })
      .eq('status', 'approved');
    if (res.error) throw new Error(res.error.message);
    return { manifestUrl, passages: approved.length };
  }
}
