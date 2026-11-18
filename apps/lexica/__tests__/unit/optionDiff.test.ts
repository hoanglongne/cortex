import { describe, expect, it } from 'vitest';
import { aroundBlank, optionDiff } from '../../app/lib/optionDiff';

describe('optionDiff (#146)', () => {
    it('makes the shared start and end faint', () => {
        const r = optionDiff(['sự tăng trưởng kinh tế', 'sự suy giảm kinh tế', 'sự ổn định kinh tế']);
        expect(r[0]).toEqual([
            { text: 'sự', differs: false },
            { text: 'tăng trưởng', differs: true },
            { text: 'kinh tế', differs: false },
        ]);
        expect(r[2][1]).toEqual({ text: 'ổn định', differs: true });
    });

    it('keeps at least one differing word and leaves unrelated options whole', () => {
        expect(optionDiff(['a b', 'a b'])[0].some((p) => p.differs)).toBe(true);
        expect(optionDiff(['nhanh', 'chậm'])).toEqual([[{ text: 'nhanh', differs: true }], [{ text: 'chậm', differs: true }]]);
    });
});

describe('aroundBlank', () => {
    it('cuts a long sentence to the words around the blank', () => {
        const s = 'one two three four five six seven ______ nine ten eleven twelve thirteen fourteen fifteen';
        const out = aroundBlank(s, 6);
        expect(out).toBe('… five six seven ______ nine ten …');
        expect(aroundBlank('short ______ one')).toBe('short ______ one');
    });
});
