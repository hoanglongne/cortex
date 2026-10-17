import { ARCHETYPES, type Archetype, type LexemeRow } from './studio.types';
import { angleFor, VOICE_EXAMPLES, VOICE_RULES } from './voice';

export const PROMPT_VERSION = 'generate.v4';

export interface PromptInput {
  trend: { label: string; summary: string | null; tags: string[] };
  /** Candidate words; the model must pick from these only. */
  candidates: Pick<LexemeRow, 'word' | 'level'>[];
  /** Words the editor asked for; when set the model must use exactly these. */
  forcedWords: string[];
  wordsPerTrend: number;
  sentencesPerWord: number;
  /** Rotates the situation angles offered, so consecutive batches differ. */
  angleOffset?: number;
}

export function buildPrompt(input: PromptInput): string {
  const words =
    input.forcedWords.length > 0
      ? `Dùng ĐÚNG các từ sau: ${input.forcedWords.join(', ')}.`
      : `Chọn ${input.wordsPerTrend} từ hợp với trend nhất trong danh sách (chỉ được chọn trong danh sách này):\n${input.candidates
          .map((c) => `- ${c.word} (${c.level})`)
          .join('\n')}`;
  const angles = Array.from(
    { length: Math.max(input.sentencesPerWord, 3) },
    (_, i) => angleFor(i, input.angleOffset ?? 0),
  );

  return `Bạn là biên tập viên nội dung cho Lexica, app học từ vựng tiếng Anh cho người Việt 18–30 tuổi.
${VOICE_RULES}

${VOICE_EXAMPLES}

TREND: ${input.trend.label}
NGỮ CẢNH: ${input.trend.summary ?? '(không có)'}
${input.trend.tags.length ? `CHỦ ĐỀ: ${input.trend.tags.join(', ')}\n` : ''}
${words}

Với MỖI từ, viết ${input.sentencesPerWord} câu, mỗi câu một tình huống khác nhau, lần lượt:\n${angles.map((a) => `- ${a}`).join('\n')}\nMỗi câu:
- Là câu tiếng Việt tự nhiên, nhúng đúng 1 từ tiếng Anh, viết HOA toàn bộ từ đó (ví dụ FRUGAL). Không viết hoa từ tiếng Anh nào khác.
- Dùng từ đúng nghĩa và đúng từ loại; chỉ dùng dạng gốc hoặc biến thể có quy tắc (-s, -ed, -ing, -ly).
- Dài 40–140 ký tự. Người đọc phải đoán được nghĩa từ ngữ cảnh.
- Gắn với trend nhưng vẫn hiểu được nếu không biết trend.
- Cấm: chính trị, tôn giáo, miệt thị giới tính/vùng miền/ngoại hình, tên người thật, chửi thề nặng, nội dung 18+, thảm hoạ/tai nạn/vụ án.

Trước khi trả lời, tự đọc lại từng câu: câu nào chưa có tình huống cụ thể, hoặc đọc như định nghĩa thì viết lại.

Với mỗi từ, kèm "translation_hint": nghĩa tiếng Việt ngắn gọn (dưới 40 ký tự), và "collocations": đúng 2 cụm tiếng Anh ngắn, viết thường, có chứa từ đó, mà người bản xứ hay dùng (ví dụ "abundant supply", "an abundant harvest").
"archetype" là một trong: ${ARCHETYPES.join(', ')}. "angle" là tình huống đã dùng.

Chỉ trả về JSON đúng dạng:
{"drafts":[{"word":"frugal","scenario":"...","translation_hint":"...","collocations":["frugal lifestyle","a frugal meal"],"archetype":"casual","angle":"tình huống học tập"}]}`;
}

export interface RawDraft {
  word: string;
  scenario: string;
  translation_hint: string;
  collocations: string[];
  archetype: Archetype | null;
  tone: string | null;
}

/** At most two short phrases that contain the word; anything else is dropped. */
export function parseCollocations(raw: unknown, word: string): string[] {
  if (!Array.isArray(raw)) return [];
  const w = word.toLowerCase();
  return raw
    .filter((c): c is string => typeof c === 'string')
    .map((c) => c.trim().toLowerCase().replace(/\s+/g, ' '))
    .filter(
      (c) => c.length > 0 && c.length <= 40 && c.split(/[^a-z'-]+/).includes(w),
    )
    .slice(0, 2);
}

const isStr = (v: unknown): v is string =>
  typeof v === 'string' && v.trim().length > 0;

/** Parses model output; malformed entries are dropped. Throws if nothing usable. */
export function parseDrafts(raw: unknown): RawDraft[] {
  const list = (raw as { drafts?: unknown } | null)?.drafts;
  if (!Array.isArray(list)) throw new Error('Model output has no drafts array');
  const out: RawDraft[] = [];
  for (const item of list) {
    if (typeof item !== 'object' || item === null) continue;
    const d = item as Record<string, unknown>;
    if (!isStr(d.word) || !isStr(d.scenario) || !isStr(d.translation_hint))
      continue;
    out.push({
      word: d.word.trim().toLowerCase(),
      scenario: d.scenario.trim(),
      translation_hint: d.translation_hint.trim(),
      collocations: parseCollocations(d.collocations, d.word.trim()),
      archetype: ARCHETYPES.includes(d.archetype as Archetype)
        ? (d.archetype as Archetype)
        : null,
      // The situation angle is stored as the draft's tone.
      tone: isStr(d.angle)
        ? d.angle.trim().slice(0, 40)
        : isStr(d.tone)
          ? d.tone.trim().slice(0, 40)
          : null,
    });
  }
  if (out.length === 0) throw new Error('Model output has no valid drafts');
  return out;
}

/**
 * Picks candidate words for a trend: least used first, spread across levels,
 * shuffled so each run offers the model a different mix.
 */
export function pickCandidates<T extends Pick<LexemeRow, 'word' | 'level'>>(
  lexemes: T[],
  count: number,
  random: () => number = Math.random,
): T[] {
  const byLevel = new Map<string, T[]>();
  for (const l of lexemes) {
    const list = byLevel.get(l.level) ?? [];
    list.push(l);
    byLevel.set(l.level, list);
  }
  const buckets = [...byLevel.values()];
  const out: T[] = [];
  let i = 0;
  while (out.length < count && buckets.some((b) => b.length > 0)) {
    const bucket = buckets[i++ % buckets.length];
    if (bucket.length === 0) continue;
    // Bias toward the front (least used) but keep some randomness.
    const idx = Math.floor(random() * Math.min(bucket.length, 8));
    out.push(bucket.splice(idx, 1)[0]);
  }
  return out;
}
