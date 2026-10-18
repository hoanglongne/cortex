/**
 * The classroom modules this teacher app knows (docs/CLASSROOM.md). A new
 * app joins classes by adding its module here, after its SQL module and its
 * package exist. An app registered in the database but not here is shown by
 * name only, never breaks a page.
 */
import type { AppId, Board } from '@cortex/classroom';
import type { ModuleUI } from './types';
import { lexicaUI } from './lexica';

export const MODULES: Record<AppId, ModuleUI> = {
    lexica: lexicaUI,
};

export const moduleFor = (app: AppId): ModuleUI | null => MODULES[app] ?? null;

/** The modules a class uses, in the class's order, skipping apps this build does not know. */
export const modulesOf = (board: Pick<Board, 'class'>): ModuleUI[] => board.class.apps.map(moduleFor).filter((m): m is ModuleUI => m !== null);

export type { ModuleUI, NewAssignment } from './types';
