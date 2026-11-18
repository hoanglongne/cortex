'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { TOPIC_COLOR } from '../lib/engagement/cardLook';
import { TOPICS, topicOf } from '../lib/engagement/collection';
import { HAPTIC, vibrate } from '../lib/engagement/haptics';
import type { Edition } from '../lib/engagement/economy';

const EDITION_NAME: Record<Edition, string | null> = { common: null, silver: 'BẠC', holo: 'HOLO', legendary: 'HUYỀN THOẠI' };
const FRAME: Record<Edition, string> = {
    common: 'border-line-strong',
    silver: 'lx-edition-silver',
    holo: 'lx-edition-holo',
    legendary: 'lx-edition-legendary',
};

export interface WordCardData {
    word: string;
    ipa?: string;
    meaning: string;
    example?: string;
    scenario?: string;
}

/**
 * The word card (issue #146), flat and quiet like the rest of the app: a
 * hairline frame (the edition sets its colour), a mono topic label with a
 * small dot, the word on the front and the meaning on the back. Tap to turn
 * it over: a short 2D squash, no tilt, no gloss.
 */
export default function WordCard({
    card,
    edition = 'common',
    serial,
    onSpeak,
    className = '',
}: {
    card: WordCardData;
    edition?: Edition;
    serial?: number | null;
    onSpeak?: () => void;
    className?: string;
}) {
    const still = useReducedMotion();
    const [back, setBack] = useState(false);
    const topic = topicOf(card);
    const topicLabel = TOPICS.find((t) => t.id === topic)?.label ?? '';
    const tag = edition === 'legendary' && serial != null ? `No.${String(serial).padStart(4, '0')}` : EDITION_NAME[edition];
    const turn = () => {
        setBack((b) => !b);
        vibrate(HAPTIC.unknown);
    };

    return (
        <div
            data-testid="word-card"
            role="button"
            tabIndex={0}
            aria-label={back ? `${card.word}: ${card.meaning}. Chạm để lật lại` : `${card.word}. Chạm để xem nghĩa`}
            onClick={turn}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), turn())}
            className={`relative aspect-[3/4] w-full cursor-pointer select-none rounded-2xl border bg-surface ${FRAME[edition]} ${className}`}
        >
            <div className="absolute inset-x-4 top-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-subtle">
                <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: TOPIC_COLOR[topic] }} />
                    {topicLabel}
                </span>
                {tag && <span className={`lx-edition-label-${edition}`}>{tag}</span>}
            </div>
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={back ? 'back' : 'front'}
                    initial={still ? false : { scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    exit={still ? undefined : { scaleX: 0 }}
                    transition={{ duration: 0.12, ease: 'easeInOut' }}
                    className="absolute inset-0 flex flex-col px-4 pb-3 pt-9"
                >
                    {!back ? (
                        <>
                            <div className="flex flex-1 flex-col items-center justify-center text-center">
                                <p className={`font-bold text-ink ${card.word.length <= 7 ? 'text-3xl tracking-wide' : card.word.length <= 10 ? 'text-2xl' : 'text-xl'} [overflow-wrap:break-word]`}>{card.word}</p>
                                {card.ipa && <p className="mt-1 font-mono text-sm text-muted">/{card.ipa}/</p>}
                            </div>
                            <p className="text-center font-mono text-[10px] uppercase tracking-wider text-subtle">Chạm để lật</p>
                        </>
                    ) : (
                        <>
                            <div className="flex flex-1 flex-col gap-2 border-t border-line pt-3">
                                <p className="text-lg font-semibold leading-snug text-ink">{card.meaning}</p>
                                {card.example && <p className="text-sm italic leading-relaxed text-muted line-clamp-5">“{card.example}”</p>}
                            </div>
                            {onSpeak && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSpeak();
                                    }}
                                    className="flex h-9 items-center justify-center gap-2 rounded-lg border border-line text-sm text-ink-2 hover:text-ink"
                                >
                                    <Volume2 className="h-4 w-4" /> Nghe
                                </button>
                            )}
                        </>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
