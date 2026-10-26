/**
 * W4 forecasts for the teacher (docs/TEACH_PLAN.md, section 2): who may
 * forget their words, who may drop out, who remembers poorly, who is moving
 * fast, where a student's verified score is heading by the end of the
 * course, and the class as a whole.
 *
 * Every forecast says which numbers it rests on (`why`, the "Vì sao?"
 * button) and comes with something to do (`actions`). When the data is thin
 * there is no forecast, only what is missing (`notYet`). All thresholds live
 * in THRESHOLDS. Pure; tested in apps/teach/__tests__/forecast.test.ts.
 */
import type { Review } from './index';
import { ieltsBetween } from './ielts';

export const THRESHOLDS = {
    /** Sắp quên: words overdue for review. */
    forget: { minOverdue: 5, urgentOverdue: 20, urgentAtRisk: 5 },
    /** Sắp bỏ học: days in a row without study, or the last 7 days against the 3 weeks before. */
    dropout: { offDays: 5, urgentOffDays: 7, drop: 0.5, urgentDrop: 0.75, baselineWeeks: 3, minBaselineDays: 1 },
    /** Nhớ kém / tiến nhanh: right recalls in the last 14 days. */
    recall: { minTries: 30, weak: 0.6, strong: 0.9 },
    /** Tiến nhanh also needs this many study days in the last 7. */
    fast: { minDaysWeek: 4 },
    /** Điểm cuối khoá: a straight line through verified scores. */
    score: { minTests: 2, minSpanDays: 14, windowDays: 180, maxPerWeek: 25, minSpread: 25, spreadPerWeek: 8, floor: 400, ceil: 1800 },
} as const;

export type ForecastKind = 'forget' | 'dropout' | 'weak_recall' | 'fast' | 'score';
/** urgent and watch need the teacher; good is praise; info is for reading. */
export type Urgency = 'urgent' | 'watch' | 'good' | 'info';

export type ForecastAction =
    /** One tap: a review assignment for this student alone, with these words. */
    | { kind: 'assign_review'; cardIds: string[] }
    /** A message to copy into Zalo. */
    | { kind: 'message'; text: string }
    /** The weekly parent message (the teacher app writes it). */
    | { kind: 'parent' }
    | { kind: 'praise'; text: string }
    /** Advice the teacher passes on; nothing to click in the teacher app. */
    | { kind: 'advice'; text: string };

export interface ScoreForecast {
    low: number;
    high: number;
    /** "6.0–6.5" */
    ielts: string;
    /** Against the class target: surely, maybe, unlikely; null without a target. */
    target: 'yes' | 'maybe' | 'no' | null;
    perWeek: number;
}

export interface Forecast {
    kind: ForecastKind;
    urgency: Urgency;
    /** One line, for a list. */
    title: string;
    /** The numbers behind it, a sentence each ("Vì sao?"). */
    why: string[];
    actions: ForecastAction[];
    score?: ScoreForecast;
}

/** A forecast the data can't support yet, and what it needs. */
export interface NotYet {
    kind: ForecastKind;
    need: string;
}

export interface StudentForecast {
    forecasts: Forecast[];
    notYet: NotYet[];
}

export interface StudentInput {
    name: string;
    /** When the student joined the class (ISO). */
    joinedAt: string;
    /** Local dates ("YYYY-MM-DD") with any study, the last 30 days. */
    days: readonly string[];
    /** Null for reports from Lexica versions before the forecasts. */
    review: Review | null;
    /** Verified vocabulary scores, any order. */
    scores: readonly { score: number; sd: number; at: string }[];
}

export interface CourseInput {
    /** "YYYY-MM-DD" */
    endsOn: string | null;
    targetScore: number | null;
}

// ─── Dates ────────────────────────────────────────────────────────────────

const DAY_MS = 86_400_000;
/** Day number of a "YYYY-MM-DD" (or the date part of an ISO time). */
export const dayNumber = (date: string) => Math.floor(Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10)) / DAY_MS);
const shortDate = (day: number) => {
    const d = new Date(day * DAY_MS);
    return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
};

