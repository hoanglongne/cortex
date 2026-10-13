import { beforeEach, describe, expect, it } from 'vitest';
import { answer, bank, initialRisk, multiplier, pickNext, total } from '@/app/lib/engagement/risk';
import { getGhost, ghostCorrectAt, localDate, previousDate, recordRun } from '@/app/lib/engagement/ghost';
import { buildSets, MAX_SET_SIZE, setProgress, topicOf } from '@/app/lib/engagement/collection';
import { getAllCards } from '@/app/lib/content/repository';
import { freezeTarget, pendingClaims } from '@/app/lib/engagement/claims';
import { economyMessage, hasShield } from '@/app/lib/engagement/economy';
import { readShieldsUsed, spendShield } from '@/app/lib/engagement/shields';
import { wrapLines } from '@/app/lib/engagement/shareCard';

describe('Liều hay Dừng', () => {
    it('climbs the ladder and caps at x5', () => {
        let s = initialRisk();
        for (let i = 0; i < 6; i++) s = answer(s, true);
        // 10 + 15 + 20 + 30 + 50 + 50
        expect(s.pot).toBe(175);
        expect(multiplier(s)).toBe(5);
    });

    it('banking keeps points; a wrong answer only empties the pot', () => {
        let s = answer(answer(initialRisk(), true), true); // pot 25
        s = bank(s);
        expect(s).toMatchObject({ banked: 25, pot: 0, step: 0 });
        s = answer(s, true);
        s = answer(s, false);
        expect(s).toMatchObject({ banked: 25, pot: 0, step: 0, bestPot: 25 });
        expect(total(s)).toBe(25);
    });

    it('a shield keeps the pot on a wrong answer', () => {
        const s = answer(initialRisk(), true);
        expect(answer(s, false, true)).toEqual(s);
    });

    it('Liều picks the next harder word', () => {
        const qs = [{ elo: 900 }, { elo: 1300 }, { elo: 1100 }];
        expect(pickNext(qs, 1000, true)).toBe(2);
        expect(pickNext(qs, 1400, true)).toBe(1);
        expect(pickNext(qs, 1000, false)).toBe(0);
        expect(pickNext([], 1000, true)).toBe(-1);
    });
});

describe('ghost of yesterday', () => {
    beforeEach(() => localStorage.clear());

    const run = (date: string, score: number, correct = 3) => ({
        date,
        score,
        correct,
        total: 5,
        durationMs: 40_000,
        bestPot: score,
        timeline: [[5_000, 1], [10_000, 0], [15_000, 1], [20_000, 1]] as [number, 0 | 1][],
    });

    it('dates step back across months', () => {
        expect(previousDate('2026-03-01')).toBe('2026-02-28');
        expect(localDate(new Date(2026, 0, 5, 9).getTime())).toBe('2026-01-05');
    });

    it('replays yesterday and keeps only the best run of a day', () => {
        recordRun(run('2026-10-10', 50));
        recordRun(run('2026-10-10', 30));
        const ghost = getGhost('2026-10-11')!;
        expect(ghost.score).toBe(50);
        expect(ghostCorrectAt(ghost, 12_000)).toBe(1);
        expect(ghostCorrectAt(ghost, 60_000)).toBe(3);
    });

    it('counts a 3-day winning streak once', () => {
        recordRun(run('2026-10-07', 10));
        expect(recordRun(run('2026-10-08', 20)).winStreak).toBe(1);
        expect(recordRun(run('2026-10-09', 30)).winStreak).toBe(2);
        const third = recordRun(run('2026-10-10', 40));
        expect(third).toMatchObject({ beat: true, winStreak: 3, streakReached: true, scoreDiff: 10 });
        expect(recordRun(run('2026-10-10', 45)).streakReached).toBe(false);
        expect(recordRun(run('2026-10-11', 5)).beat).toBe(false);
    });

    it('has no ghost on the first day', () => {
        expect(recordRun(run('2026-10-10', 10)).beat).toBeNull();
    });
});

