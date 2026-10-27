import { describe, expect, it } from 'vitest';
import { timeLeft, type Board } from '@cortex/classroom';
import { arenaQuestions, arenaTeams, fillTeams, forgettingWords, guessers, hardWords, shortMeaning, sourceWords } from '../app/lib/arena';
import type { IndexCard } from '../app/modules/lexica/words';

const card = (id: string, word: string, meaning: string, level = 'intermediate', branch: 'cert' | 'talk' = 'cert'): IndexCard => ({ id, word, meaning, level, branch });
const POOL = [
    card('v1', 'environment', 'môi trường'),
    card('v2', 'pollution', 'sự ô nhiễm'),
    card('v3', 'recycle', 'tái chế'),
    card('v4', 'sustainable', 'bền vững'),
    card('v5', 'habitat', 'môi trường sống; nơi ở'),
    card('v6', 'surroundings', 'môi trường'), // the same meaning as v1: never a wrong option for it
    card('v7', 'hello', 'xin chào', 'beginner', 'talk'),
    card('v8', 'empty', ''),
];
// A fixed "random" so the tests are stable
const seq = (() => {
    let x = 7;
    return () => {
        x = (x * 9301 + 49297) % 233280;
        return x / 233280;
    };
})();

describe('questions', () => {
    const qs = arenaQuestions(POOL.slice(0, 5).concat(POOL[7]), POOL, 10, seq);

    it('alternates word→meaning and meaning→word, skipping words without a meaning', () => {
        expect(qs).toHaveLength(5);
        expect(qs.map((q) => q.kind)).toEqual(['meaning', 'word', 'meaning', 'word', 'meaning']);
        expect(qs.some((q) => q.card_id === 'v8')).toBe(false);
    });

    it('has the right answer once, distinct options, and no second right answer', () => {
        for (const q of qs) {
            const t = POOL.find((c) => c.id === q.card_id)!;
            const right = q.kind === 'meaning' ? shortMeaning(t.meaning) : t.word;
            expect(q.options[q.answer]).toBe(right);
            expect(q.prompt).toBe(q.kind === 'meaning' ? t.word : shortMeaning(t.meaning));
            expect(new Set(q.options.map((o) => o.toLowerCase())).size).toBe(q.options.length);
            expect(q.options.length).toBe(4);
            if (q.card_id === 'v1') expect(q.options).not.toContain('surroundings');
        }
    });

    it('prefers wrong options of the same level and branch', () => {
        // 'xin chào' / 'hello' (beginner, talk) only when nothing closer is left
        expect(qs.flatMap((q) => q.options)).not.toContain('xin chào');
        expect(qs.flatMap((q) => q.options)).not.toContain('hello');
    });

    it('stops at n, and skips a word with nothing to mix it with', () => {
        expect(arenaQuestions(POOL, POOL, 3, seq)).toHaveLength(3);
        expect(arenaQuestions([POOL[0]], [POOL[0], POOL[5]], 5, seq)).toEqual([]);
    });

    it('keeps meanings short for a button', () => {
        expect(shortMeaning('môi trường sống; nơi ở')).toBe('môi trường sống');
        expect(shortMeaning('x'.repeat(80))).toHaveLength(60);
    });
});

