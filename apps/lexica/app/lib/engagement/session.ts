import { updateCardProgress, type UserCardProgress } from '../eloAlgorithm';
import { isOwned, type CollectionSet } from './collection';
import { isHard } from './hard';

/**
 * A learning session in the swipe deck: 10 cards, a combo for words known in
 * a row, and a recap with something to come back for. Pure, unit tested.
 */

export const SESSION_SIZE = 10;
/** Combo counts that get a bigger celebration. */
export const COMBO_MILESTONES = [5, 10, 15, 20, 30, 50];

export type CardState = UserCardProgress['state'];

export const STATE_LABEL: Record<CardState, string> = {
    seed: 'Mầm non',
    sprout: 'Đang nhớ',
    gold: 'Thuộc tốt',
    mastered: 'Thành thạo',
};

export interface LevelUp {
    cardId: string;
    from: CardState | null;
    to: CardState;
}

export interface LuckyReward {
    cardId: string;
    item: 'dust' | 'box';
    amount: number;
}

export interface SessionState {
    count: number;
    known: number;
    combo: number;
    maxCombo: number;
    newCards: string[];
    levelUps: LevelUp[];
    lucky: LuckyReward[];
    /** Hard words (see hard.ts) recalled in this session. */
    hardBeaten: string[];
    /** Words seen before and remembered in this session (offered for "Câu của bạn"). */
    remembered: string[];
    startedAt: number;
}

export const newSession = (now = Date.now()): SessionState => ({
    count: 0,
    known: 0,
    combo: 0,
    maxCombo: 0,
    newCards: [],
    levelUps: [],
    lucky: [],
    hardBeaten: [],
    remembered: [],
    startedAt: now,
});

const RANK: Record<CardState, number> = { seed: 0, sprout: 1, gold: 2, mastered: 3 };

/** Records one swipe given the card's progress before and after it. */
export function recordSwipe(
    s: SessionState,
    input: { cardId: string; known: boolean; before?: UserCardProgress; after?: UserCardProgress },
): SessionState {
    const combo = input.known ? s.combo + 1 : 0;
    const next: SessionState = {
        ...s,
        count: s.count + 1,
        known: s.known + (input.known ? 1 : 0),
        combo,
        maxCombo: Math.max(s.maxCombo, combo),
    };
    if (input.known && isHard(input.before)) next.hardBeaten = [...s.hardBeaten, input.cardId];
    if (input.known && !input.before) next.newCards = [...s.newCards, input.cardId];
    if (input.known && input.before) next.remembered = [...(s.remembered ?? []), input.cardId];
    if (input.known && input.before && input.after && RANK[input.after.state] > RANK[input.before.state]) {
        next.levelUps = [...s.levelUps, { cardId: input.cardId, from: input.before.state, to: input.after.state }];
    }
    return next;
}

export const sessionDone = (s: SessionState) => s.count >= SESSION_SIZE;

/** True when this combo count deserves the big celebration. */
export const isComboMilestone = (combo: number) => COMBO_MILESTONES.includes(combo);

/** What "Đã nhớ" on this card would do to its level, in a few words. */
export function levelHint(progress: UserCardProgress | undefined, cardId: string): string | null {
    if (!progress) return null;
    if (progress.state === 'mastered') return null;
    const after = updateCardProgress(progress, cardId, 'right');
    if (after.state === progress.state) return null;
    return `Nhớ lần này → lên ${STATE_LABEL[after.state]}`;
}

/** "Còn N từ là đủ bộ X" when learning this card brings a set within reach. */
export function setHint(
    cardId: string,
    sets: readonly CollectionSet[],
    progress: Record<string, UserCardProgress>,
    within = 3,
): string | null {
    if (isOwned(progress[cardId])) return null;
    const set = sets.find((x) => x.cardIds.includes(cardId));
    if (!set) return null;
    const missing = set.cardIds.filter((id) => !isOwned(progress[id])).length;
    if (missing > within) return null;
    return missing === 1 ? `Từ cuối cùng của bộ ${set.label}` : `Còn ${missing} từ là đủ bộ ${set.label}`;
}

/** The set closest to complete (for the recap), if any is within reach. */
export function nearestSet(
    sets: readonly CollectionSet[],
    progress: Record<string, UserCardProgress>,
    within = 5,
): { label: string; missing: number } | null {
    let best: { label: string; missing: number } | null = null;
    for (const set of sets) {
        const missing = set.cardIds.filter((id) => !isOwned(progress[id])).length;
        if (missing === 0 || missing > within) continue;
        if (!best || missing < best.missing) best = { label: set.label, missing };
    }
    return best;
}

/** Teasers for the next session, from the cards that will come next. */
export function nextSessionTeasers(input: {
    upcoming: { id: string; trend?: unknown }[];
    luckyIds: ReadonlySet<string>;
}): string[] {
    const next = input.upcoming.slice(0, SESSION_SIZE);
    const out: string[] = [];
    const lucky = next.filter((c) => input.luckyIds.has(c.id)).length;
    if (lucky > 0) out.push(lucky === 1 ? 'Phiên sau có 1 thẻ may mắn' : `Phiên sau có ${lucky} thẻ may mắn`);
    const trend = next.filter((c) => c.trend).length;
    if (trend > 0) out.push(`Phiên sau có ${trend} thẻ Trend mới`);
    return out;
}
