'use client';

import { useMemo } from 'react';
import { useLexicaStore } from '../store/lexicaStore';
import { getAllCards, getCard } from '../lib/content/repository';
import type { GameCard } from '../lib/games/rounds';

/** Words needed to play anything. */
export const MIN_WORDS = 6;

/** The words I know as game cards, and the whole bank for wrong options. */
export function usePool(): { known: GameCard[]; bank: GameCard[] } {
    const learned = useLexicaStore((s) => s.learnedWords);
    return useMemo(() => {
        const known = [...learned].map((id) => getCard(id)).filter((c): c is NonNullable<ReturnType<typeof getCard>> => Boolean(c));
        return { known, bank: [...getAllCards()] };
    }, [learned]);
}
