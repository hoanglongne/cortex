'use client';

import { useEffect, useState } from 'react';
import { animate, motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { ringArcs } from '../lib/journey/ring';
import { HAPTIC, vibrate } from '../lib/engagement/haptics';
import { useLexicaStore } from '../store/lexicaStore';

const ARCS = ringArcs(4, 52, 60, 60, 16);
const SPARKS = Array.from({ length: 10 }, (_, i) => (i * 360) / 10);

/** A number that counts up from 0 (shows the end value at once with reduced motion). */
function CountUp({ to, still }: { to: number; still: boolean }) {
    const [n, setN] = useState(still ? to : 0);
    useEffect(() => {
        if (still) return;
        const c = animate(0, to, { duration: 0.9, delay: 0.7, ease: 'easeOut', onUpdate: (v) => setN(Math.round(v)) });
        return () => c.stop();
    }, [to, still]);
    return <>{n}</>;
}

/**
 * The end of today's session (issue #146): the four arcs close one by one,
 * a check pops in with a small burst, and today's word steps (Hiểu, Nhớ, Gặp, Dùng) count up.
 * A short buzz marks the moment. Reduced motion: everything shown at once.
 */
export default function RecapHero({ words, headline }: { words: number; headline: string }) {
    const still = !!useReducedMotion();
    const sound = useLexicaStore((s) => s.soundEnabled);
    useEffect(() => {
        const t = setTimeout(() => vibrate(HAPTIC.milestone, sound), still ? 0 : 900);
        return () => clearTimeout(t);
    }, [sound, still]);

    return (
        <div data-testid="recap-hero" className="flex flex-col items-center text-center">
            <div className="relative h-36 w-36">
                <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full" aria-hidden>
                    {ARCS.map((d, i) => (
                        <g key={i}>
                            <path d={d} fill="none" strokeWidth="9" strokeLinecap="round" className="stroke-surface-3" />
                            <motion.path
                                d={d}
                                fill="none"
                                strokeWidth="9"
                                strokeLinecap="round"
                                className="stroke-accent"
                                initial={still ? false : { pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.25, delay: i * 0.18, ease: 'easeOut' }}
                            />
                        </g>
                    ))}
                </svg>
                {!still &&
                    SPARKS.map((deg, i) => (
                        <motion.span
                            key={deg}
                            aria-hidden
                            className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
                            style={{ background: i % 2 ? 'var(--color-warning)' : 'var(--color-accent)' }}
                            initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                            animate={{
                                x: Math.cos((deg * Math.PI) / 180) * 78,
                                y: Math.sin((deg * Math.PI) / 180) * 78,
                                opacity: [0, 1, 0],
                                scale: [0.5, 1.2, 0.6],
                            }}
                            transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
                        />
                    ))}
                <motion.span
                    className="absolute inset-[26%] flex items-center justify-center rounded-full bg-accent text-on-accent"
                    initial={still ? false : { scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 14, delay: 0.75 }}
                >
                    <Check className="h-9 w-9" strokeWidth={3} />
                </motion.span>
            </div>
            {words > 0 && (
            <motion.p
                className="mt-3 text-4xl font-bold text-ink"
                initial={still ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
            >
                +<CountUp to={words} still={still} />
                <span className="ml-1.5 text-base font-medium text-muted">bước tiến hôm nay</span>
            </motion.p>
            )}
            <h1 className="mt-3 text-base font-semibold text-ink-2">{headline}</h1>
        </div>
    );
}
