import { describe, expect, it } from 'vitest';
import { emptyLearner, type EvidenceRow } from '../../app/lib/learner/model';
import { fitRows, REPORT_EVERY_MS, weeklyReport } from '../../app/lib/learner/report';

const D = 86_400_000;

describe('fitRows', () => {
    it('keeps graded recog reviews with the gap in days, skipping first reviews and weak rows', () => {
        const log: EvidenceRow[] = [
            ['a', 0, 'review', 'right', 1, 0],
            ['a', 0, 'dial', 'seen', 0.2, D],
            ['a', 1, 'write', 'right', 1, D],
            ['a', 0, 'review', 'wrong', 1, 3 * D],
            ['b', 0, 'review', 'right', 1, 3 * D],
        ];
        expect(fitRows(log)).toEqual([['a', 0, 3]]);
        expect(fitRows(log, 3 * D)).toEqual([]);
    });
});

describe('weeklyReport', () => {
    const state = {
        ...emptyLearner(),
        log: [['a', 0, 'review', 'right', 1, 0], ['a', 0, 'review', 'right', 1, 2 * D]] as EvidenceRow[],
        metrics: { fsrs: { n: 10, logLoss: 4, brier: 1 }, sm2: { n: 10, logLoss: 6, brier: 2 } },
    };

    it('sends sums since the last report, then waits a week', () => {
        const first = weeklyReport(state, undefined, 5 * D)!;
        expect(first.props).toMatchObject({ n: 10, ll_fsrs: 4, ll_sm2: 6, rows: '[["a",1,2]]' });
        expect(weeklyReport(state, first.mark, 5 * D + REPORT_EVERY_MS - 1)).toBeNull();
        const more = { ...state, metrics: { fsrs: { n: 12, logLoss: 5, brier: 1.5 }, sm2: { n: 12, logLoss: 7, brier: 2.5 } } };
        const next = weeklyReport(more, first.mark, 5 * D + REPORT_EVERY_MS)!;
        expect(next.props).toMatchObject({ n: 2, ll_fsrs: 1, ll_sm2: 1, rows: '[]', n_total: 12 });
    });

    it('sends nothing when there is nothing new', () => {
        expect(weeklyReport(emptyLearner(), undefined, D)).toBeNull();
    });
});
