'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * A reel that flicks through labels, slows down and stops on `result`. The
 * result is decided by the server before the reel starts; the near-misses
 * are only a show (docs/LEXICA_ENGAGEMENT_SPEC.md §2.5).
 */
export function useReel<T>(items: T[], result: T | null, steps = 18): { current: T | null; done: boolean } {
    const [index, setIndex] = useState(0);
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (result === null || items.length === 0) return;
        const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        if (reduce) {
            const t = setTimeout(() => setDone(true), 0);
            return () => clearTimeout(t);
        }
        let step = 0;
        let timer: ReturnType<typeof setTimeout>;
        const tick = () => {
            step++;
            if (step >= steps) {
                setDone(true);
                return;
            }
            setIndex((i) => i + 1);
            // Ease out: gaps grow from 60 ms to ~400 ms.
            timer = setTimeout(tick, 60 + Math.pow(step / steps, 2.2) * 360);
        };
        timer = setTimeout(tick, 60);
        return () => clearTimeout(timer);
    }, [items.length, result, steps]);

    if (result === null) return { current: null, done: false };
    return { current: done ? result : items[index % items.length], done };
}

export function RevealModal({ children, onClose, canClose }: { children: React.ReactNode; onClose: () => void; canClose: boolean }) {
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={() => canClose && onClose()}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-sm rounded-3xl border border-line bg-surface p-6 text-center"
            >
                {children}
                {canClose && (
                    <button onClick={onClose} className="mt-6 w-full py-3 rounded-xl bg-accent hover:bg-accent-strong text-on-accent font-semibold text-sm">
                        Xong
                    </button>
                )}
            </motion.div>
        </div>
    );
}
