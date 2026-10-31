/**
 * "Hành trình": a run through seven floors. On each floor you choose between
 * two doors (a fight, an elite, a treasure, a rest); the last floor is the
 * boss. Treasures give relics that bend the rules; hearts do not come back by
 * themselves. Pure, unit tested; the screen asks the questions.
 */
import { shuffle, type Rand } from './rounds';

export const FLOORS = 7;
export const MAX_HEARTS = 5;

export type RoomKind = 'fight' | 'elite' | 'treasure' | 'rest' | 'boss';
export type RelicId = 'shield' | 'double' | 'eye' | 'heart' | 'coin';

export const RELICS: Record<RelicId, { name: string; text: string }> = {
    shield: { name: 'Khiên', text: 'Chặn câu sai đầu tiên của mỗi phòng' },
    double: { name: 'Nhân đôi', text: 'Phòng chiến đấu kế tiếp được gấp đôi điểm' },
    eye: { name: 'Mắt thần', text: 'Mỗi phòng có một lần 50/50' },
    heart: { name: 'Thêm tim', text: 'Hồi một tim ngay' },
    coin: { name: 'Túi vàng', text: 'Mỗi câu đúng thêm 5 điểm cho đến hết hành trình' },
};

export const ROOM_LABEL: Record<RoomKind, { name: string; hint: string }> = {
    fight: { name: 'Chiến đấu', hint: '3 câu, sai mất tim' },
    elite: { name: 'Tinh anh', hint: '4 câu khó, điểm ×1,5' },
    treasure: { name: 'Kho báu', hint: 'Chọn một vật phẩm' },
    rest: { name: 'Nghỉ chân', hint: 'Hồi một tim' },
    boss: { name: 'Trùm', hint: '5 câu, điểm ×2' },
};

/** Questions in a room. */
export const questionsIn = (k: RoomKind): number => ({ fight: 3, elite: 4, treasure: 0, rest: 0, boss: 5 })[k];

export interface Run {
    floor: number;
    hearts: number;
    score: number;
    relics: RelicId[];
    /** The Nhân đôi relic waiting for the next fight. */
    doubleNext: boolean;
    correct: number;
    asked: number;
    cleared: number;
}

export const newRun = (): Run => ({ floor: 1, hearts: 3, score: 0, relics: [], doubleNext: false, correct: 0, asked: 0, cleared: 0 });

export const ended = (r: Run) => r.hearts <= 0 || r.floor > FLOORS;
export const victory = (r: Run) => r.hearts > 0 && r.floor > FLOORS;

/** The two doors of a floor. Floors 1–2 are fights and rests, later ones add elites; the last is the boss alone. */
export function doors(floor: number, rand: Rand = Math.random): RoomKind[] {
    if (floor >= FLOORS) return ['boss'];
    const pool: RoomKind[] = floor <= 2 ? ['fight', 'fight', 'treasure', 'rest'] : floor === FLOORS - 1 ? ['rest', 'treasure', 'elite'] : ['fight', 'elite', 'treasure', 'rest'];
    const [a, b] = shuffle(pool, rand);
    const second = b === a ? (a === 'fight' ? 'treasure' : 'fight') : b;
    return [a, second];
}

/** Three relics to choose from (never ones already held, except hearts). */
export function offer(r: Run, rand: Rand = Math.random): RelicId[] {
    const all = Object.keys(RELICS) as RelicId[];
    const fresh = all.filter((x) => x === 'heart' || !r.relics.includes(x));
    return shuffle(fresh, rand).slice(0, 3);
}

export function take(r: Run, relic: RelicId): Run {
    if (relic === 'heart') return { ...r, hearts: Math.min(MAX_HEARTS, r.hearts + 1), floor: r.floor + 1, cleared: r.cleared + 1 };
    return { ...r, relics: [...r.relics, relic], doubleNext: relic === 'double' ? true : r.doubleNext, floor: r.floor + 1, cleared: r.cleared + 1 };
}

export function rest(r: Run): Run {
    return { ...r, hearts: Math.min(MAX_HEARTS, r.hearts + 1), floor: r.floor + 1, cleared: r.cleared + 1 };
}

/**
 * A fight, elite or boss done: `right` of `total` answered. Each wrong answer
 * costs a heart, the first one is blocked by a Khiên. Points grow with room.
 */
export function finishRoom(r: Run, kind: RoomKind, right: number, total: number): Run {
    const wrong = total - right;
    const blocked = r.relics.includes('shield') && wrong > 0 ? 1 : 0;
    const hearts = r.hearts - Math.max(0, wrong - blocked);
    const mult = kind === 'boss' ? 2 : kind === 'elite' ? 1.5 : 1;
    const dbl = kind === 'fight' && r.doubleNext ? 2 : 1;
    const coin = r.relics.includes('coin') ? 5 : 0;
    const score = r.score + Math.round(right * (10 + coin) * mult * dbl) + (wrong === 0 ? 10 : 0);
    return { ...r, hearts, score, doubleNext: dbl === 2 ? false : r.doubleNext, correct: r.correct + right, asked: r.asked + total, floor: hearts > 0 ? r.floor + 1 : r.floor, cleared: hearts > 0 ? r.cleared + 1 : r.cleared };
}

/** Final score: the floors cleared and the hearts left count too, and a win is worth most. */
export function runScore(r: Run): number {
    return r.score + r.cleared * 30 + Math.max(0, r.hearts) * 40 + (victory(r) ? 300 : 0);
}
