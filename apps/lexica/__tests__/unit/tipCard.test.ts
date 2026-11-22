import { describe, expect, it } from 'vitest';
import { VOCAB_DATABASE } from '../../app/data/vocabCards';
import { exampleHtml, tipFacts, tipHtml } from '../../app/lib/dial/tipCard';

const topic = { label: 'Ăn uống', color: '#FF8A4C' };
const abundant = VOCAB_DATABASE.find((c) => c.id === 'v001')!;

describe('Blend meaning card', () => {
    it('keeps only what the card shows', () => {
        const f = tipFacts(abundant, topic);
        expect(f.w).toBe('abundant');
        expect(f.lv).toBe('Cơ bản');
        expect(f.col).toEqual(['abundant supply', 'an abundant harvest']);
        expect(f.pt.map(([t]) => t)).toEqual(['ab-', 'und-', '-ant']);
        expect(f.ex).toContain('ABUNDANT');
    });

    it('marks the word and its endings in the example, and escapes the rest', () => {
        expect(exampleHtml('Cô ấy có nhiều BENEFITS <b>x</b>', 'benefit')).toBe('Cô ấy có nhiều <mark>BENEFITS</mark> &lt;b&gt;x&lt;/b&gt;');
        expect(exampleHtml('Không có từ', 'abundant')).toBe('Không có từ');
    });

    it('builds the card with every section, and leaves out the ones a card does not have', () => {
        const full = tipHtml({ en: 'abundant', vi: 'dồi dào', card: tipFacts(abundant, topic), note: 'Lexica sẽ thêm từ này vào bộ thẻ học.' });
        for (const part of ['Ăn uống', 'Cơ bản', 'Trong bài', 'Cụm hay gặp', 'Ví dụ', 'Cấu tạo từ', 'Đã thuộc']) expect(full).toContain(part);
        const bare = tipHtml({ en: 'x', vi: 'y', card: { hint: 'nghĩa' }, note: '' });
        for (const part of ['Cụm hay gặp', 'Ví dụ', 'Cấu tạo từ']) expect(bare).not.toContain(part);
    });

    it('never lets card text become markup', () => {
        const html = tipHtml({ en: '<img src=x onerror=1>', vi: '"><script>', card: { hint: '<u>x</u>', col: ['<i>'], pt: [['<s>', '<em>']] }, note: '<marquee>' });
        for (const tag of ['<img', '<script', '<u>', '<s>', '<em>', '<marquee']) expect(html).not.toContain(tag);
        expect(html).toContain('&lt;img src=x onerror=1&gt;');
        expect(html).toContain('&quot;&gt;&lt;script&gt;');
    });

    it('every card with a rule has a meaning, so the card is never empty', () => {
        for (const c of VOCAB_DATABASE) expect(tipFacts(c, topic).hint.length).toBeGreaterThan(0);
    });
});
