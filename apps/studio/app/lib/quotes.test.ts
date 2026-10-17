import { describe, expect, it } from 'vitest';
import { ApiError } from './api';
import { buildSummary, coverageText, findSummary, quoteError } from './quotes';

describe('buildSummary', () => {
    it('tells a network failure apart from a bad file', () => {
        const text = buildSummary({
            built: [{ title: 'Emma', sentences: 1200 }],
            failed: [
                { title: 'Dracula', error: 'HTTP 503', network: true },
                { title: 'Howards End', error: 'Không thấy dòng *** START', network: false },
            ],
            remaining: 30,
            total: 42,
        });
        expect(text).toContain('Đã thêm 1 sách');
        expect(text).toContain('Lỗi mạng, chưa tải được 1 sách: Dracula');
        expect(text).toContain('không đúng định dạng Gutenberg: Howards End');
        expect(text).toContain('Còn 30/42 sách');
    });
});

describe('findSummary', () => {
    it('reports cards without quotes separately from saved ones', () => {
        expect(findSummary({ cards: 50, saved: 70, news: 2, rejected: 1, missed: 12, remaining: 400 })).toBe(
            'Đã tìm cho 50 thẻ: 70 câu chờ duyệt, trong đó 2 câu từ báo, 12 thẻ không có câu nào trong kho, 1 câu bị loại tự động. Còn 400 thẻ chưa tìm.',
        );
    });

    it('says when every card was already searched', () => {
        expect(findSummary({ cards: 0, saved: 0, news: 0, rejected: 0, missed: 0, remaining: 0 })).toMatch(/Mọi thẻ đã được tìm/);
    });
});

describe('quoteError', () => {
    it('words errors in Vietnamese by kind', () => {
        expect(quoteError(new ApiError('Lỗi mạng: không kết nối được', 0, null))).toMatch(/^Lỗi mạng/);
        expect(quoteError(new ApiError('Forbidden', 403, null))).toMatch(/không có quyền/);
        expect(quoteError(new ApiError('boom', 500, null))).toMatch(/Máy chủ gặp lỗi \(HTTP 500\)/);
        expect(quoteError(new ApiError('Kho câu chưa được dựng.', 400, null))).toBe('Kho câu chưa được dựng.');
    });
});

describe('coverageText', () => {
    it('shows covered cards and a percentage', () => {
        expect(coverageText(324, 540)).toBe('324/540 thẻ có câu · 60%');
        expect(coverageText(0, 0)).toBe('0/0 thẻ có câu · 0%');
    });
});
