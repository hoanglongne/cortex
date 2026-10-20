import { describe, expect, it } from 'vitest';
import { actionsByDay, calendar, daysBefore, dueForecast, intensity, reachedBetween, stepSeries, weeks } from '../../app/lib/stats';
import { understand } from '../../app/lib/journey/steps';

const t = (d: string, h = 10) => new Date(`${d}T${String(h).padStart(2, '0')}:00:00`).getTime();

describe('statistics', () => {
    const journeys = {
        a: { ...understand(undefined, t('2026-10-19')), rememberedAt: t('2026-10-20'), metAt: t('2026-10-20') },
        b: understand(undefined, t('2026-10-12')),
    };
    const activity = {
        journeys,
        studyHistory: { '2026-10-19': { swipes: 10 }, '2026-10-12': { swipes: 4 }, '2026-10-18': { swipes: 0 } },
        daysDone: ['2026-10-15'],
        sightings: [{ at: t('2026-10-20') }],
        spokenAt: { a: t('2026-10-20', 9) },
        mySentences: {},
    };

    it('counts every action on its day, finished sessions included', () => {
        const a = actionsByDay(activity);
        expect(a.get('2026-10-19')).toBe(10);
        expect(a.get('2026-10-20')).toBe(3); // met, sighting, spoken
        expect(a.get('2026-10-15')).toBe(1);
        expect(a.has('2026-10-18')).toBe(false);
    });

    it('compares this week with the last one', () => {
        const w = weeks(journeys, actionsByDay(activity), '2026-10-20');
        expect(w.now).toMatchObject({ activeDays: 3, reached: { hieu: 1, nho: 1, gap: 1, dung: 0 } });
        expect(w.before).toMatchObject({ activeDays: 1, reached: { hieu: 1, nho: 0, gap: 0, dung: 0 } });
        expect(reachedBetween(journeys, '2026-10-01', '2026-10-31').hieu).toBe(2);
    });

    it('lays out weeks Monday first, nothing in the future', () => {
        const cols = calendar(new Map([['2026-10-20', 5]]), '2026-10-20', 2);
        expect(cols).toHaveLength(2);
        expect(cols[1][0]).toEqual({ date: '2026-10-19', n: 0 }); // Monday
        expect(cols[1][1]).toEqual({ date: '2026-10-20', n: 5 });
        expect(cols[1][2]).toBeNull();
        expect(daysBefore('2026-03-01', 1)).toBe('2026-02-28');
    });

    it('scales colour to the days of this learner', () => {
        const all = [1, 2, 3, 4, 10, 20, 40, 80];
        expect(intensity(0, all)).toBe(0);
        expect(intensity(1, all)).toBe(1);
        expect(intensity(80, all)).toBe(4);
        expect(intensity(5, [5])).toBe(2);
    });

    it('fills step history gaps and forecasts reviews', () => {
        const s = stepSeries({ '2026-10-17': { hieu: 3, nho: 1, gap: 0, dung: 0 } }, { hieu: 5, nho: 2, gap: 1, dung: 0 }, '2026-10-20', 5);
        expect(s.map((x) => x.counts.hieu)).toEqual([0, 3, 3, 3, 5]);
        const f = dueForecast({ a: { nextReviewAt: t('2026-10-19') }, b: { nextReviewAt: t('2026-10-22') }, c: { nextReviewAt: t('2026-11-30') } }, t('2026-10-20'), 7);
        expect(f[0]).toEqual({ date: '2026-10-20', n: 1 });
        expect(f[2]).toEqual({ date: '2026-10-22', n: 1 });
        expect(f.reduce((n, x) => n + x.n, 0)).toBe(2);
    });
});
