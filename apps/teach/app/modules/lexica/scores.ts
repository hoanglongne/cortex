'use client';

import { useEffect, useState } from 'react';
import { getSupabase } from '../../lib/supabase';

/** A student's last verified vocabulary score (Lexica's server-scored test) and the one before. */
export interface VerifiedScore {
    score: number;
    sd: number;
    level: string;
    at: string;
    code: string;
    previous: number | null;
}

const cache = new Map<string, Promise<Record<string, VerifiedScore>>>();

/** Verified scores of a class by student id, once per class per visit. Empty when Lexica's SQL is not run yet. */
function load(classId: string): Promise<Record<string, VerifiedScore>> {
    let p = cache.get(classId);
    if (!p) {
        p = (async () => {
            const client = getSupabase();
            if (!client) return {};
            const { data, error } = await client.rpc('lexica_class_scores', { p_class: classId });
            if (error) return {};
            return (data ?? {}) as Record<string, VerifiedScore>;
        })();
        cache.set(classId, p);
    }
    return p;
}

export function useClassScores(classId: string): Record<string, VerifiedScore> | null {
    const [scores, setScores] = useState<Record<string, VerifiedScore> | null>(null);
    useEffect(() => {
        let live = true;
        void load(classId).then((s) => live && setScores(s));
        return () => {
            live = false;
        };
    }, [classId]);
    return scores;
}
