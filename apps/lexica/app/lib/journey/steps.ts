/**
 * The four steps of a word (docs/LEXICA_DIRECTION.md): Hiểu → Nhớ → Gặp →
 * Dùng. Each feature moves a word along one step; the app only counts words
 * by how far they got. Pure functions, unit tested; the store keeps one
 * WordJourney per card.
 *
 * - Hiểu: learned the card and passed its meaning check.
 * - Nhớ: recalled right on two different days, the second at least 3 days
 *   after the first. A wrong answer takes Nhớ away again.
 * - Gặp: read a passage with the word, or got its meaning right in a quote.
 * - Dùng: speech recognition heard the word (or its phrase) clearly.
 *
 * Gặp and Dùng are kept when Nhớ is lost: once the word is recalled again it
 * goes straight back to the furthest step it had reached.
 *
 * Beyond the four, a word can be lived: the learner used it in their own life
 * (a message, an email, a meeting) and said so (lib/journey/outside.ts). It
 * takes days, so it is not a step of the daily session and not in the count
 * of four; it is shown on its own.
 */
import type { UserCardProgress } from '../eloAlgorithm';

export type WordStep = 'hieu' | 'nho' | 'gap' | 'dung';

export const STEPS: readonly WordStep[] = ['hieu', 'nho', 'gap', 'dung'];

export const STEP_LABEL: Record<WordStep, string> = {
    hieu: 'Hiểu',
    nho: 'Nhớ',
    gap: 'Gặp',
    dung: 'Dùng',
};

export const STEP_HINT: Record<WordStep, string> = {
    hieu: 'Hiểu nghĩa trong câu tiếng Việt',
    nho: 'Nhớ lại được ở hai ngày khác nhau',
    gap: 'Nhận ra trong đoạn văn tiếng Anh',
    dung: 'Nói ra thành tiếng, máy nghe rõ',
};

export interface WordJourney {
    /** When the word was first understood (ms). */
    understoodAt: number;
    /** Local dates (YYYY-MM-DD) of right recalls since the last wrong one, oldest first. */
    recalls: string[];
    /** When Nhớ was reached; cleared by a wrong recall. */
    rememberedAt?: number;
    /** When the word was first met in English text. */
    metAt?: number;
    /** When the word was first said clearly. */
    usedAt?: number;
    /** When the learner said they used it in their own life (the fifth step, "Đời"). */
    livedAt?: number;
}

export type Journeys = Record<string, WordJourney>;

/** Days between two right recalls for Nhớ. */
export const NHO_GAP_DAYS = 3;

const DAY_MS = 86_400_000;

const dayNumber = (date: string) => Math.round(Date.parse(`${date}T00:00:00Z`) / DAY_MS);

/** True when two recalls are far enough apart. */
export function recallsMakeNho(recalls: readonly string[]): boolean {
    if (recalls.length < 2) return false;
    const first = dayNumber(recalls[0]);
    return recalls.some((d) => dayNumber(d) - first >= NHO_GAP_DAYS);
}

/** The furthest step shown for a word, or null before Hiểu. Steps never skip. */
export function stepOf(j: WordJourney | undefined): WordStep | null {
    if (!j) return null;
    if (!j.rememberedAt) return 'hieu';
    if (!j.metAt) return 'nho';
    if (!j.usedAt) return 'gap';
    return 'dung';
}

export function stepIndex(step: WordStep | null): number {
    return step ? STEPS.indexOf(step) + 1 : 0;
}

/** First time the word is understood; later calls change nothing. */
export function understand(j: WordJourney | undefined, now: number): WordJourney {
    return j ?? { understoodAt: now, recalls: [] };
}

/**
 * A recall in review (or a recall check in the deck). Right answers add the
 * day; a wrong one starts the count again and takes Nhớ away.
 */
export function recall(j: WordJourney | undefined, correct: boolean, date: string, now: number): WordJourney {
    const base = understand(j, now);
    if (!correct) {
        const next: WordJourney = { ...base, recalls: [] };
        delete next.rememberedAt;
        return next;
    }
    const recalls = base.recalls.includes(date) ? base.recalls : [...base.recalls, date].slice(-6);
    const rememberedAt = base.rememberedAt ?? (recallsMakeNho(recalls) ? now : undefined);
    return { ...base, recalls, ...(rememberedAt ? { rememberedAt } : {}) };
}

