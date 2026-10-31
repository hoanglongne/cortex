'use client';

import { useMemo, useState } from 'react';
import type { GameAnswer, GameCard } from '../lib/games/rounds';
import { matchBoard } from '../lib/games/rounds';
import { Bar, Over } from './Shell';
import { edge, GAME_COLOR, tint } from './theme';

const PAIR_HUES = ['var(--color-game-sky)', 'var(--color-game-coral)', 'var(--color-game-mint)', 'var(--color-warning)', 'var(--color-accent)', 'var(--color-game-violet)'];

const PAIRS = 6;

/** Ghép: tap a word, then its meaning. Fewer wrong taps, higher score. */
export default function MatchGame({ cards, onAgain }: { cards: GameCard[]; onAgain: () => void }) {
    const board = useMemo(() => matchBoard(cards, PAIRS), [cards]);
    const [open, setOpen] = useState<string | null>(null);
    const [done, setDone] = useState<string[]>([]);
    const [wrong, setWrong] = useState<string[]>([]);
    const [misses, setMisses] = useState(0);
    const [flash, setFlash] = useState<string[]>([]);

    const tap = (key: string) => {
        if (flash.length || done.includes(board.find((t) => t.key === key)!.pair)) return;
        if (!open) return setOpen(key);
        if (open === key) return setOpen(null);
        const a = board.find((t) => t.key === open)!;
        const b = board.find((t) => t.key === key)!;
        if (a.pair === b.pair && a.kind !== b.kind) {
            setDone([...done, a.pair]);
            setOpen(null);
        } else {
            setMisses(misses + 1);
            setWrong([...new Set([...wrong, a.pair, b.pair])]);
            setFlash([open, key]);
            setTimeout(() => {
                setFlash([]);
                setOpen(null);
            }, 600);
        }
    };

    const order = [...new Set(board.map((t) => t.pair))];
    const total = order.length;
    const score = Math.max(0, done.length * 20 - misses * 5);
    const answers: GameAnswer[] = [...new Set(board.map((t) => t.pair))].map((id) => ({ cardId: id, correct: !wrong.includes(id) }));

    return (
        <div className="space-y-4">
            <Bar game="match" title="Ghép" score={score} progress={done.length / PAIRS} />
            {done.length === total ? (
                <Over game="match" score={score} answers={answers} onAgain={onAgain} line={`${misses} lần nhầm`} />
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    {board.map((t) => {
                        const on = done.includes(t.pair);
                        const hue = PAIR_HUES[order.indexOf(t.pair) % PAIR_HUES.length];
                        const style = on
                            ? { background: tint(hue, 22), borderColor: edge(hue, 60) }
                            : open === t.key
                              ? { background: tint(GAME_COLOR.match, 22), borderColor: GAME_COLOR.match }
                              : flash.includes(t.key)
                                ? { background: 'color-mix(in srgb, var(--color-danger) 16%, var(--color-surface))', borderColor: 'var(--color-danger)' }
                                : undefined;
                        return (
                            <button key={t.key} onClick={() => tap(t.key)} disabled={on} style={style} className={`min-h-16 px-3 py-2 rounded-2xl border border-line bg-surface text-sm text-ink transition-colors ${t.kind === 'word' ? 'font-semibold' : ''}`}>
                                {t.text}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
