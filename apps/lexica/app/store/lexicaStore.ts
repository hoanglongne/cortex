import { analytics } from '../lib/analytics';
import { CORTEX_API_URL } from '../lib/cortexConfig';
import { authHeaders, getCortexAuth } from '../lib/cortexAuth';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { VocabCardData, DifficultyLevel, UserArchetype } from '../types/vocab';
import { UserStats, UserCardProgress, recordSwipe, generateInitialDeck, updateCardProgress } from '../lib/eloAlgorithm';
import type { Quality } from '../lib/srs';
import { afterSave, afterSkip, DEFAULT_PROMPT, type MySentence, type MySentencePrompt } from '../lib/engagement/mySentence';
import { getCard } from '../lib/content/repository';
import { applySpeakResult } from '../lib/pronunciation/drill';
import type { SpeakLevel } from '../lib/pronunciation/score';

/**
 * LEXICA Global State Store (Zustand + localStorage persistence)
 * 
 * Manages:
 * - User stats (ELO, swipe history, energy)
 * - Current card deck
 * - Energy system (30 max, resets at midnight)
 * - Selected difficulty level
 * - Story Mode progress
 * - Study history (for charts & analytics)
 */

// Study History Entry (per day)
interface StudyHistoryEntry {
    swipes: number;       // Total swipes that day
    correct: number;      // Swipes right (remember)
    wrong: number;        // Swipes left (forget)
    eloChange: number;    // Net ELO change that day
}

interface LexicaStore {
    // User Stats
    userStats: UserStats;

    // Card Progress (Spaced Repetition)
    cardProgress: Record<string, UserCardProgress>; // { "v001": {...}, "v002": {...} }

    // Learned Words (words user has seen and practiced)
    learnedWords: Set<string>; // Set of card IDs that have been learned
    todayLearnedWords: Set<string>; // Words learned today (resets daily)
    lastLearnedWordsReset: string; // Date string for today's learned words reset

    // Energy System
    energy: number;
    maxEnergy: number;
    lastEnergyReset: number; // Timestamp of last midnight reset

    // Current Deck
    currentDeck: VocabCardData[];

    // Difficulty Level Selection
    selectedLevel: DifficultyLevel | 'all' | null; // null = not selected yet

    // Level Test Flow
    hasSeenWelcome: boolean; // Has user seen the welcome screen
    isInTest: boolean; // Currently taking the test
    testScore: number | null; // Test score (0-5)
    recommendedLevel: DifficultyLevel | null; // AI recommended level from test

    // Speaking ("Luyện nói", lib/pronunciation/drill.ts)
    /** "Chưa rõ" count per card; the words hard to say. */
    speakMisses: Record<string, number>;

    // Reading ("Đọc", lib/engagement/reading.ts)
    /** Cards added from a passage with "Thêm vào phiên học"; dealt first in the next deck. */
    queuedCardIds: string[];

    // Streak
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string | null; // 'YYYY-MM-DD'

    // Highest ELO (peak rating)
    highestElo: number;

    // Study History (for analytics)
    studyHistory: Record<string, StudyHistoryEntry>; // { '2026-04-15': {...}, ... }

    // Onboarding
    hasSeenOnboarding: boolean;
    completeOnboarding: () => void;

    // Personalization (NEW)
    userArchetype: UserArchetype | null; // User's selected context/persona
    setUserArchetype: (type: UserArchetype) => void;

    // "Câu của bạn" (lib/engagement/mySentence.ts)
    mySentences: Record<string, MySentence>;
    mySentencePrompt: MySentencePrompt;
    setMySentence: (cardId: string, text: string, kind: MySentence['kind']) => void;
    clearMySentence: (cardId: string) => void;
    skipMySentence: () => void;
    setMySentenceOff: (off: boolean) => void;

    // Daily Goals (NEW)
    dailyGoal: number; // Target number of cards per day (5-30)
    dailyProgress: number; // Number of cards swiped today
    lastGoalSetDate: string | null; // 'YYYY-MM-DD' - for daily reset
    setDailyGoal: (num: number) => void;
    incrementDailyProgress: () => void;
    resetDailyProgress: () => void;
    checkAndResetDailyGoal: () => void;

