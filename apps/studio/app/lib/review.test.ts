import { describe, expect, it } from 'vitest';
import { draftNotes, interleave, minutesLeft } from './review';

describe('interleave', () => {
    it('takes turns between kinds and keeps each kind in order', () => {
        const a = [{ type: 'a', n: 1 }, { type: 'a', n: 2 }, { type: 'a', n: 3 }];
        const b = [{ type: 'b', n: 1 }];
        expect(interleave([a, b]).map(x => x.type + x.n)).toEqual(['a1', 'b1', 'a2', 'a3']);
    });
    it('handles empty lists', () => {
        expect(interleave([[], []])).toEqual([]);
    });
});

describe('draftNotes', () => {
    it('says all passed when nothing failed', () => {
        expect(draftNotes({ length: { pass: true, hard: true } })).toEqual([{ tone: 'ok', text: 'Đạt mọi kiểm tra tự động' }]);
    });
    it('lists only failures, hard ones as bad', () => {
        const notes = draftNotes({ length: { pass: false, hard: true, detail: '170/160' }, tone: { pass: false, hard: false }, ok: { pass: true, hard: true } });
        expect(notes.map(n => n.tone)).toEqual(['bad', 'warn']);
        expect(notes[0].detail).toBe('170/160');
    });
});

describe('minutesLeft', () => {
    it('is at least a minute', () => {
        expect(minutesLeft(1, 5)).toBe(1);
        expect(minutesLeft(30, 10)).toBe(5);
    });
});
