import { describe, expect, it } from 'vitest';
import { clampPace, dailyNewWords, paceNudge, projection, sessionMinutes } from '../../app/lib/journey/pace';
import type { StepCounts } from '../../app/lib/journey/steps';

const c = (hieu: number): StepCounts => ({ hieu, nho: 0, gap: 0, dung: 0 });
/** Snapshots for 2026-05-01.. with the given Hiểu totals. */
const hist = (totals: number[]): Record<string, StepCounts> =>
    Object.fromEntries(totals.map((t, i) => [`2026-05-${String(i + 1).padStart(2, '0')}`, c(t)]));

describe('pace', () => {
    it('clamps and rounds the chosen pace', () => {
        expect(clampPace(1)).toBe(3);
        expect(clampPace(99)).toBe(40);
        expect(clampPace(12.6)).toBe(13);
        expect(clampPace(NaN)).toBe(3);
    });

    it('projects cumulative words and minutes', () => {
        expect(projection(12)[29]).toBe(360);
        expect(projection(10, 3)).toEqual([10, 20, 30]);
        expect(sessionMinutes(10)).toBe(10);
        expect(sessionMinutes(15)).toBe(13);
    });

    it('reads new words per day from snapshot growth', () => {
        const days = dailyNewWords(hist([0, 5, 5, 9]), '2026-05-05', 4);
        expect(days).toEqual([0, 5, 0, 4]);
    });

    it('nudges to the average when most days fall short', () => {
        const n = paceNudge(15, hist([0, 6, 6, 12, 12, 18, 24, 24]), '2026-05-09');
        expect(n).toMatchObject({ suggested: 4, shortDays: 7 });
    });

    it('does not nudge when the pace fits, history is short or pace is at minimum', () => {
        expect(paceNudge(10, hist([0, 10, 20, 30, 40, 50, 60, 70]), '2026-05-09')).toBeNull();
        expect(paceNudge(15, hist([0, 3]), '2026-05-03')).toBeNull();
        expect(paceNudge(3, hist([0, 0, 0, 0, 0, 0, 0, 0]), '2026-05-09')).toBeNull();
    });
});
