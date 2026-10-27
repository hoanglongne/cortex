import { describe, expect, it } from 'vitest';
import type { Board, TestResults } from '@cortex/classroom';
import { personalReviews, testReviews, weakClassWords } from '../app/lib/suggest';

const TODAY = '2026-10-27';
const lesson = (id: string, ids: string[], created: string, forUser: string | null = null) => ({ id, app: 'lexica', kind: 'words', title: id, payload: { card_ids: ids, missing_words: [], mode: 'only' }, due_on: null, created_at: `${created}T10:00:00Z`, for_user: forUser });
const student = (id: string, words: Record<string, number>, atRisk: string[] = []) => ({
    user_id: id,
    name: id.toUpperCase(),
    apps: { lexica: { metrics: { counts: {}, words, sounds: {}, review: { overdue: atRisk.length, due7: 0, recall14: [0, 0], atRisk } } } },
});

describe('smart assignments', () => {
    const board = {
        class: { id: 'c', apps: ['lexica'] },
        assignments: [
            lesson('new', ['n1', 'n2'], '2026-10-25'), // too new to judge
            lesson('old', ['w1', 'w2', 'w3'], '2026-10-10'),
            lesson('rev', ['w1', 'w2', 'w3'], '2026-10-24', 'u2'), // u2 already has a review this week
        ],
        students: [
            student('u1', { w1: 2, w2: 0, w3: 4 }, ['w1', 'w2', 'w3', 'x9']),
            student('u2', { w1: 1, w2: 0, w3: 3 }, ['w1', 'w2', 'w3']),
            student('u3', { w1: 3, w2: 1, w3: 2 }, ['w2', 'n1']),
            { user_id: 'u4', name: 'U4', apps: {} },
        ],
    } as unknown as Board;

    it('finds lesson words most of the class has not remembered, once the lesson has settled', () => {
        // w2: 0 of 3 remember; w1: 2 of 3; w3: 3 of 3; n1/n2 are too new
        expect(weakClassWords(board, TODAY)).toEqual(['w2']);
        expect(weakClassWords({ ...board, students: board.students.slice(0, 2) }, TODAY)).toEqual([]);
    });

    it('gives each student their own words about to be forgotten, not twice in a week', () => {
        // u1: lesson words only (x9 is not a lesson word); u2 had one this week; u3 has fewer than 3
        expect(personalReviews(board, TODAY)).toEqual([{ userId: 'u1', name: 'U1', cardIds: ['w1', 'w2', 'w3'] }]);
    });

    it('after a test, each student reviews what they missed', () => {
        const results = {
            students: [
                { user_id: 'u1', name: 'U1', status: 'submitted', correct: 8, missed: ['w2', 'w2', 'w3'] },
                { user_id: 'u2', name: 'U2', status: 'submitted', correct: 10, missed: [] },
                { user_id: 'u3', name: 'U3', status: 'started' },
                { user_id: 'gone', name: 'X', status: 'submitted', missed: ['w1'] },
            ],
        } as unknown as TestResults;
        expect(testReviews(results, board)).toEqual([{ userId: 'u1', name: 'U1', cardIds: ['w2', 'w3'] }]);
    });
});
