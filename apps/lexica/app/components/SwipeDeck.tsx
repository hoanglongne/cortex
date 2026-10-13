'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { flushSync } from 'react-dom';
import { trackCardEvent } from '../lib/content/events';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper, Check, X, Flame, Sparkles } from 'lucide-react';
import Link from 'next/link';
import VocabCard from './VocabCard';
import { useLexicaStore } from '../store/lexicaStore';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { analytics } from '../lib/analytics';
import { useVoiceAvailable } from '../lib/speechAvailability';
import { capture } from '../lib/productAnalytics';
import { getAllCards, getCurrentDrop, useContentVersion } from '../lib/content/repository';
import { buildSets } from '../lib/engagement/collection';
import { useEconomy } from '../lib/engagement/economy';
import { useLucky } from '../lib/engagement/lucky';
import { HAPTIC, vibrate } from '../lib/engagement/haptics';
import {
    isComboMilestone,
    levelHint,
    nearestSet,
    newSession,
    nextSessionTeasers,
    recordSwipe,
    sessionDone,
    setHint,
    SESSION_SIZE,
    type LuckyReward,
} from '../lib/engagement/session';
import SessionRecap from './SessionRecap';

export default function SwipeDeck() {
    const cards = useLexicaStore(state => state.currentDeck);
    const swipeCard = useLexicaStore(state => state.swipeCard);
    const swipeMode = useLexicaStore(state => state.swipeMode);
    const voiceAvailable = useVoiceAvailable();

    const { swipeRight, swipeLeft, buttonPress, comboTick, sparkle, soundEnabled } = useSoundEffects();
    const cardProgress = useLexicaStore(state => state.cardProgress);
    const contentVersion = useContentVersion();
    const readyToMint = useEconomy(state => state.state?.ready.length ?? 0);
    const luckyIds = useLucky(state => state.lucky);
    const checkLucky = useLucky(state => state.check);
    const claimLucky = useLucky(state => state.claim);

    // 10-card sessions with a combo and a recap (lib/engagement/session.ts)
    const [session, setSession] = useState(newSession);
    const [lastCombo, setLastCombo] = useState(0);
    const [luckyToast, setLuckyToast] = useState<LuckyReward | null>(null);
    const done = sessionDone(session);

    const sets = useMemo(() => {
        void contentVersion;
        const drop = getCurrentDrop();
        return buildSets(getAllCards(), drop ? { [drop.id]: drop.title } : {});
    }, [contentVersion]);

    // Ask which of the upcoming cards are lucky (signed-in users only).
    const deckKey = cards.slice(0, SESSION_SIZE + 2).map(c => c.id).join(',');
    useEffect(() => {
        if (deckKey) void checkLucky(deckKey.split(','));
    }, [deckKey, checkLucky]);

    const [lastSwipeDirection, setLastSwipeDirection] = useState<'left' | 'right' | null>(null);
    const [cardExitDirections, setCardExitDirections] = useState<Record<string, 'left' | 'right'>>({});

    // Revealed state for top card, controlled here so keyboard handler can access it
    const topCardId = cards[0]?.id;
    const [revealedForCardId, setRevealedForCardId] = useState<string | null>(null);
    const topCardRevealed = revealedForCardId === topCardId;
    const setTopCardRevealed = useCallback((val: boolean) => {
        setRevealedForCardId(val ? topCardId ?? null : null);
        if (val && topCardId) trackCardEvent(topCardId, 'reveal');
    }, [topCardId]);

    // Studio feedback: one impression per card shown on top, dwell measured to the swipe
    const shownAtRef = useRef<{ id: string; at: number } | null>(null);
    useEffect(() => {
        if (!topCardId || shownAtRef.current?.id === topCardId) return;
        shownAtRef.current = { id: topCardId, at: Date.now() };
        trackCardEvent(topCardId, 'impression');
    }, [topCardId]);

    const handleSwipe = useCallback((
        direction: 'left' | 'right',
        cardId: string,
        source: 'manual' | 'voice' | 'quiz' = 'manual'
    ) => {
        // Voice mode requires voice input for swiping right
        if (swipeMode === 'voice' && voiceAvailable && direction === 'right' && source !== 'voice') {
            return;
        }

        setLastSwipeDirection(direction);
        setTimeout(() => setLastSwipeDirection(null), 1000);

        const card = cards.find(c => c.id === cardId);
        analytics.swipe(direction, cardId, source, card?.word);

        // Session, combo, sound and haptics
        const before = useLexicaStore.getState().cardProgress[cardId];
        const nextCombo = direction === 'right' ? session.combo + 1 : 0;
        setLastCombo(nextCombo);
        if (direction === 'right') {
            if (isComboMilestone(nextCombo)) {
                sparkle();
                vibrate(HAPTIC.milestone, soundEnabled);
            } else if (nextCombo >= 3) {
                comboTick(nextCombo);
                vibrate(HAPTIC.known, soundEnabled);
            } else {
                swipeRight();
                vibrate(HAPTIC.known, soundEnabled);
            }
        } else {
            swipeLeft();
            vibrate(HAPTIC.unknown, soundEnabled);
        }

        // flushSync forces a synchronous re-render with the correct exit direction
        // BEFORE swipeCard removes the card, so AnimatePresence snapshots the right values
        flushSync(() => {
            setCardExitDirections(prev => ({ ...prev, [cardId]: direction }));
        });

        const shown = shownAtRef.current;
        trackCardEvent(cardId, direction === 'right' ? 'known' : 'unknown', shown?.id === cardId ? Date.now() - shown.at : undefined);

        swipeCard(cardId, direction);

        const after = useLexicaStore.getState().cardProgress[cardId];
        setSession(prev => {
            const next = recordSwipe(prev, { cardId, known: direction === 'right', before, after });
            if (sessionDone(next) && !sessionDone(prev)) {
                capture('session_complete', {
                    known: next.known,
                    new_cards: next.newCards.length,
                    level_ups: next.levelUps.length,
                    max_combo: next.maxCombo,
                    seconds: Math.round((Date.now() - next.startedAt) / 1000),
                });
            }
            return next;
        });

        // Lucky card: the server decides the reward (and the daily cap).
        if (direction === 'right' && luckyIds.has(cardId)) {
            void claimLucky(cardId).then(result => {
                if (!result?.paid || !result.item || !result.amount) return;
                const reward: LuckyReward = { cardId, item: result.item, amount: result.amount };
                setSession(prev => ({ ...prev, lucky: [...prev.lucky, reward] }));
                setLuckyToast(reward);
                sparkle();
                vibrate(HAPTIC.lucky, soundEnabled);
                capture('lucky_card', { item: result.item, amount: result.amount });
                setTimeout(() => setLuckyToast(null), 2200);
            });
        }
    }, [swipeCard, swipeMode, voiceAvailable, cards, swipeRight, swipeLeft, session.combo, comboTick, sparkle, soundEnabled, luckyIds, claimLucky]);

    const continueSession = useCallback(() => {
        buttonPress();
        capture('session_continue', { previous_known: session.known });
        setSession(newSession());
        setLastCombo(0);
    }, [buttonPress, session.known]);

    // Keyboard controls (desktop)
    useEffect(() => {
        if (!topCardId) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }
            if (done) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    continueSession();
                }
                return;
            }

            const isSpaceKey = e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar';

            if (isSpaceKey) {
                e.preventDefault();
                setTopCardRevealed(true);
                return;
            }

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                handleSwipe('left', topCardId);
                return;
            }

            if (e.key === 'ArrowRight') {
                e.preventDefault();
                if (swipeMode === 'voice' && voiceAvailable) {
                    return;
                }
                handleSwipe('right', topCardId);
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [topCardId, handleSwipe, swipeMode, voiceAvailable, setTopCardRevealed, done, continueSession]);

    if (cards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-100 px-8 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mb-4"
                >
                    <PartyPopper className="w-20 h-20 text-muted mx-auto" />
                </motion.div>
                <h2 className="text-2xl font-bold text-ink mb-2">
                    Hoàn thành bộ bài!
                </h2>
                <p className="text-muted text-sm mb-6">
                    Bạn đã quẹt hết các thẻ trong lượt này.
                </p>

                <div className="flex flex-col gap-3 w-full max-w-xs">
                    {/* Primary CTA: Stories */}
                    <Link
                        href="/stories"
                        onClick={() => buttonPress()}
                        className="w-full px-6 py-3 bg-surface-2/50 hover:bg-surface-2 border border-line-strong hover:border-line-strong rounded-xl font-semibold text-ink text-sm transition-all flex items-center justify-center gap-2"
                    >
                        Đọc truyện thực hành
                    </Link>

                    {/* Secondary CTA: Learned */}
                    <Link
                        href="/learned"
                        onClick={() => buttonPress()}
                        className="w-full px-6 py-3 bg-surface-2/50 hover:bg-surface-2 border border-line-strong hover:border-line-strong rounded-xl font-semibold text-ink text-sm transition-all flex items-center justify-center gap-2"
                    >
                        Xem danh sách từ vựng
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-100 flex items-center justify-center">
            {/* Swipe Feedback */}
            <AnimatePresence>
                {lastSwipeDirection && (
                    <motion.div
                        key="feedback"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute z-50 flex flex-col items-center gap-2 font-mono text-lg pointer-events-none"
                    >
                        {lastSwipeDirection === 'right' ? (
                            <div className="flex flex-col items-center">
                                <span className="flex items-center gap-2 text-accent">
                                    <Check className="w-6 h-6" />
                                    ĐÃ NHỚ
                                </span>
                                {lastCombo >= 3 && (
                                    <motion.span
                                        initial={{ scale: 0.6 }}
                                        animate={{ scale: isComboMilestone(lastCombo) ? [1.4, 1] : 1 }}
                                        className={`mt-1 flex items-center gap-1 font-bold ${isComboMilestone(lastCombo) ? 'text-3xl text-accent' : 'text-xl text-ink'}`}
                                    >
                                        <Flame className="w-5 h-5 text-accent" />×{lastCombo}
                                    </motion.span>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <span className="flex items-center gap-2 text-danger">
                                    <X className="w-6 h-6" />
                                    CHƯA NHỚ
                                </span>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {luckyToast && (
                    <motion.div
                        key="lucky"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 top-[calc(50%-272px)] sm:top-[calc(50%-248px)] flex items-center gap-2 rounded-full border border-accent/50 bg-surface px-4 py-2 font-mono text-sm text-accent pointer-events-none"
                    >
                        <Sparkles className="w-4 h-4" />
                        Thẻ may mắn: +{luckyToast.amount} {luckyToast.item === 'dust' ? 'Bụi' : 'Hộp'}
                    </motion.div>
                )}
            </AnimatePresence>

            {done && (
                <SessionRecap
                    session={session}
                    readyToMint={readyToMint}
                    nearest={nearestSet(sets, cardProgress)}
                    teasers={nextSessionTeasers({ upcoming: cards, luckyIds })}
                    onContinue={continueSession}
                />
            )}

            <AnimatePresence>
                {!done && cards.map((card, index) => {
                    if (index > 2) return null; // Only show top 3 cards for performance

                    // Get exit direction for this card (left = negative, right = positive)
                    const exitDirection = cardExitDirections[card.id];
                    const xMultiplier = exitDirection === 'left' ? -1 : 1;

                    return (
                        <motion.div
                            key={card.id}
                            exit={{
                                x: xMultiplier * 500,
                                y: 200,
                                opacity: 0,
                                rotate: xMultiplier * 25,
                                transition: { duration: 0.5, ease: 'easeInOut' },
                            }}
                            className="absolute w-full top-1/2 -translate-y-1/2"
                            style={{ zIndex: cards.length - index }}
                        >
                            <VocabCard
                                card={card}
                                index={index}
                                onSwipe={(direction, source) => handleSwipe(direction, card.id, source)}
                                revealed={index === 0 ? topCardRevealed : undefined}
                                onReveal={index === 0 ? () => setTopCardRevealed(true) : undefined}
                                lucky={luckyIds.has(card.id)}
                                hint={index === 0 ? (levelHint(cardProgress[card.id], card.id) ?? setHint(card.id, sets, cardProgress)) : null}
                                sessionCount={index === 0 ? session.count : undefined}
                            />
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {/* Explicit actions: same as swiping left / right */}
            {topCardId && !done && (
                <div className="absolute top-[calc(50%+237px)] left-0 right-0 mx-2 sm:mx-4 grid grid-cols-2 gap-2.5">
                    <button
                        onClick={() => handleSwipe('left', topCardId)}
                        className="h-14 rounded-xl border border-line bg-surface text-ink font-medium flex items-center justify-center gap-2 hover:bg-surface-2 active:scale-[0.98] transition"
                    >
                        <X className="w-4 h-4" />
                        Chưa nhớ
                    </button>
                    <button
                        onClick={() => handleSwipe('right', topCardId)}
                        disabled={swipeMode === 'voice' && voiceAvailable}
                        title={swipeMode === 'voice' && voiceAvailable ? 'Chế độ giọng nói: nói từ để ghi nhớ' : undefined}
                        className="h-14 rounded-xl bg-accent text-on-accent font-bold flex items-center justify-center gap-2 hover:bg-accent-strong active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Đã nhớ
                        <Check className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
