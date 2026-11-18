'use client';

import { useRef, useState } from 'react';
import { motion, useReducedMotion, useSpring } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { FLAT, TOPIC_COLOR, tiltAt } from '../lib/engagement/cardLook';
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
 * The word card as the main character (issue #146): a front with the word
 * and the topic's colour, a back with the meaning and an example. It tilts
 * toward the finger, catches the light (silver, holo and legendary shine
 * more), and flips with a springy follow-through. Reduced motion: no tilt,
 * the flip is instant.
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
    const ref = useRef<HTMLDivElement>(null);
    const [back, setBack] = useState(false);
    const [light, setLight] = useState({ gx: FLAT.gx, gy: FLAT.gy });
    const spring = { stiffness: 180, damping: 14, mass: 0.6 };
    const rx = useSpring(0, spring);
    const ry = useSpring(0, spring);
    const flip = useSpring(0, { stiffness: 120, damping: 12 });
    const topic = topicOf(card);
    const color = TOPIC_COLOR[topic];
    const topicLabel = TOPICS.find((t) => t.id === topic)?.label ?? '';
    const shiny = edition !== 'common';
    const tag = edition === 'legendary' && serial != null ? `No.${String(serial).padStart(4, '0')}` : EDITION_NAME[edition];

    const move = (e: React.PointerEvent) => {
        if (still || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const t = tiltAt(e.clientX - r.left, e.clientY - r.top, r.width, r.height);
        rx.set(t.rx);
        ry.set(t.ry);
        setLight({ gx: t.gx, gy: t.gy });
    };
    const leave = () => {
        rx.set(0);
        ry.set(0);
        setLight({ gx: FLAT.gx, gy: FLAT.gy });
    };
    const turn = () => {
        const next = !back;
        setBack(next);
        if (still) flip.jump(next ? 180 : 0);
        else flip.set(next ? 180 : 0);
        vibrate(HAPTIC.unknown);
    };

    const face = 'absolute inset-0 rounded-3xl border-2 bg-surface overflow-hidden [backface-visibility:hidden] flex flex-col';
    const glare = shiny
        ? `radial-gradient(circle at ${light.gx}% ${light.gy}%, rgba(255,255,255,0.28), transparent 45%), linear-gradient(${110 + (light.gx - 50) / 2}deg, transparent 20%, ${edition === 'legendary' ? 'rgba(217,195,143,0.25)' : edition === 'holo' ? 'rgba(198,244,50,0.18)' : 'rgba(200,205,215,0.15)'} 45%, transparent 70%)`
        : `radial-gradient(circle at ${light.gx}% ${light.gy}%, rgba(255,255,255,0.08), transparent 50%)`;

    return (
        <div className={`[perspective:900px] ${className}`}>
            <motion.div
                ref={ref}
                data-testid="word-card"
                role="button"
                tabIndex={0}
                aria-label={back ? `${card.word}: ${card.meaning}. Chạm để lật lại` : `${card.word}. Chạm để xem nghĩa`}
                onPointerMove={move}
                onPointerLeave={leave}
                onClick={turn}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), turn())}
                style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
                className="relative aspect-[3/4] w-full cursor-pointer select-none"
            >
                <motion.div style={{ rotateY: flip, transformStyle: 'preserve-3d' }} className="absolute inset-0">
                    {/* Front: the word */}
                    <div className={`${face} ${FRAME[edition]}`}>
                        <div className="h-2" style={{ background: color }} />
                        <div className="flex items-center justify-between px-4 pt-3">
                            <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color }}>
                                {topicLabel}
                            </span>
                            {tag && <span className={`font-mono text-[10px] tracking-wider lx-edition-label-${edition}`}>{tag}</span>}
                        </div>
                        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
                            <p className="text-3xl font-bold tracking-wide text-ink [overflow-wrap:anywhere]">{card.word}</p>
                            {card.ipa && <p className="mt-1 font-mono text-sm text-muted">/{card.ipa}/</p>}
                        </div>
                        <p className="pb-3 text-center text-[11px] text-subtle">Chạm để lật</p>
                        <div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-screen" style={{ background: glare }} />
                    </div>
                    {/* Back: meaning and example */}
                    <div className={`${face} ${FRAME[edition]} [transform:rotateY(180deg)]`}>
                        <div className="h-2" style={{ background: color }} />
                        <div className="flex flex-1 flex-col gap-3 p-4">
                            <p className="text-sm font-semibold text-ink">{card.word}</p>
                            <p className="text-xl font-bold leading-snug" style={{ color }}>
                                {card.meaning}
                            </p>
                            {card.example && <p className="text-sm italic leading-relaxed text-ink-2 line-clamp-5">“{card.example}”</p>}
                        </div>
                        {onSpeak && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSpeak();
                                }}
                                className="m-3 mt-0 flex h-10 items-center justify-center gap-2 rounded-xl border border-line text-sm text-ink"
                            >
                                <Volume2 className="h-4 w-4" /> Nghe
                            </button>
                        )}
                        <div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-screen" style={{ background: glare }} />
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
