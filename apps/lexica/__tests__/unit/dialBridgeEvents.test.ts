import { describe, expect, it } from 'vitest';
import { parseDialEvents } from '../../app/lib/dial/bridge';

describe('parseDialEvents (#163)', () => {
    const now = 1_000_000_000_000;
    it('reads taps (old shape), known and votes, dropping bad entries', () => {
        const raw = JSON.stringify([
            { cardId: 'v001', at: now - 10 },
            { cardId: 'v001', at: now - 5 },
            { kind: 'known', cardId: 'v002', at: now },
            { kind: 'down', cardId: 'v003', at: now, rule: 'v003:khả thi' },
            { kind: 'up', cardId: 'v003', at: now, rule: 'v999:x' },
            { kind: 'hack', cardId: 'v004', at: now },
            { cardId: 'x1', at: now },
        ]);
        expect(parseDialEvents(raw, now)).toEqual([
            { kind: 'tap', cardId: 'v001', at: now - 10 },
            { kind: 'known', cardId: 'v002', at: now },
            { kind: 'down', cardId: 'v003', at: now, rule: 'v003:khả thi' },
        ]);
        expect(parseDialEvents('nope', now)).toEqual([]);
    });
});
