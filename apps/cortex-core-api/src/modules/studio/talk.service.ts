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
  buildTalkPack,
  buildTalkPrompt,
  checkTalkCard,
  isTalkLevel,
  parseTalkReply,
  TALK_BATCH,
  TALK_PROMPT_VERSION,
  TALK_TOPICS,
  talkCardId,
  talkPath,
  type TalkDraft,
  type TalkRow,
} from './talk';
import { PASSAGE_LEVELS } from './passages';

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
  phrase: 'cụm không hợp lệ (1–5 từ tiếng Anh)',
  duplicate: 'đã có cụm này',
  scenario: 'câu tiếng Việt thiếu cụm hoặc sai độ dài',
  translation: 'nghĩa quá dài',
  situation: 'tình huống quá ngắn hoặc quá dài',
  model: 'câu mẫu thiếu cụm hoặc quá dài',
  blocklist: 'chạm danh sách chặn',
};
const describe = (failed: string[]) =>
  failed.map((f) => RULE_TEXT[f] ?? f).join(', ');

export type TalkStatus = TalkRow['status'];

/** Giao tiếp phrase cards: generate, review, publish (talk.ts). */
@Injectable()
export class TalkService {
  constructor(
    private readonly llm: StudioLlm,
    private readonly studio: StudioService,
  ) {}

  private async phrases(db: Db): Promise<Set<string>> {
    const list = rows<{ phrase: string }>(
      await db
        .from('studio_talk_cards')
        .select('phrase')
        .neq('status', 'rejected'),
    );
    return new Set(list.map((r) => r.phrase));
  }

  /** Writes a batch of phrase cards for a level and topic; they wait for review. */
  async generate(
    db: Db,
    userId: string | null,
    input: { level: string; topic: string; count?: number },
  ) {
    if (!isTalkLevel(input.level))
      throw new BadRequestException('Level không hợp lệ');
    if (!(TALK_TOPICS as readonly string[]).includes(input.topic))
      throw new BadRequestException('Chủ đề không hợp lệ');
    const count = Math.min(
      TALK_BATCH[1],
      Math.max(TALK_BATCH[0], input.count ?? 5),
    );
    const [existing, blocklist] = await Promise.all([
      this.phrases(db),
      this.studio.listBlocklist(db),
    ]);

    let drafts: TalkDraft[];
    let model: string;
    try {
      const out = await this.llm.generateJson(
        buildTalkPrompt({
          level: input.level,
          topic: input.topic,
          count,
          avoid: [...existing],
        }),
      );
      model = out.model;
      drafts = parseTalkReply(out.json);
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new BadGatewayException(`Model AI lỗi: ${message(err)}`);
    }
    if (drafts.length === 0)
      throw new BadGatewayException('Model AI trả về sai định dạng');

    const saved: string[] = [];
    const failed: { phrase: string; reason: string }[] = [];
    for (const d of drafts) {
      const bad = checkTalkCard(d, existing, blocklist);
      if (bad.length > 0) {
        failed.push({ phrase: d.phrase, reason: describe(bad) });
        continue;
      }
      existing.add(d.phrase);
      const id = crypto.randomUUID();
      const res = await db.from('studio_talk_cards').insert({
        id,
        card_id: talkCardId(id),
        level: input.level,
        topic: input.topic,
        ...d,
        status: 'pending',
        model,
        prompt_version: TALK_PROMPT_VERSION,
        created_by: userId,
      });
      if (res.error)
        throw new InternalServerErrorException(
          `Không lưu được thẻ: ${res.error.message}`,
        );
      saved.push(d.phrase);
    }
    return { saved: saved.length, phrases: saved, failed };
  }

  async list(db: Db, status: TalkStatus, limit = 40) {
    return rows<TalkRow & { created_at: string; published_at: string | null }>(
      await db
        .from('studio_talk_cards')
        .select(
          'id, card_id, core, level, topic, phrase, scenario, translation_hint, situation_prompt, situation_model, status, created_at, published_at',
        )
        .eq('status', status)
        .eq('core', false)
        .order('created_at', { ascending: status === 'pending' })
        .limit(limit),
    );
  }

  /** Approve (optionally with edits) or reject one phrase card. */
  async review(
    db: Db,
    userId: string,
    id: string,
    action: 'approve' | 'reject',
    edits: Partial<TalkDraft> = {},
  ) {
    const row = rows<TalkRow>(
      await db.from('studio_talk_cards').select('*').eq('id', id).limit(1),
    )[0];
    if (!row) throw new NotFoundException('Không tìm thấy thẻ');
    const patch: Record<string, unknown> = {
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewer_id: userId,
      reviewed_at: new Date().toISOString(),
    };
    if (action === 'approve') {
      const pick = (k: keyof TalkDraft) => edits[k]?.trim() || row[k];
      const next: TalkDraft = {
        phrase: pick('phrase').toLowerCase(),
        scenario: pick('scenario'),
        translation_hint: pick('translation_hint'),
        situation_prompt: pick('situation_prompt'),
        situation_model: pick('situation_model'),
      };
      const others = await this.phrases(db);
      others.delete(row.phrase);
      const failed = checkTalkCard(
        next,
        others,
        await this.studio.listBlocklist(db),
      );
      if (failed.length > 0)
        throw new BadRequestException(`Thẻ chưa đạt: ${describe(failed)}`);
      Object.assign(patch, next);
    }
    const res = await db.from('studio_talk_cards').update(patch).eq('id', id);
    if (res.error) throw new Error(res.error.message);
    return { id, status: patch.status };
  }

  async stats(db: Db) {
    const list = rows<{
      status: TalkStatus;
      level: string;
      core: boolean;
      published_at: string | null;
    }>(
      await db
        .from('studio_talk_cards')
        .select('status, level, core, published_at'),
    );
    const own = list.filter((r) => !r.core);
    const count = (s: TalkStatus) => own.filter((p) => p.status === s).length;
    return {
      pending: count('pending'),
      approved: count('approved'),
      rejected: count('rejected'),
      core: list.length - own.length,
      unpublished: own.filter((p) => p.status === 'approved' && !p.published_at)
        .length,
      byLevel: Object.fromEntries(
        PASSAGE_LEVELS.map((l) => [
          l,
          list.filter((p) => p.status === 'approved' && p.level === l).length,
        ]),
      ),
    };
  }

  /** Uploads approved phrases as the `talk` pack and points the manifest at it. */
  async publish(db: Db, userId: string) {
    const approved = rows<TalkRow>(
      await db
        .from('studio_talk_cards')
        .select('*')
        .eq('status', 'approved')
        .eq('core', false)
        .order('created_at'),
    );
    if (approved.length === 0)
      throw new BadRequestException('Chưa có thẻ giao tiếp nào được duyệt');
    const publishedAt = new Date().toISOString();
    const body = JSON.stringify(buildTalkPack(approved, publishedAt));
    const { path, hash } = talkPath(body);
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
        talk: { id: 'talk', url, sha256: hash },
      },
      { talk: approved.length },
      'publish_talk',
    );
    const res = await db
      .from('studio_talk_cards')
      .update({ published_at: publishedAt })
      .eq('status', 'approved')
      .eq('core', false);
    if (res.error) throw new Error(res.error.message);
    return { manifestUrl, cards: approved.length };
  }
}
