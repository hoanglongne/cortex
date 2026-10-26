import { describe, expect, it } from 'vitest';
import type { BoardStudent } from '@cortex/classroom';
import {
    classForecast,
    courseInput,
    forecastInput,
    lexicaModule,
    parseReview,
    scoreForecast,
    studentForecast,
    THRESHOLDS,
    weekCounts,
    type CourseInput,
    type Review,
    type StudentInput,
} from '@cortex/classroom-lexica';

const TODAY = '2026-10-25';
const noCourse: CourseInput = { endsOn: null, targetScore: null };
const review = (r: Partial<Review> = {}): Review => ({ overdue: 0, due7: 0, recall14: [0, 0], atRisk: [], ...r });

/** "YYYY-MM-DD" n days before TODAY. */
const ago = (n: number) => new Date(Date.UTC(2026, 9, 25 - n)).toISOString().slice(0, 10);
/** Study on the given days-ago. */
const studied = (...n: number[]) => n.map(ago);

const student = (s: Partial<StudentInput> = {}): StudentInput => ({
    name: 'An',
    joinedAt: `${ago(40)}T08:00:00Z`,
    days: studied(0, 1, 2, 3, 4, 7, 8, 9, 10, 14, 15, 16, 17, 21, 22, 23, 24),
    review: review(),
    scores: [],
    ...s,
});

const kinds = (s: StudentInput, c = noCourse) => studentForecast(s, c, TODAY).forecasts.map((f) => f.kind);

describe('weekCounts', () => {
    it('counts study days in 7-day windows back from today', () => {
        expect(weekCounts(studied(0, 6, 7, 13, 14), TODAY, 3)).toEqual([2, 2, 1]);
    });
});

describe('sắp quên', () => {
    it('stays quiet under 5 overdue words', () => {
        expect(kinds(student({ review: review({ overdue: 4 }) }))).not.toContain('forget');
    });

    it('offers a one-tap review of the class words at risk, with the numbers behind it', () => {
        const f = studentForecast(student({ review: review({ overdue: 8, due7: 12, atRisk: ['v1', 'v2'] }) }), noCourse, TODAY).forecasts.find((x) => x.kind === 'forget')!;
        expect(f.urgency).toBe('watch');
        expect(f.actions[0]).toEqual({ kind: 'assign_review', cardIds: ['v1', 'v2'] });
        expect(f.why.join(' ')).toContain('8 từ đã quá hạn');
        expect(f.why.join(' ')).toContain('2 từ trong số đó');
        expect(f.why.join(' ')).toContain('12 từ đến hạn');
    });

    it('is urgent with many overdue or many class words at risk; without class words it only messages', () => {
        expect(studentForecast(student({ review: review({ overdue: 25 }) }), noCourse, TODAY).forecasts[0]).toMatchObject({ kind: 'forget', urgency: 'urgent' });
        const f = studentForecast(student({ review: review({ overdue: 6 }) }), noCourse, TODAY).forecasts[0];
        expect(f.actions.map((a) => a.kind)).toEqual(['message']);
        expect(studentForecast(student({ review: review({ overdue: 6, atRisk: ['a', 'b', 'c', 'd', 'e'] }) }), noCourse, TODAY).forecasts[0].urgency).toBe('urgent');
    });

    it('says what is missing when Lexica sent no review numbers', () => {
        const r = studentForecast(student({ review: null }), noCourse, TODAY);
        expect(r.forecasts.map((f) => f.kind)).not.toContain('forget');
        expect(r.notYet.find((n) => n.kind === 'forget')?.need).toContain('Lexica mới');
    });
});

describe('sắp bỏ học', () => {
    it('flags 5 days in a row without study, even for someone new', () => {
        const s = student({ joinedAt: `${ago(9)}T08:00:00Z`, days: studied(5, 6, 7, 8) });
        const f = studentForecast(s, noCourse, TODAY).forecasts.find((x) => x.kind === 'dropout')!;
        expect(f.title).toContain('5 ngày chưa học');
        expect(f.why.join(' ')).toContain(`lần gần nhất ngày 20/10`);
        expect(f.actions.map((a) => a.kind)).toEqual(['message', 'parent']);
    });

    it('flags a halved study rhythm against the 3 weeks before, saying so', () => {
        // 5, 4, 5 days in the 3 weeks before; 1 day in the last 7
        const s = student({ days: studied(1, 7, 8, 9, 10, 11, 14, 15, 16, 17, 21, 22, 23, 24, 25) });
        const f = studentForecast(s, noCourse, TODAY).forecasts.find((x) => x.kind === 'dropout')!;
        expect(f.why[0]).toBe('3 tuần trước em học 5, 4, 5 ngày mỗi tuần; 7 ngày qua 1 ngày.');
        expect(f.urgency).toBe('urgent');
    });

    it('does not compare without 3 weeks of history, and says how long to wait', () => {
        const s = student({ joinedAt: `${ago(10)}T08:00:00Z`, days: studied(2, 7, 8, 9, 10) });
        const r = studentForecast(s, noCourse, TODAY);
        expect(r.forecasts.map((f) => f.kind)).not.toContain('dropout');
        expect(r.notYet.find((n) => n.kind === 'dropout')?.need).toBe('Cần thêm 17 ngày để so nhịp học với 3 tuần trước.');
    });

    it('flags a student who never started', () => {
        const f = studentForecast(student({ joinedAt: `${ago(7)}T08:00:00Z`, days: [] }), noCourse, TODAY).forecasts.find((x) => x.kind === 'dropout')!;
        expect(f.title).toBe('Có thể bỏ học: chưa bắt đầu học');
        expect(f.urgency).toBe('urgent');
    });

    it('leaves a steady student alone', () => {
        expect(kinds(student())).not.toContain('dropout');
    });
});

