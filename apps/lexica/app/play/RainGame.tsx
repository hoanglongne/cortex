'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Hourglass, Sparkles, Star } from 'lucide-react';
import { isOver, LANES, level, LIVES, newRain, submit, target, tick, type Effect, type Rain } from '../lib/games/rain';
import type { GameAnswer, GameCard } from '../lib/games/rounds';
import { Bar, Over } from './Shell';
import { edge, GAME_COLOR, tint } from './theme';

const EFFECT_TEXT: Record<Effect, string> = { heart: 'Thêm một tim', slow: 'Mưa chậm lại', clear: 'Dọn sạch cả màn' };

/** The sky changes with the level: clear, cloudy, storm. */
const SKY = ['var(--color-game-sky)', 'var(--color-game-violet)', 'var(--color-game-coral)'];

/**
 * Mưa từ: Vietnamese meanings fall in four lanes; type the English word to
 * clear them before they reach the ground. It starts slow and short, picks up as
 * you clear words, and a missed word eases it off for a few seconds. Golden words
 * give a heart, slow the rain or clear the sky. "Luyện" has no hearts to lose.
 */
export default function RainGame({ cards, onAgain }: { cards: GameCard[]; onAgain: () => void }) {
    const [practice, setPractice] = useState<boolean | null>(null);
    if (practice === null) {
        return (
            <div className="space-y-4">
                <Bar game="rain" title="Mưa từ" score={0} />
                <p className="text-sm text-muted text-center">Nghĩa tiếng Việt rơi xuống. Gõ từ tiếng Anh để phá trước khi chạm đất.</p>
                <div className="grid gap-3">
                    <button onClick={() => setPractice(true)} className="rounded-3xl border border-line bg-surface p-5 text-left active:scale-[0.98]">
                        <span className="block text-lg font-bold text-ink">Luyện</span>
                        <span className="block text-sm text-muted">Không mất tim, để làm quen. Từ chạm đất vẫn quay lại phần ôn.</span>
                    </button>
                    <button onClick={() => setPractice(false)} className="rounded-3xl border p-5 text-left active:scale-[0.98]" style={{ background: tint(GAME_COLOR.rain, 12), borderColor: edge(GAME_COLOR.rain, 45) }}>
                        <span className="block text-lg font-bold text-ink">Thử thách</span>
                        <span className="block text-sm text-ink-2">{LIVES} tim, rơi nhanh dần, có từ vàng giúp bạn.</span>
                    </button>
                </div>
            </div>
        );
    }
    return <Rainfall key={String(practice)} cards={cards} practice={practice} onAgain={onAgain} />;
}