describe('album sets', () => {
    it('puts every core card in exactly one topic set of at most MAX_SET_SIZE', () => {
        const cards = getAllCards();
        const unique = new Set(cards.map((c) => c.id)).size;
        const sets = buildSets(cards);
        const ids = sets.flatMap((s) => s.cardIds);
        expect(ids.length).toBe(unique);
        expect(new Set(ids).size).toBe(unique);
        expect(Math.max(...sets.map((s) => s.cardIds.length))).toBeLessThanOrEqual(MAX_SET_SIZE);
        expect(new Set(sets.map((s) => s.id)).size).toBe(sets.length);
    });

    it('groups Trend Drop cards into a season set', () => {
        const base = { word: 'X', elo: 1000, level: 'intermediate' as const, translationHint: 'x' };
        const sets = buildSets(
            [
                { ...base, id: 'ta', scenario: 'lương chưa về', trend: { label: 'bill', dropId: '2026-w41', expiresAt: '2026-10-20T00:00:00Z' } },
                { ...base, id: 'v1', scenario: 'lương chưa về' },
            ],
            { '2026-w41': 'Drop tuần 41' },
        );
        expect(sets[0]).toMatchObject({ id: 'season-2026-w41', label: 'Drop tuần 41', kind: 'season', cardIds: ['ta'] });
        expect(topicOf({ scenario: 'sếp hối deadline' })).toBe('work');
    });

    it('reports owned and completed sets', () => {
        const set = { id: 's', label: 'S', kind: 'topic' as const, cardIds: ['a', 'b'] };
        const p = (state: 'seed' | 'mastered') => ({ cardId: 'x', state, lastReviewedAt: 0, nextReviewAt: 0, reviewCount: 1, wrongCount: 0 });
        expect(setProgress(set, { a: p('mastered') })).toEqual({ owned: 1, mastered: 1, total: 2, complete: false });
        expect(setProgress(set, { a: p('seed'), b: p('seed') }).complete).toBe(true);
    });
});

describe('economy helpers', () => {
    const base = { today: '2026-10-13', dailyProgress: 15, dailyGoal: 15, progressDate: '2026-10-13', currentStreak: 8, claimed: new Set<string>() };

    it('claims the daily goal and reached streak milestones once', () => {
        expect(pendingClaims(base).map((c) => `${c.kind}:${c.ref}`)).toEqual(['daily_goal:2026-10-13', 'streak_7:7']);
        expect(pendingClaims({ ...base, claimed: new Set(['daily_goal:2026-10-13', 'streak_7:7']) })).toEqual([]);
        expect(pendingClaims({ ...base, progressDate: '2026-10-12', currentStreak: 2 })).toEqual([]);
    });

    it('covers exactly one missed day with a freeze', () => {
        expect(freezeTarget('2026-10-11', '2026-10-13', previousDate)).toBe('2026-10-12');
        expect(freezeTarget('2026-10-12', '2026-10-13', previousDate)).toBeNull();
        expect(freezeTarget('2026-10-01', '2026-10-13', previousDate)).toBeNull();
        expect(freezeTarget(null, '2026-10-13', previousDate)).toBeNull();
    });

    it('shields only from Holo up, once per word per day', () => {
        expect(hasShield({ edition: 'silver', serial: null, rerolls: 0 })).toBe(false);
        expect(hasShield({ edition: 'holo', serial: null, rerolls: 0 })).toBe(true);
        localStorage.clear();
        spendShield('v1', '2026-10-13');
        expect(readShieldsUsed('2026-10-13').has('v1')).toBe(true);
        expect(readShieldsUsed('2026-10-14').has('v1')).toBe(false);
    });

    it('translates server errors and wraps share text', () => {
        expect(economyMessage('no boxes')).toBe('Bạn chưa có hộp nào.');
        expect(economyMessage('Failed to fetch')).toMatch(/kết nối/);
        expect(wrapLines('một hai ba bốn năm sáu', 8)).toEqual(['một hai', 'ba bốn', 'năm sáu']);
    });
});
