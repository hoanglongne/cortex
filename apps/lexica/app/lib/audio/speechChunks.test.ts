import { describe, expect, it } from 'vitest';
import { speechChunks } from './speechChunks';

describe('speechChunks', () => {
    it('keeps a short paragraph whole', () => {
        expect(speechChunks(['Hello there. How are you?'])).toEqual(['Hello there. How are you?']);
    });
    it('splits at sentence ends once a part is full', () => {
        const para = 'One two three. Four five six. Seven eight nine.';
        expect(speechChunks([para], 30)).toEqual(['One two three.', 'Four five six.', 'Seven eight nine.']);
    });
    it('never joins two paragraphs and keeps an over-long sentence whole', () => {
        const long = 'word '.repeat(80).trim() + '.';
        const out = speechChunks(['Short.', long, 'Last.'], 50);
        expect(out).toEqual(['Short.', long, 'Last.']);
    });
    it('skips empty text', () => {
        expect(speechChunks(['', '  '])).toEqual([]);
    });
});
