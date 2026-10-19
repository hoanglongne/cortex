'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import type { Board, ClassInfo } from '@cortex/classroom';
import { api } from './supabase';

export interface Teaching {
    classes: ClassInfo[];
    boards: Record<string, Board>;
}

/**
 * Data younger than this is shown without asking Supabase again, so moving
 * between pages and tabs costs nothing. Anything the teacher changes reloads
 * right away (`reload`), so only other people's changes (a student learning)
 * wait up to this long.
 */
export const FRESH_MS = 30_000;

interface Entry<T> {
    value: T;
    at: number;
}

let teaching: Entry<Teaching> | null = null;
const boards = new Map<string, Entry<Board>>();
let pendingTeaching: Promise<void> | null = null;
const pendingBoards = new Map<string, Promise<Board>>();
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

export const isFresh = (at: number, now = Date.now()) => now - at < FRESH_MS;

/** Forget everything (signing out, another account). */
export function clearTeaching() {
    teaching = null;
    boards.clear();
    pendingTeaching = null;
    pendingBoards.clear();
    emit();
}

/** The classes this person teaches with every board; one request at a time however many pages ask. */
export function loadTeaching(): Promise<void> {
    pendingTeaching ??= (async () => {
        try {
            const classes = (await api.myClasses()).filter((c) => c.role === 'teacher');
            const list = await Promise.all(classes.map((c) => api.board(c.id).catch(() => null)));
            const at = Date.now();
            const byId: Record<string, Board> = {};
            classes.forEach((c, i) => {
                const b = list[i];
                if (!b) return;
                byId[c.id] = b;
                boards.set(c.id, { value: b, at });
            });
            teaching = { value: { classes, boards: byId }, at };
            emit();
        } finally {
            pendingTeaching = null;
        }
    })();
    return pendingTeaching;
}

/** One class's board; also updates the copy the cross-class pages show. */
export function loadBoard(classId: string): Promise<Board> {
    let p = pendingBoards.get(classId);
    if (!p) {
        p = api.board(classId).then(
            (b) => {
                pendingBoards.delete(classId);
                boards.set(classId, { value: b, at: Date.now() });
                if (teaching?.value.boards[classId]) teaching = { ...teaching, value: { ...teaching.value, boards: { ...teaching.value.boards, [classId]: b } } };
                emit();
                return b;
            },
            (e: unknown) => {
                pendingBoards.delete(classId);
                throw e;
            },
        );
        pendingBoards.set(classId, p);
    }
    return p;
}

/** The teacher changed something: the class list (names, counts) may be out of date too. */
export function markTeachingStale() {
    if (teaching) teaching = { ...teaching, at: 0 };
}

/**
 * The classes this person teaches, each with its board. Kept in memory
 * between pages so moving around the app is instant; refreshed when older
 * than FRESH_MS.
 */
export function useTeaching() {
    useSyncExternalStore(subscribe, getVersion, getVersion);
    const [error, setError] = useState('');

    const reload = useCallback(async () => {
        try {
            await loadTeaching();
            setError('');
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
    }, []);

    useEffect(() => {
        if (teaching && isFresh(teaching.at)) return;
        const t = setTimeout(() => void reload(), 0);
        return () => clearTimeout(t);
    }, [reload]);

    return { data: teaching?.value ?? null, error, reload };
}

/** One class's board, from memory when fresh (opening a class from a list is instant). */
export function useBoard(classId: string) {
    useSyncExternalStore(subscribe, getVersion, getVersion);
    const [error, setError] = useState('');

    const fetchBoard = useCallback(async () => {
        try {
            await loadBoard(classId);
            setError('');
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
    }, [classId]);

    /** After the teacher changes something. */
    const reload = useCallback(async () => {
        markTeachingStale();
        await fetchBoard();
    }, [fetchBoard]);

    useEffect(() => {
        const cached = boards.get(classId);
        if (cached && isFresh(cached.at)) return;
        const t = setTimeout(() => void fetchBoard(), 0);
        return () => clearTimeout(t);
    }, [classId, fetchBoard]);

    return { board: boards.get(classId)?.value ?? null, error, reload };
}
