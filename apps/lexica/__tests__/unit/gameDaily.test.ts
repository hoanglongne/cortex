import { describe, expect, it } from 'vitest';
import { addPlay, goalMet, weekSummary } from '../../app/lib/games/daily';
import { weekBoard, type DuelListItem } from '../../app/lib/duels';

describe('daily game goal', () => {
    it('counts plays and keeps the best score per day', () => {
        let log = addPlay({}, '2026-05-10', 40);
        log = addPlay(log, '2026-05-10', 70);
        log = addPlay(log, '2026-05-10', 20);
        expect(log['2026-05-10']).toEqual({ plays: 3, best: 70 });
        expect(goalMet(log, '2026-05-10')).toBe(true);
        expect(goalMet(log, '2026-05-11')).toBe(false);
    });

    it('keeps only 14 days', () => {
        let log = {};
        for (let d = 1; d <= 20; d++) log = addPlay(log, `2026-05-${String(d).padStart(2, '0')}`, d);
        expect(Object.keys(log)).toHaveLength(14);
        expect(log).not.toHaveProperty('2026-05-01');
    });

    it('sums the last 7 days', () => {
        let log = addPlay({}, '2026-05-10', 50);
        log = addPlay(log, '2026-05-06', 90);
        log = addPlay(log, '2026-05-01', 999);
        expect(weekSummary(log, '2026-05-10')).toEqual({ plays: 2, best: 90, days: 2 });
    });
});

const duel = (o: Partial<DuelListItem>): DuelListItem => ({
    id: 'd', created_at: '2026-05-09T10:00:00Z', expires_at: '2026-05-11T10:00:00Z', mine: true, with_id: 'b1', with_name: 'An', state: 'done',
    total: 8, i_finished: true, their_finished: true, my_correct: 5, their_correct: 3, ...o,
});

describe('week board', () => {
    const now = Date.parse('2026-05-10T12:00:00Z');
    it('counts wins, losses and draws per buddy, best first', () => {
        const rows = weekBoard(
            [duel({ id: '1' }), duel({ id: '2', my_correct: 2, their_correct: 6 }), duel({ id: '3', with_id: 'b2', with_name: 'Bình', my_correct: 4, their_correct: 4 }), duel({ id: '4', with_id: 'b2', with_name: 'Bình' })],
            now,
        );
        expect(rows.map((r) => [r.name, r.wins, r.losses, r.draws])).toEqual([['Bình', 1, 0, 1], ['An', 1, 1, 0]]);
    });
    it('ignores old, unfinished and hidden duels', () => {
        const rows = weekBoard([duel({ created_at: '2026-04-20T10:00:00Z' }), duel({ their_finished: false, their_correct: null }), duel({ i_finished: false })], now);
        expect(rows).toEqual([]);
    });
});
