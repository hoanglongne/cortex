/**
 * What the teacher's "Hôm nay" shows (Claude Doc "Lexica Lớp học — thiết
 * kế"): the work that needs them first, praise next, numbers last. The core
 * rules (who went quiet, what is due) hold for every app; each module adds
 * what only it knows (docs/CLASSROOM.md). Pure, unit tested.
 */
import { daysUntil, studentApp, studentState, type Board } from '@cortex/classroom';
import type { ModuleUI } from '../modules/types';

export type Need =
    | { kind: 'nudge'; classId: string; className: string; names: string[] }
    | { kind: 'due'; classId: string; className: string; title: string; days: number; notDone: number; total: number }
    | { kind: 'module'; classId: string; className: string; text: string; tab?: string };

export interface Praise {
    classId: string;
    userId: string;
    name: string;
    why: string;
}

type Modules = (app: string) => ModuleUI | null;

/** Most urgent first: work due soonest, then students to nudge, then what modules raise. */
export function needs(boards: readonly Board[], moduleFor: Modules, now = Date.now()): Need[] {
    const due: Extract<Need, { kind: 'due' }>[] = [];
    const nudge: Need[] = [];
    const extra: Need[] = [];
    for (const b of boards) {
        const base = { classId: b.class.id, className: b.class.name };
        const names = b.students.filter((s) => studentState(s, now) === 'nudge').map((s) => s.name);
        if (names.length) nudge.push({ kind: 'nudge', ...base, names });
        for (const a of b.assignments) {
            const m = moduleFor(a.app);
            if (!m || !a.due_on || b.students.length === 0) continue;
            const days = daysUntil(a.due_on, now);
            if (days < 0 || days > 2) continue;
            const p = m.core.assignmentProgress({ ...a, payload: m.core.parsePayload(a.kind, a.payload) }, b.students);
            if (p.done < p.total) due.push({ kind: 'due', ...base, title: a.title, days, notDone: p.total - p.done, total: p.total });
        }
        for (const app of b.class.apps) {
            for (const n of moduleFor(app)?.core.needs?.(b) ?? []) extra.push({ kind: 'module', classId: n.classId, className: n.className, text: n.text, tab: n.tab });
        }
    }
    due.sort((x, y) => x.days - y.days);
    return [...due, ...nudge, ...extra];
}

/** Up to `n` students worth praise this week: the most remarkable reason any app gives, then long streaks. */
export function praise(boards: readonly Board[], moduleFor: Modules, n = 4): Praise[] {
    const out: (Praise & { score: number })[] = [];
    for (const b of boards) {
        for (const s of b.students) {
            let best: { why: string; score: number } | null = s.streak >= 7 ? { why: `chuỗi ${s.streak} ngày học`, score: s.streak } : null;
            for (const app of b.class.apps) {
                const m = moduleFor(app);
                const sa = m ? studentApp(m.core, s) : null;
                const p = m && sa ? m.core.praise(sa) : null;
                if (p && (!best || p.score > best.score)) best = p;
            }
            if (best) out.push({ classId: b.class.id, userId: s.user_id, name: s.name, why: best.why, score: best.score });
        }
    }
    return out
        .sort((a, b) => b.score - a.score)
        .slice(0, n)
        .map((p) => ({ classId: p.classId, userId: p.userId, name: p.name, why: p.why }));
}

/** "3 lớp · 72 học viên · 61 em học trong 7 ngày qua". */
export function summaryLine(boards: readonly Board[]): string {
    const students = boards.reduce((n, b) => n + b.students.length, 0);
    const active = boards.reduce((n, b) => n + b.students.filter((s) => s.inactive_days !== null && s.inactive_days <= 6).length, 0);
    return `${boards.length} lớp · ${students} học viên · ${active} em học trong 7 ngày qua`;
}

/** A parent message: the class's apps each add their line, praise before numbers. */
export function parentMessage(student: Board['students'][number], board: Board, moduleFor: Modules): string {
    const lines = board.class.apps.flatMap((app) => {
        const m = moduleFor(app);
        const sa = m ? studentApp(m.core, student) : null;
        const line = m && sa ? m.core.parentLine(sa) : null;
        return line ? [line] : [];
    });
    const streak = student.streak > 0 ? ` Chuỗi ${student.streak} ngày học.` : '';
    return `${student.name} (${board.class.name}) tuần này: ${lines.join(' ') || 'chưa có số liệu mới.'}${streak}`;
}

/** "Chào buổi sáng" by the hour. */
export function greeting(hour: number): string {
    return hour < 11 ? 'Chào buổi sáng' : hour < 14 ? 'Chào buổi trưa' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
}
