'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { flushSync } from 'react-dom';
import { trackCardEvent } from '../lib/content/events';
import { AudioService } from '../lib/audio/AudioService';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper, Check, X, Flame, Sparkles } from 'lucide-react';
import Link from 'next/link';
import VocabCard from './VocabCard';
import { useLexicaStore } from '../store/lexicaStore';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { analytics } from '../lib/analytics';
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
    type SessionState,
} from '../lib/engagement/session';
import SessionRecap from './SessionRecap';
import { buildCheck, RETEST_AFTER, type RecallCheck } from '../lib/engagement/recall';
import type { Quality } from '../lib/srs';

export default function SwipeDeck({
    sessionSize,
    onFinish,
    finishLabel = 'Tiếp tục',
}: {
    /** Cards in a session (default 10). */
    sessionSize?: number;
    /** Inside the Today session: the recap's button moves on instead of dealing 10 more. */
    onFinish?: (session: SessionState) => void;
    finishLabel?: string;
} = {}) {
    const cards = useLexicaStore(state => state.currentDeck);
    const swipeCard = useLexicaStore(state => state.swipeCard);
    const deferCard = useLexicaStore(state => state.deferCard);
    const markAsMastered = useLexicaStore(state => state.markAsMastered);

    const { swipeRight, swipeLeft, buttonPress, comboTick, sparkle, soundEnabled } = useSoundEffects();
    const cardProgress = useLexicaStore(state => state.cardProgress);
    const contentVersion = useContentVersion();
    const readyToMint = useEconomy(state => state.state?.ready.length ?? 0);
    const luckyIds = useLucky(state => state.lucky);
    const checkLucky = useLucky(state => state.check);
    const claimLucky = useLucky(state => state.claim);

    // 10-card sessions with a combo and a recap (lib/engagement/session.ts)
    const [session, setSession] = useState(() => newSession(Date.now(), sessionSize));
    const [lastCombo, setLastCombo] = useState(0);
    const [luckyToast, setLuckyToast] = useState<(LuckyReward & { explain: boolean }) | null>(null);
    const done = sessionDone(session);

    // Recall checks (lib/engagement/recall.ts): "Đã nhớ" only counts once answered.
    // `asked` is a check on the top card now; `retests` wait for a peeked card to come back.
    const [asked, setAsked] = useState<RecallCheck | null>(null);
    const [retests, setRetests] = useState<Record<string, RecallCheck>>({});
    const [notice, setNotice] = useState<string | null>(null);

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

    // The top card and the next two sound at once when tapped
    const nextIds = cards.slice(0, 3).map((c) => c.id).join(',');
    useEffect(() => {
        if (nextIds) AudioService.preload(nextIds.split(','));
    }, [nextIds]);

    // Studio feedback: one impression per card shown on top, dwell measured to the swipe
    const shownAtRef = useRef<{ id: string; at: number } | null>(null);
    useEffect(() => {
        if (!topCardId || shownAtRef.current?.id === topCardId) return;
        shownAtRef.current = { id: topCardId, at: Date.now() };
        trackCardEvent(topCardId, 'impression');
    }, [topCardId]);

    const activeCheck = asked?.cardId === topCardId ? asked : (topCardId ? retests[topCardId] ?? null : null);

    /** Records the outcome: progress, session, combo, sound, lucky reward. */
    const commit = useCallback((
        direction: 'left' | 'right',
        cardId: string,
        source: 'manual' | 'voice' | 'check' = 'manual',
        quality: Quality = 'good'
    ) => {
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

        swipeCard(cardId, direction, quality);

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
                const explain = takeLuckyExplainer();
                setLuckyToast({ ...reward, explain });
                sparkle();
                vibrate(HAPTIC.lucky, soundEnabled);
                capture('lucky_card', { item: result.item, amount: result.amount });
                setTimeout(() => setLuckyToast(null), explain ? 3800 : 2200);
            });
        }
    }, [swipeCard, cards, swipeRight, swipeLeft, session.combo, comboTick, sparkle, soundEnabled, luckyIds, claimLucky]);

    /** A swipe or button press. "Đã nhớ" asks first; "Chưa nhớ" counts right away. */
    const handleSwipe = useCallback((
        direction: 'left' | 'right',
        cardId: string,
        source: 'manual' | 'voice' = 'manual'
    ) => {
        if (activeCheck) return; // answer the check first

        // Saying the word three times is effort enough; so is admitting you forgot.
        if (direction === 'left' || source === 'voice') {
            commit(direction, cardId, source);
            return;
        }

        const card = cards.find(c => c.id === cardId);
        if (!card) return;
        const progress = useLexicaStore.getState().cardProgress[cardId];
        const peeked = cardId === topCardId && topCardRevealed;

        if (peeked && cards.length > 1) {
            // Seen the meaning: ask again a few cards later, with the word hidden.
            const check = buildCheck({ card, progress, pool: getAllCards(), peeked: true });
            setRetests(prev => ({ ...prev, [cardId]: check }));
            setRevealedForCardId(null);
            deferCard(cardId, RETEST_AFTER);
            buttonPress();
            setNotice(takeRetestExplainer()
                ? 'Đã xem nghĩa thì chưa tính là nhớ. Mình sẽ hỏi lại sau vài thẻ.'
                : 'Hỏi lại sau vài thẻ');
            setTimeout(() => setNotice(null), 2400);
            capture('recall_deferred', { is_new: !progress });
            return;
        }

        setAsked(buildCheck({ card, progress, pool: getAllCards(), peeked: false }));
    }, [activeCheck, commit, cards, topCardId, topCardRevealed, deferCard, buttonPress]);

    const answerCheck = useCallback((correct: boolean) => {
        const check = activeCheck;
        if (!check) return;
        setAsked(null);
        setRetests(prev => {
            const next = { ...prev };
            delete next[check.cardId];
            return next;
        });
        capture('recall_check', { kind: check.kind, correct, peeked: check.peeked, is_new: check.isNew });
        // Recalled only after seeing the meaning: right, but it grows more slowly.
        commit(correct ? 'right' : 'left', check.cardId, 'check', check.peeked ? 'hard' : 'good');
        // An unseen word answered right without peeking: they already knew it.
        if (correct && check.isNew && !check.peeked) markAsMastered(check.cardId);
    }, [activeCheck, commit, markAsMastered]);

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
                    if (onFinish) onFinish(session);
                    else continueSession();
                }
                return;
            }

            if (activeCheck) return; // RecallPanel handles its own keys

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
                handleSwipe('right', topCardId);
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [topCardId, handleSwipe, setTopCardRevealed, done, continueSession, activeCheck, onFinish, session]);

    if (cards.length === 0 && onFinish) {
        return (
            <div className="flex flex-col items-center justify-center h-[460px] px-8 text-center gap-4">
                <p className="text-ink font-semibold">Hết từ mới ở level này.</p>
                <button onClick={() => onFinish(session)} className="h-12 px-6 rounded-xl bg-accent text-on-accent font-bold">
                    {finishLabel}
                </button>
            </div>
        );
    }

    if (cards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[460px] px-8 text-center">
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
                    {/* Primary CTA: read a short passage */}
                    <Link
                        href="/read"
                        onClick={() => buttonPress()}
                        className="w-full px-6 py-3 bg-surface-2/50 hover:bg-surface-2 border border-line-strong hover:border-line-strong rounded-xl font-semibold text-ink text-sm transition-all flex items-center justify-center gap-2"
                    >
                        Đọc 2 phút
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
        <div className="relative w-full h-[460px] flex items-center justify-center">
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
                        className="absolute z-50 top-[calc(50%-277px)] rounded-2xl border border-accent/50 bg-surface px-4 py-2 text-center pointer-events-none max-w-[90%]"
                    >
                        <p className="flex items-center justify-center gap-2 font-mono text-sm text-accent">
                            <Sparkles className="w-4 h-4" />
                            Thẻ may mắn: +{luckyToast.amount} {luckyToast.item === 'dust' ? 'Bụi' : 'Hộp'}
                        </p>
                        {luckyToast.explain && (
                            <p className="mt-0.5 text-xs text-muted">
                                {luckyToast.item === 'dust' ? 'Bụi dùng để nâng cấp thẻ trong Album' : 'Mở hộp trong Album để nhận quà'}
                            </p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {notice && (
                    <motion.div
                        key="notice"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 top-[calc(50%-277px)] rounded-2xl border border-line-strong bg-surface px-4 py-2 text-center text-sm text-ink-2 pointer-events-none max-w-[90%]"
                    >
                        {notice}
                    </motion.div>
                )}
            </AnimatePresence>

            {done && (
                <SessionRecap
                    session={session}
                    readyToMint={readyToMint}
                    nearest={nearestSet(sets, cardProgress)}
                    teasers={onFinish ? [] : nextSessionTeasers({ upcoming: cards, luckyIds })}
                    onContinue={onFinish ? () => onFinish(session) : continueSession}
                    continueLabel={onFinish ? finishLabel : undefined}
                />
            )}

            {/* Unmounted at once when the session ends: cards still flying out must never cover the recap. */}
            {!done && (
            <AnimatePresence>
                {cards.map((card, index) => {
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
                                hint={index === 0 ? (levelHint(cardProgress[card.id], card.id) ?? setHint(card.id, sets, cardProgress) ?? (luckyIds.has(card.id) ? 'Nhớ được thẻ này là có quà' : null)) : null}
                                sessionCount={index === 0 ? session.count : undefined}
                                check={index === 0 ? activeCheck : null}
                                onCheckAnswer={index === 0 ? answerCheck : undefined}
                            />
                        </motion.div>
                    );
                })}
            </AnimatePresence>
            )}

            {/* Explicit actions: same as swiping left / right */}
            {topCardId && !done && !activeCheck && (
                <div className="absolute top-[calc(50%+242px)] left-0 right-0 mx-2 sm:mx-4 grid grid-cols-2 gap-2.5">
                    <button
                        onClick={() => handleSwipe('left', topCardId)}
                        className="h-14 rounded-xl border border-line bg-surface text-ink font-medium flex items-center justify-center gap-2 hover:bg-surface-2 active:scale-[0.98] transition"
                    >
                        <X className="w-4 h-4" />
                        Chưa nhớ
                    </button>
                    <button
                        onClick={() => handleSwipe('right', topCardId)}
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

/** The first few lucky rewards say what the reward is for; then just the amount. */
const LUCKY_EXPLAIN_KEY = 'lexica-lucky-explained';
function takeLuckyExplainer(): boolean {
    try {
        const seen = Number(localStorage.getItem(LUCKY_EXPLAIN_KEY) ?? 0);
        if (seen >= 3) return false;
        localStorage.setItem(LUCKY_EXPLAIN_KEY, String(seen + 1));
        return true;
    } catch {
        return false;
    }
}

/** The first two deferrals explain why; after that a short line is enough. */
const RETEST_EXPLAIN_KEY = 'lexica-retest-explained';
function takeRetestExplainer(): boolean {
    try {
        const seen = Number(localStorage.getItem(RETEST_EXPLAIN_KEY) ?? 0);
        if (seen >= 2) return false;
        localStorage.setItem(RETEST_EXPLAIN_KEY, String(seen + 1));
        return true;
    } catch {
        return false;
    }
}
