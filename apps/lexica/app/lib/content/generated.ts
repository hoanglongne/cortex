/**
 * A passage written on demand around the learner's own words (the Đọc stage
 * of the Today session, when no ready-made passage has them). The Cortex API
 * writes it once per word set and caches it (POST /v1/lexica/reading); the
 * app keeps the last few here so a reload does not ask again.
 */
import { CORTEX_API_URL } from '../cortexConfig';
import { authHeaders, getCortexAuth } from '../cortexAuth';
import { getCard } from './repository';
import { deckWordsIn, parsePassage, type Passage } from './passages';
import type { DifficultyLevel } from '../../types/vocab';

const KEY = 'lexica-generated-readings-v1';
const KEEP = 30;

/** Longest the learner waits for a written reading before the fallback. */
export const READING_TIMEOUT_MS = 30_000;
/** Share of the asked-for words a reading must contain to be called "written for you". */
export const MIN_COVERAGE = 0.6;

/** How many of these words (card ids) the passage text contains, with endings (plan, planned). */
export function wordsIn(text: string, words: readonly { id: string; word: string }[]): string[] {
    return deckWordsIn(text, words);
}

/** True when the text holds enough of the words it was written around. */
export function coversWords(text: string, words: readonly { id: string; word: string }[]): boolean {
    if (words.length === 0) return true;
    return wordsIn(text, words).length >= Math.ceil(words.length * MIN_COVERAGE);
}

export const canGenerateReading = () => Boolean(CORTEX_API_URL);

/** Stable key for a set of words, a level and a kind. */
export function readingKey(cardIds: readonly string[], level: DifficultyLevel, kind: 'text' | 'dialogue'): string {
    const words = [...new Set(cardIds.map((id) => getCard(id)?.word.toLowerCase() ?? id))].sort();
    return `${kind}:${level}:${words.join('|')}`;
}

function readCache(): Record<string, Passage> {
    try {
        return (JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, Passage>) ?? {};
    } catch {
        return {};
    }
}

function writeCache(key: string, p: Passage) {
    try {
        const all = { ...readCache(), [key]: p };
        const keys = Object.keys(all);
        for (const k of keys.slice(0, Math.max(0, keys.length - KEEP))) delete all[k];
        localStorage.setItem(KEY, JSON.stringify(all));
    } catch {
        // Private mode: it is written again next time.
    }
}

/**
 * The passage for these words, from the device cache or the API. Throws when
 * the API is not configured or cannot write one (the caller falls back).
 */
export async function generatedReading(cardIds: readonly string[], level: DifficultyLevel, kind: 'text' | 'dialogue' = 'text'): Promise<Passage> {
    const key = readingKey(cardIds, level, kind);
    const cached = readCache()[key];
    if (cached) return cached;
    if (!CORTEX_API_URL) throw new Error('no api');
    const words = cardIds
        .map((id) => getCard(id))
        .filter((c): c is NonNullable<typeof c> => Boolean(c))
        .map((c) => ({ id: c.id, word: c.word.toLowerCase(), meaning: c.translationHint }));
    const auth = await getCortexAuth().catch(() => null);
    const res = await fetch(`${CORTEX_API_URL}/v1/lexica/reading`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(auth ? authHeaders(auth) : {}) },
        body: JSON.stringify({ level, kind, words }),
        signal: AbortSignal.timeout(READING_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`reading ${res.status}`);
    const body = (await res.json()) as { id?: string; title?: string; text?: string; translation?: string; questions?: unknown[] };
    const passage = parsePassage({
        id: body.id ?? `r_${Date.now().toString(36)}`,
        level,
        topic: 'Viết cho bạn',
        title: body.title,
        text: body.text,
        translation: body.translation,
        newWords: words.map((w) => w.id),
        words: [],
        questions: body.questions ?? [],
        ...(kind === 'dialogue' ? { kind } : {}),
    });
    if (!passage) throw new Error('bad reading');
    // Never call a text "written for you" when it does not hold your words
    if (!coversWords(passage.text, words)) throw new Error('reading misses the words');
    writeCache(key, passage);
    return passage;
}
