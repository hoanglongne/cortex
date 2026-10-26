import { describe, expect, it } from 'vitest';
import { addRecall, recallTotals, REVIEW_KEEP_DAYS, reviewNumbers } from '../../app/lib/journey/reviewLog';

const DAY = 86_400_000;

describe('review log', () => {
    it('adds recalls per day and drops days older than 30', () => {
        let log = addRecall({ '2026-09-01': [3, 4] }, '2026-10-25', true);
        log = addRecall(log, '2026-10-25', false);
        expect(log).toEqual({ '2026-10-25': [1, 2] });
        expect(REVIEW_KEEP_DAYS).toBe(30);
    });

    it('totals the last 14 days, today included', () => {
        const log = { '2026-10-25': [2, 3] as [number, number], '2026-10-12': [5, 5] as [number, number], '2026-10-11': [9, 9] as [number, number] };
        expect(recallTotals(log, '2026-10-25')).toEqual([7, 8]);
    });
});

describe('review numbers', () => {
    const now = Date.UTC(2026, 9, 25, 12);
    const journeys = {
        a: { understoodAt: 1, recalls: [] },
        known: { understoodAt: 5, rememberedAt: 5, recalls: [] },
    };

    it('counts overdue and due-this-week words, skipping words known beforehand', () => {
        const progress = {
            a: { nextReviewAt: now - DAY },
            b: { nextReviewAt: now + 2 * DAY },
            c: { nextReviewAt: now + 9 * DAY },
            known: { nextReviewAt: now - 10 * DAY },
        };
        expect(reviewNumbers(progress, journeys, new Set(), {}, '2026-10-25', now)).toEqual({ overdue: 1, due7: 1, recall14: [0, 0], atRisk: [] });
    });

    it('lists lesson words overdue by more than 3 days, longest first', () => {
        const progress = {
            l1: { nextReviewAt: now - 4 * DAY },
            l2: { nextReviewAt: now - 9 * DAY },
            l3: { nextReviewAt: now - 2 * DAY },
            other: { nextReviewAt: now - 20 * DAY },
        };
        const r = reviewNumbers(progress, {}, new Set(['l1', 'l2', 'l3']), { '2026-10-20': [8, 10] }, '2026-10-25', now);
        expect(r.atRisk).toEqual(['l2', 'l1']);
        expect(r.overdue).toBe(4);
        expect(r.recall14).toEqual([8, 10]);
    });
});
