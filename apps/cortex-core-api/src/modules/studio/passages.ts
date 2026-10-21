/**
 * "Đọc" passages for Lexica (docs/LEXICA_FEEDBACK_TASKS.md T7): a short
 * English text at one level, on one topic, written around 3–5 deck words the
 * learner may not know yet. Generated here, reviewed by an editor like
 * cards, published as a pack the app downloads. Pure functions only.
 */
import { createHash } from 'crypto';
import { hasWord, lemma, sentenceLemmas } from './corpus/corpus';
import { validateDraft } from './validator';
import type { BlockRule } from './studio.types';

export const PASSAGE_PROMPT_VERSION = 'passage.v1';
export const PASSAGE_LEVELS = [
  'beginner',
  'intermediate',
  'advanced',
  'expert',
] as const;
export type PassageLevel = (typeof PASSAGE_LEVELS)[number];

/** Same list as Lexica's lib/content/passages.ts. */
export const PASSAGE_TOPICS = [
  'Đời sống',
  'Công việc',
  'Tiền bạc',
  'Công nghệ',
  'Giáo dục',
  'Sức khoẻ',
  'Du lịch',
  'Môi trường',
  'Xã hội',
] as const;

/** English words per passage. */
export const PASSAGE_WORDS: readonly [number, number] = [120, 200];
/** English words per dialogue (Giao tiếp branch): shorter, one line per turn. */
export const DIALOGUE_WORDS: readonly [number, number] = [60, 170];

export type PassageKind = 'text' | 'dialogue';
export const PASSAGE_KINDS: readonly PassageKind[] = ['text', 'dialogue'];
export const NEW_WORDS: readonly [number, number] = [3, 5];

const LEVEL_TEXT: Record<PassageLevel, string> = {
  beginner: 'CEFR A2–B1 (IELTS 4.5–5.5): short sentences, everyday words',
  intermediate: 'CEFR B1–B2 (IELTS 5.5–6.5)',
  advanced: 'CEFR B2–C1 (IELTS 6.5–7.5)',
  expert: 'CEFR C1 (IELTS 7.5+)',
};

export interface LexiconCard {
  id: string;
  word: string;
  level: string;
  translation_hint: string;
}

export interface PassageDraft {
  title: string;
  text: string;
  translation: string;
  questions: { question: string; options: string[]; answer: number }[];
}

export interface PassageRow extends PassageDraft {
  id: string;
  /** 'dialogue' rows teach Giao tiếp phrases; missing on rows saved before. */
  kind?: PassageKind;
  level: PassageLevel;
  topic: string;
  new_words: string[];
  words: string[];
  status: 'pending' | 'approved' | 'rejected';
}

export function wordCount(text: string): number {
  return text.split(/\s+/).filter((t) => /[a-z]/i.test(t)).length;
}

/**
 * The new words for the next passage: cards of the level used in the fewest
 * passages so far (core cards first: those are what most learners still
 * meet), one card per word, spread by a seeded shuffle within the least used.
 */
export function pickNewWords(
  cards: readonly LexiconCard[],
  usedCount: ReadonlyMap<string, number>,
  level: PassageLevel,
  n = 4,
  seed = 0,
): LexiconCard[] {
  const seenWord = new Set<string>();
  const pool = cards.filter((c) => {
    if (c.level !== level) return false;
    const key = c.word.toLowerCase();
    if (seenWord.has(key)) return false;
    seenWord.add(key);
    return true;
  });
  const score = (c: LexiconCard) =>
    (usedCount.get(c.id) ?? 0) * 1000 +
    (/^[vg]\d/.test(c.id) ? 0 : 500) +
    (hash(`${seed}:${c.id}`) % 500);
  return [...pool].sort((a, b) => score(a) - score(b)).slice(0, n);
}

function hash(s: string): number {
  return createHash('md5').update(s).digest().readUInt32BE(0);
}

