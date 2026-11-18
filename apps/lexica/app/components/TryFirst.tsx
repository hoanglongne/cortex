'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { getAllCards } from '../lib/content/repository';
import { AudioService } from '../lib/audio/AudioService';
import { HAPTIC, vibrate } from '../lib/engagement/haptics';

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
            <p className="font-mono text-[11px] uppercase tracking-wider text-accent">Thử một thẻ</p>
            <h1 className="mt-2 text-center text-xl font-semibold text-ink">Bạn biết từ này không?</h1>
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
                            className="absolute inset-0 flex cursor-grab flex-col items-center justify-center rounded-3xl border-2 border-line-strong bg-surface active:cursor-grabbing"
                        >
                            <motion.span style={{ opacity: knowGlow }} className="absolute left-4 top-4 rounded-md border border-accent px-2 py-0.5 text-xs font-bold text-accent">BIẾT</motion.span>
                            <motion.span style={{ opacity: learnGlow }} className="absolute right-4 top-4 rounded-md border border-warning px-2 py-0.5 text-xs font-bold text-warning">CHƯA</motion.span>
                            <p className="text-3xl font-bold tracking-wide text-ink">{card.word}</p>
                            {card.ipa && <p className="mt-1 font-mono text-sm text-muted">/{card.ipa}/</p>}
                            <span className="mt-6 flex items-center gap-1.5 text-sm text-accent">
                                <Volume2 className="h-4 w-4" /> Chạm để nghe
                            </span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="meaning"
                            data-testid="try-meaning"
                            initial={still ? false : { opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-2 border-accent/50 bg-accent/5 p-5 text-center"
                        >
                            <p className="text-lg font-semibold text-ink">{card.word}</p>
                            <p className="mt-2 text-2xl font-bold text-accent">{card.translationHint}</p>
                            <p className="mt-4 text-sm text-ink-2">
                                {answer === 'know' ? 'Tốt! Từ bạn đã biết sẽ ít khi quay lại.' : 'Không sao. Từ chưa biết sẽ quay lại đúng lúc bạn sắp quên.'}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {!answer ? (
                <div className="mt-6 flex w-60 gap-2">
                    <button type="button" onClick={() => pick('learn')} className="h-11 flex-1 rounded-xl border border-warning/50 text-sm font-semibold text-warning">
                        Chưa biết
                    </button>
                    <button type="button" onClick={() => pick('know')} className="h-11 flex-1 rounded-xl border border-accent/50 text-sm font-semibold text-accent">
                        Biết rồi
                    </button>
                </div>
            ) : (
                <button type="button" onClick={onDone} className="mt-6 h-12 w-60 rounded-2xl bg-accent font-bold text-on-accent">
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
