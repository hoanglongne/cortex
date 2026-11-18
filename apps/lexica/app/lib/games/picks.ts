/**
 * "3 game hợp với bạn hôm nay" (issue #146): one challenge, one that fits the
 * learner's branch, one quick game. Rotates by date so the page changes each
 * day, and is the same all day. Pure, unit tested.
 */
import type { Branch } from '../journey/path';

export type PickId = 'boss' | 'grid' | 'rain' | 'run' | 'blitz' | 'detective' | 'liar' | 'listen' | 'cloze' | 'upgrade' | 'match' | 'spell' | 'chain' | 'dictate' | 'fill' | 'linked';

export interface Pick { id: PickId; why: string }

const CHALLENGE: PickId[] = ['run', 'rain', 'boss', 'grid'];
const FOR_BRANCH: Record<Branch | 'none', PickId[]> = {
    cert: ['cloze', 'upgrade', 'fill', 'dictate'],
    talk: ['linked', 'listen', 'dictate', 'chain'],
    none: ['detective', 'liar', 'listen', 'match'],
};
const QUICK: PickId[] = ['blitz', 'match', 'spell', 'liar', 'detective'];

/** Day number from a local date "YYYY-MM-DD", for rotating. */
function dayIndex(date: string): number {
    const [y, m, d] = date.split('-').map(Number);
    return Math.floor(Date.UTC(y, (m || 1) - 1, d || 1) / 86_400_000);
}

export function todaysPicks(date: string, branch: Branch | null, dueWords: number): Pick[] {
    const n = dayIndex(date);
    const out: Pick[] = [];
    const add = (list: PickId[], why: string, offset = 0) => {
        for (let i = 0; i < list.length; i++) {
            const id = list[(n + offset + i) % list.length];
            if (!out.some((p) => p.id === id)) {
                out.push({ id, why });
                return;
            }
        }
    };
    add(CHALLENGE, 'Thử thách hôm nay');
    add(FOR_BRANCH[branch ?? 'none'], branch === 'cert' ? 'Hợp hướng Chứng chỉ' : branch === 'talk' ? 'Hợp hướng Giao tiếp' : 'Luyện suy luận');
    // Many words due: a fast game clears the most of them.
    if (dueWords >= 10) add(['blitz', 'match'], `${dueWords} từ đến hạn ôn`);
    else add(QUICK, 'Nhanh, 1–2 phút', 1);
    return out;
}