export function buildPassagePrompt(input: {
  level: PassageLevel;
  topic: string;
  newWords: readonly LexiconCard[];
  knownWords: readonly string[];
  kind?: PassageKind;
}): string {
  const list = input.newWords
    .map((c) => `- ${c.word.toLowerCase()} (${c.translation_hint})`)
    .join('\n');
  if (input.kind === 'dialogue') {
    return `You write short everyday dialogues for Vietnamese learners of English (the "Giao tiếp" branch of an app).

Write ONE dialogue:
- Level: ${LEVEL_TEXT[input.level]}.
- Topic: ${input.topic} (Vietnamese label; a Vietnamese or international everyday setting: a café, an office, a hotel, a chat between friends).
- Two people with short first names (one may be Vietnamese), 6–10 turns, ${DIALOGUE_WORDS[0]}–${DIALOGUE_WORDS[1]} English words in total.
- Each turn is ONE line: "Name: what they say". No narration, no stage directions.
- It must use EACH of these phrases at least once, naturally, so the meaning is clear (the first word may be inflected: "followed up", "makes sense"):
${list}
- Natural spoken English: contractions, short sentences. No slang that depends on wordplay, no politics, religion, violence or brand names.
- Also give a natural Vietnamese translation with the same lines and the same names, a short Vietnamese title (max 8 words), and 2 simple comprehension questions in English with 3–4 options each (index of the right option in "answer").

Reply with JSON only:
{"title": "...", "text": "Name: ...\nName: ...", "translation": "Name: ...\nName: ...", "questions": [{"question": "...", "options": ["...", "..."], "answer": 0}]}`;
  }
  return `You write short reading passages for Vietnamese learners of English.

Write ONE passage:
- Level: ${LEVEL_TEXT[input.level]}.
- Topic: ${input.topic} (Vietnamese label; write about it in English, in a Vietnamese or international everyday setting).
- Length: ${PASSAGE_WORDS[0]}–${PASSAGE_WORDS[1]} English words, 2–4 short paragraphs separated by a blank line.
- It must use EACH of these words at least once, in a way that makes the meaning clear from context:
${list}
- You may also use some of these words the learner already knows: ${input.knownWords.slice(0, 20).join(', ') || '(none)'}.
- A realistic, meaningful moment of ordinary life (work, study, family, friends, a city, health, money, a small decision) that an adult would find worth reading. No fantasy, no crime, no silly plot twists.
- Neutral, clear, friendly tone. No slang, no jokes that depend on wordplay, no politics, religion, violence or brand names.
- Also give a natural Vietnamese translation with the same paragraphs, a short Vietnamese title (max 8 words), and 2 simple comprehension questions in English with 3–4 options each (index of the right option in "answer").

Reply with JSON only:
{"title": "...", "text": "...", "translation": "...", "questions": [{"question": "...", "options": ["...", "..."], "answer": 0}]}`;
}

const isStr = (v: unknown): v is string =>
  typeof v === 'string' && v.trim().length > 0;

/** The model's reply as a draft, or null when it is not usable at all. */
export function parsePassageReply(json: unknown): PassageDraft | null {
  if (typeof json !== 'object' || json === null) return null;
  const o = json as Record<string, unknown>;
  if (!isStr(o.title) || !isStr(o.text) || !isStr(o.translation)) return null;
  const questions = Array.isArray(o.questions)
    ? o.questions
        .map((q) => {
          const x = q as Record<string, unknown>;
          const options = Array.isArray(x?.options)
            ? x.options.filter(isStr).slice(0, 4)
            : [];
          const answer = Number(x?.answer);
          if (!isStr(x?.question) || options.length < 2) return null;
          if (
            !Number.isInteger(answer) ||
            answer < 0 ||
            answer >= options.length
          )
            return null;
          return { question: x.question.trim(), options, answer };
        })
        .filter((q): q is PassageDraft['questions'][number] => q !== null)
        .slice(0, 2)
    : [];
  return {
    title: o.title.trim().slice(0, 80),
    text: o.text.replace(/\r/g, '').trim(),
    translation: o.translation.replace(/\r/g, '').trim(),
    questions,
  };
}

/** Rules a passage must pass. Returns the failed rule names; empty = usable. */
export function checkPassage(
  draft: Pick<PassageDraft, 'text' | 'translation' | 'title'>,
  newWords: readonly string[],
  blocklist: readonly BlockRule[],
  kind: PassageKind = 'text',
): string[] {
  const failed: string[] = [];
  const n = wordCount(draft.text);
  const [min, max] = kind === 'dialogue' ? DIALOGUE_WORDS : PASSAGE_WORDS;
  if (n < min || n > max) failed.push('length');
  if (kind === 'dialogue' && !isDialogue(draft.text)) failed.push('dialogue');
  const missing = newWords.filter((w) => !hasWord(draft.text, w));
  if (missing.length > 0) failed.push(`missing:${missing.join('/')}`);
  if (
    !draft.translation.trim() ||
    draft.translation.length < draft.text.length / 3
  )
    failed.push('translation');
  if (!draft.title.trim()) failed.push('title');
  const report = validateDraft(
    { word: newWords[0] ?? 'x', scenario: draft.text.slice(0, 2000) },
    {
      lexicon: new Set(newWords),
      blocklist,
      existingScenarios: new Set(),
      sameWordScenarios: [],
      recentWords: new Set(),
    },
  );
  if (!report.rules.blocklist?.pass) failed.push('blocklist');
  return failed;
}

