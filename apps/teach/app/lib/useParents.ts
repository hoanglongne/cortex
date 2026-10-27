'use client';

import { useCallback, useEffect, useState } from 'react';
import { weekAttendance, type Board, type ClassParents, type ReportContent, type WeekMetrics } from '@cortex/classroom';
import { LEXICA, lexicaWeek } from '@cortex/classroom-lexica';
import { api } from './supabase';
import { composeReport } from './parentReport';
import { useScoreHistories } from './useForecasts';
import { useAttendance } from './useAttendance';
import { wordIndex, type WordIndex } from '../modules/lexica/words';

/** The class's parent links and one week's approved reports; reload after any change. */
export function useClassParents(classId: string, week: string) {
    const [data, setData] = useState<{ key: string; value: ClassParents } | null>(null);
    const [error, setError] = useState('');
    const key = `${classId}:${week}`;
    const load = useCallback(async () => {
        try {
            const value = await api.parents(classId, week);
            setData({ key: `${classId}:${week}`, value });
            setError('');
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
    }, [classId, week]);
    useEffect(() => {
        const t = setTimeout(() => void load(), 0);
        return () => clearTimeout(t);
    }, [load]);
    return { parents: data && data.key === key ? data.value : null, error, reload: load };
}

function useWeekMetrics(classId: string, week: string): WeekMetrics | null {
    const [data, setData] = useState<{ key: string; value: WeekMetrics } | null>(null);
    const key = `${classId}:${week}`;
    useEffect(() => {
        let live = true;
        api.weekMetrics(classId, week).then(
            (value) => live && setData({ key, value }),
            () => live && setData({ key, value: {} }),
        );
        return () => {
            live = false;
        };
    }, [classId, week, key]);
    return data && data.key === key ? data.value : null;
}

function useWords(): WordIndex | null {
    const [index, setIndex] = useState<WordIndex | null>(null);
    useEffect(() => {
        let live = true;
        void wordIndex().then((w) => live && setIndex(w));
        return () => {
            live = false;
        };
    }, []);
    return index;
}

const sunday = (monday: string) => {
    const d = new Date(`${monday}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 6);
    return d.toISOString().slice(0, 10);
};

/** Each student's report as the system writes it for `week`, before the teacher's line. Null while loading. */
export function useDrafts(board: Board, week: string): Record<string, ReportContent> | null {
    const metrics = useWeekMetrics(board.class.id, week);
    const histories = useScoreHistories([board.class.id]);
    const words = useWords();
    const { attendance } = useAttendance([board.class.id], week, sunday(week));
    if (!metrics || !histories || !words || !attendance) return null;
    const sessions = attendance[board.class.id]?.sessions ?? [];
    const history = histories[board.class.id] ?? {};
    const out: Record<string, ReportContent> = {};
    for (const s of board.students) {
        const m = metrics[s.user_id];
        const lexica = board.class.apps.includes(LEXICA)
            ? lexicaWeek({
                  end: m?.apps[LEXICA]?.end ?? null,
                  start: m?.apps[LEXICA]?.start ?? null,
                  word: (id) => words.byId.get(id)?.word,
                  scores: history[s.user_id] ?? [],
                  weekEnd: sunday(week),
              })
            : null;
        out[s.user_id] = composeReport({ days: m?.days.length ?? 0, lexica, attend: weekAttendance(sessions, s.user_id, week) });
    }
    return out;
}
