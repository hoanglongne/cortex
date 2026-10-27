/**
 * Đấu trường (docs/TEACH_PLAN.md 4): which words to ask, and the questions
 * themselves, from the class's own words. Two kinds alternate: a word, pick
 * its meaning; a meaning, pick the word. Wrong options come from Lexica's
 * list, the same level and branch first, never a second right answer.
 * Pure, unit tested.
 */
import type { ArenaQuestionInput, Board } from '@cortex/classroom';
import { LEXICA, lexicaModule } from '@cortex/classroom-lexica';
import type { IndexCard } from '../modules/lexica/words';

export type ArenaSource = { kind: 'lesson'; assignmentId: string } | { kind: 'forgetting' } | { kind: 'all' } | { kind: 'cards'; ids: string[] };

const classLessons = (board: Board) => board.class.apps.includes(LEXICA) ? board.assignments.filter((a) => a.app === LEXICA && !a.for_user) : [];
const lessonIds = (a: Board['assignments'][number]) => lexicaModule.parsePayload(a.kind, a.payload).card_ids;

/** Lesson words the most students are about to forget (W4 `atRisk`), most first. */
export function forgettingWords(board: Board): string[] {
    const count = new Map<string, number>();
    for (const s of board.students) {
        for (const id of lexicaModule.parseMetrics(s.apps[LEXICA]?.metrics).review?.atRisk ?? []) count.set(id, (count.get(id) ?? 0) + 1);
    }
    return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
}

/** The card ids a source gives, in a stable order (newest lesson first for "all"). */
export function sourceWords(board: Board, source: ArenaSource): string[] {
    if (source.kind === 'cards') return [...new Set(source.ids)];
    if (source.kind === 'forgetting') return forgettingWords(board);
    if (source.kind === 'lesson') {
        const a = classLessons(board).find((x) => x.id === source.assignmentId);
        return a ? [...new Set(lessonIds(a))] : [];
    }
    return [...new Set(classLessons(board).flatMap(lessonIds))];
}

const norm = (s: string) => s.trim().toLowerCase();
/** A meaning short enough for a button: the first sense, at most 60 characters. */
export function shortMeaning(m: string): string {
    const first = m.split(/[;|]/)[0].trim();
    return first.length > 60 ? `${first.slice(0, 59).trimEnd()}…` : first;
}

function shuffle<T>(xs: T[], rand: () => number): T[] {
    const a = [...xs];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/**
 * Up to `n` questions from `targets` (in a shuffled order), each with up to 3
 * wrong options from `pool`. A word with no usable meaning, or no distinct
 * wrong option, is skipped.
 */
export function arenaQuestions(targets: readonly IndexCard[], pool: readonly IndexCard[], n: number, rand: () => number = Math.random): ArenaQuestionInput[] {
    const seen = new Set<string>();
    const unique = targets.filter((c) => !seen.has(c.id) && seen.add(c.id) && shortMeaning(c.meaning ?? '') !== '');
    const out: ArenaQuestionInput[] = [];
    for (const t of shuffle(unique, rand)) {
        if (out.length >= n) break;
        const kind: ArenaQuestionInput['kind'] = out.length % 2 === 0 ? 'meaning' : 'word';
        const value = (c: IndexCard) => (kind === 'meaning' ? shortMeaning(c.meaning ?? '') : c.word.trim());
        const right = value(t);
        // Not the same word, not the same meaning (two right answers), not empty
        const candidates = shuffle(
            pool.filter((c) => c.id !== t.id && norm(c.word) !== norm(t.word) && norm(shortMeaning(c.meaning ?? '')) !== norm(shortMeaning(t.meaning)) && value(c) !== ''),
            rand,
        ).sort((a, b) => (a.level === t.level ? 0 : 1) + (a.branch === t.branch ? 0 : 1) - ((b.level === t.level ? 0 : 1) + (b.branch === t.branch ? 0 : 1)));
        const wrong: string[] = [];
        const used = new Set([norm(right)]);
        for (const c of candidates) {
            if (wrong.length === 3) break;
            const v = value(c);
            if (used.has(norm(v))) continue;
            used.add(norm(v));
            wrong.push(v);
        }
        if (wrong.length === 0) continue;
        const options = shuffle([right, ...wrong], rand);
        out.push({ card_id: t.id, kind, prompt: kind === 'meaning' ? t.word.trim() : shortMeaning(t.meaning), options, answer: options.indexOf(right) });
    }
    return out;
}

/** Words most of the class got wrong (under 60% right): the next round, or the next lesson. */
export function hardWords(summary: readonly { card_id?: string; answered: number; correct: number }[], share = 0.6): string[] {
    return summary.filter((q) => q.card_id && q.answered > 0 && q.correct / q.answered < share).map((q) => q.card_id!);
}
