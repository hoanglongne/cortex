import { beforeEach, describe, expect, it } from 'vitest';
import { getRival, recordRun } from '@/app/lib/engagement/ghost';
import { dustFor, POINTS_PER_DUST, REVIEW_DUST_DAILY_CAP, reviewDustLine } from '@/app/lib/engagement/reviewDust';

describe('review points to Bụi', () => {
    it('pays 1 Bụi per 10 banked points', () => {
        expect(POINTS_PER_DUST).toBe(10);
        expect(dustFor(120)).toBe(12);
        expect(dustFor(9)).toBe(0);
        expect(dustFor(-5)).toBe(0);
    });

    it('stops at 30 Bụi a day', () => {
        expect(REVIEW_DUST_DAILY_CAP).toBe(30);
        expect(dustFor(500)).toBe(30);
        expect(dustFor(120, 25)).toBe(5);
        expect(dustFor(120, 30)).toBe(0);
        expect(dustFor(120, 40)).toBe(0);
    });

    it('says what the points turned into', () => {
        expect(reviewDustLine({ status: 'paid', points: 120, dust: 12, capped: false })).toBe('Chốt 120 điểm → +12 Bụi');
        expect(reviewDustLine({ status: 'paid', points: 400, dust: 5, capped: true })).toContain('đủ 30 Bụi hôm nay');
        expect(reviewDustLine({ status: 'paid', points: 80, dust: 0, capped: true })).toContain('đã đủ 30 Bụi');
        expect(reviewDustLine({ status: 'signed-out', points: 80 })).toContain('đăng nhập');
    });
});

describe('fallback rival', () => {
    beforeEach(() => localStorage.clear());

    const run = (date: string, score: number) => ({
        date,
        score,
        correct: 3,
        total: 5,
        durationMs: 40_000,
        bestPot: score,
        timeline: [] as [number, 0 | 1][],
    });

    it('races yesterday when there was a session', () => {
        recordRun(run('2026-10-14', 40));
        expect(getRival('2026-10-15')).toMatchObject({ date: '2026-10-14', label: 'hôm qua', short: 'Hôm qua' });
    });

    it('otherwise races the latest session of the last 7 days, named by weekday', () => {
        recordRun(run('2026-10-10', 70));
        recordRun(run('2026-10-13', 40)); // a Tuesday
        expect(getRival('2026-10-15')).toMatchObject({ date: '2026-10-13', label: 'hôm thứ Ba', short: 'Thứ Ba' });
        // and the result compares with that same session
        expect(recordRun(run('2026-10-15', 50))).toMatchObject({ beat: true, scoreDiff: 10 });
    });

    it('has no rival when the last session is over a week old', () => {
        recordRun(run('2026-10-01', 40));
        expect(getRival('2026-10-15')).toBeNull();
    });
});