function Rainfall({ cards, practice, onAgain }: { cards: GameCard[]; practice: boolean; onAgain: () => void }) {
    const [rain, setRain] = useState<Rain>(() => newRain(cards, Math.random, practice));
    const [typed, setTyped] = useState('');
    const [pop, setPop] = useState<{ id: number; lane: number; text: string }[]>([]);
    const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
    const [stopped, setStopped] = useState(false);
    const last = useRef(0);
    const sky = SKY[Math.min(SKY.length - 1, Math.floor((level(rain) - 1) / 2))];
    const c = GAME_COLOR.rain;
    const over = isOver(rain) || stopped;

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
        const { rain: next, hit, effect } = submit(rain, value);
        if (!hit) return;
        setRain(next);
        setTyped('');
        setPop((p) => [...p.slice(-4), { id: hit.id, lane: hit.lane, text: `+${next.score - rain.score}` }]);
        setTimeout(() => setPop((p) => p.filter((x) => x.id !== hit.id)), 700);
        if (effect) {
            setToast({ id: hit.id, text: EFFECT_TEXT[effect] });
            setTimeout(() => setToast((t) => (t?.id === hit.id ? null : t)), 1800);
        }
    };

    if (over) {
        const answers: GameAnswer[] = [...rain.cleared.map((id) => ({ cardId: id, correct: true })), ...rain.missed.map((id) => ({ cardId: id, correct: false }))];
        return (
            <div className="space-y-4">
                <Bar game="rain" title="Mưa từ" score={rain.score} progress={1} />
                <Over game="rain" score={rain.score} answers={answers} onAgain={onAgain} line={`${rain.cleared.length} từ, chuỗi dài nhất ×${rain.best}${practice ? ' · chế độ luyện' : ''}`} />
            </div>
        );
    }

    const aim = target(rain, typed);
    return (
        <div className="space-y-3">
            <Bar game="rain" title="Mưa từ" score={rain.score} right={<span className="mr-1 text-subtle">Lv {level(rain)}</span>} />
            <div className="flex items-center justify-between text-xs">
                {practice ? (
                    <button onClick={() => setStopped(true)} className="rounded-lg border border-line px-2 py-1 text-ink-2">
                        Xong, xem kết quả
                    </button>
                ) : (
                    <span className="flex items-center gap-1">
                        {Array.from({ length: LIVES }, (_, n) => (
                            <Heart key={n} className={`h-4 w-4 ${n < rain.lives ? 'fill-danger text-danger' : 'text-subtle'}`} />
                        ))}
                    </span>
                )}
                <span className="flex items-center gap-3">
                    {rain.slowMs > 0 && (
                        <span className="flex items-center gap-1 text-game-sky" style={{ color: 'var(--color-game-sky)' }}>
                            <Hourglass className="h-3.5 w-3.5" /> chậm
                        </span>
                    )}
                    {rain.combo >= 2 && (
                        <motion.span key={rain.combo} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="flex items-center gap-1 font-semibold text-warning">
                            <Sparkles className="h-3.5 w-3.5" /> ×{rain.combo}
                        </motion.span>
                    )}
                </span>
            </div>

            {/* The sky */}
            <div className="relative h-[52vh] min-h-72 overflow-hidden rounded-3xl border" style={{ background: `linear-gradient(180deg, ${tint(sky, 4)}, ${tint(sky, 16)})`, borderColor: edge(sky, 34) }}>
                {Array.from({ length: LANES - 1 }, (_, i) => (
                    <span key={i} aria-hidden className="absolute top-0 bottom-0 w-px" style={{ left: `${((i + 1) / LANES) * 100}%`, background: edge(sky, 10) }} />
                ))}
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-1.5" style={{ background: 'var(--color-danger)', opacity: 0.6 }} />
                {rain.drops.map((d) => {
                    const aimed = aim?.id === d.id;
                    const typedLen = aimed ? typed.trim().length : 0;
                    return (
                        <div key={d.id} className="absolute w-1/4 px-1" style={{ left: `${(d.lane / LANES) * 100}%`, top: `${d.y * 92}%` }}>
                            <div
                                className={`rounded-xl border px-2 py-1.5 text-center text-xs leading-tight ${d.y > 0.7 ? 'text-danger' : 'text-ink'}`}
                                style={{
                                    background: d.gold ? tint('var(--color-warning)', 26) : aimed ? tint(c, 30) : 'var(--color-surface)',
                                    borderColor: d.gold ? 'var(--color-warning)' : aimed ? c : d.y > 0.7 ? 'var(--color-danger)' : 'var(--color-line)',
                                    boxShadow: d.gold ? '0 0 12px color-mix(in srgb, var(--color-warning) 55%, transparent)' : undefined,
                                }}
                            >
                                {d.gold && <Star className="mx-auto mb-0.5 h-3 w-3 fill-warning text-warning" aria-label="Từ vàng" />}
                                <span className="block">{d.meaning}</span>
                                {/* The first letter and how many letters there are: a nudge, not the word */}
                                <span className="mt-0.5 block overflow-hidden whitespace-nowrap font-mono text-[11px] tracking-[0.1em] text-muted">
                                    {[...d.word].map((ch, k) => (k === 0 || k < typedLen ? <span key={k} style={{ color: k < typedLen ? c : undefined }}>{ch}</span> : <span key={k}>·</span>))}
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
                    {toast && (
                        <motion.p key={toast.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute inset-x-0 top-3 text-center text-sm font-bold text-warning">
                            {toast.text}
                        </motion.p>
                    )}
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
                placeholder="Gõ từ tiếng Anh, đủ chữ là tự biến mất"
                className="h-12 w-full rounded-2xl border bg-surface px-4 text-base text-ink focus:outline-none"
                style={{ borderColor: edge(c, 50) }}
            />
        </div>
    );
}
