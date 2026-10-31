/**
 * "Đã biết, không học": at the first meeting with a word the learner may say
 * they already know it. The word then never comes back (not in review, games,
 * readings or class quizzes), unlike "Đã nhớ", which keeps it in the review
 * plan. Kept to a number a day so the button is not a way to skip the session.
 * Pure, unit tested.
 */
export const KNOWN_DAILY_CAP = 20;

/** Card id → when the learner said they know it (ms). */
export type KnownWords = Record<string, number>;

const startOfDay = (now: number) => {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
};

/** Words marked known since midnight (local). */
export const knownToday = (known: KnownWords, now: number): number => Object.values(known).filter((t) => t >= startOfDay(now)).length;

export const canMarkKnown = (known: KnownWords, now: number): boolean => knownToday(known, now) < KNOWN_DAILY_CAP;

export function markKnown(known: KnownWords, cardId: string, now: number): KnownWords {
    return known[cardId] !== undefined ? known : { ...known, [cardId]: now };
}

export function unmarkKnown(known: KnownWords, cardId: string): KnownWords {
    if (known[cardId] === undefined) return known;
    const { [cardId]: _gone, ...rest } = known;
    void _gone;
    return rest;
}

/** The cards that may still be dealt: the ones not marked known. */
export const withoutKnown = <T extends { id: string }>(cards: readonly T[], known: KnownWords): T[] => cards.filter((c) => known[c.id] === undefined);
