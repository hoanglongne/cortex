'use client';

import { useMemo, useState } from 'react';
import type { GameAnswer, GameCard } from '../lib/games/rounds';
import { matchBoard } from '../lib/games/rounds';
import { Bar, Over } from './Shell';

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

    const total = new Set(board.map((t) => t.pair)).size;
    const score = Math.max(0, done.length * 20 - misses * 5);
    const answers: GameAnswer[] = [...new Set(board.map((t) => t.pair))].map((id) => ({ cardId: id, correct: !wrong.includes(id) }));

    return (
        <div className="space-y-4">
            <Bar title="Ghép" score={score} />
            {done.length === total ? (
                <Over score={score} answers={answers} onAgain={onAgain} line={`${misses} lần nhầm`} />
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    {board.map((t) => {
                        const on = done.includes(t.pair);
                        const state = on ? 'opacity-30' : flash.includes(t.key) ? 'border-danger bg-danger/10' : open === t.key ? 'border-accent bg-accent/10' : '';
                        return (
                            <button key={t.key} onClick={() => tap(t.key)} disabled={on} className={`min-h-16 px-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink ${t.kind === 'word' ? 'font-semibold' : ''} ${state}`}>
                                {t.text}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
