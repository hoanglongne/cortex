import { describe, expect, it } from 'vitest';
import { BRANCH_PROMISE, BRANCH_ROWS, BRANCH_SWITCH_NOTE } from '../../app/lib/journey/branchInfo';

describe('branch info', () => {
    it('compares both branches on every row', () => {
        expect(BRANCH_ROWS.length).toBeGreaterThanOrEqual(3);
        for (const r of BRANCH_ROWS) expect(r.cert && r.talk).toBeTruthy();
    });

    it('never promises a band or certainty', () => {
        const all = [...BRANCH_ROWS.flatMap((r) => [r.cert, r.talk]), BRANCH_PROMISE.cert, BRANCH_PROMISE.talk, BRANCH_SWITCH_NOTE].join(' ').toLowerCase();
        expect(all).not.toMatch(/chắc chắn|đảm bảo đạt|cam kết đạt/);
        expect(all).not.toMatch(/band \d/);
    });
});