describe('nhớ kém, tiến nhanh', () => {
    it('needs 30 recalls before judging memory', () => {
        const r = studentForecast(student({ review: review({ recall14: [5, 20] }) }), noCourse, TODAY);
        expect(r.forecasts.map((f) => f.kind)).not.toContain('weak_recall');
        expect(r.notYet.find((n) => n.kind === 'weak_recall')?.need).toContain('Cần thêm 10 lượt ôn');
    });

    it('flags under 60% right recalls with advice', () => {
        const f = studentForecast(student({ review: review({ recall14: [25, 48], atRisk: ['v9'] }) }), noCourse, TODAY).forecasts.find((x) => x.kind === 'weak_recall')!;
        expect(f.title).toBe('Nhớ kém: 52% lượt ôn đúng');
        expect(f.actions.map((a) => a.kind)).toEqual(['assign_review', 'message', 'advice']);
    });

    it('always gives something to send for weak recall, even without class words at risk', () => {
        const f = studentForecast(student({ review: review({ recall14: [25, 48] }) }), noCourse, TODAY).forecasts.find((x) => x.kind === 'weak_recall')!;
        expect(f.actions.map((a) => a.kind)).toEqual(['message', 'advice']);
        expect(f.actions[0]).toMatchObject({ kind: 'message' });
        expect((f.actions[0] as { text: string }).text).toContain('52%');
    });

    it('praises 90%+ with regular study and a rising score', () => {
        const scores = [
            { score: 1000, sd: 40, at: `${ago(30)}T10:00:00Z` },
            { score: 1060, sd: 40, at: `${ago(2)}T10:00:00Z` },
        ];
        const f = studentForecast(student({ review: review({ recall14: [46, 50] }), scores }), noCourse, TODAY).forecasts.find((x) => x.kind === 'fast')!;
        expect(f.urgency).toBe('good');
        expect(f.why).toContain('Điểm từ vựng tăng từ 1000 lên 1060.');
        expect(f.actions[0].kind).toBe('praise');
    });

    it('does not praise when the score fell or study was thin this week', () => {
        const fell = [
            { score: 1060, sd: 40, at: `${ago(30)}T10:00:00Z` },
            { score: 1000, sd: 40, at: `${ago(2)}T10:00:00Z` },
        ];
        expect(kinds(student({ review: review({ recall14: [46, 50] }), scores: fell }))).not.toContain('fast');
        expect(kinds(student({ review: review({ recall14: [46, 50] }), days: studied(0, 7, 8, 9, 10, 14, 15, 16, 21, 22) }))).not.toContain('fast');
    });
});

