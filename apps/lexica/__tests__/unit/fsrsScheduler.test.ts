import { describe, expect, it } from 'vitest';
import { bucket, FSRS_ROLLOUT, fsrsDueAt, sm2DueAt, usesFsrs } from '../../app/lib/learner/scheduler';

const D = 86_400_000;
const mem = (s: number) => ({ s, d: 5, last: 0, reps: 3, lapses: 0 });

describe('FSRS scheduler (F2, off)', () => {
    it('is off for everyone while the rollout is 0', () => {
        expect(FSRS_ROLLOUT).toBe(0);
        expect(usesFsrs('abc')).toBe(false);
        expect(usesFsrs(undefined, 100)).toBe(false);
        expect(usesFsrs('abc', 100)).toBe(true);
        expect(bucket('abc')).toBe(bucket('abc'));
    });

    it('takes the nearer of the FSRS and SM-2 dates', () => {
        const now = 100 * D;
        // stability 20 days at 90% retention: due in ~20 days
        expect(fsrsDueAt(mem(20), now, { sm2DueAt: now + 5 * D, prevGapDays: 10, switchedAt: 0 })).toBe(now + 5 * D);
        expect(fsrsDueAt(mem(20), now, { sm2DueAt: now + 60 * D, prevGapDays: 10, switchedAt: 0 })).toBe(now + 20 * D);
    });

    it('limits growth to x1.5 in the first two weeks after switching', () => {
        const now = 100 * D;
        expect(fsrsDueAt(mem(20), now, { sm2DueAt: now + 60 * D, prevGapDays: 4, switchedAt: now - 3 * D })).toBe(now + 6 * D);
    });

    it('restores the SM-2 date from its own fields', () => {
        expect(sm2DueAt({ lastReviewedAt: 10 * D, intervalDays: 3, nextReviewAt: 99 })).toBe(13 * D);
        expect(sm2DueAt({ lastReviewedAt: 10 * D, nextReviewAt: 99 })).toBe(99);
    });
});
