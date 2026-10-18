/**
 * MyApp in classes (docs/CLASSROOM.md): what a lesson is, what a student
 * reports, and the rules the teacher app shows. Pure; mirrors
 * sql/classroom_myapp.sql.
 */
import type { ClassroomModuleCore } from '@cortex/classroom';

export const MYAPP = 'myapp';

export type Level = 'beginner' | 'intermediate' | 'advanced';
export interface MyAppSettings {
    level: Level | null;
}
export interface TopicPayload {
    topic: string;
    minutes: number;
}
export interface MyAppMetrics {
    sessions: number;
    minutes: number;
    done: Record<string, true>;
}

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const int = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.round(v)) : 0);

export const myappModule: ClassroomModuleCore<MyAppSettings, TopicPayload, MyAppMetrics> = {
    id: MYAPP,
    name: 'MyApp',
    tagline: 'Luyện nói một mình theo chủ đề',
    kinds: { topic: 'Chủ đề nói' },
    parseSettings(raw) {
        const l = obj(raw).level;
        return { level: l === 'beginner' || l === 'intermediate' || l === 'advanced' ? l : null };
    },
    parsePayload(_kind, raw) {
        const o = obj(raw);
        return { topic: typeof o.topic === 'string' ? o.topic : '', minutes: int(o.minutes) || 5 };
    },
    parseMetrics(raw) {
        const o = obj(raw);
        const done: Record<string, true> = {};
        for (const k of Object.keys(obj(o.done))) done[k] = true;
        return { sessions: int(o.sessions), minutes: int(o.minutes), done };
    },
    assignmentProgress(a, students) {
        let started = 0;
        let done = 0;
        for (const s of students) {
            const m = this.parseMetrics(s.apps[MYAPP]?.metrics);
            if (m.sessions > 0) started++;
            if (m.done[a.id]) done++;
        }
        return { started, done, total: students.length };
    },
    praise(app) {
        const gained = app.metrics.minutes - (app.week_ago?.minutes ?? 0);
        return gained >= 30 ? { why: `+${gained} phút nói tuần này`, score: 50 + gained } : null;
    },
    parentLine(app) {
        const gained = app.metrics.minutes - (app.week_ago?.minutes ?? 0);
        return gained > 0 ? `Luyện nói: ${gained} phút tuần này.` : null;
    },
};
