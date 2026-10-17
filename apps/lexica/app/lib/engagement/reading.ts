/**
 * "Đọc" (docs/LEXICA_FEEDBACK_TASKS.md T7): reading a passage counts as a
 * light review of the words the learner already knows in it (once per word
 * per day), and its new words can be added to the next session. No lock, no
 * pass or fail. Pure functions plus a small on-device log.
 */
import type { Passage } from '../content/passages';
import type { UserCardProgress } from '../eloAlgorithm';
import type { DifficultyLevel } from '../../types/vocab';
import { isOwned } from './collection';

type Progress = Record<string, UserCardProgress | undefined>;

/** Deck words of the passage the learner already remembers. */
export function knownIn(p: Pick<Passage, 'newWords' | 'words'>, progress: Progress): string[] {
    return [...p.newWords, ...p.words].filter((id) => isOwned(progress[id]));
}

/** Deck words of the passage the learner has not remembered yet. */
export function unknownIn(p: Pick<Passage, 'newWords' | 'words'>, progress: Progress): string[] {
    return [...p.newWords, ...p.words].filter((id) => !isOwned(progress[id]));
}

/** Words to count as a light review now: known, and not already reviewed by reading today. */
export function readingReviewIds(p: Pick<Passage, 'newWords' | 'words'>, progress: Progress, reviewedToday: ReadonlySet<string>): string[] {
    return knownIn(p, progress).filter((id) => !reviewedToday.has(id));
}

/** "Ôn lại 4 từ · Thêm 3 từ mới vào phiên tới" */
export function finishLine(reviewed: number, added: number): string {
    const parts: string[] = [];
    if (reviewed > 0) parts.push(`Ôn lại ${reviewed} từ`);
    if (added > 0) parts.push(`Thêm ${added} từ mới vào phiên tới`);
    return parts.length > 0 ? parts.join(' · ') : 'Đọc xong. Đoạn sau sẽ có thêm từ để ôn.';
}

const LEVEL_ORDER: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];

/**
 * Passages in the order to suggest them: the learner's level (or the
 * nearest), unread first, then the ones with the most words still to learn.
 */
export function recommendPassages<T extends Pick<Passage, 'id' | 'level' | 'newWords' | 'words'>>(
    passages: readonly T[],
    input: { level: DifficultyLevel | 'all' | null; progress: Progress; read: ReadonlySet<string> },
): T[] {
    const target = input.level && input.level !== 'all' ? LEVEL_ORDER.indexOf(input.level) : -1;
    const distance = (p: T) => (target < 0 ? 0 : Math.abs(LEVEL_ORDER.indexOf(p.level) - target));
    const fresh = (p: T) => p.newWords.filter((id) => !isOwned(input.progress[id])).length;
    return [...passages].sort(
        (a, b) =>
            Number(input.read.has(a.id)) - Number(input.read.has(b.id)) ||
            distance(a) - distance(b) ||
            fresh(b) - fresh(a) ||
            a.id.localeCompare(b.id),
    );
}

/** A passage with one of these (just learned) words, for the session recap. */
export function passageWith<T extends Pick<Passage, 'id' | 'newWords' | 'words'>>(passages: readonly T[], cardIds: readonly string[], read: ReadonlySet<string> = new Set()): T | null {
    const wanted = new Set(cardIds);
    const hits = passages.filter((p) => [...p.newWords, ...p.words].some((id) => wanted.has(id)));
    return hits.find((p) => !read.has(p.id)) ?? hits[0] ?? null;
}

// ─── On-device log ────────────────────────────────────────────────────────

const KEY = 'lexica-reading-v1';

interface ReadingLog {
    /** Local date the review list belongs to. */
    date: string;
    /** Words already reviewed by reading on that date. */
    reviewed: string[];
    /** Passages finished, ever (most recent last). */
    read: string[];
}

function load(): ReadingLog {
    try {
        const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<ReadingLog> | null;
        return { date: raw?.date ?? '', reviewed: raw?.reviewed ?? [], read: raw?.read ?? [] };
    } catch {
        return { date: '', reviewed: [], read: [] };
    }
}

function save(log: ReadingLog) {
    try {
        localStorage.setItem(KEY, JSON.stringify({ ...log, read: log.read.slice(-300) }));
    } catch {
        // Private mode: words may be reviewed again by reading today.
    }
}

export function reviewedToday(today: string): Set<string> {
    const log = load();
    return new Set(log.date === today ? log.reviewed : []);
}

export function readPassages(): Set<string> {
    return new Set(load().read);
}

/**
 * Records a finished passage and returns the words to review now (each at
 * most once a day). The caller applies the review to the store.
 */
export function finishPassage(p: Pick<Passage, 'id' | 'newWords' | 'words'>, progress: Progress, today: string): string[] {
    const log = load();
    const already = new Set(log.date === today ? log.reviewed : []);
    const ids = readingReviewIds(p, progress, already);
    save({
        date: today,
        reviewed: [...already, ...ids],
        read: [...log.read.filter((id) => id !== p.id), p.id],
    });
    return ids;
}
