'use client';

import { useMemo, useState } from 'react';
import type { GameAnswer, GameCard } from '../lib/games/rounds';
import { spellOk, spellRounds } from '../lib/games/rounds';
import { Bar, Over } from './Shell';

const ROUNDS = 8;

/** Gõ: the meaning and "A _ _ _ _"; type the word. A wrong try shows the next letter once. */
export default function SpellGame({ cards, onAgain }: { cards: GameCard[]; onAgain: () => void }) {
    const rounds = useMemo(() => spellRounds(cards, ROUNDS), [cards]);
    const [i, setI] = useState(0);
    const [typed, setTyped] = useState('');
    const [tries, setTries] = useState(0);
    const [reveal, setReveal] = useState(false);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState<GameAnswer[]>([]);
    const q = rounds[i];

    if (!q) return (
        <div className="space-y-4">
            <Bar title="Gõ" score={score} />
            <Over score={score} answers={answers} onAgain={onAgain} />
        </div>
    );

    const next = (correct: boolean, gain: number) => {
        setAnswers((a) => [...a, { cardId: q.cardId, correct }]);
        setScore((s) => s + gain);
        setTyped('');
        setTries(0);
        setReveal(false);
        setI(i + 1);
    };
    const submit = () => {
        if (!typed.trim()) return;
        if (spellOk(typed, q.word)) return next(true, tries === 0 ? 20 : 10);
        if (tries + 1 >= 2) {
            setReveal(true);
            setTimeout(() => next(false, 0), 1500);
        } else {
            setTries(tries + 1);
            setTyped('');
        }
    };
    // After one miss the second letter shows
    const mask = tries > 0 ? q.mask.split(' ').map((c, k) => (k === 1 ? q.word[1].toLowerCase() : c)).join(' ') : q.mask;

    return (
        <div className="space-y-4">
            <Bar title="Gõ" score={score} />
            <p className="text-xs text-subtle text-center">
                Từ {i + 1}/{rounds.length}
            </p>
            <div className="rounded-2xl border border-line bg-surface p-5 text-center space-y-3">
                <p className="text-ink">{q.meaning}</p>
                <p data-testid="spell-mask" className="font-mono text-2xl tracking-widest text-ink">{reveal ? q.word : mask}</p>
                {tries > 0 && !reveal && <p className="text-xs text-warning">Chưa đúng, thử lại (đã mở thêm một chữ)</p>}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex gap-2">
                <input
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                    autoFocus
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    aria-label="Gõ từ tiếng Anh"
                    className="flex-1 h-12 px-4 rounded-xl border border-line bg-surface text-ink"
                    disabled={reveal}
                />
                <button type="submit" disabled={reveal} className="h-12 px-5 rounded-xl bg-accent text-on-accent font-bold">
                    Kiểm tra
                </button>
            </form>
        </div>
    );
}
