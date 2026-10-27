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

function shuffle<T>(xs: readonly T[], rand: () => number): T[] {
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

/**
 * Team mode: `teams` teams of even strength. Strongest first, dealt back
 * and forth (1, 2, 3, 3, 2, 1…) so no team gets all the strong students;
 * a student with no known level counts as the class middle; ties fall
 * differently each time.
 */
export function arenaTeams(players: readonly { id: string; strength: number | null }[], teams: number, rand: () => number = Math.random): Record<string, number> {
    const known = players.filter((p) => p.strength !== null).map((p) => p.strength!);
    const middle = known.length ? known.reduce((a, b) => a + b, 0) / known.length : 0;
    const sorted = shuffle(players, rand).sort((a, b) => (b.strength ?? middle) - (a.strength ?? middle));
    const out: Record<string, number> = {};
    sorted.forEach((p, i) => {
        const round = Math.floor(i / teams);
        const pos = i % teams;
        out[p.id] = (round % 2 === 0 ? pos : teams - 1 - pos) + 1;
    });
    return out;
}

/** Players who joined after the split go to the smallest team, the lowest number on a tie. */
export function fillTeams(split: Record<string, number>, ids: readonly string[], teams: number): Record<string, number> {
    const out: Record<string, number> = {};
    for (const id of ids) if (split[id] >= 1 && split[id] <= teams) out[id] = split[id];
    for (const id of ids) {
        if (out[id]) continue;
        const size = (t: number) => Object.values(out).filter((x) => x === t).length;
        let best = 1;
        for (let t = 2; t <= teams; t++) if (size(t) < size(best)) best = t;
        out[id] = best;
    }
    return out;
}

/**
 * Students who seem to tap before reading: at least 2 wrong answers in under
 * 1.5 seconds, and at least a third of what they answered. The teacher sees
 * this at the end, never the class.
 */
export function guessers<S extends { answered: number; fast_wrong: number }>(stats: readonly S[]): S[] {
    return stats.filter((s) => s.fast_wrong >= 2 && s.fast_wrong * 3 >= s.answered);
}