describe('điểm cuối khoá', () => {
    const course: CourseInput = { endsOn: '2026-12-06', targetScore: 1150 };
    const rising = [
        { score: 1000, sd: 40, at: `${ago(42)}T10:00:00Z` },
        { score: 1040, sd: 40, at: `${ago(21)}T10:00:00Z` },
        { score: 1060, sd: 35, at: `${ago(0)}T10:00:00Z` },
    ];

    it('needs a course end date, two tests and 14 days between them', () => {
        expect(scoreForecast(student({ scores: rising }), noCourse, TODAY).notYet?.need).toContain('ngày kết thúc khoá');
        expect(scoreForecast(student({ scores: rising.slice(2) }), course, TODAY).notYet?.need).toContain('Cần thêm 1 lần kiểm tra');
        const close = [rising[2], { score: 1050, sd: 40, at: `${ago(5)}T10:00:00Z` }];
        expect(scoreForecast(student({ scores: close }), course, TODAY).notYet?.need).toBe('Cần một lần kiểm tra nữa từ ngày 3/11 để dự báo điểm.');
    });

    it('projects a range along the trend, widening with distance, against the target', () => {
        const f = scoreForecast(student({ scores: rising }), course, TODAY).forecast!;
        // Trend ≈ 10 points a week, 6 weeks ahead from a fitted ≈ 1063
        expect(f.score!.perWeek).toBe(10);
        expect(f.score!.low).toBeGreaterThan(1000);
        expect(f.score!.high).toBeLessThan(1250);
        expect(f.score!.low).toBeLessThan(f.score!.high);
        expect(f.score!.target).toBe('maybe');
        expect(f.title).toMatch(/^Cuối khoá: \d+–\d+ · IELTS từ vựng khoảng \d\.\d–\d\.\d$/);
        expect(f.why[0]).toContain('1000 (13/9)');
    });

    it('caps an implausible slope and says so', () => {
        const jump = [
            { score: 800, sd: 40, at: `${ago(20)}T10:00:00Z` },
            { score: 1100, sd: 40, at: `${ago(0)}T10:00:00Z` },
        ];
        const f = scoreForecast(student({ scores: jump }), course, TODAY).forecast!;
        expect(f.score!.perWeek).toBe(THRESHOLDS.score.maxPerWeek);
        expect(f.why[1]).toContain('đã giới hạn ở 25');
    });

    it('says no forecast once the course is over', () => {
        expect(scoreForecast(student({ scores: rising }), { endsOn: '2026-10-01', targetScore: null }, TODAY)).toEqual({ forecast: null, notYet: null });
    });

    it('below the target: a message with the range and the target, and a review when class words are at risk', () => {
        const flat = [
            { score: 900, sd: 30, at: `${ago(40)}T10:00:00Z` },
            { score: 910, sd: 30, at: `${ago(5)}T10:00:00Z` },
        ];
        const f = scoreForecast(student({ scores: flat, review: review({ atRisk: ['v3'] }) }), { endsOn: '2026-12-06', targetScore: 1200 }, TODAY).forecast!;
        expect(f.score!.target).toBe('no');
        expect(f.actions.map((a) => a.kind)).toEqual(['assign_review', 'message', 'advice']);
        expect((f.actions[1] as { text: string }).text).toContain('mục tiêu của lớp là 1200');
        const onTrack = scoreForecast(student({ scores: flat }), { endsOn: '2026-12-06', targetScore: 800 }, TODAY).forecast!;
        expect(onTrack.actions).toEqual([]);
    });
});

describe('cả lớp', () => {
    it('counts forecasts, averages score ranges and names who pulls the class down', () => {
        const course: CourseInput = { endsOn: '2026-12-06', targetScore: 1200 };
        const scores = [
            { score: 1000, sd: 30, at: `${ago(28)}T10:00:00Z` },
            { score: 1020, sd: 30, at: `${ago(0)}T10:00:00Z` },
        ];
        const list = [
            { userId: 'a', name: 'An', forecast: studentForecast(student({ scores, review: review({ overdue: 30 }) }), course, TODAY) },
            { userId: 'b', name: 'Bình', forecast: studentForecast(student({ name: 'Bình' }), course, TODAY) },
        ];
        const c = classForecast(list, course);
        expect(c.counts.forget).toBe(1);
        expect(c.score?.students).toBe(1);
        expect(c.target).toMatchObject({ score: 1200, no: 1 });
        expect(c.pullingDown).toEqual([{ userId: 'a', name: 'An', reasons: ['sắp quên nhiều từ', 'dưới mục tiêu'] }]);
        expect(c.notYet[0]).toContain('1/2 em chưa đủ 2 lần kiểm tra');
    });
});

describe('from the class board', () => {
    it('reads review numbers and course settings as the server keeps them', () => {
        expect(parseReview({ overdue: 3.6, due7: -2, recall14: [40, 30], atRisk: ['a', 'a', 7] })).toEqual({ overdue: 4, due7: 0, recall14: [30, 30], atRisk: ['a'] });
        expect(parseReview(undefined)).toBeNull();
        const s = { user_id: 'u', name: 'An', joined_at: '2026-09-01T00:00:00Z', note: null, streak: 0, last_active: null, inactive_days: null, days: ['2026-10-24'], apps: { lexica: { metrics: { review: { overdue: 9 } }, last_active: null, week_ago: null, week_first: null } } } as BoardStudent;
        expect(forecastInput(s).review?.overdue).toBe(9);
        expect(forecastInput({ ...s, apps: {} }).review).toBeNull();
        expect(courseInput({ ends_on: '2026-12-31', target_score: 1200 })).toEqual({ endsOn: '2026-12-31', targetScore: 1200 });
        expect(lexicaModule.parseSettings({ ends_on: '31/12', target_score: 99 })).toMatchObject({ ends_on: null, target_score: null });
    });
});
