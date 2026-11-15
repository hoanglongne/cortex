/**
 * The learner's Núm vặn level (0–100 %), shared by every dial view and kept on
 * this device. Pure helpers plus a tiny hook.
 */
import { useEffect, useState } from 'react';
import type { DialHit } from './match';

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
 * Which hits to show at a level. Hits on priority cards (the learner's words)
 * go first; the rest fill up to `level` % of all hits, spread evenly.
 */
export function pickHits(hits: DialHit[], level: number, priority: ReadonlySet<string> = new Set()): Set<number> {
    const want = Math.round((hits.length * level) / 100);
    const order = hits.map((h, i) => i).sort((a, b) => Number(priority.has(hits[b].cardId)) - Number(priority.has(hits[a].cardId)));
    const pri = order.filter((i) => priority.has(hits[i].cardId));
    const rest = order.filter((i) => !priority.has(hits[i].cardId));
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
