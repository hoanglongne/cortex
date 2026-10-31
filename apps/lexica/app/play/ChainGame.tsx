'use client';

import { useMemo, useState } from 'react';
import { chainOk, chainReplies, shuffle, type GameAnswer, type GameCard } from '../lib/games/rounds';
import { Bar, Over } from './Shell';

/**
 * Nối chuỗi: each word starts with the last letter of the one before. You
 * answer with a word you know (any word of your own list), the computer with
 * one from the whole bank. Whoever cannot, loses; used words are out.
 */
export default function ChainGame({ known, bank, onAgain }: { known: GameCard[]; bank: GameCard[]; onAgain: () => void }) {
    const mine = useMemo(() => new Map(known.map((c) => [c.word.trim().toLowerCase(), c])), [known]);
    const pool = useMemo(() => shuffle(bank.map((c) => c.word.trim())), [bank]);
    const [chain, setChain] = useState<{ who: 'me' | 'cpu'; word: string }[]>([{ who: 'cpu', word: pool.find((w) => /^[a-z]{4,7}$/i.test(w)) ?? 'start' }]);
    const [typed, setTyped] = useState('');
    const [msg, setMsg] = useState('');
    const [end, setEnd] = useState<'me' | 'cpu' | null>(null);
    const [answers, setAnswers] = useState<GameAnswer[]>([]);
    const used = new Set(chain.map((c) => c.word.toLowerCase()));
    const last = chain[chain.length - 1].word.toLowerCase();
    const score = chain.filter((c) => c.who === 'me').length * 10;

    const play = () => {
        const w = typed.trim().toLowerCase();
        const card = mine.get(w);
        if (!chainOk(last, w)) return setMsg(`Từ phải bắt đầu bằng "${last[last.length - 1].toUpperCase()}"`);
        if (used.has(w)) return setMsg('Từ này đã dùng rồi');
        if (!card) return setMsg('Chọn một từ trong danh sách bạn đã học');
        setAnswers([...answers, { cardId: card.id, correct: true }]);
        const nextUsed = new Set(used).add(w);
        const reply = chainReplies(w, pool, nextUsed)[0];
        setTyped('');
        setMsg('');
        if (!reply) {
            setChain([...chain, { who: 'me', word: w }]);
            return setEnd('me');
        }
        setChain([...chain, { who: 'me', word: w }, { who: 'cpu', word: reply }]);
    };
    // Words I could play now, to show as a gentle help after a stuck moment
    const hints = known.filter((c) => chainOk(last, c.word) && !used.has(c.word.trim().toLowerCase())).slice(0, 3);

    if (end || (hints.length === 0 && chain.length > 1)) {
        const won = end === 'me';
        return (
            <div className="space-y-4">
                <Bar game="chain" title="Nối chuỗi" score={score} />
                <Over game="chain" score={score} answers={answers} onAgain={onAgain} line={won ? 'Máy hết từ, bạn thắng' : 'Hết từ bạn biết để nối'} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Bar game="chain" title="Nối chuỗi" score={score} />
            <div className="rounded-2xl border border-line bg-surface p-4 space-y-2">
                <p className="text-xs text-subtle">Từ trước: bắt đầu bằng chữ cuối</p>
                <p className="text-2xl font-semibold text-ink">
                    {last.slice(0, -1)}
                    <span className="text-accent">{last.slice(-1)}</span>
                </p>
            </div>
            <ol className="flex flex-wrap gap-1.5" aria-label="Chuỗi từ">
                {chain.map((c, k) => (
                    <li key={k} className={`px-2 py-1 rounded-lg text-xs border ${c.who === 'me' ? 'border-accent/40 text-accent' : 'border-line text-muted'}`}>
                        {c.word}
                    </li>
                ))}
            </ol>
            <form onSubmit={(e) => { e.preventDefault(); play(); }} className="flex gap-2">
                <input value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus autoCapitalize="off" autoCorrect="off" spellCheck={false} aria-label="Từ của bạn" className="flex-1 h-12 px-4 rounded-xl border border-line bg-surface text-ink" />
                <button type="submit" className="h-12 px-5 rounded-xl bg-accent text-on-accent font-bold">Nối</button>
            </form>
            {msg && <p className="text-xs text-warning">{msg}</p>}
            <p className="text-xs text-subtle">Gợi ý: {hints.map((h) => h.word.toLowerCase()).join(', ')}</p>
        </div>
    );
}
