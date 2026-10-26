import { describe, expect, it } from 'vitest';
import { lastWeek, weekLabel, parentLink } from '@cortex/classroom';
import { lexicaWeek, type LexicaWeek } from '@cortex/classroom-lexica';
import { composeReport, joinVi, linksMessage, scoreLine } from '../app/lib/parentReport';

const WORDS: Record<string, string> = { v1: 'environment', v2: 'sustainable', v3: 'pollution', v4: 'recycle' };
const word = (id: string) => WORDS[id];
const week = (end: unknown, start: unknown, scores: { score: number; sd: number; at: string }[] = []) => lexicaWeek({ end, start, word, scores, weekEnd: '2026-10-25' });

const start = { counts: { hieu: 40, nho: 20, gap: 5, dung: 2, doi: 0 }, words: { v1: 1, v2: 2, v3: 1 }, sounds: {} };
const end = {
    counts: { hieu: 52, nho: 43, gap: 9, dung: 8, doi: 1 },
    words: { v1: 4, v2: 2, v3: 2, v4: 2, v9: 4 },
    sounds: { th: [12, 7], ending: [10, 2], cluster: [6, 5] },
    review: { overdue: 3, due7: 4, recall14: [20, 25], atRisk: [] },
};

describe('weeks', () => {
    it('picks the last finished Monday–Sunday', () => {
        expect(lastWeek('2026-10-26')).toBe('2026-10-19'); // Monday
        expect(lastWeek('2026-10-25')).toBe('2026-10-12'); // Sunday: that week is not over
        expect(lastWeek('2026-10-28', 1)).toBe('2026-10-12');
        expect(weekLabel('2026-10-19')).toBe('19/10 – 25/10');
        expect(parentLink('https://teach.x/', 'abc')).toBe('https://teach.x/p/abc');
    });
});

describe("Lexica's week", () => {
    it('counts what newly happened, with class words as examples', () => {
        const w = week(end, start);
        expect(w).toMatchObject({ hasData: true, firstWeek: false, nho: 23, dung: 6, doi: 1, hieu: 12, overdue: 3 });
        // v1 reached Dùng; v3 and v4 reached Nhớ; v2 was already at Nhớ; v9 has no word in the list
        expect(w.saidWords).toEqual(['environment']);
        expect(w.rememberedWords).toEqual(['pollution', 'recycle']);
        // th: 7 misses of 12; cluster: 5 of 6 (more often, fewer misses); ending not often missed
        expect(w.hardSound).toMatchObject({ kind: 'th', example: 'think' });
    });

    it('takes the verified score known by the end of the week, with the change', () => {
        const w = week(end, start, [
            { score: 1000, sd: 40, at: '2026-10-01T10:00:00Z' },
            { score: 1060, sd: 35, at: '2026-10-22T10:00:00Z' },
            { score: 1200, sd: 35, at: '2026-10-27T10:00:00Z' },
        ]);
        expect(w.score).toEqual({ score: 1060, ielts: '6.0–6.5', delta: 60, at: '2026-10-22' });
        expect(scoreLine(w.score!)).toBe('1060 · IELTS từ vựng khoảng 6.0–6.5 · tăng 60 so với lần trước');
    });

    it('treats the first week in class as totals, and no report as no data', () => {
        expect(week(end, null)).toMatchObject({ firstWeek: true, nho: 43 });
        expect(week(null, null)).toMatchObject({ hasData: false, nho: 0, saidWords: [], hardSound: null, overdue: null, score: null });
    });
});

describe('the report', () => {
    const lx = week(end, start);

    it('opens with days, new words and the sound to work on, in plain Vietnamese', () => {
        const r = composeReport({ days: 5, lexica: lx, note: '  Con chăm.  ' });
        expect(r.summary).toBe('Tuần này con học 5/7 ngày. Con nhớ thêm 23 từ và nói rõ được 6 từ. Con còn hay nhầm âm "th" (như trong "think").');
        expect(r.did).toEqual([
            { text: 'Con nói rõ 1 từ của bài trên lớp, máy nghe đúng', words: ['environment'] },
            { text: 'Con nhớ được 2 từ của bài trên lớp', words: ['pollution', 'recycle'] },
            { text: 'Con dùng 1 từ trong đời thường (tin nhắn, câu nói hằng ngày)' },
        ]);
        expect(r.note).toBe('Con chăm.');
        expect(r.help).toBe('Nhờ con đọc to vài từ có âm "th", như "think".');
    });

    it('chooses the most useful help', () => {
        expect(composeReport({ days: 2, lexica: lx }).help).toContain('mỗi ngày 10 phút');
        expect(composeReport({ days: 5, lexica: { ...lx, overdue: 14 } }).help).toContain('14 từ đến lúc ôn lại');
        const many: LexicaWeek = { ...lx, rememberedWords: ['a', 'b', 'c', 'd'] };
        expect(composeReport({ days: 5, lexica: many }).help).toBe('Hỏi con nghĩa của 3 từ: a, b và c.');
        expect(composeReport({ days: 5, lexica: { ...lx, hardSound: null } }).help).toContain('từ nào hay');
    });

    it('never makes things up when there is nothing to tell', () => {
        expect(composeReport({ days: 0, lexica: null })).toEqual({ v: 1, days: 0, summary: 'Tuần này chưa có số liệu học của con.', did: [], help: 'Nhắc con mở Lexica mỗi ngày 10 phút: học đều quan trọng hơn học dồn.' });
        expect(composeReport({ days: 0, lexica: lx }).summary).toBe('Tuần này con chưa mở Lexica.');
        const first = composeReport({ days: 3, lexica: week(end, null) });
        expect(first.summary).toContain('tuần đầu con học cùng lớp; đến nay con đã nhớ 43 từ');
        expect(first.did).toEqual([]);
    });

    it('writes one Zalo line per parent', () => {
        expect(joinVi(['a'])).toBe('a');
        expect(linksMessage([{ name: 'An', link: 'https://t/p/x', pin: '0420' }, { name: 'Bình', link: 'https://t/p/y' }], '19/10 – 25/10')).toBe(
            'Báo cáo tuần 19/10 – 25/10 của các con đã có. Phụ huynh bấm vào link của con mình để xem:\n- Phụ huynh em An: https://t/p/x (mã PIN 0420)\n- Phụ huynh em Bình: https://t/p/y',
        );
    });
});
