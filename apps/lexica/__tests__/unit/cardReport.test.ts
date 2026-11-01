import { describe, expect, it } from 'vitest';
import { REPORT_REASONS, reportKey } from '../../app/lib/cardReport';

describe('card reports', () => {
    it('four reasons, each with a label, and a key per card and reason', () => {
        expect(REPORT_REASONS.map((r) => r.id)).toEqual(['wrong_meaning', 'odd_example', 'wrong_audio', 'too_hard']);
        expect(REPORT_REASONS.every((r) => r.label.length > 3)).toBe(true);
        expect(reportKey('v012', 'wrong_audio')).toBe('v012:wrong_audio');
    });
});
