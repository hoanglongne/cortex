import { describe, expect, it } from 'vitest';
import { bandText, handInError } from '../../app/lib/writing/handIn';

describe('handInError', () => {
    it('explains the known refusals in Vietnamese', () => {
        expect(handInError('not in this class')).toMatch(/không còn trong lớp/);
        expect(handInError('too many today')).toMatch(/tối đa 10/);
        expect(handInError('bad body')).toMatch(/quá dài/);
    });
    it('says the feature is not switched on when the SQL is missing', () => {
        expect(handInError('Could not find the function public.writing_submit in the schema cache')).toMatch(/chưa được bật/);
    });
    it('falls back to a plain retry message and never shows raw errors', () => {
        expect(handInError('boom: something internal')).toBe('Chưa nộp được. Thử lại sau nhé.');
        expect(handInError('TypeError: Failed to fetch')).toMatch(/Không kết nối/);
    });
});

describe('bandText', () => {
    it('writes bands with a comma', () => {
        expect(bandText(7)).toBe('7');
        expect(bandText(6.5)).toBe('6,5');
    });
});
