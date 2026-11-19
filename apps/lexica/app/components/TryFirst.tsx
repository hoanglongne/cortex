'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { getAllCards } from '../lib/content/repository';
import { AudioService } from '../lib/audio/AudioService';
import { HAPTIC, vibrate } from '../lib/engagement/haptics';
import { TOPIC_BLOCK } from '../lib/brand';
import { topicOf } from '../lib/engagement/collection';

const SWIPE = 90;

/**
 * Try first (issue #146): before any question, the first seconds are one
 * real card. Tap to hear it, swipe right if you know it, left if not, and
 * see its meaning. Then the welcome steps. "Để sau" skips straight to them.
 */
export default function TryFirst({ onDone }: { onDone: () => void }) {
    const still = useReducedMotion();
    const [card] = useState(() => {
        const easy = getAllCards().filter((c) => c.level === 'beginner' && c.word.length <= 9);
        return easy[Math.floor(Math.random() * Math.max(1, easy.length))] ?? getAllCards()[0];
    });
    useEffect(() => {
        if (!card) onDone();
    }, [card, onDone]);
    const [answer, setAnswer] = useState<'know' | 'learn' | null>(null);
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-14, 14]);
    const knowGlow = useTransform(x, [0, SWIPE], [0, 1]);
    const learnGlow = useTransform(x, [-SWIPE, 0], [1, 0]);

    if (!card) return null;
    const speak = () => void AudioService.play(card.id, 'word');
    const pick = (a: 'know' | 'learn') => {
        setAnswer(a);
        vibrate(a === 'know' ? HAPTIC.known : HAPTIC.unknown);
    };

    return (
        <div data-testid="try-first" className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg px-6">
            <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted">Thử một thẻ</p>
            <h1 className="mt-2 text-center font-display text-3xl font-extrabold tracking-tight text-ink">Bạn biết từ này không?</h1>
            <p className="mt-1 text-center text-sm text-muted">Chạm để nghe · quẹt phải nếu biết, quẹt trái nếu chưa</p>

            <div className="relative mt-6 h-72 w-60">
                <AnimatePresence mode="wait">
                    {!answer ? (
                        <motion.div
                            key="card"
                            data-testid="try-card"
                            drag={still ? false : 'x'}
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.9}
                            style={{ x, rotate }}
                            onDragEnd={(_, info) => {
                                if (info.offset.x > SWIPE) pick('know');
                                else if (info.offset.x < -SWIPE) pick('learn');
                            }}
                            onTap={speak}
                            exit={{ x: x.get() >= 0 ? 320 : -320, opacity: 0, transition: { duration: 0.25 } }}
                            className="absolute inset-0 flex cursor-grab flex-col items-center justify-center lx-hard rounded-[22px] bg-surface active:cursor-grabbing"
                        >
                            <motion.span style={{ opacity: knowGlow }} className="lx-sticker absolute left-4 top-4 bg-accent px-2 py-0.5 font-mono text-[11px] font-bold text-on-accent">BIẾT</motion.span>
                            <motion.span style={{ opacity: learnGlow }} className="lx-sticker absolute right-4 top-4 bg-surface px-2 py-0.5 font-mono text-[11px] font-bold text-ink">CHƯA</motion.span>
                            <p className="font-display text-4xl font-extrabold lowercase tracking-tight text-ink">{card.word}</p>
                            {card.ipa && <p className="mt-1 font-mono text-sm text-muted">/{card.ipa}/</p>}
                            <span className="lx-sticker mt-6 flex items-center gap-1.5 bg-surface-2 px-3 py-1 text-sm font-bold text-ink">
                                <Volume2 className="h-4 w-4" /> Chạm để nghe
                            </span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="meaning"
                            data-testid="try-meaning"
                            initial={still ? false : { opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 flex flex-col items-center justify-center lx-hard lx-onblock rounded-[22px] p-5 text-center"
                            style={{ background: TOPIC_BLOCK[topicOf({ scenario: card.scenario })] }}
                        >
                            <p className="font-display text-xl font-extrabold lowercase">{card.word}</p>
                            <p className="mt-2 font-display text-3xl font-extrabold">{card.translationHint}</p>
                            <p className="mt-4 text-sm">
                                {answer === 'know' ? 'Tốt! Từ bạn đã biết sẽ ít khi quay lại.' : 'Không sao. Từ chưa biết sẽ quay lại đúng lúc bạn sắp quên.'}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {!answer ? (
                <div className="mt-6 flex w-60 gap-2">
                    <button type="button" onClick={() => pick('learn')} className="lx-soft lx-press h-12 flex-1 rounded-[16px] bg-surface text-sm font-bold text-ink">
                        Chưa biết
                    </button>
                    <button type="button" onClick={() => pick('know')} className="lx-soft lx-press h-12 flex-1 rounded-[16px] bg-surface text-sm font-bold text-ink">
                        Biết rồi
                    </button>
                </div>
            ) : (
                <button type="button" onClick={onDone} className="lx-hard lx-press mt-6 h-12 w-60 rounded-[18px] bg-accent font-extrabold text-on-accent">
                    Học như vậy mỗi ngày →
                </button>
            )}
            {!answer && (
                <button type="button" onClick={onDone} className="mt-4 text-sm text-muted hover:text-ink">
                    Để sau
                </button>
            )}
        </div>
    );
}
