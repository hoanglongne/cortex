'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSupabase } from './supabase';
import { markDone, type DoneMap, type ScoreHistory } from './forecasts';

const cache = new Map<string, Promise<ScoreHistory>>();

/** A class's verified scores over time, once per class per visit. Empty when Lexica's SQL is not run yet. */
function loadHistory(classId: string): Promise<ScoreHistory> {
    let p = cache.get(classId);
    if (!p) {
        p = (async () => {
            const client = getSupabase();
            if (!client) return {};
            const { data, error } = await client.rpc('lexica_class_score_history', { p_class: classId });
            return error ? {} : ((data ?? {}) as ScoreHistory);
        })();
        cache.set(classId, p);
    }
    return p;
}

/** Score histories of these classes by class id; null while loading. */
export function useScoreHistories(classIds: readonly string[]): Record<string, ScoreHistory> | null {
    const key = classIds.join(',');
    const [out, setOut] = useState<{ key: string; value: Record<string, ScoreHistory> } | null>(null);
    useEffect(() => {
        let live = true;
        const ids = key ? key.split(',') : [];
        void Promise.all(ids.map(loadHistory)).then((list) => {
            if (live) setOut({ key, value: Object.fromEntries(ids.map((id, i) => [id, list[i]])) });
        });
        return () => {
            live = false;
        };
    }, [key]);
    return out && out.key === key ? out.value : null;
}

const DONE_KEY = 'teach-forecast-done';

function readDone(): DoneMap {
    try {
        const v = JSON.parse(localStorage.getItem(DONE_KEY) ?? '{}') as unknown;
        return v && typeof v === 'object' ? (v as DoneMap) : {};
    } catch {
        return {};
    }
}

/** What the teacher marked done on this device, hidden for a week. */
export function useDone(): [DoneMap, (key: string) => void] {
    const [done, setDone] = useState<DoneMap>({});
    useEffect(() => {
        // Read after mount: the page renders the same on the server and the first client pass
        const t = setTimeout(() => setDone(readDone()), 0);
        return () => clearTimeout(t);
    }, []);
    const mark = useCallback((key: string) => {
        setDone((d) => {
            const next = markDone(d, key, Date.now());
            try {
                localStorage.setItem(DONE_KEY, JSON.stringify(next));
            } catch {
                // Private mode: hidden for this visit only
            }
            return next;
        });
    }, []);
    return [done, mark];
}
