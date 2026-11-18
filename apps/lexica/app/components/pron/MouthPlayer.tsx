'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Play, Repeat, Snail } from 'lucide-react';
import Mouth from './Mouth';
import { frameAt, type Phase } from '../../lib/pronunciation/motion';
import type { MouthPart } from '../../lib/pronunciation/steps';

const PLAY_MS = 1400;
/** Slow is ×0.4 speed. */
const SLOW = 0.4;
const PHASE_LABEL: Record<Phase, string> = { rest: 'Thả lỏng', hold: 'Giữ', release: 'Thả ra' };
/** Still frames for reduced motion: before, hold, release (or back). */
const STEPS: { t: number; label: string }[] = [
    { t: 0, label: 'Trước' },
    { t: 0.45, label: 'Giữ' },
    { t: 0.66, label: 'Thả' },
];

/**
 * The mouth picture with Play, Slow and Loop (issue #156). Moves from a
 * relaxed mouth into the sound and back; stops show the release. With
 * reduced motion on, three still frames to step through instead.
 */
export default function MouthPlayer({
    phone,
    focus,
    className = '',
    autoSlow = false,
}: {
    phone: string;
    focus?: MouthPart | readonly MouthPart[] | null;
    className?: string;
    /** Play once, slowly, when shown (remount with a new key to replay). */
    autoSlow?: boolean;
}) {
    const still = useReducedMotion();
    const [t, setT] = useState<number | null>(null);
    const [slow, setSlow] = useState(false);
    const [loop, setLoop] = useState(false);
    const raf = useRef<number | null>(null);

    const stop = () => {
        if (raf.current !== null) cancelAnimationFrame(raf.current);
        raf.current = null;
    };
    useEffect(() => stop, []);
    useEffect(() => {
        if (!autoSlow || still) return;
        const ms = PLAY_MS / SLOW;
        let start: number | null = null;
        const tick = (now: number) => {
            start ??= now;
            const x = (now - start) / ms;
            if (x >= 1) {
                setT(null);
                raf.current = null;
                return;
            }
            setT(x);
            raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);
        return () => {
            if (raf.current !== null) cancelAnimationFrame(raf.current);
        };
    }, [autoSlow, still]);

    const play = (isSlow = slow, isLoop = loop) => {
        stop();
        const ms = PLAY_MS / (isSlow ? SLOW : 1);
        const start = performance.now();
        const tick = (now: number) => {
            const x = (now - start) / ms;
            if (x >= 1 && !isLoop) {
                setT(null);
                raf.current = null;
                return;
            }
            setT(x % 1);
            raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);
    };

    const phase = t === null ? null : (frameAt(phone, t)?.phase ?? null);
    const btn = 'h-8 px-2 rounded-md border text-xs flex items-center gap-1';
    const on = 'border-accent text-accent';
    const off = 'border-line text-ink-2 hover:border-line-strong';

    return (
        <div className={`space-y-1.5 ${className}`} data-testid="mouth-player">
            <Mouth phone={phone} focus={t === null ? focus : null} t={t} className="w-full h-auto" />
            <p className="h-4 text-center text-[11px] text-muted" aria-live="polite">{phase ? PHASE_LABEL[phase] : ''}</p>
            {still ? (
                <div className="flex gap-1">
                    {STEPS.map((x) => (
                        <button key={x.label} type="button" onClick={() => setT(x.t)} className={`${btn} flex-1 justify-center ${t === x.t ? on : off}`}>
                            {x.label}
                        </button>
                    ))}
                </div>
            ) : (
                <div className="flex gap-1">
                    <button type="button" onClick={() => play()} className={`${btn} flex-1 justify-center ${off}`} aria-label="Phát">
                        <Play className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        aria-pressed={slow}
                        aria-label="Chậm"
                        onClick={() => {
                            setSlow(!slow);
                            play(!slow, loop);
                        }}
                        className={`${btn} flex-1 justify-center ${slow ? on : off}`}
                    >
                        <Snail className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        aria-pressed={loop}
                        aria-label="Lặp lại"
                        onClick={() => {
                            const next = !loop;
                            setLoop(next);
                            if (next) play(slow, true);
                            else {
                                stop();
                                setT(null);
                            }
                        }}
                        className={`${btn} flex-1 justify-center ${loop ? on : off}`}
                    >
                        <Repeat className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
}
