/**
 * "Bẫy chữ": a 4×4 letter grid with some of my words hidden in it as paths of
 * touching cells (diagonals too, no cell twice). The clue is the meaning; the
 * player traces the word. Pure, unit tested.
 */
import { shuffle, type GameCard, type Rand } from './rounds';

export const SIZE = 4;
export const MIN_LEN = 3;
export const MAX_LEN = 6;

export interface Placed {
    cardId: string;
    word: string;
    meaning: string;
    /** Cell indexes, in order. */
    path: number[];
}

export interface Board {
    cells: string[];
    placed: Placed[];
}

/** Cells touching `i`, diagonals included. */
export function neighbours(i: number): number[] {
    const r = Math.floor(i / SIZE);
    const c = i % SIZE;
    const out: number[] = [];
    for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
            if (!dr && !dc) continue;
            const rr = r + dr;
            const cc = c + dc;
            if (rr >= 0 && rr < SIZE && cc >= 0 && cc < SIZE) out.push(rr * SIZE + cc);
        }
    return out;
}

export const isStep = (from: number, to: number) => neighbours(from).includes(to);

/** A path for `word` through free cells (random walk with backtracking), or null. */
function walk(word: string, taken: ReadonlySet<number>, rand: Rand): number[] | null {
    const letters = [...word];
    const go = (path: number[]): number[] | null => {
        if (path.length === letters.length) return path;
        const from = path[path.length - 1];
        for (const n of shuffle(neighbours(from), rand)) {
            if (taken.has(n) || path.includes(n)) continue;
            const r = go([...path, n]);
            if (r) return r;
        }
        return null;
    };
    for (const start of shuffle(Array.from({ length: SIZE * SIZE }, (_, i) => i), rand)) {
        if (taken.has(start)) continue;
        const r = go([start]);
        if (r) return r;
    }
    return null;
}

const FILLER = 'eeeaaiioonnrrttlsdcumpbhgy';

/** A board with up to `n` of the cards' words placed, paths never sharing a cell. */
export function makeBoard(cards: readonly GameCard[], n: number, rand: Rand = Math.random): Board {
    const usable = cards.filter((c) => /^[a-z]+$/i.test(c.word.trim()) && c.word.trim().length >= MIN_LEN && c.word.trim().length <= MAX_LEN);
    const cells: string[] = Array(SIZE * SIZE).fill('');
    const taken = new Set<number>();
    const placed: Placed[] = [];
    for (const c of shuffle(usable, rand)) {
        if (placed.length >= n) break;
        const word = c.word.trim().toLowerCase();
        const path = walk(word, taken, rand);
        if (!path) continue;
        path.forEach((cell, k) => {
            cells[cell] = word[k];
            taken.add(cell);
        });
        placed.push({ cardId: c.id, word, meaning: c.translationHint, path });
    }
    for (let i = 0; i < cells.length; i++) if (!cells[i]) cells[i] = FILLER[Math.floor(rand() * FILLER.length)];
    return { cells, placed };
}

/** True when `word` can be traced on these cells. */
export function canTrace(cells: readonly string[], word: string): boolean {
    const w = word.toLowerCase();
    const go = (i: number, k: number, used: number[]): boolean => {
        if (cells[i] !== w[k]) return false;
        if (k === w.length - 1) return true;
        return neighbours(i).some((n) => !used.includes(n) && go(n, k + 1, [...used, i]));
    };
    return cells.some((_, i) => go(i, 0, []));
}

/** Points for a word: longer ones are worth much more. */
export const wordPoints = (word: string) => word.length * word.length * 5;

/** Is this tapped path one of the placed words (spelled right)? The first match wins. */
export function matchPlaced(board: Board, path: readonly number[], found: ReadonlySet<string>): Placed | null {
    const spelled = path.map((i) => board.cells[i]).join('');
    return board.placed.find((p) => !found.has(p.word) && p.word === spelled) ?? null;
}
