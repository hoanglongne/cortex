import { ApiError } from './api';

/** "Ngoài đời" helpers for the Studio page: wording and error messages. */

export interface BuildResult {
    built: { title: string; sentences: number }[];
    failed: { title: string; error: string; network: boolean }[];
    remaining: number;
    total: number;
}

export interface FindResult {
    cards: number;
    saved: number;
    news: number;
    rejected: number;
    missed: number;
    remaining: number;
}

/** What one "Dựng kho câu" click did. A download failure is not "no sentences". */
export function buildSummary(r: BuildResult): string {
    const parts: string[] = [];
    if (r.built.length > 0) {
        const n = r.built.reduce((s, b) => s + b.sentences, 0);
        parts.push(`Đã thêm ${r.built.length} sách (${n.toLocaleString('vi-VN')} câu) vào kho.`);
    }
    const network = r.failed.filter((f) => f.network);
    const broken = r.failed.filter((f) => !f.network);
    if (network.length > 0) parts.push(`Lỗi mạng, chưa tải được ${network.length} sách: ${network.map((f) => f.title).join(', ')}. Thử lại sau.`);
    if (broken.length > 0) parts.push(`Bỏ qua ${broken.length} sách vì file không đúng định dạng Gutenberg: ${broken.map((f) => f.title).join(', ')}.`);
    parts.push(r.remaining > 0 ? `Còn ${r.remaining}/${r.total} sách chưa dựng.` : `Kho đủ ${r.total} sách.`);
    return parts.join(' ');
}

/** What one "Tìm câu" click did, keeping "no quote in the books" apart from errors. */
export function findSummary(r: FindResult): string {
    if (r.cards === 0) return 'Mọi thẻ đã được tìm sau lần dựng kho gần nhất. Thêm sách vào kho để tìm tiếp.';
    const parts = [`Đã tìm cho ${r.cards} thẻ: ${r.saved} câu chờ duyệt`];
    if (r.news > 0) parts.push(`trong đó ${r.news} câu từ báo`);
    if (r.missed > 0) parts.push(`${r.missed} thẻ không có câu nào trong kho`);
    if (r.rejected > 0) parts.push(`${r.rejected} câu bị loại tự động`);
    return `${parts.join(', ')}. ${r.remaining > 0 ? `Còn ${r.remaining} thẻ chưa tìm.` : 'Đã tìm hết các thẻ.'}`;
}

/** An API error as a sentence in Vietnamese. */
export function quoteError(err: unknown): string {
    if (err instanceof ApiError) {
        if (err.status === 0) return err.message;
        if (err.status === 401 || err.status === 403) return 'Bạn chưa đăng nhập hoặc không có quyền biên tập.';
        if (err.status >= 500) return `Máy chủ gặp lỗi (HTTP ${err.status}), thử lại sau. Chi tiết: ${err.message}`;
        return err.message;
    }
    return err instanceof Error ? err.message : String(err);
}

/** "12/540 thẻ có câu · 2%" */
export function coverageText(covered: number, cards: number): string {
    const pct = cards > 0 ? Math.round((covered / cards) * 100) : 0;
    return `${covered}/${cards} thẻ có câu · ${pct}%`;
}
