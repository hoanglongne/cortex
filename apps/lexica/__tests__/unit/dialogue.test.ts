import { describe, expect, it } from 'vitest';
import { guessOptions, guessTurns, lineMatch, parseTurns, speakersOf } from '../../app/lib/content/dialogue';

const text = `Staff: Hi! What can I get for you?
Linh: An iced latte to go, please.
Staff: Sure. Anything else?
Linh: No, that's all. Can I pay by card?
Staff: Of course. Tap here, please.
Linh: Thanks!`;
const translation = `Nhân viên: Chào bạn! Mình lấy gì cho bạn?
Linh: Một ly latte đá mang đi nhé.
Nhân viên: Được ạ. Còn gì nữa không?
Linh: Không, vậy thôi. Mình trả bằng thẻ được không?
Nhân viên: Được chứ. Chạm vào đây nhé.
Linh: Cảm ơn!`;

describe('dialogue scenes', () => {
    const turns = parseTurns(text, translation);

    it('reads speakers, lines and meanings', () => {
        expect(turns).toHaveLength(6);
        expect(turns[1]).toEqual({ speaker: 'Linh', line: 'An iced latte to go, please.', meaning: 'Một ly latte đá mang đi nhé.' });
        expect(speakersOf(turns)).toEqual(['Staff', 'Linh']);
    });

    it('asks a few guesses, from the third turn, with the right meaning among two', () => {
        expect(guessTurns(turns)).toEqual([2, 4]);
        const g = guessOptions(turns, 2, 1)!;
        expect(g.options).toContain('Được ạ. Còn gì nữa không?');
        expect(g.answer).toBe('Được ạ. Còn gì nữa không?');
        expect(new Set(g.options).size).toBe(2);
        // never the line just before
        expect(g.options).not.toContain(turns[1].meaning);
    });

    it('compares a spoken line with the script', () => {
        expect(lineMatch("no that's all can i pay by card", "No, that's all. Can I pay by card?").level).toBe('clear');
        expect(lineMatch('no can i pay', "No, that's all. Can I pay by card?").level).toBe('close');
        const m = lineMatch('thanks', "No, that's all. Can I pay by card?");
        expect(m.level).toBe('unclear');
        expect(m.missing).toContain('card');
    });
});
