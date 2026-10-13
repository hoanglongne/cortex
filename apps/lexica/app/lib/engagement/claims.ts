import type { ClaimKind } from './economy';

/** Rewards the app can claim now (each pays once; the server enforces it). */
export function pendingClaims(input: {
    today: string;
    dailyProgress: number;
    dailyGoal: number;
    /** Day dailyProgress belongs to (the store's lastLearnedWordsReset). */
    progressDate: string | null;
    currentStreak: number;
    claimed: Set<string>;
}): { kind: ClaimKind; ref: string; label: string }[] {
    const out: { kind: ClaimKind; ref: string; label: string }[] = [];
    const add = (kind: ClaimKind, ref: string, label: string) => {
        if (!input.claimed.has(`${kind}:${ref}`)) out.push({ kind, ref, label });
    };
    if (input.dailyGoal > 0 && input.dailyProgress >= input.dailyGoal && input.progressDate === input.today) {
        add('daily_goal', input.today, 'Đạt mục tiêu ngày');
    }
    for (const [days, kind] of [[7, 'streak_7'], [30, 'streak_30'], [100, 'streak_100']] as const) {
        if (input.currentStreak >= days) add(kind, String(days), `Chuỗi ${days} ngày`);
    }
    return out;
}

/** The date a streak freeze should cover: yesterday, when the last activity was the day before. */
export function freezeTarget(lastActivityDate: string | null, today: string, previous: (d: string) => string): string | null {
    if (!lastActivityDate) return null;
    const yesterday = previous(today);
    return lastActivityDate === previous(yesterday) ? yesterday : null;
}

const KEY = 'lexica-claims-v1';

export function readClaimed(): Set<string> {
    try {
        return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[]);
    } catch {
        return new Set();
    }
}

export function rememberClaimed(key: string) {
    try {
        const set = readClaimed();
        set.add(key);
        localStorage.setItem(KEY, JSON.stringify([...set].slice(-200)));
    } catch {
        // Not critical: the server ignores repeated claims.
    }
}
