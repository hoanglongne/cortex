/** Review-queue ordering for the inbox. Pure so it can be unit tested. */
export interface QueueItem {
    id: string;
    trend_id: string | null;
    word: string;
}

export interface QueueState<T extends QueueItem> {
    items: T[];
    history: { item: T; action: 'approve' | 'reject' }[];
}

export function initQueue<T extends QueueItem>(items: T[]): QueueState<T> {
    return { items, history: [] };
}

/**
 * Approving one sentence for a word usually means its sibling sentences
 * (same trend, same word) are no longer needed, so they move to the back.
 */
export function decide<T extends QueueItem>(state: QueueState<T>, id: string, action: 'approve' | 'reject'): QueueState<T> {
    const item = state.items.find(i => i.id === id);
    if (!item) return state;
    let rest = state.items.filter(i => i.id !== id);
    if (action === 'approve') {
        const sibling = (i: T) => i.word === item.word && i.trend_id === item.trend_id;
        rest = [...rest.filter(i => !sibling(i)), ...rest.filter(sibling)];
    }
    return { items: rest, history: [...state.history, { item, action }] };
}

export function skip<T extends QueueItem>(state: QueueState<T>, id: string): QueueState<T> {
    const item = state.items.find(i => i.id === id);
    if (!item || state.items.length < 2) return state;
    return { ...state, items: [...state.items.filter(i => i.id !== id), item] };
}

/** Puts the last decided item back on top. Returns null when there is nothing to undo. */
export function undo<T extends QueueItem>(state: QueueState<T>): { state: QueueState<T>; item: T } | null {
    const last = state.history[state.history.length - 1];
    if (!last) return null;
    return {
        item: last.item,
        state: { items: [last.item, ...state.items], history: state.history.slice(0, -1) },
    };
}
