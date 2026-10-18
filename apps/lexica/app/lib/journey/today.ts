/**
 * "Hôm nay" (docs/LEXICA_DIRECTION.md): one button runs four stages in a
 * fixed order, each one moving words along a step. Ôn → Nhớ, Học → Hiểu,
 * Đọc → Gặp, Nói → Dùng. A stage with nothing to do is skipped. Pure
 * functions, unit tested; the store keeps the day's log.
 */
import type { Passage } from '../content/passages';
import { stepOf, wordsAt, type Journeys, type StepCounts } from './steps';

export type Stage = 'review' | 'learn' | 'read' | 'speak';

export const STAGES: readonly Stage[] = ['review', 'learn', 'read', 'speak'];

export const STAGE_LABEL: Record<Stage, string> = { review: 'Ôn', learn: 'Học', read: 'Đọc', speak: 'Nói' };
export const STAGE_TITLE: Record<Stage, string> = {
    review: 'Ôn từ đến hạn',
    learn: 'Học từ mới',
    read: 'Đọc một đoạn ngắn',
    speak: 'Nói thành tiếng',
};
/** Rough minutes, shown on the Today card. */
export const STAGE_MINUTES: Record<Stage, number> = { review: 3, learn: 4, read: 2, speak: 2 };

/** At most this many due words in the Ôn stage (about 3 minutes). */
export const REVIEW_CAP = 12;
/** Words in the Nói stage. */
export const SPEAK_WORDS = 3;
/** New words in the very first session. */
export const FIRST_SESSION_WORDS = 5;

export interface TodayLog {
    /** Local date the log belongs to. */
    date: string;
    done: Stage[];
    /** Step counts when the day's session started, for the recap. */
    start: StepCounts;
}

export type StageStatus = 'done' | 'todo' | 'empty';

export interface TodayPlan {
    stages: { stage: Stage; status: StageStatus; size: number }[];
    /** The stage to run next, or null when the day is complete. */
    next: Stage | null;
    complete: boolean;
    minutes: number;
}

/** Today's log, or null when it belongs to another day. */
export function logFor(log: TodayLog | null | undefined, date: string): TodayLog | null {
    return log && log.date === date ? log : null;
}

export function planToday(input: {
    log: TodayLog | null;
    dueCount: number;
    newLeft: number;
    canRead: boolean;
    speakCount: number;
}): TodayPlan {
    const size: Record<Stage, number> = {
        review: Math.min(REVIEW_CAP, input.dueCount),
        learn: Math.max(0, input.newLeft),
        read: input.canRead ? 1 : 0,
        speak: Math.min(SPEAK_WORDS, input.speakCount),
    };
    const done = new Set(input.log?.done ?? []);
    const stages = STAGES.map((stage) => ({
        stage,
        size: size[stage],
        status: (done.has(stage) ? 'done' : size[stage] > 0 ? 'todo' : 'empty') as StageStatus,
    }));
    const next = stages.find((s) => s.status === 'todo')?.stage ?? null;
    const minutes = stages.filter((s) => s.status === 'todo').reduce((m, s) => m + STAGE_MINUTES[s.stage], 0);
    return { stages, next, complete: next === null, minutes };
}

/**
 * New words left for today: the pace minus words already learned today.
 * The first session ever is kept short.
 */
export function newWordsLeft(input: { pace: number; learnedToday: number; firstSession: boolean }): number {
    const target = input.firstSession ? Math.min(FIRST_SESSION_WORDS, input.pace) : input.pace;
    return Math.max(0, target - input.learnedToday);
}

/**
 * The passage for the Đọc stage: the one with the most words the learner
 * understands but has not met in English yet (remembered words count more),
 * unread first. Null when no passage has such a word.
 */
export function pickPassage<T extends Pick<Passage, 'id' | 'newWords' | 'words'> & { kind?: string }>(
    passages: readonly T[],
    journeys: Journeys,
    read: ReadonlySet<string>,
    prefer?: (p: T) => boolean,
): T | null {
    let best: { p: T; score: number } | null = null;
    for (const p of passages) {
        let score = 0;
        for (const id of [...p.newWords, ...p.words]) {
            const step = stepOf(journeys[id]);
            if (step === 'nho') score += 3;
            else if (step === 'hieu') score += 1;
        }
        if (score === 0) continue;
        if (read.has(p.id)) score -= 100;
        if (prefer && !prefer(p)) score -= 50;
        if (!best || score > best.score) best = { p, score };
    }
    return best?.p ?? null;
}

/** A word to meet in a quote when no passage fits: understood, not met, with a quote. */
export function pickQuoteWord(journeys: Journeys, hasQuote: (cardId: string) => boolean): string | null {
    return [...wordsAt(journeys, 'nho'), ...wordsAt(journeys, 'hieu')].find(hasQuote) ?? null;
}

/** Words for the Nói stage: met but not said yet, then today's new words, then remembered ones. */
export function pickSpeakWords(journeys: Journeys, learnedToday: readonly string[], n = SPEAK_WORDS): string[] {
    const out: string[] = [];
    for (const id of [...wordsAt(journeys, 'gap'), ...learnedToday, ...wordsAt(journeys, 'nho'), ...wordsAt(journeys, 'hieu')]) {
        if (out.length >= n) break;
        if (!out.includes(id) && journeys[id] && !journeys[id].usedAt) out.push(id);
    }
    return out;
}

/** Due words for the Ôn stage, in the order getDueCards gives them. */
export function reviewIds(dueIds: readonly string[]): string[] {
    return dueIds.slice(0, REVIEW_CAP);
}

/** "Còn 3 chặng · ~9 phút" */
export function planLine(plan: TodayPlan): string {
    const left = plan.stages.filter((s) => s.status === 'todo').length;
    if (plan.complete) return 'Xong hôm nay';
    return `Còn ${left} chặng · ~${plan.minutes} phút`;
}

export function stepDelta(now: StepCounts, start: StepCounts): StepCounts {
    return {
        hieu: Math.max(0, now.hieu - start.hieu),
        nho: Math.max(0, now.nho - start.nho),
        gap: Math.max(0, now.gap - start.gap),
        dung: Math.max(0, now.dung - start.dung),
    };
}
