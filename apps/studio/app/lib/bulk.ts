import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api, errorText } from './api';

export interface BulkResult {
    done: string[];
    failed: { id: string; error: string }[];
}

/** Runs `fn` for every id, `concurrency` at a time, so a long list costs a few round trips, not one per item. */
export async function runBulk(
    ids: readonly string[],
    fn: (id: string) => Promise<unknown>,
    onProgress?: (finished: number) => void,
    concurrency = 6,
): Promise<BulkResult> {
    const result: BulkResult = { done: [], failed: [] };
    let next = 0;
    let finished = 0;
    const worker = async () => {
        while (next < ids.length) {
            const id = ids[next++];
            try {
                await fn(id);
                result.done.push(id);
            } catch (err) {
                result.failed.push({ id, error: errorText(err) });
            }
            onProgress?.(++finished);
        }
    };
    await Promise.all(Array.from({ length: Math.min(concurrency, ids.length) }, worker));
    return result;
}

/** "Đã duyệt 12, lỗi 2 (…)" for the note under a bulk action. */
export function bulkSummary(verb: string, r: BulkResult): string {
    const failed = r.failed.length ? `, lỗi ${r.failed.length} (${r.failed[0].error})` : '';
    return `Đã ${verb} ${r.done.length}${failed}.`;
}

/** Which rows of a list are ticked. Ids that leave the list drop out of the selection. */
export function useSelection(ids: readonly string[]) {
    const [picked, setPicked] = useState<Set<string>>(new Set());
    const present = useMemo(() => new Set(ids), [ids]);
    const selected = useMemo(() => new Set([...picked].filter((id) => present.has(id))), [picked, present]);
    const toggle = useCallback(
        (id: string) =>
            setPicked((p) => {
                const n = new Set(p);
                if (n.has(id)) n.delete(id);
                else n.add(id);
                return n;
            }),
        [],
    );
    const setAll = useCallback((on: boolean) => setPicked(on ? new Set(ids) : new Set()), [ids]);
    const clear = useCallback(() => setPicked(new Set()), []);
    return { selected, toggle, setAll, clear, all: ids.length > 0 && selected.size === ids.length };
}

/**
 * Review one item or many without reloading the list each time: the reviewed
 * rows leave the list at once and the counts are refreshed once, a moment later.
 */
export function useBulkReview<T extends { id: string }>(opts: {
    list: T[];
    setList: (fn: (l: T[]) => T[]) => void;
    /** Endpoint of one item action, e.g. `/quotes/${id}/approve` */
    path: (id: string, action: 'approve' | 'reject') => string;
    refreshCounts: () => void;
    setError: (msg: string) => void;
    setNote: (msg: string) => void;
}) {
    const { list, setList, path, refreshCounts, setError, setNote } = opts;
    const ids = useMemo(() => list.map((x) => x.id), [list]);
    const sel = useSelection(ids);
    const [progress, setProgress] = useState<string>('');
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

    const countsSoon = useCallback(() => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(refreshCounts, 1500);
    }, [refreshCounts]);

    const removeOne = useCallback(
        (id: string) => {
            setList((l) => l.filter((x) => x.id !== id));
            countsSoon();
        },
        [setList, countsSoon],
    );

    const bulk = async (action: 'approve' | 'reject') => {
        const chosen = [...sel.selected];
        if (chosen.length === 0) return;
        setError('');
        setNote('');
        setProgress(`0/${chosen.length}`);
        const r = await runBulk(
            chosen,
            (id) => api(path(id, action), { method: 'POST', body: {} }),
            (n) => setProgress(`${n}/${chosen.length}`),
        );
        setProgress('');
        const gone = new Set(r.done);
        setList((l) => l.filter((x) => !gone.has(x.id)));
        sel.clear();
        setNote(bulkSummary(action === 'approve' ? 'duyệt' : 'loại', r));
        if (r.failed.length) setError(r.failed.map((f) => f.error).filter((v, i, a) => a.indexOf(v) === i).join('; '));
        countsSoon();
    };

    return { sel, progress, bulk, removeOne };
}
