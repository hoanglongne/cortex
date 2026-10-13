import { localDate } from './ghost';

/** Words whose shield was used today ("Liều hay Dừng": once per word per day). */
const KEY = 'lexica-shields-v1';

export function readShieldsUsed(today = localDate()): Set<string> {
    try {
        const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null') as { date: string; ids: string[] } | null;
        return new Set(raw?.date === today ? raw.ids : []);
    } catch {
        return new Set();
    }
}

/** Marks the shield of `cardId` as used today and returns the updated set. */
export function spendShield(cardId: string, today = localDate()): Set<string> {
    const used = readShieldsUsed(today);
    used.add(cardId);
    try {
        localStorage.setItem(KEY, JSON.stringify({ date: today, ids: [...used] }));
    } catch {
        // Private mode: the shield still works for this session.
    }
    return used;
}
