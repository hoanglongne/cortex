import { describe, expect, it } from 'vitest';
import { answerDiff, editDistance, matchAnswer, stem } from '../../app/lib/answerMatch';

const kind = (typed: string, answer: string) => {
    const m = matchAnswer(typed, answer);
    return m.kind === 'close' ? `close:${m.why}` : m.kind;
};

describe('matchAnswer', () => {
    it('exact, ignoring case and spaces', () => {
        expect(kind(' annoying ', 'ANNOYING')).toBe('exact');
        expect(kind('follow  up', 'FOLLOW UP')).toBe('exact');
    });

    it('another form of the same word is close', () => {
        expect(kind('ANNOY', 'ANNOYING')).toBe('close:form');
        expect(kind('ANNOYED', 'ANNOYING')).toBe('close:form');
        expect(kind('HOPE', 'HOPING')).toBe('close:form');
        expect(kind('HAPPINESS', 'HAPPY')).toBe('close:form');
        expect(kind('RUN', 'RUNNING')).toBe('close:form');
        expect(kind('IMPLEMENTATION', 'IMPLEMENT')).toBe('close:form');
    });

    it('a spelling slip is close on longer words only', () => {
        expect(kind('ANNOYIGN', 'ANNOYING')).toBe('close:typo');
        expect(kind('BELEIVE', 'BELIEVE')).toBe('close:typo');
        expect(kind('NECESARY', 'NECESSARY')).toBe('close:typo');
        expect(kind('CAR', 'CAT')).toBe('wrong');
        expect(kind('TAEK', 'TAKE')).toBe('wrong');
    });

    it('other words are wrong', () => {
        expect(kind('ANGRY', 'ANNOYING')).toBe('wrong');
        expect(kind('HAPPY', 'UNHAPPY')).toBe('wrong');
        expect(kind('FORM', 'FORMAL')).toBe('wrong');
        expect(kind('AN', 'ANNOYING')).toBe('wrong');
        expect(kind('', 'ANNOYING')).toBe('wrong');
    });

    it('helpers', () => {
        expect(editDistance('ABCD', 'ABDC')).toBe(1);
        expect(stem('ANNOYING')).toBe('ANNOY');
        expect(answerDiff('ANNOY', 'ANNOYING')).toEqual({ head: 'ANNOY', mid: 'ING', tail: '' });
        expect(answerDiff('BELEIVE', 'BELIEVE')).toEqual({ head: 'BEL', mid: 'IE', tail: 'VE' });
    });
});
