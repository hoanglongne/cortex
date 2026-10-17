/**
 * Giao tiếp phrase cards for Lexica (docs/LEXICA_DIRECTION.md): an everyday
 * phrase ("running late") in a code-switched Vietnamese sentence, plus a
 * situation to say it in and a model sentence. Generated here, reviewed by
 * an editor, published as the `talk` card pack. Pure functions only.
 */
import { createHash } from 'crypto';
import { hasWord } from './corpus/corpus';
import { validateDraft } from './validator';
import type { BlockRule } from './studio.types';
import { PASSAGE_LEVELS, type PassageLevel } from './passages';

export const TALK_PROMPT_VERSION = 'talk.v1';

export const TALK_TOPICS = [
  'Đi làm',
  'Du lịch',
  'Ăn uống',
  'Mua sắm',
  'Bạn bè',
  'Tin nhắn & điện thoại',
  'Sức khoẻ',
] as const;

/** Phrases per generate call. */
export const TALK_BATCH: readonly [number, number] = [3, 8];

/** Where a level's phrases sit on Lexica's ELO scale. */
export const TALK_ELO: Record<PassageLevel, number> = {
  beginner: 860,
  intermediate: 1010,
  advanced: 1190,
  expert: 1330,
};

const LEVEL_TEXT: Record<PassageLevel, string> = {
  beginner: 'CEFR A2–B1: very common phrases for daily life',
  intermediate: 'CEFR B1–B2: phrases for work and travel',
  advanced: 'CEFR B2–C1: idiomatic phrases at work',
  expert: 'CEFR C1: idioms and nuanced phrases',
};

export interface TalkDraft {
  phrase: string;
  scenario: string;
  translation_hint: string;
  situation_prompt: string;
  situation_model: string;
}