/** An unseen word the learner already knew: it counts as Nhớ straight away. */
export function knownAlready(j: WordJourney | undefined, now: number): WordJourney {
    const base = understand(j, now);
    return { ...base, rememberedAt: base.rememberedAt ?? now };
}

/** Met in English text (a passage, a quote). Only for words already understood. */
export function meet(j: WordJourney | undefined, now: number): WordJourney | undefined {
    if (!j) return undefined;
    return j.metAt ? j : { ...j, metAt: now };
}

/** Said clearly. Only for words already understood. */
export function sayClearly(j: WordJourney | undefined, now: number): WordJourney | undefined {
    if (!j) return undefined;
    return j.usedAt ? j : { ...j, usedAt: now };
}

/** Used in real life. Only for words already understood. */
export function live(j: WordJourney | undefined, now: number): WordJourney | undefined {
    if (!j) return undefined;
    return j.livedAt ? j : { ...j, livedAt: now };
}

export const LIVED_LABEL = 'Đời';
export const LIVED_HINT = 'Đã dùng thật ngoài đời: tin nhắn, email, câu nói';

/** Words used in real life. */
export function countLived(journeys: Journeys): number {
    return Object.values(journeys).filter((j) => j.livedAt).length;
}

export type StepCounts = Record<WordStep, number>;

/** Words that reached each step (a word at Dùng counts in all four). */
export function countSteps(journeys: Journeys, only?: ReadonlySet<string>): StepCounts {
    const counts: StepCounts = { hieu: 0, nho: 0, gap: 0, dung: 0 };
    for (const [id, j] of Object.entries(journeys)) {
        if (only && !only.has(id)) continue;
        const n = stepIndex(stepOf(j));
        if (n >= 1) counts.hieu++;
        if (n >= 2) counts.nho++;
        if (n >= 3) counts.gap++;
        if (n >= 4) counts.dung++;
    }
    return counts;
}

/** How many words reached each step on this local date (for "hôm nay +3"). */
export function countReachedOn(journeys: Journeys, date: string, toDate: (ts: number) => string): StepCounts {
    const counts: StepCounts = { hieu: 0, nho: 0, gap: 0, dung: 0 };
    for (const j of Object.values(journeys)) {
        const step = stepOf(j);
        const n = stepIndex(step);
        // A step counts on the day it became visible: Gặp shows only once Nhớ is there too.
        const shownAt = (i: number) => Math.max(...[j.understoodAt, j.rememberedAt ?? 0, j.metAt ?? 0, j.usedAt ?? 0].slice(0, i));
        if (n >= 1 && toDate(j.understoodAt) === date) counts.hieu++;
        if (n >= 2 && toDate(shownAt(2)) === date) counts.nho++;
        if (n >= 3 && toDate(shownAt(3)) === date) counts.gap++;
        if (n >= 4 && toDate(shownAt(4)) === date) counts.dung++;
    }
    return counts;
}

/** Card ids at exactly this step, most recent first. */
export function wordsAt(journeys: Journeys, step: WordStep): string[] {
    return Object.entries(journeys)
        .filter(([, j]) => stepOf(j) === step)
        .sort(([, a], [, b]) => latest(b) - latest(a))
        .map(([id]) => id);
}

const latest = (j: WordJourney) => Math.max(j.understoodAt, j.rememberedAt ?? 0, j.metAt ?? 0, j.usedAt ?? 0);

/**
 * Journeys for progress saved before the four steps existed: learned words
 * are Hiểu; words with a long enough schedule are Nhớ.
 */
export function journeysFromProgress(
    progress: Record<string, UserCardProgress | undefined>,
    learned: Iterable<string>,
): Journeys {
    const out: Journeys = {};
    const learnedSet = new Set(learned);
    for (const [id, p] of Object.entries(progress)) {
        if (!p) continue;
        if (!learnedSet.has(id) && p.reviewCount < 1) continue;
        const at = p.lastReviewedAt || Date.now();
        const remembered = p.state === 'gold' || p.state === 'mastered' || ((p.intervalDays ?? 0) >= NHO_GAP_DAYS && (p.streak ?? 0) >= 2);
        out[id] = { understoodAt: at, recalls: [], ...(remembered ? { rememberedAt: at } : {}) };
    }
    return out;
}

/** "120 Hiểu · 85 Nhớ · 40 Gặp · 22 Dùng" */
export function countsLine(c: StepCounts): string {
    return STEPS.map((s) => `${c[s]} ${STEP_LABEL[s]}`).join(' · ');
}
