/**
 * Level 3 measures kept on the device while they are hidden from learners
 * (docs/LEXICA_PRONUNCIATION_DESIGN.md, 8): numbers only, never audio or
 * what was said. A tester can download them from Cài đặt to check the
 * thresholds against what they heard.
 */
import type { ProsodyMeasures, ProsodyNote } from './level3';

const KEY = 'lexica-prosody-log';
const MAX = 300;

export interface ProsodyLogEntry {
    at: number;
    target: string;
    measures: ProsodyMeasures;
    notes: ProsodyNote['kind'][];
}

export function readProsodyLog(): ProsodyLogEntry[] {
    try {
        const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]') as unknown;
        return Array.isArray(raw) ? (raw as ProsodyLogEntry[]) : [];
    } catch {
        return [];
    }
}

export function logProsody(entry: ProsodyLogEntry) {
    try {
        localStorage.setItem(KEY, JSON.stringify([...readProsodyLog(), entry].slice(-MAX)));
    } catch {
        // Storage full or private mode: the log is a convenience.
    }
}

export function clearProsodyLog() {
    try {
        localStorage.removeItem(KEY);
    } catch {
        // nothing to clear
    }
}