export interface TalkRow extends TalkDraft {
  id: string;
  card_id: string;
  core: boolean;
  level: PassageLevel;
  topic: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function buildTalkPrompt(input: {
  level: PassageLevel;
  topic: string;
  count: number;
  avoid: readonly string[];
}): string {
  return `Bạn là biên tập viên nội dung cho Lexica, app học tiếng Anh cho người Việt. Nhánh "Giao tiếp" dạy cụm từ tiếng Anh đời thường theo cách người Việt vẫn nói: chêm tiếng Anh vào câu tiếng Việt.

Viết ${input.count} thẻ cụm từ:
- Mức: ${LEVEL_TEXT[input.level]}.
- Chủ đề: ${input.topic}.
- Mỗi thẻ là MỘT cụm tiếng Anh 1–5 từ, viết thường, người bản xứ nói hằng ngày (phrasal verb, cụm cố định, câu ngắn quen thuộc). Không phải từ học thuật.
- Không dùng các cụm đã có: ${input.avoid.slice(0, 80).join(', ') || '(chưa có)'}.

Với mỗi cụm:
- "scenario": một câu tiếng Việt tự nhiên (40–150 ký tự), chêm đúng cụm đó y nguyên, viết thường, như người Việt nói thật. Đọc câu phải đoán được nghĩa.
- "translation_hint": nghĩa tiếng Việt ngắn (dưới 40 ký tự).
- "situation_prompt": một tình huống ngắn bằng tiếng Việt để người học tự nói, bắt đầu bằng động từ hoặc "Bạn..." (ví dụ "Bạn kẹt xe, nhắn cho sếp là sẽ đến trễ.").
- "situation_model": một câu tiếng Anh mẫu cho tình huống đó, dưới 15 từ, có cụm y nguyên (động từ đầu có thể chia: "running late", "followed up").
- Cấm: chính trị, tôn giáo, miệt thị, tên người thật, chửi thề, nội dung 18+.

Chỉ trả về JSON:
{"cards":[{"phrase":"running late","scenario":"...","translation_hint":"...","situation_prompt":"...","situation_model":"..."}]}`;
}

const isStr = (v: unknown): v is string =>
  typeof v === 'string' && v.trim().length > 0;

/** The model's cards; malformed entries are dropped. */
export function parseTalkReply(json: unknown): TalkDraft[] {
  const list = (json as { cards?: unknown } | null)?.cards;
  if (!Array.isArray(list)) return [];
  const out: TalkDraft[] = [];
  for (const item of list) {
    const d = item as Record<string, unknown>;
    if (
      !isStr(d?.phrase) ||
      !isStr(d.scenario) ||
      !isStr(d.translation_hint) ||
      !isStr(d.situation_prompt) ||
      !isStr(d.situation_model)
    )
      continue;
    out.push({
      phrase: d.phrase.trim().toLowerCase().replace(/\s+/g, ' '),
      scenario: d.scenario.trim(),
      translation_hint: d.translation_hint.trim(),
      situation_prompt: d.situation_prompt.trim(),
      situation_model: d.situation_model.trim(),
    });
  }
  return out;
}

/** Rules a phrase card must pass. Returns the failed rule names; empty = usable. */
export function checkTalkCard(
  d: TalkDraft,
  existing: ReadonlySet<string>,
  blocklist: readonly BlockRule[],
): string[] {
  const failed: string[] = [];
  const words = d.phrase.split(' ');
  if (!/^[a-z' ]{2,40}$/.test(d.phrase) || words.length > 5)
    failed.push('phrase');
  if (existing.has(d.phrase)) failed.push('duplicate');
  if (
    d.scenario.length < 30 ||
    d.scenario.length > 170 ||
    !d.scenario.toLowerCase().includes(d.phrase)
  )
    failed.push('scenario');
  if (d.translation_hint.length > 50) failed.push('translation');
  if (d.situation_prompt.length < 8 || d.situation_prompt.length > 140)
    failed.push('situation');
  if (
    d.situation_model.split(/\s+/).length > 18 ||
    !hasWord(d.situation_model, d.phrase)
  )
    failed.push('model');
  const report = validateDraft(
    { word: words[0] ?? 'x', scenario: `${d.scenario} ${d.situation_model}` },
    {
      lexicon: new Set([words[0] ?? 'x']),
      blocklist,
      existingScenarios: new Set(),
      sameWordScenarios: [],
      recentWords: new Set(),
    },
  );
  if (!report.rules.blocklist?.pass) failed.push('blocklist');
  return failed;
}

/** Card id for a phrase row: "k" + 7 hex chars of its uuid. Core phrases are "g###". */
export const talkCardId = (rowId: string) =>
  `k${rowId.replace(/-/g, '').slice(0, 7)}`;

export interface TalkPack {
  schema: 1;
  id: 'talk';
  title: string;
  publishedAt: string;
  cards: {
    id: string;
    word: string;
    elo: number;
    level: PassageLevel;
    scenario: string;
    translationHint: string;
    branch: 'talk';
    situation: { prompt: string; model: string };
  }[];
}

/** Approved, non-core phrases as a card pack (core phrases ship with the app). */
export function buildTalkPack(
  rows: readonly TalkRow[],
  publishedAt: string,
): TalkPack {
  return {
    schema: 1,
    id: 'talk',
    title: 'Giao tiếp',
    publishedAt,
    cards: rows
      .filter((r) => r.status === 'approved' && !r.core)
      .map((r) => ({
        id: r.card_id,
        word: r.phrase,
        elo: TALK_ELO[r.level],
        level: r.level,
        scenario: r.scenario,
        translationHint: r.translation_hint,
        branch: 'talk' as const,
        situation: { prompt: r.situation_prompt, model: r.situation_model },
      })),
  };
}

export function talkPath(body: string): { path: string; hash: string } {
  const hash = createHash('sha256').update(body, 'utf8').digest('hex');
  return { path: `packs/talk.${hash.slice(0, 12)}.json`, hash };
}

export const isTalkLevel = (v: string): v is PassageLevel =>
  (PASSAGE_LEVELS as readonly string[]).includes(v);
