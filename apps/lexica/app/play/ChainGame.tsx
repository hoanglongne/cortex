'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { botReply, CHANCES, check, makeDict, MESSAGES, TURN_SECONDS, wordScore, type Dict } from '../lib/games/chain';
import type { GameAnswer, GameCard } from '../lib/games/rounds';
import { Bar, Over } from './Shell';
import { edge, GAME_COLOR, tint } from './theme';

let dictPromise: Promise<Dict> | null = null;
/** The two word lists load once, the first time the game opens. */
const loadDict = () =>
    (dictPromise ??= Promise.all([fetch('/words-en.txt').then((r) => r.text()), fetch('/words-common.txt').then((r) => r.text())]).then(([valid, common]) => makeDict(valid, common)));

/**
 * Nối chuỗi: each word starts with the last letter of the one before. Any real
 * English word counts (checked against a dictionary); words you have learnt score
 * much more. 20 seconds a turn and three rejected words. No hints.
 */
export default function ChainGame({ known, bank, onAgain }: { known: GameCard[]; bank: GameCard[]; onAgain: () => void }) {
    const [dict, setDict] = useState<Dict | null>(null);
    const [failed, setFailed] = useState(false);
    useEffect(() => {
        let live = true;
        loadDict().then((d) => live && setDict(d), () => live && setFailed(true));
        return () => {
            live = false;
        };
    }, []);
    if (failed) return <p className="rounded-2xl border border-line bg-surface p-4 text-sm text-ink-2">Không tải được từ điển. Kiểm tra kết nối rồi thử lại.</p>;
    if (!dict) return <p className="text-center text-sm text-muted">Đang tải từ điển...</p>;
    return <Chain dict={dict} known={known} bank={bank} onAgain={onAgain} />;
}

function Chain({ dict, known, bank, onAgain }: { dict: Dict; known: GameCard[]; bank: GameCard[]; onAgain: () => void }) {
    const learnt = useMemo(() => new Map([...known, ...bank.filter((b) => known.some((k) => k.id === b.id))].map((c) => [c.word.trim().toLowerCase(), c.id])), [known, bank]);
    const extra = useMemo(() => new Set(learnt.keys()), [learnt]);
    const [chain, setChain] = useState<{ who: 'me' | 'cpu'; word: string }[]>(() => [{ who: 'cpu', word: botReply('a', new Set(), dict, Math.random) ?? 'start' }]);
    const [typed, setTyped] = useState('');
    const [msg, setMsg] = useState('');
    const [chances, setChances] = useState(CHANCES);
    const [left, setLeft] = useState(TURN_SECONDS);
    const [end, setEnd] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState<GameAnswer[]>([]);
    const busy = useRef(false);
    const c = GAME_COLOR.chain;
    const used = new Set(chain.map((x) => x.word));
    const last = chain[chain.length - 1].word;

    useEffect(() => {
        if (end) return;
        const t = setInterval(() => setLeft((l) => l - 1), 1000);
        return () => clearInterval(t);
    }, [end, chain.length]);
    useEffect(() => {
        if (left <= 0 && !end) setEnd('Hết giờ');
    }, [left, end]);

    const play = () => {
        const w = typed.trim().toLowerCase();
        if (!w || busy.current || end) return;
        const verdict = check(last, w, used, dict, extra);
        if (verdict !== 'ok') {
            setMsg(MESSAGES[verdict]);
            if (verdict !== 'start') {
                // A rejected word costs a chance; a wrong first letter is just a slip
                const next = chances - 1;
                setChances(next);
                if (next <= 0) setEnd('Hết lượt thử');
            }
            return;
        }
        busy.current = true;
        const cardId = learnt.get(w);
        if (cardId) setAnswers((a) => [...a, { cardId, correct: true }]);
        setScore((s) => s + wordScore(w, Boolean(cardId)));
        setTyped('');
        setMsg('');
        const after = new Set(used).add(w);
        const reply = botReply(w, after, dict);
        if (!reply) {
            setChain((x) => [...x, { who: 'me', word: w }]);
            setScore((s) => s + 100);
            setEnd('Máy hết từ, bạn thắng');
            busy.current = false;
            return;
        }
        setChain((x) => [...x, { who: 'me', word: w }, { who: 'cpu', word: reply }]);
        setLeft(TURN_SECONDS);
        busy.current = false;
    };

    if (end) {
        return (
            <div className="space-y-4">
                <Bar game="chain" title="Nối chuỗi" score={score} progress={1} />
                <Over game="chain" score={score} answers={answers} onAgain={onAgain} line={`${end} · ${chain.filter((x) => x.who === 'me').length} từ`} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Bar game="chain" title="Nối chuỗi" score={score} progress={left / TURN_SECONDS} right={<span className={`mr-1 ${left <= 5 ? 'text-danger' : 'text-subtle'}`}>{left}s</span>} />
            <div className="flex items-center justify-end gap-1" aria-label={`Còn ${chances} lượt thử`}>
                {Array.from({ length: CHANCES }, (_, n) => (
                    <Heart key={n} className={`h-4 w-4 ${n < chances ? 'fill-danger text-danger' : 'text-subtle'}`} />
                ))}
            </div>
            <motion.div key={last} initial={{ scale: 0.96, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }} className="rounded-3xl border p-5 text-center" style={{ background: tint(c, 10), borderColor: edge(c, 36) }}>
                <p className="text-xs text-muted">Từ của máy, nối tiếp bằng chữ cuối</p>
                <p className="mt-1 text-4xl font-bold tracking-tight text-ink">
                    {last.slice(0, -1)}
                    <span style={{ color: c }}>{last.slice(-1)}</span>
                </p>
            </motion.div>
            <ol className="flex flex-wrap gap-1.5" aria-label="Chuỗi từ">
                {chain.slice(-12).map((x, k) => (
                    <li key={`${k}-${x.word}`} className={`px-2 py-1 rounded-lg text-xs border ${x.who === 'me' ? 'border-accent/40 text-accent' : 'border-line text-muted'}`}>
                        {x.word}
                    </li>
                ))}
            </ol>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    play();
                }}
                className="flex gap-2"
            >
                <input value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus autoCapitalize="off" autoCorrect="off" spellCheck={false} aria-label="Từ của bạn" placeholder={`Một từ bắt đầu bằng "${last.slice(-1).toUpperCase()}"`} className="flex-1 h-12 px-4 rounded-xl border border-line bg-surface text-ink" />
                <button type="submit" className="h-12 px-5 rounded-xl font-bold text-on-status" style={{ background: c }}>
                    Nối
                </button>
            </form>
            {msg && <p className="text-xs text-warning">{msg}</p>}
            <p className="text-xs text-subtle">Mọi từ tiếng Anh đúng chính tả đều được. Từ bạn đã học được nhiều điểm hơn nhiều.</p>
        </div>
    );
}
