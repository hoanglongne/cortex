import type { DifficultyLevel } from '../../types/vocab';

/**
 * "Đọc": short passages (docs/LEXICA_FEEDBACK_TASKS.md T7). Each one brings
 * 3–5 deck words the learner may not know yet, among words they may already
 * know. Core passages ship with the app (app/data/passages.ts); Studio
 * publishes more as a pack (manifest `passages`).
 */

export interface PassageQuestion {
    question: string;
    options: string[];
    /** Index of the right option. */
    answer: number;
}

export interface Passage {
    id: string;
    level: DifficultyLevel;
    topic: string;
    title: string;
    /** English text, paragraphs separated by a blank line. */
    text: string;
    /** Vietnamese translation, same paragraphs. */
    translation: string;
    /** Card ids the passage was written to introduce. */
    newWords: string[];
    /** Other deck card ids that appear in the text. */
    words: string[];
    /** Up to two optional comprehension questions. */
    questions?: PassageQuestion[];
    /** 'dialogue' for the Giao tiếp branch: lines "A: ..." / "B: ..."; plain text otherwise. */
    kind?: 'text' | 'dialogue';
}

export const PASSAGE_TOPICS = ['Đời sống', 'Công việc', 'Tiền bạc', 'Công nghệ', 'Giáo dục', 'Sức khoẻ', 'Du lịch', 'Môi trường', 'Xã hội'] as const;

/** Words in a passage written by Studio (core passages may be shorter). */
export const PASSAGE_WORDS: readonly [number, number] = [120, 200];

const LEVELS: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const strList = (v: unknown, max: number): string[] | null => (Array.isArray(v) && v.every(isStr) ? (v as string[]).slice(0, max) : null);

export function wordCount(text: string): number {
    return text.split(/\s+/).filter((t) => /[a-z]/i.test(t)).length;
}

function parseQuestion(v: unknown): PassageQuestion | null {
    if (!isObj(v) || !isStr(v.question)) return null;
    const options = strList(v.options, 4);
    const answer = v.answer;
    if (!options || options.length < 2 || typeof answer !== 'number' || !Number.isInteger(answer) || answer < 0 || answer >= options.length) return null;
    return { question: v.question, options, answer };
}

/** One passage, or null when it is not usable. */
export function parsePassage(v: unknown): Passage | null {
    if (!isObj(v)) return null;
    const { id, level, topic, title, text, translation } = v;
    if (!isStr(id) || !isStr(topic) || !isStr(title) || !isStr(text) || !isStr(translation)) return null;
    if (!LEVELS.includes(level as DifficultyLevel)) return null;
    const newWords = strList(v.newWords, 8);
    const words = strList(v.words ?? [], 60);
    if (!newWords || newWords.length === 0 || !words) return null;
    if (text.length > 4000 || translation.length > 6000) return null;
    const questions = Array.isArray(v.questions) ? v.questions.map(parseQuestion).filter((q): q is PassageQuestion => q !== null).slice(0, 2) : [];
    return {
        id,
        level: level as DifficultyLevel,
        topic,
        title,
        text: text.trim(),
        translation: translation.trim(),
        newWords,
        words: words.filter((w) => !newWords.includes(w)),
        ...(questions.length > 0 ? { questions } : {}),
        ...(v.kind === 'dialogue' ? { kind: 'dialogue' as const } : {}),
    };
}

/** The passages pack published by Studio; bad entries are skipped. */
export function parsePassages(v: unknown): Passage[] {
    if (!isObj(v) || v.schema !== 1 || !Array.isArray(v.passages)) return [];
    const seen = new Set<string>();
    const out: Passage[] = [];
    for (const raw of v.passages) {
        const p = parsePassage(raw);
        if (!p || seen.has(p.id)) continue;
        seen.add(p.id);
        out.push(p);
    }
    return out;
}

export interface Segment {
    text: string;
    /** Set when this piece is a deck word of the passage. */
    cardId?: string;
}

/**
 * Splits the text into plain pieces and deck words, matching each word and
 * its simple forms ("dilemmas", "mitigated"). The longest word wins when two
 * overlap.
 */
export function splitByWords(text: string, targets: readonly { id: string; word: string }[]): Segment[] {
    const list = [...targets].filter((t) => t.word.trim()).sort((a, b) => b.word.length - a.word.length);
    if (list.length === 0) return [{ text }];
    const esc = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // A phrase ("follow up on") takes its ending on the first word: "followed up on", "makes sense".
    const pattern = (word: string) => {
        const [head, ...rest] = word.trim().toLowerCase().split(/\s+/);
        return [`${esc(head)}(?:s|es|d|ed|ing|ly)?`, ...rest.map(esc)].join('\\s+');
    };
    const re = new RegExp(`\\b(${list.map((t) => pattern(t.word)).join('|')})\\b`, 'gi');
    const own = list.map((t) => ({ t, re: new RegExp(`^${pattern(t.word)}$`, 'i') }));
    const out: Segment[] = [];
    let last = 0;
    for (const m of text.matchAll(re)) {
        const target = own.find((o) => o.re.test(m[0]))?.t;
        if (!target || m.index === undefined) continue;
        if (m.index > last) out.push({ text: text.slice(last, m.index) });
        out.push({ text: m[0], cardId: target.id });
        last = m.index + m[0].length;
    }
    if (last < text.length) out.push({ text: text.slice(last) });
    return out;
}

/** Card ids of deck words found in `text` (for core passages, computed once). */
export function deckWordsIn(text: string, deck: readonly { id: string; word: string }[]): string[] {
    const seen = new Set<string>();
    for (const seg of splitByWords(text, deck)) if (seg.cardId) seen.add(seg.cardId);
    return [...seen];
}
