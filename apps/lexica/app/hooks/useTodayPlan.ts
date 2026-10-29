'use client';

import { useMemo, useState } from 'react';
import { useLexicaStore } from '../store/lexicaStore';
import { getDueCards } from '../lib/eloAlgorithm';
import { getCard, getPassages, getQuotes, useContentVersion } from '../lib/content/repository';
import { readPassages } from '../lib/engagement/reading';
import { canGenerateReading } from '../lib/content/generated';
import { localDate } from '../lib/engagement/ghost';
import { extraNewLeft, learnSize, logFor, newWordsLeft, pickPassage, pickQuoteWord, pickSpeakWords, planToday, reviewIds, wordsToRead, type Stage, type TodayPlan } from '../lib/journey/today';
import { classWordsToRefresh, newClassWords, onlyClassWords } from '../lib/classes';
import type { Passage } from '../lib/content/passages';

export interface TodayPicks {
    plan: TodayPlan;
    reviewIds: string[];
    /** Size of the Học stage (the pace, an extra round or a class lesson). */
    newLeft: number;
    /** 2+ in an extra round ("Học thêm"). */
    round: number;
    passage: Passage | null;
    /** Words to ask the API to write a passage around, when no ready-made one has them. */
    generate: string[] | null;
    /** Stands in for the written passage when it cannot be written. */
    fallback: Passage | null;
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
    const spokenAt = useLexicaStore((s) => s.spokenAt);
    const todayLog = useLexicaStore((s) => s.todayLog);
    const daysDone = useLexicaStore((s) => s.daysDone);
    const path = useLexicaStore((s) => s.path);
    const dailyGoal = useLexicaStore((s) => s.dailyGoal);
    const [now] = useState(() => Date.now());
    const todayLearned = useLexicaStore((s) => s.todayLearnedWords);
    const lastReset = useLexicaStore((s) => s.lastLearnedWordsReset);
    const [read] = useState(() => (typeof window === 'undefined' ? new Set<string>() : readPassages()));

    return useMemo(() => {
        void version;
        const today = localDate();
        const learnedToday = lastReset === today ? [...todayLearned] : [];
        const log = logFor(todayLog, today);
        const round = log?.round ?? 1;
        // Class words the learner had before the lesson come back in Ôn once, so the lesson counts.
        const refresh = classWordsToRefresh(journeys, cardProgress);
        const due = [...new Set([...refresh, ...getDueCards(cardProgress).map((p) => p.cardId)])];
        const firstSession = daysDone.length === 0 && Object.keys(journeys).length === 0;
        const paceLeft =
            round > 1
                ? extraNewLeft(learnedToday.length, log?.learnedAtStart ?? 0)
                : newWordsLeft({ pace: path ? path.pace : dailyGoal, learnedToday: learnedToday.length, firstSession });
        const pending = newClassWords(cardProgress).length;
        const newLeft = learnSize({ newLeft: paceLeft, pending, onlyPending: onlyClassWords((id) => Boolean(cardProgress[id])).length });
        // A lesson given after today's Ôn or Học opens that stage again (once).
        const again = new Set(log?.again ?? []);
        const reopen: Stage[] = [...(refresh.length > 0 && !again.has('review') ? ['review' as const] : []), ...(pending > 0 && !again.has('learn') ? ['learn' as const] : [])];

        // Đọc: always about the learner's own words, never an unrelated text.
        // 1. a ready-made passage with at least two of today's words;
        // 2. else a passage written on demand around today's words;
        // 3. else a ready-made passage with some words they know, or a quote.
        const wantDialogue = path?.branch === 'talk';
        const prefer = (p: Passage) => (p.kind === 'dialogue') === wantDialogue;
        const wordOf = (id: string) => getCard(id)?.word;
        // Words studied today: remembered ones first (from the journeys too, since the day's list
        // resets with energy), then new words marked "Chưa nhớ", which a reading helps most.
        const startOfDay = new Date(now).setHours(0, 0, 0, 0);
        const understoodToday = Object.keys(journeys).filter((id) => journeys[id].understoodAt >= startOfDay);
        const studiedToday = Object.values(cardProgress)
            .filter((p) => p.lastReviewedAt >= startOfDay && !journeys[p.cardId])
            .map((p) => p.cardId);
        const todayIds = [...new Set([...learnedToday, ...understoodToday, ...studiedToday])];
        const pick = pickPassage(getPassages(), journeys, read, { prefer, today: todayIds, wordOf });
        const toWrite = wordsToRead(journeys, todayIds, wordOf);
        let passage: Passage | null = null;
        let generate: string[] | null = null;
        if (pick && pick.today >= 2) passage = pick.passage;
        else if (canGenerateReading() && toWrite.length >= 2) generate = toWrite;
        else if (pick) passage = pick.passage;
        // If writing fails (offline), a ready-made passage with known words, or a quote, stands in.
        const fallback = generate && pick ? pick.passage : null;
        const quoteWord = passage ? null : pickQuoteWord(journeys, (id) => getQuotes(id).length > 0);
        const speakIds = pickSpeakWords(journeys, learnedToday, undefined, (id) => (spokenAt[id] ?? 0) >= startOfDay);
        const plan = planToday({
            log,
            dueCount: due.length,
            reopen,
            newLeft,
            learnedThisRound: Math.max(0, learnedToday.length - (round > 1 ? (log?.learnedAtStart ?? 0) : 0)),
            // Before the Học stage, today's words do not exist yet: a passage can be written once they do.
            canRead: Boolean(passage || generate || quoteWord || (canGenerateReading() && newLeft >= 2)),
            speakCount: speakIds.length || (newLeft > 0 ? 1 : 0),
        });
        return { plan, reviewIds: reviewIds(due), newLeft, round, passage, generate, fallback, quoteWord, speakIds, learnedToday };
    }, [version, cardProgress, journeys, spokenAt, todayLog, daysDone, path, dailyGoal, todayLearned, lastReset, read, now]);
}
