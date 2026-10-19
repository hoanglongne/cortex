/**
 * Browsing Lexica's cards in the lesson form ("Chọn từ Lexica"): filter by
 * branch, level, Studio pack and a search. Pure, unit tested.
 */
import type { IndexCard } from './words';

export const LEVELS = [
    ['beginner', 'Cơ bản'],
    ['intermediate', 'Trung cấp'],
    ['advanced', 'Nâng cao'],
    ['expert', 'Chuyên gia'],
] as const;

export const BRANCHES = [
    ['cert', 'Chứng chỉ'],
    ['talk', 'Giao tiếp'],
] as const;

export const levelLabel = (level: string) => LEVELS.find(([id]) => id === level)?.[1] ?? level;

/** "" = any. `pack` "lexica" = Lexica's own deck (cards with no Studio pack). */
export interface Filter {
    branch: '' | IndexCard['branch'];
    level: string;
    pack: string;
    q: string;
}

export const OWN_DECK = 'lexica';

/** Lower case, no Vietnamese marks: "hợp lý" finds "Hợp lý" and "hop ly". */
export const fold = (s: string) =>
    s
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .trim();

export function browse(cards: readonly IndexCard[], f: Filter): IndexCard[] {
    const q = fold(f.q);
    const out = cards.filter(
        (c) =>
            (!f.branch || c.branch === f.branch) &&
            (!f.level || c.level === f.level) &&
            (!f.pack || (f.pack === OWN_DECK ? !c.pack : c.pack === f.pack)) &&
            (!q || fold(c.word).includes(q) || fold(c.meaning).includes(q)),
    );
    // A search puts words that start with it first.
    return q ? out.sort((a, b) => Number(!fold(a.word).startsWith(q)) - Number(!fold(b.word).startsWith(q))) : out;
}

/** Studio packs with how many cards each has, biggest first, after the given branch and level. */
export function packsOf(cards: readonly IndexCard[], f: Pick<Filter, 'branch' | 'level'>): { name: string; count: number }[] {
    const n = new Map<string, number>();
    for (const c of cards) {
        if (!c.pack || (f.branch && c.branch !== f.branch) || (f.level && c.level !== f.level)) continue;
        n.set(c.pack, (n.get(c.pack) ?? 0) + 1);
    }
    return [...n].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'vi'));
}

/** Adds every id not yet picked, up to `max` in all; or, when all are picked already, takes them out. */
export function toggleAll(picked: readonly string[], ids: readonly string[], max: number): string[] {
    const have = new Set(picked);
    if (ids.length > 0 && ids.every((id) => have.has(id))) {
        const drop = new Set(ids);
        return picked.filter((id) => !drop.has(id));
    }
    const out = [...picked];
    for (const id of ids) {
        if (out.length >= max) break;
        if (!have.has(id)) out.push(id);
    }
    return out;
}
