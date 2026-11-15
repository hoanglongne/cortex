import { describe, expect, it } from 'vitest';
import { parseTaps } from '../../app/lib/dial/bridge';

describe('dial extension bridge', () => {
    const now = 1_000_000_000_000;
    it('keeps valid recent taps, one per card', () => {
        const raw = JSON.stringify([
            { cardId: 'v004', at: now - 1000 },
            { cardId: 'v004', at: now - 10 },
            { cardId: 'v005', at: now - 40 * 86_400_000 },
            { cardId: 'x; drop', at: now },
            { cardId: 'v006', at: now + 3_600_000 },
            null,
        ]);
        expect(parseTaps(raw, now)).toEqual([{ cardId: 'v004', at: now - 10 }]);
    });
    it('survives junk', () => {
        expect(parseTaps('{oops', now)).toEqual([]);
        expect(parseTaps('{"a":1}', now)).toEqual([]);
        expect(parseTaps(null, now)).toEqual([]);
    });
});
