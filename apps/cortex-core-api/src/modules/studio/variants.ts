import { createHash } from 'node:crypto';
import type { BlockRule } from './studio.types';
import { normalize, validateDraft } from './validator';
import { angleFor, VOICE_EXAMPLES, VOICE_RULES } from './voice';

/**
 * Example sentences per learner archetype ("câu ví dụ theo hình mẫu").
 * Every card's own scenario is the casual one; Studio writes a tech, a
 * business and a student version, an editor approves them, and they ship as
 * one overlay file that Lexica lays over core and Studio cards alike. Written
 * once at publish time, so there is no per-learner AI cost. Pure, unit tested.
 */

import type { PublishedQuote } from './quotes';

export const VARIANT_ARCHETYPES = ['tech', 'business', 'student'] as const;
export type VariantArchetype = (typeof VARIANT_ARCHETYPES)[number];

export const ARCHETYPE_LABEL: Record<VariantArchetype, string> = {
  tech: 'dân tech (dev, designer, làm startup)',
  business: 'dân văn phòng (sếp, họp, KPI, khách hàng)',
  student: 'sinh viên (thi cử, deadline bài tập, ký túc xá, đi làm thêm)',
};

export const VARIANTS_PROMPT_VERSION = 'variants.v4';
/** Cards per model call: small enough for one JSON answer. */
export const VARIANT_BATCH = 10;

export interface SourceCard {
  id: string;
  word: string;
  scenario: string;
  translation_hint: string;
}

export interface RawVariant {
  card_id: string;
  archetype: VariantArchetype;
  scenario: string;
}

export function buildVariantsPrompt(
  cards: readonly SourceCard[],
  angleOffset = 0,
): string {
  return `Bạn là biên tập viên nội dung cho Lexica, app học từ vựng tiếng Anh cho người Việt 18–30 tuổi.
Mỗi thẻ có sẵn một câu ví dụ đời thường. Hãy viết thêm cho MỖI thẻ 3 câu mới, mỗi câu cho một kiểu người học:
${VARIANT_ARCHETYPES.map((a) => `- ${a}: ${ARCHETYPE_LABEL[a]}`).join('\n')}

${VOICE_RULES}

${VOICE_EXAMPLES}

Mỗi câu:
- Là câu tiếng Việt tự nhiên, nhúng đúng 1 từ tiếng Anh là từ của thẻ, viết HOA toàn bộ từ đó. Không viết hoa từ tiếng Anh nào khác.
- Dùng từ đúng với nghĩa đã cho và đúng từ loại; chỉ dùng dạng gốc hoặc biến thể có quy tắc (-s, -ed, -ing, -ly).
- Dài 40–140 ký tự. Người đọc đoán được nghĩa từ ngữ cảnh.
- Tình huống phải là chuyện rất riêng của kiểu người học đó (chi tiết mà người trong nghề mới biết), khác hẳn câu gốc.
- Ba câu của một thẻ dùng ba tình huống khác nhau.
- Cấm: chính trị, tôn giáo, miệt thị, tên người thật, chửi thề nặng, nội dung 18+, thảm hoạ/tai nạn/vụ án.

Trước khi trả lời, tự đọc lại: câu nào chưa có tình huống cụ thể, hoặc đọc như định nghĩa thì viết lại.

THẺ:
${cards
  .map(
    (c, i) =>
      `- id=${c.id} | từ=${c.word.toUpperCase()} | nghĩa=${c.translation_hint} | câu gốc: ${c.scenario} | tình huống gợi ý: ${VARIANT_ARCHETYPES.map((a, j) => `${a}=${angleFor(i * 3 + j, angleOffset)}`).join(', ')}`,
  )
  .join('\n')}

Chỉ trả về JSON đúng dạng:
{"variants":[{"card_id":"v001","tech":"...","business":"...","student":"..."}]}`;
}

const isStr = (v: unknown): v is string =>
  typeof v === 'string' && v.trim().length > 0;

