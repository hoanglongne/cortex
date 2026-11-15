import { describe, expect, it } from 'vitest';
import { compileRules, findHits, syllableKey } from '../../app/lib/dial/match';
import { DIAL_RULES_D0 } from '../../app/lib/dial/rules';

const idx = compileRules(DIAL_RULES_D0);
const words = (t: string) => findHits(t, idx).map((h) => `${h.vi}=${h.en}`);

describe('dial matcher', () => {
    it('treats old and new tone placement alike', () => {
        expect(syllableKey('hoà')).toBe(syllableKey('hòa'));
        expect(syllableKey('Khả')).toBe(syllableKey('khả'));
    });

    it('finds phrases and keeps the source text', () => {
        expect(words('Kế hoạch này khả thi và cần thiết.')).toEqual(['khả thi=feasible', 'cần thiết=necessary']);
    });

    it('prefers the longest phrase', () => {
        expect(words('Đây là điều không thể tránh khỏi.')).toEqual(['không thể tránh khỏi=inevitable']);
    });

    it('respects notBefore', () => {
        expect(words('Tính minh bạch là yêu cầu.')).toEqual([]);
        expect(words('Dự án cần nghiên cứu khả thi.')).toEqual([]);
    });

    it('skips proper names mid-sentence but not sentence starts', () => {
        expect(words('Theo Bộ Tài chính, giá tăng.')).toEqual([]);
        expect(words('Tài chính cá nhân rất quan trọng.')).toEqual(['Tài chính=financial']);
    });

    it('never matches across punctuation', () => {
        expect(words('Nó khả, thi')).toEqual([]);
    });

    it('respects onlyAfter for ambiguous phrases', () => {
        expect(words('Chính sách có tác động tiêu cực.')).toEqual(['tác động=impact', 'tiêu cực=negative']);
        expect(words('Cần phòng chống tiêu cực.')).toEqual([]);
    });

    it('does not match inside a longer word', () => {
        expect(words('quyết tâmhuyết')).toEqual([]);
    });
});

describe('all dial rules', () => {
    it('cover most of the deck, with valid card ids and no empty rules', async () => {
        const { DIAL_RULES } = await import('../../app/lib/dial/allRules');
        const { VOCAB_DATABASE } = await import('../../app/data/vocabCards');
        const ids = new Set(VOCAB_DATABASE.map((c) => c.id));
        expect(DIAL_RULES.length).toBeGreaterThan(400);
        for (const r of DIAL_RULES) {
            expect(ids.has(r.cardId), r.cardId).toBe(true);
            expect(r.vi.length).toBeGreaterThan(0);
        }
        const all = compileRules(DIAL_RULES);
        expect(findHits('Đây là bài toán hóc búa và chúng tôi tự hỏi nên làm gì.', all).map((h) => h.en)).toEqual(['conundrum', 'wonder']);
    });
});
