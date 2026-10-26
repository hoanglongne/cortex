/**
 * Lexica's part of the parents' weekly report (docs/TEACH_PLAN.md 3.2): what
 * the child did in one finished week, from the class reports at the end of
 * the week and before it (classroom_week_metrics). Real examples come from
 * the class's own words; nothing the child wrote is used. Pure; tested in
 * apps/teach/__tests__/parentReport.test.ts.
 */
import { lexicaModule, oftenMissed, SOUND_KINDS, type SoundKind } from './index';
import { ieltsRange } from './ielts';

/** The sound groups said the way a parent would: what to listen for, and a word to try. */
export const SOUND_FOR_PARENTS: Record<SoundKind, { name: string; example: string }> = {
    final_consonant: { name: 'âm cuối của từ', example: 'book' },
    final_voicing: { name: 'âm cuối như /d/, /z/', example: 'bad' },
    th: { name: 'âm "th"', example: 'think' },
    cluster: { name: 'các phụ âm đi liền nhau', example: 'street' },
    ending: { name: 'đuôi -s, -ed', example: 'walked' },
    long_short: { name: 'nguyên âm dài và ngắn', example: 'ship, sheep' },
    ch_j: { name: 'âm "sh", "ch", "j"', example: 'she, chair' },
    final_ng: { name: 'âm "ng" ở cuối', example: 'sing' },
    final_l: { name: 'âm "l" ở cuối và âm "r"', example: 'feel, red' },
    initial_z: { name: 'âm "z"', example: 'zoo' },
    ae_e: { name: 'âm "a" trong "bad" và "e" trong "bed"', example: 'bad, bed' },
};

export interface LexicaWeekInput {
    /** The class report at the end of the week (null: none yet) and the last one before it (null: the first week). */
    end: unknown;
    start: unknown;
    /** A class word's text from its card id; undefined when the word list is not available. */
    word: (cardId: string) => string | undefined;
    /** Verified scores taken by the end of the week, any order. */
    scores: readonly { score: number; sd: number; at: string }[];
    /** The week's Sunday, "YYYY-MM-DD". */
    weekEnd: string;
}

export interface LexicaWeek {
    /** False when Lexica sent nothing by the end of the week. */
    hasData: boolean;
    /** No report before the week: the numbers are totals so far, not this week's. */
    firstWeek: boolean;
    /** Words that newly reached each step this week (totals in the first week). */
    hieu: number;
    nho: number;
    dung: number;
    doi: number;
    /** The class's words that reached Dùng (said clearly) or Nhớ this week. */
    saidWords: string[];
    rememberedWords: string[];
    /** The sound group heard off most often in the last 14 days, if any. */
    hardSound: { kind: SoundKind; name: string; example: string } | null;
    overdue: number | null;
    score: { score: number; ielts: string; delta?: number; at: string } | null;
}

/** Class words whose step went from below `step` to at least `step`. */
function reached(end: Record<string, number>, start: Record<string, number>, step: number): string[] {
    return Object.entries(end)
        .filter(([id, n]) => n >= step && (start[id] ?? 0) < step)
        .map(([id]) => id)
        .sort();
}

export function lexicaWeek(input: LexicaWeekInput): LexicaWeek {
    const hasData = Boolean(input.end && typeof input.end === 'object');
    const end = lexicaModule.parseMetrics(input.end);
    const firstWeek = hasData && !(input.start && typeof input.start === 'object');
    const start = lexicaModule.parseMetrics(firstWeek ? {} : input.start);
    const delta = (k: 'hieu' | 'nho' | 'dung' | 'doi') => Math.max(0, (end.counts[k] ?? 0) - (start.counts[k] ?? 0));
    const texts = (ids: string[]) => ids.map(input.word).filter((w): w is string => Boolean(w));

    const said = reached(end.words, start.words, 4);
    const remembered = reached(end.words, start.words, 2).filter((id) => !said.includes(id));

    let hard: LexicaWeek['hardSound'] = null;
    let worst = 0;
    for (const kind of SOUND_KINDS) {
        const pair = end.sounds[kind];
        if (pair && oftenMissed(pair) && pair[1] > worst) {
            worst = pair[1];
            hard = { kind, ...SOUND_FOR_PARENTS[kind] };
        }
    }

    const tests = input.scores.filter((s) => s.at.slice(0, 10) <= input.weekEnd).sort((a, b) => a.at.localeCompare(b.at));
    const last = tests[tests.length - 1];
    const prev = tests[tests.length - 2];

    return {
        hasData,
        firstWeek,
        hieu: delta('hieu'),
        nho: delta('nho'),
        dung: delta('dung'),
        doi: delta('doi'),
        saidWords: texts(said),
        rememberedWords: texts(remembered),
        hardSound: hard,
        overdue: end.review ? end.review.overdue : null,
        score: last ? { score: last.score, ielts: ieltsRange(last.score, last.sd), ...(prev ? { delta: last.score - prev.score } : {}), at: last.at.slice(0, 10) } : null,
    };
}