/** Every non-empty line is "Name: words", with at least two speakers. */
export function isDialogue(text: string): boolean {
  const lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  const speakers = new Set<string>();
  for (const line of lines) {
    const m = /^([^:]{1,24}):\s*\S/.exec(line);
    if (!m) return false;
    speakers.add(m[1].trim().toLowerCase());
  }
  return lines.length >= 4 && speakers.size >= 2;
}

/** Other deck cards whose word appears in the text (shown as "known" words). */
export function deckWordsIn(
  text: string,
  cards: readonly Pick<LexiconCard, 'id' | 'word'>[],
  exclude: readonly string[],
): string[] {
  const lemmas = new Set(sentenceLemmas(text));
  const skip = new Set(exclude);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of cards) {
    const key = c.word.toLowerCase();
    if (skip.has(c.id) || seen.has(key)) continue;
    seen.add(key);
    const phrase = /\s/.test(key);
    if ((phrase || lemmas.has(lemma(key))) && hasWord(text, key))
      out.push(c.id);
  }
  return out.slice(0, 60);
}

/** The published passage, as Lexica's lib/content/passages.ts reads it. */
export interface PublishedPassage {
  id: string;
  level: PassageLevel;
  topic: string;
  title: string;
  text: string;
  translation: string;
  newWords: string[];
  words: string[];
  questions?: PassageDraft['questions'];
  kind?: 'dialogue';
}

export interface PassagesFile {
  schema: 1;
  id: 'passages';
  publishedAt: string;
  passages: PublishedPassage[];
}

/** Short stable id for a passage row ("s" + 8 hex chars of its uuid). */
export const publishedId = (rowId: string) =>
  `s${rowId.replace(/-/g, '').slice(0, 8)}`;

export function buildPassagesFile(
  rows: readonly PassageRow[],
  publishedAt: string,
): PassagesFile {
  return {
    schema: 1,
    id: 'passages',
    publishedAt,
    passages: rows
      .filter((r) => r.status === 'approved')
      .map((r) => ({
        id: publishedId(r.id),
        level: r.level,
        topic: r.topic,
        title: r.title,
        text: r.text,
        translation: r.translation,
        newWords: r.new_words,
        words: r.words,
        ...(r.questions?.length ? { questions: r.questions } : {}),
        ...(r.kind === 'dialogue' ? { kind: 'dialogue' as const } : {}),
      })),
  };
}

export function passagesPath(body: string): { path: string; hash: string } {
  const hash = createHash('sha256').update(body, 'utf8').digest('hex');
  return { path: `packs/passages.${hash.slice(0, 12)}.json`, hash };
}

// ------------------------------------------------ the 100-passage plan
// docs/LEXICA_READING_PLAN.md: targets per kind × level, counting the
// passages already bundled in Lexica (apps/lexica/app/data/passages.ts).

export const PASSAGE_PLAN: Record<PassageKind, Record<PassageLevel, number>> = {
  text: { beginner: 18, intermediate: 20, advanced: 14, expert: 8 },
  dialogue: { beginner: 16, intermediate: 16, advanced: 8, expert: 0 },
};

export interface PlanItem {
  kind: PassageKind;
  level: PassageLevel;
  topic: string;
}

