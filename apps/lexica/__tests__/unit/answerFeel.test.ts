import { describe, expect, it } from 'vitest';
import { feelFor } from '../../app/lib/engagement/answerFeel';

describe('answer feel (#146)', () => {
    it('climbs with a run of right answers and caps the buzz', () => {
        expect(feelFor(true, 1)).toEqual({ sound: 'combo', combo: 3, buzz: 10 });
        expect(feelFor(true, 3).combo).toBeGreaterThan(feelFor(true, 2).combo);
        expect(feelFor(true, 20).buzz).toBe(30);
    });
    it('is soft on a wrong answer', () => {
        expect(feelFor(false, 5)).toEqual({ sound: 'wrong', combo: 0, buzz: 6 });
    });
});