/** Study days in each 7-day window back from today: [last 7 days, the 7 before, …]. */
export function weekCounts(days: readonly string[], today: string, weeks = 4): number[] {
    const t = dayNumber(today);
    const set = new Set(days.map(dayNumber));
    return Array.from({ length: weeks }, (_, k) => {
        let n = 0;
        for (let d = t - 7 * k - 6; d <= t - 7 * k; d++) if (set.has(d)) n++;
        return n;
    });
}

// ─── One student ──────────────────────────────────────────────────────────

const pct = (x: number) => `${Math.round(x * 100)}%`;

function forget(s: StudentInput): Forecast | null {
    const r = s.review;
    const T = THRESHOLDS.forget;
    if (!r || r.overdue < T.minOverdue) return null;
    const why = [`Em có ${r.overdue} từ đã quá hạn ôn.`];
    if (r.atRisk.length) why.push(`${r.atRisk.length} từ trong số đó là từ của bài lớp giao, quá hạn hơn 3 ngày.`);
    if (r.due7) why.push(`7 ngày tới thêm ${r.due7} từ đến hạn ôn.`);
    const actions: ForecastAction[] = [];
    if (r.atRisk.length) actions.push({ kind: 'assign_review', cardIds: r.atRisk });
    actions.push({ kind: 'message', text: `Chào ${s.name}! Em đang có ${r.overdue} từ đến hạn ôn trong Lexica. Mở phần Ôn chừng 10 phút là giữ được hết nhé.` });
    return {
        kind: 'forget',
        urgency: r.overdue >= T.urgentOverdue || r.atRisk.length >= T.urgentAtRisk ? 'urgent' : 'watch',
        title: r.atRisk.length ? `Sắp quên ${r.overdue} từ, có ${r.atRisk.length} từ của bài lớp` : `Sắp quên ${r.overdue} từ`,
        why,
        actions,
    };
}

function dropout(s: StudentInput, today: string): { forecast: Forecast | null; notYet: NotYet | null } {
    const T = THRESHOLDS.dropout;
    const t = dayNumber(today);
    const since = t - dayNumber(s.joinedAt);
    const studied = s.days.map(dayNumber).filter((d) => d <= t);
    const last = studied.length ? Math.max(...studied) : null;
    // Never studied: count from joining (the board keeps 30 days of study days)
    const off = last === null ? Math.min(since, 30) : t - last;
    const [now, ...before] = weekCounts(s.days, today, T.baselineWeeks + 1);
    const hasBaseline = since >= 7 * (T.baselineWeeks + 1) - 1;
    const avg = before.reduce((a, b) => a + b, 0) / before.length;
    const drop = hasBaseline && avg >= T.minBaselineDays ? 1 - now / avg : 0;

    const offTrigger = off >= T.offDays && since >= T.offDays;
    const dropTrigger = drop >= T.drop;
    if (!offTrigger && !dropTrigger) {
        const need = 7 * (T.baselineWeeks + 1) - 1 - since;
        return { forecast: null, notYet: hasBaseline ? null : { kind: 'dropout', need: `Cần thêm ${need} ngày để so nhịp học với 3 tuần trước.` } };
    }

    const why: string[] = [];
    if (hasBaseline) why.push(`3 tuần trước em học ${[...before].reverse().join(', ')} ngày mỗi tuần; 7 ngày qua ${now} ngày.`);
    if (last === null) why.push(since > 30 ? 'Em chưa học ngày nào trong 30 ngày qua.' : `Em chưa học ngày nào từ khi vào lớp (${since} ngày trước).`);
    else if (off >= T.offDays) why.push(`Em đã ${off} ngày liền chưa học, lần gần nhất ngày ${shortDate(last)}.`);
    const title =
        last === null ? 'Có thể bỏ học: chưa bắt đầu học' : offTrigger ? `Có thể bỏ học: ${off} ngày chưa học` : `Học thưa hẳn: ${now} ngày trong 7 ngày qua, trước đây khoảng ${Math.round(avg)}`;
    return {
        forecast: {
            kind: 'dropout',
            urgency: off >= T.urgentOffDays || drop >= T.urgentDrop ? 'urgent' : 'watch',
            title,
            why,
            actions: [
                { kind: 'message', text: `Chào ${s.name}! Mấy hôm nay chưa thấy em vào Lexica. Hôm nay em dành 10 phút cho phiên "Hôm nay" nhé, có gì vướng cứ nhắn cô/thầy.` },
                { kind: 'parent' },
            ],
        },
        notYet: null,
    };
}

