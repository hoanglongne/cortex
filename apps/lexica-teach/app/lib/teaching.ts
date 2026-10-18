'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Board, ClassInfo } from '@cortex/lexica-classes';
import { api } from './supabase';

export interface Teaching {
    classes: ClassInfo[];
    boards: Record<string, Board>;
}

let memo: Teaching | null = null;

/**
 * The classes this person teaches, each with its board, fetched together.
 * Kept in memory between pages so moving around the app is instant; every
 * mount refreshes it in the background.
 */
export function useTeaching() {
    const [data, setData] = useState<Teaching | null>(memo);
    const [error, setError] = useState('');

    const reload = useCallback(async () => {
        try {
            const classes = (await api.myClasses()).filter((c) => c.role === 'teacher');
            const boards = await Promise.all(classes.map((c) => api.board(c.id).catch(() => null)));
            memo = { classes, boards: Object.fromEntries(classes.flatMap((c, i) => (boards[i] ? [[c.id, boards[i]!]] : []))) };
            setData(memo);
            setError('');
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => void reload(), 0);
        return () => clearTimeout(t);
    }, [reload]);

    return { data, error, reload };
}
