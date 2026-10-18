/**
 * The contract every classroom module meets (docs/CLASSROOM.md, "Module
 * contract"). This part is pure (no React): the teacher app, the learning
 * app and tests all use it. The teacher app adds the module's screens
 * (apps/teach/app/modules/<app>/).
 */
import type { AppId, Assignment, Board, BoardStudent, StudentApp } from './types';

/** How far a class got on one assignment. `done`: finished the work; `deep`: the module's "really got it" bar. */
export interface AssignmentProgress {
    started: number;
    done: number;
    deep?: number;
    total: number;
}

/** Something on the teacher's "Hôm nay" that only this app knows to raise. */
export interface ModuleNeed {
    classId: string;
    className: string;
    /** One line, Vietnamese, what needs the teacher. */
    text: string;
    /** Where it leads (a class tab). */
    tab?: 'overview' | 'students' | 'assignments' | 'report';
}

/** A student worth praising this week, and why, in one line. */
export interface ModulePraise {
    why: string;
    /** Higher is more remarkable; compared across apps. */
    score: number;
}

export interface ClassroomModuleCore<Settings = unknown, Payload = unknown, Metrics = unknown> {
    /** cortex_apps.id: lowercase, matches the SQL module (classroom_<id>_*). */
    id: AppId;
    /** Shown to teachers: "Lexica", "Oratio". */
    name: string;
    /** What the app is for, one line, for choosing apps when making a class. */
    tagline: string;
    /** Assignment kinds this module gives, with their Vietnamese names. */
    kinds: Record<string, string>;
    /** The app's own settings with defaults; never throws. */
    parseSettings(raw: unknown): Settings;
    /** An assignment payload as stored; never throws. */
    parsePayload(kind: string, raw: unknown): Payload;
    /** A student's metrics as stored; never throws (old or missing data → zeros). */
    parseMetrics(raw: unknown): Metrics;
    /** How many students started and finished an assignment. */
    assignmentProgress(a: Assignment<Payload>, students: readonly BoardStudent[]): AssignmentProgress;
    /** Praise for one student this week, or null. */
    praise(app: StudentApp<Metrics>): ModulePraise | null;
    /** The app's part of a parent message ("+5 từ nhớ được"), or null when nothing to say. */
    parentLine(app: StudentApp<Metrics>): string | null;
    /** Extra things for "Hôm nay" beyond the core's (nudges, due dates). */
    needs?(board: Board): ModuleNeed[];
}

/** The module's slice of a student, parsed. */
export function studentApp<M>(module: Pick<ClassroomModuleCore<unknown, unknown, M>, 'id' | 'parseMetrics'>, s: BoardStudent): StudentApp<M> | null {
    const raw = s.apps[module.id];
    if (!raw) return null;
    return {
        metrics: module.parseMetrics(raw.metrics),
        last_active: raw.last_active,
        week_ago: raw.week_ago == null ? null : module.parseMetrics(raw.week_ago),
        week_first: raw.week_first == null ? null : module.parseMetrics(raw.week_first),
    };
}
