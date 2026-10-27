'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { addDays, type AttendanceByClass, type ClassAttendance } from '@cortex/classroom';
import { LOOK_BACK_DAYS } from './lessons';
import { api } from './supabase';
import { isFresh } from './teaching';

/**
 * Timetables and rolls by class, kept in memory like the boards (teaching.ts):
 * moving between Hôm nay, a class and Trên lớp is instant, and a change made
 * on one shows on the others. Empty when classroom_attendance.sql is not run yet.
 */
const store = new Map<string, { value: AttendanceByClass; at: number }>();
const pending = new Map<string, Promise<void>>();
const listeners = new Set<() => void>();
let version = 0;
const emit = () => {
    version++;
    listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => void listeners.delete(l);
};
const getVersion = () => version;

function load(key: string, ids: string[], from: string, to: string): Promise<void> {
    let p = pending.get(key);
    if (!p) {
        p = api
            .attendance(ids, from, to)
            .then(
                (value) => void store.set(key, { value, at: Date.now() }),
                (e: unknown) => {
                    // Show the pages without the roll rather than wait forever (keep what we had)
                    if (!store.has(key)) store.set(key, { value: {}, at: Date.now() });
                    throw e;
                },
            )
            .finally(() => {
                pending.delete(key);
                emit();
            });
        pending.set(key, p);
    }
    return p;
}

/** After a change: everything cached is out of date. */
export function markAttendanceStale() {
    for (const [k, v] of store) store.set(k, { ...v, at: 0 });
}

/** The classes' timetables and sessions from `from` to `to`; null while loading. */
export function useAttendance(classIds: readonly string[], from: string, to: string) {
    useSyncExternalStore(subscribe, getVersion, getVersion);
    const [error, setError] = useState('');
    const ids = [...classIds].sort().join(',');
    const key = `${ids}|${from}|${to}`;
    const fetch = useCallback(async () => {
        if (!ids) return;
        try {
            await load(key, ids.split(','), from, to);
            setError('');
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
    }, [key, ids, from, to]);
    const reload = useCallback(async () => {
        markAttendanceStale();
        pending.delete(key);
        await fetch();
    }, [fetch, key]);
    useEffect(() => {
        const cached = store.get(key);
        if (cached && isFresh(cached.at)) return;
        const t = setTimeout(() => void fetch(), 0);
        return () => clearTimeout(t);
    }, [key, fetch]);
    const value = !ids ? {} : (store.get(key)?.value ?? null);
    return { attendance: value, error, reload };
}

/** The range every page asks for, so they share one copy: 60 days back (Hôm nay, records) and two weeks ahead (cancelling). */
export function attendanceRange(today: string): [string, string] {
    return [addDays(today, -LOOK_BACK_DAYS), addDays(today, 14)];
}

/** One class's timetable and sessions over the shared range; null while loading. */
export function useClassAttendance(classId: string, today: string) {
    const [from, to] = attendanceRange(today);
    const { attendance, error, reload } = useAttendance([classId], from, to);
    const value: ClassAttendance | null = attendance ? (attendance[classId] ?? { schedule: [], sessions: [] }) : null;
    return { attendance: value, error, reload };
}
