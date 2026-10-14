import { describe, expect, it } from 'vitest';
import { currentSchedule, DAY_MS, DEFAULT_EASE, formatInterval, MAX_INTERVAL_DAYS, nextSchedule, type Quality } from '../../app/lib/srs';

const run = (answers: [boolean, Quality?][]) => {
    let s = currentSchedule(undefined);
    const days: number[] = [];
    for (const [correct, q] of answers) {
        s = nextSchedule(s, correct, q);
        days.push(s.intervalDays);
    }
    return { s, days };
};

describe('nextSchedule', () => {
    it('grows a recalled word out to weeks: 1, 3, 8, 20, 50 days', () => {
        const { days } = run([[true], [true], [true], [true], [true]]);
        expect(days).toEqual([1, 3, 8, 20, 50]);
    });

    it('easy answers grow faster than good, hard ones slower', () => {
        const good = run([[true], [true], [true], [true]]).days.at(-1)!;
        const easy = run([[true, 'easy'], [true, 'easy'], [true, 'easy'], [true, 'easy']]).days.at(-1)!;
        const hard = run([[true, 'hard'], [true, 'hard'], [true, 'hard'], [true, 'hard']]).days.at(-1)!;
        expect(easy).toBeGreaterThan(good);
        expect(hard).toBeLessThan(good);
    });

    it('a miss sends it back to tomorrow and lowers its ease', () => {
        const { s } = run([[true], [true], [true], [false]]);
        expect(s.intervalDays).toBe(1);
        expect(s.streak).toBe(0);
        expect(s.ease).toBeLessThan(DEFAULT_EASE);
    });

    it('a word missed often grows more slowly afterwards', () => {
        const clean = run([[true], [true], [true], [true]]).days.at(-1)!;
        const shaky = run([[false], [false], [false], [true], [true], [true], [true]]).days.at(-1)!;
        expect(shaky).toBeLessThan(clean);
    });

    it('never shrinks on a hard right answer and caps at six months', () => {
        const s = nextSchedule({ ease: 1.3, intervalDays: 10, streak: 5 }, true, 'hard');
        expect(s.intervalDays).toBeGreaterThan(10);
        const big = nextSchedule({ ease: 3, intervalDays: 150, streak: 9 }, true, 'easy');
        expect(big.intervalDays).toBe(MAX_INTERVAL_DAYS);
    });
});

describe('currentSchedule', () => {
    it('reads the saved schedule', () => {
        expect(currentSchedule({ lastReviewedAt: 0, nextReviewAt: 0, reviewCount: 3, ease: 2.1, intervalDays: 9, streak: 4 }))
            .toEqual({ ease: 2.1, intervalDays: 9, streak: 4 });
    });

    it('rebuilds a schedule for progress saved on the old fixed ladder', () => {
        const s = currentSchedule({ lastReviewedAt: 0, nextReviewAt: 7 * DAY_MS, reviewCount: 2 });
        expect(s).toEqual({ ease: DEFAULT_EASE, intervalDays: 7, streak: 2 });
        // and continues from it instead of starting over
        expect(nextSchedule(s, true).intervalDays).toBe(18);
    });
});

describe('formatInterval', () => {
    it('reads naturally', () => {
        expect(formatInterval(1)).toBe('mai');
        expect(formatInterval(8)).toBe('8 ngày');
        expect(formatInterval(20)).toBe('3 tuần');
        expect(formatInterval(90)).toBe('3 tháng');
    });
});
