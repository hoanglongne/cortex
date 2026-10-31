'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eraser, Lightbulb } from 'lucide-react';
import { isStep, makeBoard, matchPlaced, SIZE, wordPoints } from '../lib/games/grid';
import type { GameAnswer, GameCard } from '../lib/games/rounds';
import { Bar, Over } from './Shell';
import { edge, GAME_COLOR, tint } from './theme';

const SECONDS = 90;
const WORDS = 4;
/** Seconds added each time a board is cleared. */
const BONUS_SECONDS = 25;
const HINT_COST = 15;

/**
 * Bẫy chữ: a 4×4 grid with some of my words hidden as paths. The clues are
 * their meanings; tap touching letters to trace a word. Clear a board and a
 * new one (with one more word, up to six) comes with extra seconds, until time
 * runs out. Longer words score far more; a hint lights the first letter of
 * the next word for a few points.
 */
export default function GridGame({ cards, onAgain }: { cards: GameCard[]; onAgain: () => void }) {
    const [round, setRound] = useState(0);
    const board = useMemo(() => makeBoard(cards, Math.min(WORDS + round, 6)), [cards, round]);
    const [past, setPast] = useState<GameAnswer[]>([]);
    const [cleared, setCleared] = useState(0);
    const [path, setPath] = useState<number[]>([]);
    const [found, setFound] = useState<string[]>([]);
    const [score, setScore] = useState(0);
    const [left, setLeft] = useState(SECONDS);
    const [flash, setFlash] = useState<'ok' | 'no' | null>(null);
    const [hintCell, setHintCell] = useState<number | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const c = GAME_COLOR.grid;
    const all = board.placed.length;
    const finished = left <= 0 || (all === 0 && round > 0);
    const done = all > 0 && found.length === all;

    useEffect(() => {
        if (finished) return;
        const t = setInterval(() => setLeft((l) => l - 1), 1000);
        return () => clearInterval(t);
    }, [finished]);
    useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

    useEffect(() => {
        if (!done || left <= 0) return;
        // Board cleared: bank its words, add time, deal the next board
        const t = setTimeout(() => {
            setPast((a) => [...a, ...board.placed.map((p) => ({ cardId: p.cardId, correct: true }))]);
            setCleared((n) => n + 1);
            setLeft((l) => l + BONUS_SECONDS);
            setScore((s) => s + 50);
            setFound([]);
            setPath([]);
            setHintCell(null);
            setRound((r) => r + 1);
        }, 700);
        return () => clearTimeout(t);
    }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

    const spelled = path.map((i) => board.cells[i]).join('');

    const tap = (i: number) => {
        if (finished) return;
        setHintCell(null);
        const at = path.indexOf(i);
        let next: number[];
        if (at >= 0) next = at === path.length - 1 ? path.slice(0, -1) : path.slice(0, at + 1);
        else if (path.length === 0 || isStep(path[path.length - 1], i)) next = [...path, i];
        else next = [i];
        setPath(next);
        const hit = matchPlaced(board, next, new Set(found));
        if (hit) {
            const bonus = left > 60 ? 1.25 : 1;
            setFound((f) => [...f, hit.word]);
            setScore((s) => s + Math.round(wordPoints(hit.word) * bonus));
            setFlash('ok');
            timer.current = setTimeout(() => {
                setFlash(null);
                setPath([]);
            }, 450);
        }
    };

    const hint = () => {
        const next = board.placed.find((p) => !found.includes(p.word));
        if (!next || finished) return;
        setHintCell(next.path[0]);
        setScore((s) => Math.max(0, s - HINT_COST));
        setPath([]);
    };

    if (finished) {
        const answers: GameAnswer[] = [...past, ...board.placed.map((p) => ({ cardId: p.cardId, correct: found.includes(p.word) }))];
        const total = past.length + all;
        const got = past.length + found.length;
        return (
            <div className="space-y-4">
                <Bar game="grid" title="Bẫy chữ" score={score} progress={got / Math.max(1, total)} />
                <Over game="grid" score={score} answers={answers} onAgain={onAgain} line={`${cleared} bảng xong · ${got} từ`} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Bar game="grid" title="Bẫy chữ" score={score} progress={Math.min(1, left / SECONDS)} right={<span className={`mr-1 ${left <= 15 ? 'text-danger' : 'text-subtle'}`}>{left}s</span>} />

            <p className="text-center text-xs text-muted">Bảng {round + 1}{cleared > 0 ? ` · xong ${cleared} bảng` : ''} · xong bảng được +{BONUS_SECONDS}s</p>

            {/* Clues: one per hidden word */}
            <ul className="grid gap-1.5" aria-label="Từ cần tìm">
                {board.placed.map((p) => {
                    const done = found.includes(p.word);
                    return (
                        <li key={p.word} className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm transition-colors ${done ? '' : 'border-line bg-surface'}`} style={done ? { background: tint(c, 18), borderColor: edge(c, 55) } : undefined}>
                            <span className={done ? 'text-ink' : 'text-ink-2'}>{p.meaning}</span>
                            <span className="font-mono text-xs tracking-widest" style={{ color: done ? c : undefined }}>
                                {done ? p.word : [...p.word].map((_, k) => (k === 0 ? p.word[0] : '·')).join(' ')}
                            </span>
                        </li>
                    );
                })}
            </ul>

            {/* The grid */}
            <div className="rounded-3xl border p-3" style={{ background: tint(c, 7), borderColor: edge(c, 28) }}>
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}>
                    {board.cells.map((ch, i) => {
                        const k = path.indexOf(i);
                        const on = k >= 0;
                        const inFound = board.placed.some((p) => found.includes(p.word) && p.path.includes(i));
                        return (
                            <motion.button
                                key={i}
                                onClick={() => tap(i)}
                                animate={flash === 'ok' && on ? { scale: [1, 1.15, 1] } : {}}
                                aria-label={`Chữ ${ch}`}
                                className="relative flex aspect-square items-center justify-center rounded-2xl border text-2xl font-bold uppercase transition-colors"
                                style={{
                                    background: on ? c : inFound ? tint(c, 22) : 'var(--color-surface)',
                                    borderColor: hintCell === i ? 'var(--color-warning)' : on ? c : inFound ? edge(c, 50) : 'var(--color-line)',
                                    color: on ? 'var(--color-on-status)' : 'var(--color-ink)',
                                    boxShadow: hintCell === i ? '0 0 0 3px color-mix(in srgb, var(--color-warning) 40%, transparent)' : undefined,
                                }}
                            >
                                {ch}
                                {on && <span className="absolute right-1.5 top-0.5 font-mono text-[9px] opacity-60">{k + 1}</span>}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex h-12 flex-1 items-center justify-center rounded-2xl border border-line bg-surface font-mono text-xl uppercase tracking-[0.3em] text-ink" aria-live="polite">
                    <AnimatePresence mode="wait">
                        <motion.span key={spelled || 'empty'} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={flash === 'ok' ? 'text-accent' : ''}>
                            {spelled || <span className="text-subtle text-sm normal-case tracking-normal">Chạm các chữ liền kề</span>}
                        </motion.span>
                    </AnimatePresence>
                </div>
                <button onClick={() => setPath([])} aria-label="Xoá" className="h-12 w-12 rounded-2xl border border-line bg-surface text-muted flex items-center justify-center">
                    <Eraser className="h-5 w-5" />
                </button>
                <button onClick={hint} aria-label={`Gợi ý, trừ ${HINT_COST} điểm`} className="h-12 w-12 rounded-2xl border border-line bg-surface text-warning flex items-center justify-center">
                    <Lightbulb className="h-5 w-5" />
                </button>
            </div>
            <p className="text-center text-xs text-subtle">Chữ liền kề kể cả đường chéo, không dùng một ô hai lần. Từ dài điểm cao hơn nhiều.</p>
        </div>
    );
}