    // Swipe Mode
    swipeMode: 'touch' | 'voice';
    setSwipeMode: (mode: 'touch' | 'voice') => void;

    // Sound Effects
    soundEnabled: boolean;
    toggleSound: () => void;

    // Auto-Review Settings
    autoReviewInDeck: boolean; // Auto-inject review cards into main deck
    reviewCardsInjectedThisSession: boolean; // Track if review cards already injected (to prevent spam)
    toggleAutoReview: () => void;

    // Actions
    swipeCard: (cardId: string, direction: 'left' | 'right', quality?: Quality) => void;
    consumeEnergy: () => boolean; // Returns false if not enough energy
    checkAndResetEnergy: () => void; // Check if midnight passed, reset if needed
    loadNewDeck: () => void;
    resetProgress: () => void; // Debug: reset everything
    setSelectedLevel: (level: DifficultyLevel | 'all' | null) => void; // Set difficulty level

    // Test flow actions
    startTest: () => void;
    skipToManual: () => void;
    completeTest: (score: number, recommendedLevel: DifficultyLevel, calibratedElo?: number) => void;
    acceptRecommendedLevel: () => void;

    // Speaking actions
    recordSpeak: (cardId: string, level: SpeakLevel) => void;

    // Reading actions
    /** Adds cards to the front of the next deck (as new cards). Returns how many were added. */
    queueCards: (cardIds: string[]) => number;
    /** A light "good" review for each card (reading a passage). */
    lightReview: (cardIds: string[]) => void;

    // Cortex Integration
    syncAllToCortex: () => Promise<void>;

    // Helpers
    getLearnedWordsCount: () => number;
    getLearnedWordsList: () => string[];
    getMasteredWordsCount: () => number;
    getStudyStats: () => { totalDays: number; totalSwipes: number; averageAccuracy: number; last30Days: Array<{ date: string; swipes: number; accuracy: number; eloChange: number }> };

    // Review Session
    submitReviewAnswer: (cardId: string, correct: boolean, quality?: Quality) => void;

    // Mastered action
    markAsMastered: (cardId: string) => void;
    /** Moves a card further down the current deck (recall retest). */
    deferCard: (cardId: string, offset: number) => void;
}

const INITIAL_USER_STATS: UserStats = {
    currentElo: 1000,
    totalSwipes: 0,
    correctSwipes: 0,
    wrongSwipes: 0,
    recentSwipes: [],
    seenCardIds: [],
};

/**
 * Get today's date as 'YYYY-MM-DD' in local time
 */
