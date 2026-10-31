'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { finished, newMemory, pairCount, timeBonus, turn, turnBack, type Memory } from '../lib/games/memory';
import type { GameAnswer, GameCard } from '../lib/games/rounds';
import { matchBoard } from '../lib/games/rounds';
import { Bar, Over } from './Shell';
import { edge, GAME_COLOR, tint } from './theme';

const PAIRS = 6;
const PAIR_HUES = ['var(--color-game-sky)', 'var(--color-game-coral)', 'var(--color-game-mint)', 'var(--color-warning)', 'var(--color-accent)', 'var(--color-game-violet)'];

/**
 * Ghép as a memory game: twelve cards face down, words and meanings mixed in
 * one grid. Turn two; a word and its meaning stay up in their own colour, any
 * other pair turns back. Matches in a row build a combo; a quick board earns
 * a time bonus.
 */
export default function MatchGame({ cards, onAgain }: { cards: GameCard[]; onAgain: () => void }) {
    const [m, setM] = useState<Memory>(() => newMemory(matchBoard(cards, PAIRS)));
    const [seconds, setSeconds] = useState(0);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const order = useMemo(() => [...new Set(m.tiles.map((t) => t.pair))], [m.tiles]);
    const c = GAME_COLOR.match;
    const done = finished(m);

    useEffect(() => {
        if (done) return;
        const t = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(t);
    }, [done]);
    useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

    const tap = (key: string) => {
        const { memory, result } = turn(m, key);
        if (result === 'ignored') return;
        setM(memory);
        if (result === 'miss') timer.current = setTimeout(() => setM((x) => turnBack(x)), 850);
    };

    if (done) {
        const bonus = timeBonus(seconds);
        const answers: GameAnswer[] = order.map((id) => ({ cardId: id, correct: !m.slipped.includes(id) }));
        return (
            <div className="space-y-4">
                <Bar game="match" title="Ghép" score={m.score + bonus} progress={1} />
                <Over game="match" score={m.score + bonus} answers={answers} onAgain={onAgain} line={`${m.flips} lần lật · ${seconds}s · combo ×${m.best}${bonus ? ` · +${bonus} điểm tốc độ` : ''}`} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Bar game="match" title="Ghép" score={m.score} progress={m.found.length / pairCount(m)} right={<span className="mr-1 text-subtle">{seconds}s</span>} />
            <div className="flex h-6 items-center justify-between text-xs text-muted">
                <span>
                    {m.found.length}/{pairCount(m)} cặp · {m.flips} lần lật
                </span>
                {m.combo >= 2 && (
                    <motion.span key={m.combo} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="flex items-center gap-1 font-semibold text-warning">
                        <Flame className="h-3.5 w-3.5" /> Combo ×{m.combo}
                    </motion.span>
                )}
            </div>
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                {m.tiles.map((t) => {
                    const foundPair = m.found.includes(t.pair);
                    const up = foundPair || m.open.includes(t.key);
                    const hue = PAIR_HUES[order.indexOf(t.pair) % PAIR_HUES.length];
                    const miss = m.open.length === 2 && m.open.includes(t.key) && !foundPair;
                    return (
                        <button key={t.key} onClick={() => tap(t.key)} disabled={up} aria-label={up ? t.text : 'Thẻ úp'} className="relative aspect-[3/4] [perspective:600px]">
                            <motion.div className="absolute inset-0 [transform-style:preserve-3d]" animate={{ rotateY: up ? 180 : 0 }} transition={{ duration: 0.35 }}>
                                {/* Back: the pattern */}
                                <div className="absolute inset-0 flex items-center justify-center rounded-2xl border [backface-visibility:hidden]" style={{ background: tint(c, 18), borderColor: edge(c, 45) }}>
                                    <span aria-hidden className="h-8 w-8 rotate-45 rounded-md border-2" style={{ borderColor: edge(c, 70) }} />
                                </div>
                                {/* Front: the word or its meaning */}
                                <div
                                    className={`absolute inset-0 flex items-center justify-center rounded-2xl border p-2 text-center text-[13px] leading-tight [backface-visibility:hidden] [transform:rotateY(180deg)] ${t.kind === 'word' ? 'font-bold' : ''}`}
                                    style={{
                                        background: foundPair ? tint(hue, 24) : miss ? 'color-mix(in srgb, var(--color-danger) 16%, var(--color-surface))' : 'var(--color-surface)',
                                        borderColor: foundPair ? edge(hue, 70) : miss ? 'var(--color-danger)' : 'var(--color-line-strong)',
                                        color: 'var(--color-ink)',
                                    }}
                                >
                                    {t.text}
                                </div>
                            </motion.div>
                        </button>
                    );
                })}
            </div>
            <p className="text-center text-xs text-subtle">Lật hai thẻ: một từ và nghĩa của nó thì ở lại. Ghép liền nhau thì được combo.</p>
        </div>
    );
}
