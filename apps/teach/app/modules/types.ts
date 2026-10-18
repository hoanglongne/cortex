import type { FC } from 'react';
import type { Assignment, Board, BoardStudent, ClassroomModuleCore, StudentApp } from '@cortex/classroom';

/** What a module asks the teacher app to save when a teacher gives work. */
export interface NewAssignment {
    kind: string;
    title: string;
    payload: unknown;
    due: string | null;
}

/**
 * A module's screens in the teacher app (docs/CLASSROOM.md, "Module
 * contract"). The pure part (`core`) comes from packages/classroom-<app>;
 * these components live in app/modules/<app>/ and use the app's UI kit.
 */
export interface ModuleUI {
    core: ClassroomModuleCore<unknown, unknown, unknown>;
    /** A Tailwind background class for the app's dot and chips (a theme token). */
    dot: string;
    /** The learning app's address: class links open there (/join/CODE). */
    appUrl: string;
    /** Words for the two progress bars of an assignment: "done" and the module's "deep" bar. */
    progressLabels: { done: string; deep?: string };
    /** The app's settings when making or editing a class. */
    SettingsFields: FC<{ value: unknown; onChange: (value: unknown) => void }>;
    /** The settings in a few words, under the class name ("Chứng chỉ · Trung cấp"). */
    settingsLine: (settings: unknown) => string | null;
    /** A student's progress in one line (a student row). */
    StudentSummary: FC<{ app: StudentApp | null }>;
    /** The app's section on a student's page. */
    StudentSection: FC<{ student: BoardStudent; board: Board }>;
    /** The class's progress in this app (class overview). */
    ClassSummary: FC<{ board: Board }>;
    /** What an assignment holds (its words, its topic…). */
    AssignmentBody: FC<{ assignment: Assignment; board: Board }>;
    /** Giving work in this app: the module's own form, inside the assign panel. */
    AssignForm: FC<{ board: Board; onSubmit: (a: NewAssignment) => Promise<void>; onCancel: () => void }>;
}
