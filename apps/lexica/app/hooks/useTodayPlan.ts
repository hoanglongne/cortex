'use client';

import { useMemo, useState } from 'react';
import { useLexicaStore } from '../store/lexicaStore';
import { getDueCards } from '../lib/eloAlgorithm';
import { getPassages, getQuotes, useContentVersion } from '../lib/content/repository';
import { readPassages, recommendPassages } from '../lib/engagement/reading';
import { localDate } from '../lib/engagement/ghost';
import { logFor, newWordsLeft, pickPassage, pickQuoteWord, pickSpeakWords, planToday, reviewIds, type TodayPlan } from '../lib/journey/today';
import type { Passage } from '../lib/content/passages';

export interface TodayPicks {
    plan: TodayPlan;
    reviewIds: string[];
    newLeft: number;
    passage: Passage | null;
    quoteWord: string | null;
    speakIds: string[];
    learnedToday: string[];
}

/**
 * What today's session holds right now: the plan for the Today card and the
 * words, passage or quote each stage would use. Recomputed as progress moves.
 */
export function useTodayPlan(): TodayPicks {
    const version = useContentVersion();
    const cardProgress = useLexicaStore((s) => s.cardProgress);
    const journeys = useLexicaStore((s) => s.journeys);
    const todayLog = useLexicaStore((s) => s.todayLog);
    const daysDone = useLexicaStore((s) => s.daysDone);
    const path = useLexicaStore((s) => s.path);
    const dailyGoal = useLexicaStore((s) => s.dailyGoal);
    const level = useLexicaStore((s) => s.selectedLevel);
    const todayLearned = useLexicaStore((s) => s.todayLearnedWords);
    const lastReset = useLexicaStore((s) => s.lastLearnedWordsReset);
    const [read] = useState(() => (typeof window === 'undefined' ? new Set<string>() : readPassages()));

    return useMemo(() => {
        void version;
        const today = localDate();
        const learnedToday = lastReset === today ? [...todayLearned] : [];
        const due = getDueCards(cardProgress).map((p) => p.cardId);
        const firstSession = daysDone.length === 0 && Object.keys(journeys).length === 0;
        const newLeft = newWordsLeft({ pace: path ? path.pace : dailyGoal, learnedToday: learnedToday.length, firstSession });

        const passages = getPassages();
        const wantDialogue = path?.branch === 'talk';
        const prefer = (p: Passage) => (p.kind === 'dialogue') === wantDialogue;
        let passage = pickPassage(passages, journeys, read, prefer);
        const quoteWord = passage ? null : pickQuoteWord(journeys, (id) => getQuotes(id).length > 0);
        if (!passage && !quoteWord) {
            // Nothing with a known word: an unread passage at the learner's level still brings new words.
            passage = recommendPassages(passages.filter(prefer), { level, progress: cardProgress, read }).find((p) => !read.has(p.id)) ?? null;
        }
        const speakIds = pickSpeakWords(journeys, learnedToday);
        const plan = planToday({
            log: logFor(todayLog, today),
            dueCount: due.length,
            newLeft,
            canRead: Boolean(passage || quoteWord),
            speakCount: speakIds.length || (newLeft > 0 ? 1 : 0),
        });
        return { plan, reviewIds: reviewIds(due), newLeft, passage, quoteWord, speakIds, learnedToday };
    }, [version, cardProgress, journeys, todayLog, daysDone, path, dailyGoal, level, todayLearned, lastReset, read]);
}
