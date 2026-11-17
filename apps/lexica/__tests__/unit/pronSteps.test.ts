import { describe, expect, it } from 'vitest';
import { mouthFor } from '../../app/lib/pronunciation/mouth';
import { GUIDED_PHONES, guideFor } from '../../app/lib/pronunciation/steps';

const VERB = /^(Khép|Dồn|Bật|Chạm|Chặn|Thả|Rung|Giữ|Mở|Đặt|Thổi|Đẩy|Đưa|Kéo|Chu|Nâng|Cho|Cong|Hạ|Để|Trượt|Nói|Tròn|Lùi) /;

describe('sound steps (#152)', () => {
    it('covers every phone that has a mouth picture', () => {
        const all = ['P', 'B', 'T', 'D', 'K', 'G', 'F', 'V', 'TH', 'DH', 'S', 'Z', 'SH', 'ZH', 'CH', 'JH', 'M', 'N', 'NG', 'L', 'R', 'HH', 'W', 'Y',
            'IY', 'IH', 'EH', 'EY', 'AE', 'AH', 'AA', 'AY', 'AW', 'AO', 'OW', 'OY', 'UH', 'UW', 'ER'];
        expect(all.filter((p) => mouthFor(p) && !guideFor(p))).toEqual([]);
        expect(guideFor('TH1')).toBe(guideFor('TH'));
        expect(guideFor('XX')).toBeNull();
    });

    it('has one to three short steps, each starting with a verb', () => {
        for (const p of GUIDED_PHONES) {
            const g = guideFor(p)!;
            expect(g.steps.length, p).toBeGreaterThan(0);
            expect(g.steps.length, p).toBeLessThanOrEqual(3);
            for (const st of g.steps) {
                expect(st.text, p).toMatch(VERB);
                expect(st.text.length, p).toBeLessThanOrEqual(60);
            }
        }
    });

    it('marks voicing on the voiced/voiceless pairs', () => {
        expect(guideFor('Z')!.steps.some((x) => x.part === 'voice' && /Rung/.test(x.text))).toBe(true);
        expect(guideFor('TH')!.slip).toMatch(/Người Việt/);
    });
});
