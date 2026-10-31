import { describe, expect, it } from 'vitest';
import { finished, MATCH_POINTS, MISS_COST, newMemory, pending, timeBonus, turn, turnBack } from '../../app/lib/games/memory';
import type { MatchTile } from '../../app/lib/games/rounds';

const tiles: MatchTile[] = [
    { key: 'a:w', pair: 'a', text: 'abundant', kind: 'word' },
    { key: 'b:w', pair: 'b', text: 'brief', kind: 'word' },
    { key: 'a:m', pair: 'a', text: 'dư thừa', kind: 'meaning' },
    { key: 'b:m', pair: 'b', text: 'ngắn gọn', kind: 'meaning' },
];

describe('memory', () => {
    it('a pair stays turned and scores, then a chain of pairs builds a combo', () => {
        let m = newMemory(tiles);
        let r = turn(m, 'a:w');
        expect(r.result).toBe('first');
        r = turn(r.memory, 'a:m');
        expect(r.result).toBe('match');
        expect(r.memory.found).toEqual(['a']);
        expect(r.memory.score).toBe(MATCH_POINTS);
        m = r.memory;
        m = turn(m, 'b:w').memory;
        r = turn(m, 'b:m');
        expect(r.memory.combo).toBe(2);
        expect(r.memory.score).toBe(MATCH_POINTS * 2 + 5);
        expect(finished(r.memory)).toBe(true);
        expect(r.memory.flips).toBe(4);
    });

    it('a miss leaves both turned until they are turned back, costs points, ends the combo and marks both pairs', () => {
        let m = turn(newMemory(tiles), 'a:w').memory;
        const r = turn(m, 'b:m');
        expect(r.result).toBe('miss');
        expect(pending(r.memory)).toBe(true);
        expect(r.memory.slipped.sort()).toEqual(['a', 'b']);
        expect(r.memory.score).toBe(0);
        // nothing else can be turned meanwhile
        expect(turn(r.memory, 'b:w').result).toBe('ignored');
        m = turnBack(r.memory);
        expect(m.open).toEqual([]);
        expect(turn(m, 'b:w').result).toBe('first');
    });

    it('ignores the same card twice and cards already found', () => {
        let m = turn(newMemory(tiles), 'a:w').memory;
        expect(turn(m, 'a:w').result).toBe('ignored');
        m = turn(m, 'a:m').memory;
        expect(turn(m, 'a:w').result).toBe('ignored');
    });

    it('two words of different pairs, or of the same kind, are a miss', () => {
        const m = turn(newMemory(tiles), 'a:w').memory;
        expect(turn(m, 'b:w').result).toBe('miss');
    });

    it('rewards a quick board', () => {
        expect(timeBonus(20)).toBe(40);
        expect(timeBonus(200)).toBe(0);
        expect(MISS_COST).toBeGreaterThan(0);
    });
});
