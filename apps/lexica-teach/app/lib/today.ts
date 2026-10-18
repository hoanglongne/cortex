/**
 * What the teacher's "Hôm nay" shows (Claude Doc, Cấu trúc màn hình): the
 * work that needs them first, praise next, numbers last. Pure, unit tested.
 */
import { assignmentProgress, daysUntil, studentState, weekDelta, type Board } from '@cortex/lexica-classes';

export type Need =
    | { kind: 'nudge'; classId: string; className: string; names: string[] }
    | { kind: 'due'; classId: string; className: string; title: string; days: number; notLearned: number; total: number }
    | { kind: 'missing'; classId: string; className: string; words: number };

export interface Praise {
    classId: string;
    userId: string;
    name: string;
    why: string;
}

/** Most urgent first: lessons due soonest, then students to nudge, then words Studio is writing. */
export function needs(boards: readonly Board[], now = Date.now()): Need[] {
    const due: Need[] = [];
    const nudge: Need[] = [];
    const missing: Need[] = [];
    for (const b of boards) {
        const base = { classId: b.class.id, className: b.class.name };
        const names = b.students.filter((s) => studentState(s, now) === 'nudge').map((s) => s.name);
        if (names.length) nudge.push({ kind: 'nudge', ...base, names });
        for (const a of b.assignments ?? []) {
            if (!a.due_on || b.students.length === 0) continue;
            const days = daysUntil(a.due_on, now);
            if (days < 0 || days > 2) continue;
            const p = assignmentProgress(a, b.students);
            if (p.learned < p.total) due.push({ kind: 'due', ...base, title: a.title, days, notLearned: p.total - p.learned, total: p.total });
        }
        const words = (b.assignments ?? []).reduce((n, a) => n + a.missing_words.length, 0);
        if (words > 0) missing.push({ kind: 'missing', ...base, words });
    }
    due.sort((x, y) => (x.kind === 'due' && y.kind === 'due' ? x.days - y.days : 0));
    return [...due, ...nudge, ...missing];
}

/** Up to `n` students worth a word of praise this week: most new words used, then long streaks. */
export function praise(boards: readonly Board[], n = 4): Praise[] {
    const out: (Praise & { score: number })[] = [];
    for (const b of boards) {
        for (const s of b.students) {
            const d = weekDelta(s);
            if (d.dung >= 3) out.push({ classId: b.class.id, userId: s.user_id, name: s.name, why: `+${d.dung} từ Dùng tuần này`, score: 100 + d.dung });
            else if (s.streak >= 7) out.push({ classId: b.class.id, userId: s.user_id, name: s.name, why: `chuỗi ${s.streak} ngày học`, score: s.streak });
            else if (d.nho >= 10) out.push({ classId: b.class.id, userId: s.user_id, name: s.name, why: `+${d.nho} từ Nhớ tuần này`, score: d.nho / 2 });
        }
    }
    return out
        .sort((a, b) => b.score - a.score)
        .slice(0, n)
        .map((p) => ({ classId: p.classId, userId: p.userId, name: p.name, why: p.why }));
}

/** "3 lớp · 72 học viên · 61 học tuần này". */
export function summaryLine(boards: readonly Board[]): string {
    const students = boards.reduce((n, b) => n + b.students.length, 0);
    const active = boards.reduce((n, b) => n + b.students.filter((s) => s.inactive_days !== null && s.inactive_days <= 6).length, 0);
    return `${boards.length} lớp · ${students} học viên · ${active} em học trong 7 ngày qua`;
}

/** "Chào buổi sáng" by the hour. */
export function greeting(hour: number): string {
    return hour < 11 ? 'Chào buổi sáng' : hour < 14 ? 'Chào buổi trưa' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
}
