import { describe, expect, it } from 'vitest';
import { RECHECK_DAYS, selfCheckFor, shouldOpen } from '../../app/lib/pronunciation/selfCheck';

describe('self-checks (#155)', () => {
    it('picks the object that fits the sound', () => {
        expect(selfCheckFor('P')?.id).toBe('paper');
        expect(selfCheckFor('Z1')?.id).toBe('throat');
        expect(selfCheckFor('TH')?.id).toBe('mirror');
        expect(selfCheckFor('V')?.id).toBe('lips');
        expect(selfCheckFor('SH')?.id).toBe('hold');
        expect(selfCheckFor('IY')).toBeNull();
    });

    it('opens until done, then again after two weeks', () => {
        const day = 86_400_000;
        expect(shouldOpen(undefined, 0)).toBe(true);
        expect(shouldOpen(0, (RECHECK_DAYS - 1) * day)).toBe(false);
        expect(shouldOpen(0, RECHECK_DAYS * day)).toBe(true);
    });
});
