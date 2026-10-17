/**
 * Classes from English centers (docs/LEXICA_DIRECTION.md, "Trung tâm"):
 * the words a teacher assigned, kept on the device so the Today session can
 * deal them first even offline. Filled by the class sync (lib/classSync.ts).
 */
import { getCard } from './content/repository';

const ASSIGNED_KEY = 'lexica-class-words-v1';

export function readAssignedWords(): string[] {
    try {
        const raw = JSON.parse(localStorage.getItem(ASSIGNED_KEY) ?? '[]') as unknown;
        return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : [];
    } catch {
        return [];
    }
}

export function writeAssignedWords(ids: string[]) {
    try {
        localStorage.setItem(ASSIGNED_KEY, JSON.stringify([...new Set(ids)].slice(0, 500)));
    } catch {
        // Private mode: assigned words are just not dealt first.
    }
}

/** Assigned words that exist on this device, for the Học stage to deal first. */
export function classWordsToQueue(): string[] {
    return readAssignedWords().filter((id) => getCard(id));
}
