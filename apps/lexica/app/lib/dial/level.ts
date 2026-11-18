/**
 * The learner's Núm vặn level (0–100 %), shared by every dial view and kept on
 * this device. Pure helpers plus a tiny hook.
 */
import { useEffect, useState } from 'react';
import type { DialHit } from './match';
import { defaultMode, intensityFromLevel, type DialIntensity, type DialMode } from './prefs';

const KEY = 'lexica-dial-level';
export const DEFAULT_DIAL_LEVEL = 50;

export function readDialLevel(): number {
    try {
        const v = Number(localStorage.getItem(KEY));
        return Number.isFinite(v) && v >= 0 && v <= 100 && localStorage.getItem(KEY) !== null ? v : DEFAULT_DIAL_LEVEL;
    } catch {
        return DEFAULT_DIAL_LEVEL;
    }
}

export function useDialLevel(): [number, (v: number) => void] {
    const [level, setLevel] = useState(DEFAULT_DIAL_LEVEL);
    useEffect(() => setLevel(readDialLevel()), []);
    const set = (v: number) => {
        setLevel(v);
        try { localStorage.setItem(KEY, String(v)); } catch { /* private mode */ }
    };
    return [level, set];
}

/**
 * Which hits to show at a level. Hits on ranked cards go first (lower rank
 * first: due words, then other learned words); the rest fill up to `level` %
 * of all hits, spread evenly, and never more than `cap` (the intensity's per-page cap).
 */
export function pickHits(hits: DialHit[], level: number, priority: ReadonlySet<string> | ReadonlyMap<string, number> = new Set(), cap = Infinity): Set<number> {
    const want = Math.min(cap, Math.round((hits.length * level) / 100));
    const rankOf = (id: string): number | undefined =>
        priority instanceof Map ? priority.get(id) : (priority as ReadonlySet<string>).has(id) ? 0 : undefined;
    const pri = hits.map((_, i) => i).filter((i) => rankOf(hits[i].cardId) !== undefined)
        .sort((a, b) => (rankOf(hits[a].cardId)! - rankOf(hits[b].cardId)!) || a - b);
    const rest = hits.map((_, i) => i).filter((i) => rankOf(hits[i].cardId) === undefined);
    const shown = new Set(pri.slice(0, want));
    // Spread the remaining picks evenly over the other hits.
    const left = want - shown.size;
    if (left > 0) {
        let acc = 0;
        for (const i of rest) {
            acc += left / rest.length;
            if (acc >= 1 - 1e-9) { shown.add(i); acc -= 1; }
        }
    }
    return shown;
}

const PREFS_KEY = 'lexica-dial-prefs';

export interface DialPrefs { intensity: DialIntensity; mode: DialMode }

/** Saved intensity and display mode; before any choice, the old level and the learner's word count decide. */
export function readDialPrefs(learnedWords: number): DialPrefs {
    const fallback: DialPrefs = { intensity: intensityFromLevel(readDialLevel()), mode: defaultMode(learnedWords) };
    try {
        const raw = JSON.parse(localStorage.getItem(PREFS_KEY) ?? 'null') as Partial<DialPrefs> | null;
        return {
            intensity: raw?.intensity === 'light' || raw?.intensity === 'medium' || raw?.intensity === 'heavy' ? raw.intensity : fallback.intensity,
            mode: raw?.mode === 'replace' || raw?.mode === 'highlight' || raw?.mode === 'both' ? raw.mode : fallback.mode,
        };
    } catch {
        return fallback;
    }
}

export function useDialPrefs(learnedWords: number): [DialPrefs, (p: Partial<DialPrefs>) => void] {
    const [prefs, setPrefs] = useState<DialPrefs>({ intensity: 'medium', mode: 'replace' });
    useEffect(() => setPrefs(readDialPrefs(learnedWords)), [learnedWords]);
    const set = (p: Partial<DialPrefs>) => {
        setPrefs((cur) => {
            const next = { ...cur, ...p };
            try { localStorage.setItem(PREFS_KEY, JSON.stringify(next)); } catch { /* private mode */ }
            return next;
        });
    };
    return [prefs, set];
}

