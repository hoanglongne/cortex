import { describe, expect, it } from 'vitest';
import { defaultMode, estimate, estimateLine, hitText, intensityFromLevel, isBlocked, onSite, pageLanguage, ruleKey } from '../../app/lib/dial/prefs';

describe('Núm vặn prefs', () => {
    it('N1: estimate from reading habits, capped by intensity', () => {
        expect(estimate('light', 10, 6)).toEqual({ perDay: 30, perWeek: 84, guessed: false });
        expect(estimate('heavy', 10, 6).perDay).toBe(60);
        expect(estimate('medium', null, null).guessed).toBe(true);
        expect(estimateLine(estimate('light', 10, 6))).toBe('≈ 30 lượt gặp từ mỗi ngày · ≈ 84 từ khác nhau mỗi tuần');
        expect(intensityFromLevel(30)).toBe('light');
        expect(intensityFromLevel(50)).toBe('medium');
        expect(intensityFromLevel(100)).toBe('heavy');
    });

    it('N2: three ways to show a word, highlight first for new learners', () => {
        expect(hitText('replace', 'khả thi', 'feasible')).toEqual({ text: 'feasible', hiddenEn: false });
        expect(hitText('highlight', 'khả thi', 'feasible')).toEqual({ text: 'khả thi', hiddenEn: true });
        expect(hitText('both', 'khả thi', 'feasible').text).toBe('khả thi (feasible)');
        expect(defaultMode(10)).toBe('highlight');
        expect(defaultMode(80)).toBe('replace');
    });

    it('N3: one key per rule hit', () => {
        expect(ruleKey('v001', '  Dồi  Dào ')).toBe('v001:dồi dào');
    });

    it('N4: never on money, mail, health, government or sign-in pages', () => {
        for (const host of ['vietcombank.com.vn', 'ebank.tpb.vn', 'momo.vn', 'mail.google.com', 'vneid.gov.vn', 'abc.gov.vn', 'accounts.google.com', 'medpro.vn'])
            expect(isBlocked(host), host).toBe(true);
        expect(isBlocked('shop.example.com', '/checkout/step1')).toBe(true);
        expect(isBlocked('vnexpress.net', '/', { password: true })).toBe(true);
        expect(isBlocked('vnexpress.net', '/kinh-doanh/abc.html')).toBe(false);
        expect(isBlocked('tuoitre.vn')).toBe(false);
        expect(onSite('news.zing.vn', 'zing.vn')).toBe(true);
        expect(onSite('notzing.vn', 'zing.vn')).toBe(false);
    });

    it('N7: tells Vietnamese, English and other pages apart', () => {
        expect(pageLanguage('Sau nhiều tháng chuẩn bị, công ty quyết định triển khai phương án mới vì nó khả thi.')).toBe('vi');
        expect(pageLanguage('The company decided to carry out the new plan because it was cheaper and the team wanted to work together.')).toBe('en');
        expect(pageLanguage('12345')).toBe('other');
    });
});
