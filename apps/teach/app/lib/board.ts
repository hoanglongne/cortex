'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Board } from '@cortex/classroom';
import { api } from './supabase';

/** One class's board. */
export function useBoard(classId: string) {
    const [board, setBoard] = useState<Board | null>(null);
    const [error, setError] = useState('');

    const reload = useCallback(async () => {
        try {
            setBoard(await api.board(classId));
            setError('');
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
    }, [classId]);

    useEffect(() => {
        const t = setTimeout(() => void reload(), 0);
        return () => clearTimeout(t);
    }, [reload]);

    return { board, error, reload };
}

/** Students learning on each of the last `n` days (oldest first), any app. */
export function activityByDay(board: Board, n = 7, now = Date.now()): { date: string; count: number }[] {
    const out: { date: string; count: number }[] = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(now - i * 86_400_000);
        const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        out.push({ date, count: board.students.filter((s) => s.days.includes(date)).length });
    }
    return out;
}
