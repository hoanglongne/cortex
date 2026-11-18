import { describe, expect, it } from 'vitest';
import { calibrate, checkCandidates, checkDue, dialGroup, experimentReport, seenWeight } from '../../app/lib/learner/dialSignal';
import type { EvidenceRow } from '../../app/lib/learner/model';

const DAY = 86_400_000;
const T = 1_800_000_000_000;

describe('Blend signals', () => {
    it('"seen" is worth little until checks back it, and almost nothing if they do not', () => {
        expect(seenWeight(undefined)).toBe(0.2);
        expect(seenWeight({ asked: 5, correct: 5 })).toBe(0.2);
        expect(seenWeight({ asked: 20, correct: 10 })).toBe(0.02);
        expect(seenWeight({ asked: 20, correct: 20 })).toBe(0.3);
        expect(seenWeight({ asked: 20, correct: 17 })).toBeCloseTo(0.15, 2);
    });

    it('asks only words seen this week and not missed or checked since', () => {
        const log: EvidenceRow[] = [
            ['v001', 0, 'dial', 'seen', 0.2, T - DAY],
            ['v002', 0, 'dial', 'seen', 0.2, T - 2 * DAY],
            ['v002', 0, 'dial', 'wrong', 1, T - DAY],
            ['v003', 0, 'dial', 'seen', 0.2, T - 9 * DAY],
            ['v004', 0, 'dial', 'seen', 0.2, T - 3 * DAY],
            ['v004', 0, 'check', 'right', 1, T - 2 * DAY],
            ['v005', 0, 'dial', 'seen', 0.2, T - 4 * DAY],
        ];
        expect(checkCandidates(log, T)).toEqual(['v001', 'v005']);
    });

    it('is due weekly with enough words, and calibration adds up', () => {
        expect(checkDue(undefined, 2, T)).toBe(false);
        expect(checkDue(undefined, 3, T)).toBe(true);
        const c = calibrate(undefined, 5, 4, T);
        expect(c).toEqual({ asked: 5, correct: 4, lastCheck: T });
        expect(checkDue(c, 5, T + 6 * DAY)).toBe(false);
        expect(checkDue(c, 5, T + 7 * DAY)).toBe(true);
    });

    it('splits words stably about half and half, and reports by group', () => {
        const ids = Array.from({ length: 400 }, (_, i) => `v${String(i + 1).padStart(3, '0')}`);
        const dial = ids.filter((id) => dialGroup(id, 'seed') === 'dial').length;
        expect(dial).toBeGreaterThan(150);
        expect(dial).toBeLessThan(250);
        expect(dialGroup('v001', 'seed')).toBe(dialGroup('v001', 'seed'));
        const log: EvidenceRow[] = [['v001', 0, 'review', 'right', 1, T], ['v001', 0, 'review', 'right', 1, T + 14 * DAY], ['v001', 0, 'review', 'wrong', 1, T + 30 * DAY]];
        const r = experimentReport({ log }, 'seed');
        const g = r[dialGroup('v001', 'seed')];
        expect(g.d14).toEqual([1, 1]);
        expect(g.d30).toEqual([0, 1]);
    });
});