/**
 * Finds the variant list in model output. Models do not always keep the
 * asked shape: accept {variants:[…]}, a bare array, any single array
 * property, or an object keyed by card id.
 */
const isList = (v: unknown): v is unknown[] => Array.isArray(v);

function variantList(raw: unknown): unknown[] | null {
  if (isList(raw)) return raw;
  if (typeof raw !== 'object' || raw === null) return null;
  const obj = raw as Record<string, unknown>;
  if (isList(obj.variants)) return obj.variants;
  const arrays = Object.values(obj).filter(isList);
  if (arrays.length === 1) return arrays[0];
  const keyed = Object.entries(obj.variants ?? obj).filter(
    ([, v]) => typeof v === 'object' && v !== null && !Array.isArray(v),
  );
  return keyed.length > 0
    ? keyed.map(([id, v]) => ({ card_id: id, ...(v as object) }))
    : null;
}

/** Parses model output for the cards asked about; unknown ids and blanks are dropped. */
export function parseVariants(
  raw: unknown,
  askedIds: ReadonlySet<string>,
): RawVariant[] {
  const list = variantList(raw);
  if (!list) throw new Error('Model output has no variants array');
  const out: RawVariant[] = [];
  for (const item of list) {
    if (typeof item !== 'object' || item === null) continue;
    const v = item as Record<string, unknown>;
    if (!isStr(v.card_id) || !askedIds.has(v.card_id)) continue;
    for (const archetype of VARIANT_ARCHETYPES) {
      const scenario = v[archetype];
      if (isStr(scenario)) {
        out.push({ card_id: v.card_id, archetype, scenario: scenario.trim() });
      }
    }
  }
  return out;
}

/**
 * Same hard rules as generated drafts (length, one upper-case target word,
 * blocklist, not a copy) plus no clichés, minus the lexicon and fatigue rules that only make
 * sense for new cards. Returns the failed rule names; empty means usable.
 */
export function checkVariant(
  variant: { scenario: string },
  card: SourceCard,
  blocklist: readonly BlockRule[],
  taken: readonly string[],
): string[] {
  const word = card.word.toLowerCase();
  const report = validateDraft(
    { word, scenario: variant.scenario },
    {
      lexicon: new Set([word]),
      blocklist,
      existingScenarios: new Set(taken.map(normalize)),
      sameWordScenarios: taken,
      recentWords: new Set(),
    },
  );
  return Object.entries(report.rules)
    .filter(
      ([name, r]) =>
        !r.pass && (r.hard || name === 'dup_near' || name === 'cliche'),
    )
    .map(([name]) => name);
}

export interface VariantsFile {
  schema: 1;
  id: 'variants';
  publishedAt: string;
  variants: Record<string, Partial<Record<VariantArchetype, string>>>;
  /** "Ngoài đời" quotes per card (quotes.ts); absent in files published before them. */
  quotes?: Record<string, PublishedQuote[]>;
}

/** The overlay Lexica downloads: approved variants keyed by card id. */
export function buildVariantsFile(
  rows: readonly {
    card_id: string;
    archetype: VariantArchetype;
    scenario: string;
  }[],
  publishedAt: string,
  quotes: Record<string, PublishedQuote[]> = {},
): VariantsFile {
  const variants: VariantsFile['variants'] = {};
  for (const r of [...rows].sort((a, b) =>
    a.card_id.localeCompare(b.card_id),
  )) {
    (variants[r.card_id] ??= {})[r.archetype] = r.scenario;
  }
  return {
    schema: 1,
    id: 'variants',
    publishedAt,
    variants,
    ...(Object.keys(quotes).length > 0 ? { quotes } : {}),
  };
}

export function variantsPath(body: string): { path: string; hash: string } {
  const hash = createHash('sha256').update(body, 'utf8').digest('hex');
  return { path: `packs/variants.${hash.slice(0, 12)}.json`, hash };
}