function recall(s: StudentInput, today: string): { forecast: Forecast | null; notYet: NotYet | null } {
    const r = s.review;
    const T = THRESHOLDS.recall;
    if (!r) return { forecast: null, notYet: null };
    const [right, total] = r.recall14;
    if (total < T.minTries) {
        return { forecast: null, notYet: { kind: 'weak_recall', need: `Cần thêm ${T.minTries - total} lượt ôn (14 ngày qua mới có ${total}) để biết em nhớ tốt hay chưa.` } };
    }
    const rate = right / total;
    const base = `14 ngày qua em ôn ${total} lượt, nhớ đúng ${right} (${pct(rate)}).`;
    if (rate < T.weak) {
        const actions: ForecastAction[] = [];
        if (r.atRisk.length) actions.push({ kind: 'assign_review', cardIds: r.atRisk });
        // Something to send even without class words at risk: the advice, in words for the student
        actions.push({
            kind: 'message',
            text: `Chào ${s.name}! Hai tuần nay em nhớ đúng ${pct(rate)} số lần ôn. Em thử giảm số từ mới mỗi ngày trong Lexica (mục tiêu mỗi ngày) để có thời gian ôn từ cũ nhé, nhớ chắc vài từ còn hơn học nhiều mà quên.`,
        });
        actions.push({ kind: 'advice', text: 'Gợi ý em giảm số từ mới mỗi ngày trong Lexica (mục tiêu mỗi ngày), để kịp ôn từ cũ.' });
        return {
            forecast: { kind: 'weak_recall', urgency: 'watch', title: `Nhớ kém: ${pct(rate)} lượt ôn đúng`, why: [base, `Mức nên có: từ ${pct(T.weak)} trở lên.`], actions },
            notYet: null,
        };
    }
    const week = weekCounts(s.days, today, 1)[0];
    if (rate < T.strong || week < THRESHOLDS.fast.minDaysWeek) return { forecast: null, notYet: null };
    const sorted = [...s.scores].sort((a, b) => a.at.localeCompare(b.at));
    const [prev, last] = sorted.slice(-2);
    if (prev && last && last.score <= prev.score) return { forecast: null, notYet: null };
    const why = [base, `7 ngày qua em học ${week} ngày.`];
    why.push(prev && last ? `Điểm từ vựng tăng từ ${prev.score} lên ${last.score}.` : 'Chưa có hai lần kiểm tra để so điểm.');
    return {
        forecast: {
            kind: 'fast',
            urgency: 'good',
            title: `Tiến nhanh: nhớ đúng ${pct(rate)}, học ${week}/7 ngày`,
            why,
            actions: [
                { kind: 'praise', text: `${s.name} ơi, hai tuần nay em nhớ đúng ${pct(rate)} số lần ôn và học đều ${week}/7 ngày. Giỏi lắm, giữ nhịp này nhé!` },
                { kind: 'advice', text: 'Em nhớ tốt và học đều: có thể gợi ý em thử level cao hơn trong Lexica.' },
            ],
        },
        notYet: null,
    };
}

/** Least squares through (day, score): slope per day and the fitted score on the last test's day. */
function fit(points: { x: number; y: number }[]) {
    const n = points.length;
    const mx = points.reduce((a, p) => a + p.x, 0) / n;
    const my = points.reduce((a, p) => a + p.y, 0) / n;
    const sxx = points.reduce((a, p) => a + (p.x - mx) ** 2, 0);
    const slope = sxx ? points.reduce((a, p) => a + (p.x - mx) * (p.y - my), 0) / sxx : 0;
    const lastX = points[n - 1].x;
    const residual = n > 2 ? Math.sqrt(points.reduce((a, p) => a + (p.y - (my + slope * (p.x - mx))) ** 2, 0) / (n - 2)) : 0;
    return { slope, atLast: my + slope * (lastX - mx), residual };
}

const round10 = (x: number) => Math.round(x / 10) * 10;

