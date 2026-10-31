'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Flame, Volume2, X } from 'lucide-react';
import { AudioService } from '../lib/audio/AudioService';
import { detectivePoints, type Choice, type GameAnswer } from '../lib/games/rounds';
import { Bar, Over } from './Shell';
import { ANSWER_LETTER, ANSWER_TILE, edge, GAME_COLOR, tint } from './theme';

export type McqMode = 'blitz' | 'detective' | 'liar' | 'listen' | 'cloze' | 'upgrade';

const TITLE: Record<McqMode, string> = { blitz: 'Chớp', detective: 'Thám tử từ', liar: 'Từ nói dối', listen: 'Nghe và bắt từ', cloze: 'Điền đoạn', upgrade: 'Nâng cấp câu' };
const BLITZ_SECONDS = 60;

/**
 * One screen for the four choice games: Chớp runs against a 60 s clock with a
 * streak; the others go round by round (the detective pays more for fewer
 * clues). The rounds come ready from lib/games/rounds.ts.
 */
export default function McqGame({ mode, rounds, onAgain }: { mode: McqMode; rounds: Choice[]; onAgain: () => void }) {
    const [i, setI] = useState(0);
    const [picked, setPicked] = useState<number | null>(null);
    const [clues, setClues] = useState(1);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [answers, setAnswers] = useState<GameAnswer[]>([]);
    const [left, setLeft] = useState(BLITZ_SECONDS);
    const timeUp = mode === 'blitz' && left <= 0;
    const over = timeUp || i >= rounds.length;
    const q = rounds[i];
    const advance = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (mode !== 'blitz' || over) return;
        const t = setInterval(() => setLeft((l) => l - 1), 1000);
        return () => clearInterval(t);
    }, [mode, over]);
    useEffect(() => () => { if (advance.current) clearTimeout(advance.current); }, []);
    useEffect(() => {
        if (mode === 'listen' && q && !over) void AudioService.play(q.cardId, 'word');
    }, [mode, q, over]);

    const clueList = useMemo(() => q?.clues ?? [], [q]);
    const shown = clueList.slice(0, clues);

    const choose = (n: number) => {
        if (picked !== null || !q) return;
        const right = n === q.answer;
        setPicked(n);
        setAnswers((a) => [...a, { cardId: q.cardId, correct: right }]);
        setStreak(right ? streak + 1 : 0);
        const gain = mode === 'detective' ? detectivePoints(clues, right) * 10 : right ? 10 + Math.min(streak, 5) * 2 : 0;
        setScore((s) => s + gain);
        advance.current = setTimeout(() => {
            setPicked(null);
            setClues(1);
            setI((x) => x + 1);
        }, right ? 700 : 1400);
    };

    if (over) {
        return (
            <div className="space-y-4">
                <Bar game={mode} title={TITLE[mode]} score={score} progress={1} />
                <Over game={mode} score={score} answers={answers} onAgain={onAgain} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Bar game={mode} title={TITLE[mode]} score={score} progress={mode === 'blitz' ? left / BLITZ_SECONDS : i / rounds.length} right={mode === 'blitz' ? <span className={`mr-1 ${left <= 10 ? 'text-danger' : 'text-subtle'}`}>{left}s</span> : undefined} />
            <div className="flex h-6 items-center justify-center">
                {mode !== 'blitz' ? (
                    <p className="text-xs text-subtle">
                        Câu {i + 1}/{rounds.length}
                    </p>
                ) : (
                    streak >= 2 && (
                        <motion.p key={streak} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-semibold text-warning" style={{ background: edge('var(--color-warning)', 16) }}>
                            <Flame className="h-3.5 w-3.5" /> Chuỗi đúng ×{streak}
                        </motion.p>
                    )
                )}
            </div>

            <div className="relative overflow-hidden rounded-3xl border p-5 space-y-3 min-h-32" style={{ background: tint(GAME_COLOR[mode], 9), borderColor: edge(GAME_COLOR[mode], 30) }}>
                <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full" style={{ background: edge(GAME_COLOR[mode], 12) }} />
                <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">{mode === 'blitz' ? 'Từ nào có nghĩa này?' : mode === 'liar' ? 'Tìm cụm bị tráo từ' : mode === 'cloze' ? 'Chọn từ điền vào chỗ trống' : mode === 'upgrade' ? 'Nâng cấp câu' : q.prompt}</p>
                {mode === 'detective' &&
                    shown.map((c, k) => (
                        <p key={k} className="text-ink">
                            <span className="font-mono text-xs text-accent mr-2">Manh mối {k + 1}</span>
                            {c}
                        </p>
                    ))}
                {(mode === 'blitz' || mode === 'liar') && <p className="text-lg font-semibold text-ink">{q.prompt}</p>}
                {(mode === 'cloze' || mode === 'upgrade') && <p lang="en" className="whitespace-pre-line text-lg text-ink">{q.prompt}</p>}
                {mode === 'listen' && (
                    <button onClick={() => void AudioService.play(q.cardId, 'word')} className="h-14 w-full rounded-xl border border-line bg-surface-2/40 text-ink flex items-center justify-center gap-2">
                        <Volume2 className="w-5 h-5" /> Nghe lại
                    </button>
                )}
            </div>

            {mode === 'detective' && picked === null && clues < clueList.length && (
                <button onClick={() => setClues(clues + 1)} className="w-full h-10 rounded-xl border border-line text-sm text-ink-2">
                    Xem thêm manh mối (ít điểm hơn)
                </button>
            )}

            <div className="grid gap-2.5">
                {q.options.map((o, n) => {
                    const isRight = picked !== null && n === q.answer;
                    const isWrong = picked === n && n !== q.answer;
                    return (
                        <motion.button
                            key={`${i}-${n}`}
                            onClick={() => choose(n)}
                            disabled={picked !== null}
                            animate={isWrong ? { x: [0, -8, 8, -6, 6, 0] } : isRight ? { scale: [1, 1.03, 1] } : {}}
                            transition={{ duration: 0.4 }}
                            className={`flex min-h-14 items-center gap-3 rounded-2xl border px-3 py-2 text-left text-ink transition-colors ${picked !== null && !isRight && !isWrong ? 'opacity-40' : ''} ${isRight ? 'border-accent bg-accent text-on-accent' : isWrong ? 'border-danger bg-danger/15' : 'border-line bg-surface hover:border-line-strong'}`}
                        >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold text-on-arena" style={{ background: isRight ? 'rgb(0 0 0 / 0.25)' : ANSWER_TILE[n % 4] }}>
                                {isRight ? <Check className="h-4 w-4" /> : isWrong ? <X className="h-4 w-4" /> : ANSWER_LETTER[n % 4]}
                            </span>
                            <span className="flex-1">{o}</span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