/** The passages bundled in the app; keep in step with Lexica's data/passages.ts. */
export const BUNDLED_PASSAGES: readonly PlanItem[] = [
  ['text', 'beginner', 'Công việc'],
  ['text', 'beginner', 'Tiền bạc'],
  ['text', 'beginner', 'Đời sống'],
  ['text', 'beginner', 'Sức khoẻ'],
  ['text', 'intermediate', 'Công việc'],
  ['text', 'intermediate', 'Giáo dục'],
  ['text', 'intermediate', 'Xã hội'],
  ['text', 'advanced', 'Tiền bạc'],
  ['text', 'advanced', 'Đời sống'],
  ['text', 'expert', 'Môi trường'],
  ['dialogue', 'beginner', 'Đời sống'],
  ['dialogue', 'beginner', 'Du lịch'],
  ['dialogue', 'intermediate', 'Công việc'],
  ['dialogue', 'intermediate', 'Đời sống'],
].map(([kind, level, topic]) => ({
  kind: kind as PassageKind,
  level: level as PassageLevel,
  topic,
}));

/** Everyday situations dialogues lean towards. */
const DIALOGUE_TOPICS = ['Đời sống', 'Du lịch', 'Công việc', 'Tiền bạc'];

export interface PlanCell {
  kind: PassageKind;
  level: PassageLevel;
  target: number;
  bundled: number;
  approved: number;
  pending: number;
  missing: number;
}

type PlanRow = Pick<PassageRow, 'level' | 'topic' | 'status'> & {
  kind?: PassageKind | null;
};

const kindOf = (r: { kind?: PassageKind | null }): PassageKind =>
  r.kind === 'dialogue' ? 'dialogue' : 'text';

/** One cell per kind × level with a target: what is there and what is missing. */
export function planCells(stored: readonly PlanRow[]): PlanCell[] {
  const out: PlanCell[] = [];
  for (const kind of PASSAGE_KINDS)
    for (const level of PASSAGE_LEVELS) {
      const target = PASSAGE_PLAN[kind][level];
      if (target === 0) continue;
      const here = (r: { level: string } & { kind?: PassageKind | null }) =>
        kindOf(r) === kind && r.level === level;
      const bundled = BUNDLED_PASSAGES.filter(here).length;
      const approved = stored.filter(
        (r) => here(r) && r.status === 'approved',
      ).length;
      const pending = stored.filter(
        (r) => here(r) && r.status === 'pending',
      ).length;
      out.push({
        kind,
        level,
        target,
        bundled,
        approved,
        pending,
        missing: Math.max(0, target - bundled - approved - pending),
      });
    }
  return out;
}

/** Passages per topic of one kind (bundled and not rejected). */
export function topicCounts(
  stored: readonly PlanRow[],
  kind: PassageKind,
): Record<string, number> {
  const counts = Object.fromEntries(PASSAGE_TOPICS.map((t) => [t, 0]));
  for (const r of [...BUNDLED_PASSAGES, ...stored])
    if (
      kindOf(r) === kind &&
      (!('status' in r) || r.status !== 'rejected') &&
      r.topic in counts
    )
      counts[r.topic] += 1;
  return counts;
}

/**
 * The next `count` passages to write: each from the cell missing the most
 * (lower levels first on a tie), on the topic that cell uses least, then
 * the topic its kind uses least. Dialogues lean towards everyday topics.
 */
export function nextFromPlan(
  stored: readonly PlanRow[],
  count: number,
): PlanItem[] {
  const rowsSoFar: PlanRow[] = stored.filter((r) => r.status !== 'rejected');
  const out: PlanItem[] = [];
  for (let i = 0; i < count; i++) {
    const cell = planCells(rowsSoFar)
      .filter((c) => c.missing > 0)
      .sort(
        (a, b) =>
          b.missing - a.missing ||
          PASSAGE_LEVELS.indexOf(a.level) - PASSAGE_LEVELS.indexOf(b.level),
      )[0];
    if (!cell) break;
    const { kind, level } = cell;
    const all = [...BUNDLED_PASSAGES, ...rowsSoFar];
    const inCell = (t: string) =>
      all.filter(
        (r) => kindOf(r) === kind && r.level === level && r.topic === t,
      ).length;
    const byKind = topicCounts(rowsSoFar, kind);
    // A preferred dialogue topic counts as half used, so it comes up about twice as often.
    const weight = (t: string) =>
      kind === 'dialogue' && DIALOGUE_TOPICS.includes(t) ? 0.5 : 1;
    const topic = [...PASSAGE_TOPICS].sort(
      (a, b) =>
        inCell(a) * weight(a) - inCell(b) * weight(b) ||
        byKind[a] * weight(a) - byKind[b] * weight(b),
    )[0];
    out.push({ kind, level, topic });
    rowsSoFar.push({ kind, level, topic, status: 'pending' });
  }
  return out;
}