describe('which words', () => {
    const lesson = (id: string, ids: string[], forUser: string | null = null) => ({ id, app: 'lexica', kind: 'words', title: id, payload: { card_ids: ids, missing_words: [], mode: 'only' }, due_on: null, created_at: '2026-10-20', for_user: forUser });
    const board = {
        class: { id: 'c1', apps: ['lexica'] },
        assignments: [lesson('a2', ['v3', 'v4']), lesson('a1', ['v1', 'v2', 'v3']), lesson('r', ['v9'], 'u1')],
        students: [
            { user_id: 'u1', apps: { lexica: { metrics: { counts: {}, words: {}, sounds: {}, review: { overdue: 1, due7: 0, recall14: [0, 0], atRisk: ['v2', 'v3'] } } } } },
            { user_id: 'u2', apps: { lexica: { metrics: { counts: {}, words: {}, sounds: {}, review: { overdue: 1, due7: 0, recall14: [0, 0], atRisk: ['v3'] } } } } },
        ],
    } as unknown as Board;

    it('takes a lesson, all class lessons (not one student’s review) or what the class is forgetting', () => {
        expect(sourceWords(board, { kind: 'lesson', assignmentId: 'a1' })).toEqual(['v1', 'v2', 'v3']);
        expect(sourceWords(board, { kind: 'all' })).toEqual(['v3', 'v4', 'v1', 'v2']);
        expect(forgettingWords(board)).toEqual(['v3', 'v2']);
        expect(sourceWords(board, { kind: 'cards', ids: ['v1', 'v1', 'v2'] })).toEqual(['v1', 'v2']);
    });

    it('finds the words most of the class got wrong', () => {
        expect(hardWords([{ card_id: 'v1', answered: 10, correct: 9 }, { card_id: 'v2', answered: 10, correct: 4 }, { card_id: 'v3', answered: 0, correct: 0 }])).toEqual(['v2']);
    });
});

describe('shared clock', () => {
    it("counts down on the server's time, whatever the device clock says", () => {
        const v = { seconds: 20, q_opened_at: '2026-10-27T10:00:00.000Z', now: '2026-10-27T10:00:05.000Z' };
        // The device clock is 1 hour behind; it got the answer at its own 09:00:05
        const got = Date.parse('2026-10-27T09:00:05.000Z');
        expect(timeLeft(v, got, got)).toBe(15_000);
        expect(timeLeft(v, got, got + 3_000)).toBe(12_000);
        expect(timeLeft(v, got, got + 60_000)).toBe(0);
        expect(timeLeft({ ...v, q_opened_at: null }, got, got)).toBe(0);
    });
});

describe('teams', () => {
    const players = [
        { id: 'a', strength: 1200 },
        { id: 'b', strength: 1100 },
        { id: 'c', strength: 1000 },
        { id: 'd', strength: 900 },
        { id: 'e', strength: null },
        { id: 'f', strength: 800 },
    ];

    it('deals strongest first, back and forth, so teams are even', () => {
        const t = arenaTeams(players, 2, seq);
        expect(Object.keys(t)).toHaveLength(6);
        const sum = (n: number) => players.filter((p) => t[p.id] === n).reduce((x, p) => x + (p.strength ?? 1000), 0);
        expect(Object.values(t).filter((x) => x === 1)).toHaveLength(3);
        // 1200 and 1100 are split; the totals are close
        expect(t.a).not.toBe(t.b);
        expect(Math.abs(sum(1) - sum(2))).toBeLessThanOrEqual(200);
        const three = arenaTeams(players, 3, seq);
        expect(new Set(Object.values(three))).toEqual(new Set([1, 2, 3]));
        expect([1, 2, 3].map((n) => Object.values(three).filter((x) => x === n).length)).toEqual([2, 2, 2]);
    });

    it('puts late players in the smallest team and drops ones who left', () => {
        expect(fillTeams({ a: 1, b: 2, c: 1, gone: 2 }, ['a', 'b', 'c', 'd', 'e'], 2)).toEqual({ a: 1, b: 2, c: 1, d: 2, e: 1 });
        expect(fillTeams({ a: 7 }, ['a'], 3)).toEqual({ a: 1 });
    });
});

describe('guessing', () => {
    it('flags several quick wrong answers, not one slip', () => {
        const s = (fast_wrong: number, answered: number) => ({ name: `${fast_wrong}/${answered}`, fast_wrong, answered });
        expect(guessers([s(1, 10), s(2, 10), s(3, 9), s(4, 10), s(2, 4)]).map((x) => x.name)).toEqual(['3/9', '4/10', '2/4']);
    });
});