export function scoreForecast(s: StudentInput, course: CourseInput, today: string): { forecast: Forecast | null; notYet: NotYet | null } {
    const T = THRESHOLDS.score;
    if (!course.endsOn) return { forecast: null, notYet: { kind: 'score', need: 'Đặt ngày kết thúc khoá trong cài đặt lớp để có dự báo điểm cuối khoá.' } };
    const t = dayNumber(today);
    const end = dayNumber(course.endsOn);
    if (end <= t) return { forecast: null, notYet: null };
    const tests = s.scores
        .map((x) => ({ ...x, day: dayNumber(x.at) }))
        .filter((x) => x.day <= t && x.day > t - T.windowDays)
        .sort((a, b) => a.day - b.day);
    if (tests.length < T.minTests) {
        const more = T.minTests - tests.length;
        return { forecast: null, notYet: { kind: 'score', need: `Cần thêm ${more} lần kiểm tra từ vựng (cách nhau từ ${T.minSpanDays} ngày) để dự báo điểm.` } };
    }
    const span = tests[tests.length - 1].day - tests[0].day;
    if (span < T.minSpanDays) {
        return { forecast: null, notYet: { kind: 'score', need: `Cần một lần kiểm tra nữa từ ngày ${shortDate(tests[0].day + T.minSpanDays)} để dự báo điểm.` } };
    }

    const last = tests[tests.length - 1];
    const line = fit(tests.map((x) => ({ x: x.day, y: x.score })));
    const rawWeek = line.slope * 7;
    const perWeek = Math.max(-T.maxPerWeek, Math.min(T.maxPerWeek, rawWeek));
    const weeks = (end - last.day) / 7;
    const mid = line.atLast + perWeek * weeks;
    // Measurement spread of the last test (or the fit's), widening the further ahead
    const spread = Math.max(T.minSpread, last.sd, line.residual) + T.spreadPerWeek * weeks;
    const clamp = (x: number) => Math.min(T.ceil, Math.max(T.floor, round10(x)));
    const low = clamp(mid - spread);
    const high = Math.max(low + 10, clamp(mid + spread));
    const ielts = ieltsBetween(low, high);
    const target = course.targetScore === null ? null : low >= course.targetScore ? 'yes' : high < course.targetScore ? 'no' : 'maybe';

    const why = [
        `Điểm đã xác minh: ${tests.map((x) => `${x.score} (${shortDate(x.day)})`).join(', ')}.`,
        `Đường thẳng qua các lần kiểm tra: ${perWeek >= 0 ? 'tăng' : 'giảm'} khoảng ${Math.abs(Math.round(perWeek))} điểm mỗi tuần${Math.abs(rawWeek) > T.maxPerWeek ? ` (thực tế ${Math.round(rawWeek)}, đã giới hạn ở ${T.maxPerWeek} cho hợp lý)` : ''}.`,
        `Còn ${Math.round(weeks)} tuần đến ngày kết thúc khoá (${shortDate(end)}). Càng xa càng khó đoán, nên khoảng rộng thêm ${T.spreadPerWeek} điểm mỗi tuần.`,
    ];
    if (course.targetScore !== null) {
        why.push(
            target === 'yes'
                ? `Cả khoảng dự báo đều từ ${course.targetScore} trở lên: em đang đi đúng hướng tới mục tiêu.`
                : target === 'no'
                  ? `Cả khoảng dự báo đều dưới mục tiêu ${course.targetScore}: cần tăng nhịp mới kịp.`
                  : `Mục tiêu ${course.targetScore} nằm trong khoảng dự báo: có thể đạt nếu giữ nhịp.`,
        );
    }
    return {
        forecast: {
            kind: 'score',
            urgency: target === 'no' ? 'watch' : 'info',
            title: `Cuối khoá: ${low}–${high} · IELTS từ vựng khoảng ${ielts}`,
            why,
            actions:
                target === 'no'
                    ? [
                          ...(s.review?.atRisk.length ? [{ kind: 'assign_review' as const, cardIds: s.review.atRisk }] : []),
                          {
                              kind: 'message' as const,
                              text: `Chào ${s.name}! Theo nhịp hiện tại, cuối khoá em ở khoảng ${low}–${high} điểm từ vựng, mục tiêu của lớp là ${course.targetScore}. Mỗi ngày em học đều phiên "Hôm nay" trong Lexica là kịp nhé.`,
                          },
                          { kind: 'advice' as const, text: 'Giao thêm bài ôn và nhắc em học đều hơn để kịp mục tiêu.' },
                      ]
                    : [],
            score: { low, high, ielts, target, perWeek: Math.round(perWeek) },
        },
        notYet: null,
    };
}