function getTodayDateString(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Get yesterday's date as 'YYYY-MM-DD' in local time
 */
function getYesterdayDateString(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
}

/**
 * Get midnight timestamp for today
 */
function getMidnightTimestamp(): number {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    return midnight.getTime();
}

/**
 * Check if energy should reset (new day)
 */
function shouldResetEnergy(lastResetTimestamp: number): boolean {
    const currentMidnight = getMidnightTimestamp();
    return lastResetTimestamp < currentMidnight;
}

export const useLexicaStore = create<LexicaStore>()(
    persist(
        (set, get) => ({
            // Initial state
            userStats: INITIAL_USER_STATS,
            cardProgress: {}, // Empty at start, will populate as user learns
            learnedWords: new Set<string>(), // Empty set at start
            todayLearnedWords: new Set<string>(),
            lastLearnedWordsReset: getTodayDateString(),
            energy: 30,
            maxEnergy: 30,
            lastEnergyReset: getMidnightTimestamp(),
            currentDeck: [],
            selectedLevel: null, // User hasn't selected level yet
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: null,
            highestElo: 1000, // Initialize with starting ELO
            studyHistory: {},
            swipeMode: 'touch',
            setSwipeMode: (mode) => set({ swipeMode: mode }),

            // Sound effects (enabled by default)
            soundEnabled: true,
            toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

            // Auto-Review (enabled by default, but only injects once per session)
            autoReviewInDeck: true,
            reviewCardsInjectedThisSession: false,
            toggleAutoReview: () => {
                const newValue = !get().autoReviewInDeck;
                set({
                    autoReviewInDeck: newValue,
                    // Reset session flag so it can inject again on next load if re-enabled
                    reviewCardsInjectedThisSession: false
                });
            },

            completeOnboarding: () => set({ hasSeenOnboarding: true }),

            // Test flow state
            hasSeenWelcome: false,
            hasSeenOnboarding: false,
            isInTest: false,
            testScore: null,
            recommendedLevel: null,

            // Personalization (NEW)
            userArchetype: null, // Will be set during onboarding
            setUserArchetype: (type) => set({ userArchetype: type }),

            mySentences: {},
            mySentencePrompt: DEFAULT_PROMPT,
            setMySentence: (cardId, text, kind) =>
                set((s) => ({
                    mySentences: { ...s.mySentences, [cardId]: { text, kind, at: Date.now() } },
                    mySentencePrompt: afterSave(s.mySentencePrompt),
                })),
            clearMySentence: (cardId) =>
                set((s) => {
                    const rest = { ...s.mySentences };
                    delete rest[cardId];
                    return { mySentences: rest };
                }),
            skipMySentence: () => set((s) => ({ mySentencePrompt: afterSkip(s.mySentencePrompt) })),
            setMySentenceOff: (off) => set((s) => ({ mySentencePrompt: { ...s.mySentencePrompt, off } })),

            // Daily Goals (NEW)
            dailyGoal: 15, // Default: 15 cards per day
            dailyProgress: 0, // Reset daily
            lastGoalSetDate: null, // Will be set on first goal setting
            setDailyGoal: (num) => set({
                dailyGoal: num,
                lastGoalSetDate: getTodayDateString()
            }),
            incrementDailyProgress: () => set((state) => ({
                dailyProgress: state.dailyProgress + 1
            })),
            resetDailyProgress: () => set({ dailyProgress: 0 }),
            checkAndResetDailyGoal: () => {
                const today = getTodayDateString();
                const { lastGoalSetDate, lastEnergyReset } = get();

                // Reset daily progress if new day
                if (lastGoalSetDate && lastGoalSetDate !== today) {
                    set({
                        dailyProgress: 0,
                        // Don't reset lastGoalSetDate here - only reset on new slider interaction
                    });
                }

                // Also check energy reset
                if (shouldResetEnergy(lastEnergyReset)) {
                    set({
                        energy: 30,
                        lastEnergyReset: getMidnightTimestamp(),
                        todayLearnedWords: new Set(),
                    });
                }
            },

            queuedCardIds: [],
            speakMisses: {},


            // Swipe card action
            swipeCard: (cardId, direction, quality) => {
                const { userStats, cardProgress, currentDeck, learnedWords } = get();

                // Update user stats
                const updatedStats = recordSwipe(userStats, cardId, direction);

                // Update card progress (SRS)
                const existingProgress = cardProgress[cardId];
                const updatedProgress = updateCardProgress(existingProgress, cardId, direction, quality);
                const updatedCardProgress = {
                    ...cardProgress,
                    [cardId]: updatedProgress,
                };

                // Only count as "learned" when user swipes Right (Nhớ)
                const updatedLearnedWords = new Set(learnedWords);
                const updatedTodayLearnedWords = new Set(get().todayLearnedWords);
                const today = getTodayDateString();

                // Reset today's learned words if it's a new day
                if (get().lastLearnedWordsReset !== today) {
                    updatedTodayLearnedWords.clear();
                }

                if (direction === 'right') {
                    updatedLearnedWords.add(cardId);
                    updatedTodayLearnedWords.add(cardId);
                }

                // Remove swiped card from deck
                const updatedDeck = currentDeck.filter(card => card.id !== cardId);

                // Increment daily progress ONLY when swiping right (learning)
                // Reset to 0 first if it's a new day
                const isNewDay = get().lastLearnedWordsReset !== today;
                const newDailyProgress = direction === 'right'
                    ? (isNewDay ? 1 : get().dailyProgress + 1)
                    : (isNewDay ? 0 : get().dailyProgress);

                // Update streak
                const { currentStreak, longestStreak, lastActivityDate, studyHistory } = get();
                let streakUpdate = {};
                if (lastActivityDate !== today) {
                    const yesterday = getYesterdayDateString();
                    const newStreak = lastActivityDate === yesterday ? currentStreak + 1 : 1;
                    streakUpdate = {
                        currentStreak: newStreak,
                        longestStreak: Math.max(longestStreak, newStreak),
                        lastActivityDate: today,
                    };
                }

                // Update study history (for analytics)
                const todayEntry = studyHistory[today] || { swipes: 0, correct: 0, wrong: 0, eloChange: 0 };
                const eloChange = updatedStats.currentElo - userStats.currentElo;
                const updatedStudyHistory = {
                    ...studyHistory,
                    [today]: {
                        swipes: todayEntry.swipes + 1,
                        correct: todayEntry.correct + (direction === 'right' ? 1 : 0),
                        wrong: todayEntry.wrong + (direction === 'left' ? 1 : 0),
                        eloChange: todayEntry.eloChange + eloChange,
                    },
                };

                // Track highest ELO
                const { highestElo } = get();
                const newHighestElo = Math.max(highestElo, updatedStats.currentElo);

                set({
                    userStats: updatedStats,
                    cardProgress: updatedCardProgress,
                    learnedWords: updatedLearnedWords,
                    todayLearnedWords: updatedTodayLearnedWords,
                    lastLearnedWordsReset: today,
                    currentDeck: updatedDeck,
                    dailyProgress: newDailyProgress,
                    studyHistory: updatedStudyHistory,
                    highestElo: newHighestElo,
                    ...streakUpdate,
                });

                // analytics.swipe is already called in SwipeDeck.tsx, so we don't need it here
                // to avoid double logging.

                // If deck is empty, load new deck
                if (updatedDeck.length === 0) {
                    get().loadNewDeck();
                }
            },

            // Consume energy for swipe
            consumeEnergy: () => {
                const { energy } = get();

                if (energy <= 0) {
                    return false; // Not enough energy
                }

                set({ energy: energy - 1 });
                return true;
            },

            // Check and reset energy at midnight
            checkAndResetEnergy: () => {
                const { lastEnergyReset, maxEnergy } = get();

                if (shouldResetEnergy(lastEnergyReset)) {
                    set({
                        energy: maxEnergy,
                        lastEnergyReset: getMidnightTimestamp(),
                    });
                }
            },

            // Load new deck
            loadNewDeck: () => {
                const { userStats, cardProgress, selectedLevel, queuedCardIds } = get();

                // Words added from a passage ("Thêm vào phiên học") come first, as new cards.
                const forcedCardIds = queuedCardIds.filter(id => !cardProgress[id]);

                // Only inject review cards if:
                // 1. Auto-review is enabled
                // 2. Haven't injected review cards yet this session
                // DISABLED: We don't inject review cards into main deck anymore
                const shouldInjectReview = false;
                const newDeck = generateInitialDeck(userStats, cardProgress, selectedLevel, forcedCardIds, shouldInjectReview);

                // Mark that we've injected review cards (so it won't happen again on next loadNewDeck)
                const dealt = new Set(newDeck.map(c => c.id));
                const queued = forcedCardIds.filter(id => !dealt.has(id));
                if (shouldInjectReview) {
                    set({ currentDeck: newDeck, queuedCardIds: queued, reviewCardsInjectedThisSession: true });
                } else {
                    set({ currentDeck: newDeck, queuedCardIds: queued });
                }
            },

            // Reset all progress (debug only)
            resetProgress: () => {
                set({
                    userStats: INITIAL_USER_STATS,
                    cardProgress: {},
                    mySentences: {},
                    learnedWords: new Set<string>(),
                    energy: 30,
                    lastEnergyReset: getMidnightTimestamp(),
                    currentDeck: [],
                    selectedLevel: null, // Reset level selection
                    hasSeenWelcome: false, // Reset welcome screen
                    isInTest: false,
                    testScore: null,
                    recommendedLevel: null,
                    queuedCardIds: [],
                    speakMisses: {},
                    // Reset streak
                    currentStreak: 0,
                    longestStreak: 0,
                    lastActivityDate: null,
                });
            },

            // Set selected difficulty level
            setSelectedLevel: (level) => {
                set({ selectedLevel: level });
                // Reload deck with new level filter
                get().loadNewDeck();
            },

            // Test flow actions
            startTest: () => {
                set({
                    hasSeenWelcome: true,
                    isInTest: true
                });
            },

            skipToManual: () => {
                set({
                    hasSeenWelcome: true,
                    isInTest: false,
                    testScore: null,
                    recommendedLevel: null
                });
            },

            completeTest: (score, recommendedLevel, calibratedElo) => {
                const { userStats } = get();
                set({
                    isInTest: false,
                    testScore: score,
                    recommendedLevel: recommendedLevel,
                    ...(calibratedElo !== undefined && {
                        userStats: { ...userStats, currentElo: calibratedElo },
                    }),
                });
            },

            acceptRecommendedLevel: () => {
                const { recommendedLevel } = get();
                if (recommendedLevel) {
                    get().setSelectedLevel(recommendedLevel);
                }
            },

            // Helper: Get count of learned words
            getLearnedWordsCount: () => {
                return get().learnedWords.size;
            },

            // Helper: Get list of learned word IDs
            getLearnedWordsList: () => {
                return Array.from(get().learnedWords);
            },

            // Helper: Get count of mastered words (cards with state = 'mastered' or high confidence)
            getMasteredWordsCount: () => {
                const { cardProgress } = get();
                return Object.values(cardProgress).filter(
                    progress => progress.state === 'mastered'
                ).length;
            },

            // Helper: Get study statistics for analytics
            getStudyStats: () => {
                const { studyHistory } = get();
                const dates = Object.keys(studyHistory).sort();

                // Calculate totals
                const totalDays = dates.length;
                let totalSwipes = 0;
                let totalCorrect = 0;

                for (const date of dates) {
                    const entry = studyHistory[date];
                    totalSwipes += entry.swipes;
                    totalCorrect += entry.correct;
                }

                const averageAccuracy = totalSwipes > 0 ? Math.round((totalCorrect / totalSwipes) * 100) : 0;

                // Get last 30 days
                const last30Days = dates.slice(-30).map(date => {
                    const entry = studyHistory[date];
                    const accuracy = entry.swipes > 0 ? Math.round((entry.correct / entry.swipes) * 100) : 0;
                    return {
                        date,
                        swipes: entry.swipes,
                        accuracy,
                        eloChange: entry.eloChange,
                    };
                });

                return {
                    totalDays,
                    totalSwipes,
                    averageAccuracy,
                    last30Days,
                };
            },

            submitReviewAnswer: (cardId, correct, quality) => {
                const { cardProgress, studyHistory } = get();
                const existing = cardProgress[cardId];
                if (!existing) return;
                const updated = updateCardProgress(existing, cardId, correct ? 'right' : 'left', quality);

                // Update study history for review sessions
                const today = getTodayDateString();
                const todayEntry = studyHistory[today] || { swipes: 0, correct: 0, wrong: 0, eloChange: 0 };
                const updatedStudyHistory = {
                    ...studyHistory,
                    [today]: {
                        ...todayEntry,
                        swipes: todayEntry.swipes + 1,
                        correct: todayEntry.correct + (correct ? 1 : 0),
                        wrong: todayEntry.wrong + (correct ? 0 : 1),
                        // Review doesn't change ELO, so eloChange stays the same
                    },
                };

                set({
                    cardProgress: { ...cardProgress, [cardId]: updated },
                    studyHistory: updatedStudyHistory,
                });

                // CORTEX Integration: Send to Hub automatically
                if (correct) {
                    analytics.swipe('right', cardId, 'quiz');
                }
            },

            deferCard: (cardId, offset) => {
                const deck = [...get().currentDeck];
                const i = deck.findIndex(card => card.id === cardId);
                if (i < 0) return;
                const [card] = deck.splice(i, 1);
                deck.splice(Math.min(i + offset, deck.length), 0, card);
                set({ currentDeck: deck });
            },

            markAsMastered: (cardId) => {
                const { cardProgress, learnedWords, currentDeck } = get();
                const now = Date.now();

                // Set card to mastered state immediately
                const updatedCardProgress = {
                    ...cardProgress,
                    [cardId]: {
                        cardId,
                        state: 'mastered' as const,
                        lastReviewedAt: now,
                        nextReviewAt: now + (30 * 24 * 60 * 60 * 1000), // Review in 30 days
                        ease: 2.8,
                        intervalDays: 30,
                        streak: 3,
                        reviewCount: (cardProgress[cardId]?.reviewCount || 0) + 1,
                        wrongCount: cardProgress[cardId]?.wrongCount || 0,
                    },
                };

                // Add to learned words
                const updatedLearnedWords = new Set(learnedWords);
                updatedLearnedWords.add(cardId);

                // Remove from deck
                const updatedDeck = currentDeck.filter(card => card.id !== cardId);

                set({
                    cardProgress: updatedCardProgress,
                    learnedWords: updatedLearnedWords,
                    currentDeck: updatedDeck,
                });

                // CORTEX Integration: Send to Hub automatically
                analytics.swipe('right', cardId, 'manual');

                // Load new deck if empty
                if (updatedDeck.length === 0) {
                    get().loadNewDeck();
                }
            },

            recordSpeak: (cardId, level) => {
                set({ speakMisses: applySpeakResult(get().speakMisses, cardId, level) });
            },

            queueCards: (cardIds) => {
                const { queuedCardIds, cardProgress, currentDeck } = get();
                const fresh = [...new Set(cardIds)].filter(id => !cardProgress[id] && !queuedCardIds.includes(id) && !currentDeck.some(c => c.id === id) && getCard(id));
                if (fresh.length === 0) return 0;
                // Cards already dealt stay put; queued ones go first in the next deck.
                set({ queuedCardIds: [...fresh, ...queuedCardIds] });
                return fresh.length;
            },

            lightReview: (cardIds) => {
                const { cardProgress } = get();
                const updated = { ...cardProgress };
                for (const id of cardIds) {
                    if (!updated[id]) continue;
                    updated[id] = updateCardProgress(updated[id], id, 'right', 'good');
                }
                set({ cardProgress: updated });
            },

            syncAllToCortex: async () => {
                const { learnedWords } = get();
                if (!learnedWords) {
                    console.error('[Cortex] learnedWords is undefined');
                    return;
                }

                const wordIds = Array.from(learnedWords);
                console.log(`[Cortex] Attempting to sync ${wordIds.length} words...`);

                if (wordIds.length === 0) {
                    console.warn('[Cortex] No learned words to sync');
                    return;
                }

                const API_URL = CORTEX_API_URL;
                if (!API_URL) {
                    console.warn('[Cortex] NEXT_PUBLIC_CORTEX_API_URL not set. Sync skipped.');
                    return;
                }

                const auth = await getCortexAuth();
                if (!auth) {
                    console.warn('[Cortex] Not signed in. Sync skipped.');
                    return;
                }

                try {
                    const response = await fetch(`${API_URL}/actions/log`, {
                        method: 'POST',
                        mode: 'cors',
                        headers: { 'Content-Type': 'application/json', ...authHeaders(auth) },
                        body: JSON.stringify({
                            userId: auth.userId,
                            appSource: 'lexica',
                            actionType: 'LEARN_VOCABULARY',
                            metadata: {
                                words: wordIds,
                                isBulkSync: true
                            }
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`API responded with ${response.status}`);
                    }

                    console.log('[Cortex] Full sync complete');
                } catch (err) {
                    console.error('[Cortex] Sync failed:', err);
                }
            },
        }),
        {
            name: 'lexica-storage', // localStorage key
            partialize: (state) => ({
                // Only persist these fields
                userStats: state.userStats,
                cardProgress: state.cardProgress, // Persist SRS progress
                learnedWords: Array.from(state.learnedWords), // Convert Set to Array for JSON
                energy: state.energy,
                lastEnergyReset: state.lastEnergyReset,
                swipeMode: state.swipeMode,
                soundEnabled: state.soundEnabled, // Persist voice/touch preference
                autoReviewInDeck: state.autoReviewInDeck, // Persist auto-review setting
                selectedLevel: state.selectedLevel, // Persist user's level choice
                hasSeenWelcome: state.hasSeenWelcome, // Persist welcome screen state
                hasSeenOnboarding: state.hasSeenOnboarding,
                testScore: state.testScore, // Persist test score
                recommendedLevel: state.recommendedLevel, // Persist recommendation
                // Streak persistence
                currentStreak: state.currentStreak,
                longestStreak: state.longestStreak,
                lastActivityDate: state.lastActivityDate,
                // Highest ELO
                highestElo: state.highestElo,
                queuedCardIds: state.queuedCardIds,
                speakMisses: state.speakMisses,
                studyHistory: state.studyHistory,
                // Daily Goals - persist daily progress tracking
                dailyGoal: state.dailyGoal,
                dailyProgress: state.dailyProgress,
                lastGoalSetDate: state.lastGoalSetDate,
                // Personalization
                userArchetype: state.userArchetype,
                mySentences: state.mySentences,
                mySentencePrompt: state.mySentencePrompt,
                // Speed Quiz - today's learned words
                todayLearnedWords: Array.from(state.todayLearnedWords),
                lastLearnedWordsReset: state.lastLearnedWordsReset,
                // Don't persist currentDeck (will be regenerated)
                // Don't persist isInTest (transient state)
                // Don't persist showStoryUnlock, showStoryMode (transient UI state)
                // Don't persist reviewCardsInjectedThisSession (session flag only)
            }),
            // Custom merge to handle Set serialization
            merge: (persistedState: unknown, currentState) => {
                const persisted = persistedState as Partial<LexicaStore> & {
                    learnedWords?: string[] | Set<string>;
                    todayLearnedWords?: string[] | Set<string>;
                };
                return {
                    ...currentState,
                    ...persisted,
                    learnedWords: new Set(
                        Array.isArray(persisted?.learnedWords)
                            ? persisted.learnedWords
                            : persisted?.learnedWords instanceof Set
                                ? Array.from(persisted.learnedWords)
                                : []
                    ),
                    todayLearnedWords: new Set(
                        Array.isArray(persisted?.todayLearnedWords)
                            ? persisted.todayLearnedWords
                            : persisted?.todayLearnedWords instanceof Set
                                ? Array.from(persisted.todayLearnedWords)
                                : []
                    ),
                };
            },
        }
    )
);

/**
 * Initialize store on app load
 * Call this in root layout or main component
 */
export function initializeLexicaStore() {
    const store = useLexicaStore.getState();

    // Check and reset energy if new day
    store.checkAndResetEnergy();

    // Reset dailyProgress if it's a new day (uses same date key as todayLearnedWords)
    const today = getTodayDateString();
    const { lastLearnedWordsReset, dailyProgress } = useLexicaStore.getState();
    if (dailyProgress > 0 && lastLearnedWordsReset && lastLearnedWordsReset !== today) {
        useLexicaStore.setState({ dailyProgress: 0 });
    }

    // Reset session flag so review cards can be injected again on this new page load
    useLexicaStore.setState({ reviewCardsInjectedThisSession: false });

    // Load initial deck if empty
    if (store.currentDeck.length === 0) {
        store.loadNewDeck();
    }
}
