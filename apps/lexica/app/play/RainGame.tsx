'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import { isOver, LANES, level, LIVES, newRain, submit, target, tick, type Rain } from '../lib/games/rain';
import type { GameAnswer, GameCard } from '../lib/games/rounds';
import { Bar, Over } from './Shell';
import { edge, GAME_COLOR, tint } from './theme';

/**
 * Mưa từ: Vietnamese meanings fall in four lanes; type the English word to
 * clear them before they reach the ground. Each clear speeds things up a
 * little. The first letters you type light up the word you are heading for.
 */
export default function RainGame({ cards, onAgain }: { cards: GameCard[]; onAgain: () => void }) {
    const [rain, setRain] = useState<Rain>(() => newRain(cards));
    const [typed, setTyped] = useState('');
    const [pop, setPop] = useState<{ id: number; lane: number; text: string }[]>([]);
    const last = useRef(0);
    const c = GAME_COLOR.rain;
    const over = isOver(rain);

    // The clock: a frame loop moves the drops
    useEffect(() => {
        if (over) return;
        let raf = 0;
        last.current = performance.now();
        const loop = (now: number) => {
            const dt = Math.min(100, now - last.current);
            last.current = now;
            setRain((r) => tick(r, dt));
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, [over]);

    const onType = (value: string) => {
        setTyped(value);
        const { rain: next, hit } = submit(rain, value);
        if (hit) {
            setRain(next);
            setTyped('');
            setPop((p) => [...p.slice(-4), { id: hit.id, lane: hit.lane, text: `+${next.score - rain.score}` }]);
            setTimeout(() => setPop((p) => p.filter((x) => x.id !== hit.id)), 700);
        }
    };

    if (over) {
        const answers: GameAnswer[] = [...rain.cleared.map((id) => ({ cardId: id, correct: true })), ...rain.missed.map((id) => ({ cardId: id, correct: false }))];
        return (
            <div className="space-y-4">
                <Bar game="rain" title="Mưa từ" score={rain.score} progress={1} />
                <Over game="rain" score={rain.score} answers={answers} onAgain={onAgain} line={`${rain.cleared.length} từ, chuỗi dài nhất ×${rain.best}`} />
            </div>
        );
    }

    const aim = target(rain, typed);
    return (
        <div className="space-y-3">
            <Bar game="rain" title="Mưa từ" score={rain.score} right={<span className="mr-1 text-subtle">Lv {level(rain)}</span>} />
            <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                    {Array.from({ length: LIVES }, (_, n) => (
                        <Heart key={n} className={`h-4 w-4 ${n < rain.lives ? 'fill-danger text-danger' : 'text-subtle'}`} />
                    ))}
                </span>
                {rain.combo >= 2 && (
                    <motion.span key={rain.combo} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="flex items-center gap-1 font-semibold text-warning">
                        <Sparkles className="h-3.5 w-3.5" /> ×{rain.combo}
                    </motion.span>
                )}
            </div>

            {/* The sky */}
            <div className="relative h-[52vh] min-h-72 overflow-hidden rounded-3xl border" style={{ background: `linear-gradient(180deg, ${tint(c, 4)}, ${tint(c, 14)})`, borderColor: edge(c, 32) }}>
                {Array.from({ length: LANES - 1 }, (_, i) => (
                    <span key={i} aria-hidden className="absolute top-0 bottom-0 w-px" style={{ left: `${((i + 1) / LANES) * 100}%`, background: edge(c, 10) }} />
                ))}
                {/* the ground */}
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-1.5" style={{ background: 'var(--color-danger)', opacity: 0.6 }} />
                {rain.drops.map((d) => {
                    const aimed = aim?.id === d.id;
                    return (
                        <div key={d.id} className="absolute w-1/4 px-1" style={{ left: `${(d.lane / LANES) * 100}%`, top: `${d.y * 92}%` }}>
                            <div className={`rounded-xl border px-2 py-1.5 text-center text-xs leading-tight ${d.y > 0.7 ? 'text-danger' : 'text-ink'}`} style={{ background: aimed ? tint(c, 30) : 'var(--color-surface)', borderColor: aimed ? c : d.y > 0.7 ? 'var(--color-danger)' : 'var(--color-line)' }}>
                                <span className="block">{d.meaning}</span>
                                <span className="mt-0.5 block font-mono text-[10px] tracking-[0.25em] text-muted">
                                    {aimed ? <span style={{ color: c }}>{d.word.slice(0, typed.trim().length)}</span> : null}
                                    {'·'.repeat(d.word.length - (aimed ? typed.trim().length : 0)).split('').join(' ')}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <AnimatePresence>
                    {pop.map((p) => (
                        <motion.span key={p.id} initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -24 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }} className="absolute bottom-6 w-1/4 text-center font-bold text-accent" style={{ left: `${(p.lane / LANES) * 100}%` }}>
                            {p.text}
                        </motion.span>
                    ))}
                </AnimatePresence>
            </div>

            <input
                value={typed}
                onChange={(e) => onType(e.target.value)}
                autoFocus
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Gõ từ tiếng Anh"
                placeholder="Gõ từ tiếng Anh rồi nó tự biến mất"
                className="h-12 w-full rounded-2xl border bg-surface px-4 text-base text-ink focus:outline-none"
                style={{ borderColor: edge(c, 50) }}
            />
        </div>
    );
}