const ORDER: Record<Urgency, number> = { urgent: 0, watch: 1, good: 2, info: 3 };

/** Every forecast for one student, most urgent first, and what the thin data still needs. */
export function studentForecast(s: StudentInput, course: CourseInput, today: string): StudentForecast {
    const forecasts: Forecast[] = [];
    const notYet: NotYet[] = [];
    const f = forget(s);
    if (f) forecasts.push(f);
    if (!s.review) notYet.push({ kind: 'forget', need: 'Lexica của em chưa gửi lịch ôn: em cần mở bản Lexica mới để có dự báo về từ sắp quên.' });
    for (const part of [dropout(s, today), recall(s, today), scoreForecast(s, course, today)]) {
        if (part.forecast) forecasts.push(part.forecast);
        if (part.notYet) notYet.push(part.notYet);
    }
    forecasts.sort((a, b) => ORDER[a.urgency] - ORDER[b.urgency]);
    return { forecasts, notYet };
}

// ─── The class ────────────────────────────────────────────────────────────

export interface ClassForecast {
    students: number;
    /** Students with each forecast. */
    counts: Record<Exclude<ForecastKind, 'score'>, number>;
    /** The class's average score range at the end of the course, from students who have one. */
    score: { students: number; low: number; high: number; ielts: string } | null;
    /** The class target: how many students are on track, maybe, off track. */
    target: { score: number; yes: number; maybe: number; no: number } | null;
    /** Students who pull the class down: urgent forecasts or off the target, with why in a few words. */
    pullingDown: { userId: string; name: string; reasons: string[] }[];
    /** What the class needs before the score forecast says anything. */
    notYet: string[];
}

export function classForecast(students: readonly { userId: string; name: string; forecast: StudentForecast }[], course: CourseInput): ClassForecast {
    const counts = { forget: 0, dropout: 0, weak_recall: 0, fast: 0 };
    const scores: ScoreForecast[] = [];
    const pullingDown: ClassForecast['pullingDown'] = [];
    for (const s of students) {
        const reasons: string[] = [];
        for (const f of s.forecast.forecasts) {
            if (f.kind === 'score' && f.score) {
                scores.push(f.score);
                if (f.score.target === 'no') reasons.push('dưới mục tiêu');
            } else if (f.kind !== 'score') {
                counts[f.kind]++;
                if (f.urgency === 'urgent') reasons.push(f.kind === 'dropout' ? 'có thể bỏ học' : 'sắp quên nhiều từ');
            }
        }
        if (reasons.length) pullingDown.push({ userId: s.userId, name: s.name, reasons });
    }
    const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    const score = scores.length ? { students: scores.length, low: round10(avg(scores.map((x) => x.low))), high: round10(avg(scores.map((x) => x.high))), ielts: '' } : null;
    if (score) score.ielts = ieltsBetween(score.low, score.high);
    const target =
        course.targetScore !== null && scores.length
            ? {
                  score: course.targetScore,
                  yes: scores.filter((x) => x.target === 'yes').length,
                  maybe: scores.filter((x) => x.target === 'maybe').length,
                  no: scores.filter((x) => x.target === 'no').length,
              }
            : null;
    const notYet: string[] = [];
    if (!course.endsOn) notYet.push('Đặt ngày kết thúc khoá trong cài đặt lớp để có dự báo điểm cuối khoá.');
    else if (scores.length < students.length) {
        notYet.push(`${students.length - scores.length}/${students.length} em chưa đủ 2 lần kiểm tra từ vựng cách nhau từ ${THRESHOLDS.score.minSpanDays} ngày, nên chưa có dự báo điểm.`);
    }
    return { students: students.length, counts, score, target, pullingDown, notYet };
}
