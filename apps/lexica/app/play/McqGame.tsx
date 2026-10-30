'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { AudioService } from '../lib/audio/AudioService';
import { detectivePoints, type Choice, type GameAnswer } from '../lib/games/rounds';
import { Bar, Over } from './Shell';

export type McqMode = 'blitz' | 'detective' | 'liar' | 'listen';

const TITLE: Record<McqMode, string> = { blitz: 'Chớp', detective: 'Thám tử từ', liar: 'Từ nói dối', listen: 'Nghe và bắt từ' };
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
                <Bar title={TITLE[mode]} score={score} />
                <Over score={score} answers={answers} onAgain={onAgain} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Bar title={TITLE[mode]} score={score} right={mode === 'blitz' ? <span className="mr-2 text-subtle">{left}s</span> : undefined} />
            {mode !== 'blitz' && (
                <p className="text-xs text-subtle text-center">
                    Câu {i + 1}/{rounds.length}
                </p>
            )}
            {mode === 'blitz' && streak >= 2 && <p className="text-xs text-warning text-center">Chuỗi đúng {streak}</p>}

            <div className="rounded-2xl border border-line bg-surface p-5 space-y-3 min-h-32">
                <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">{mode === 'blitz' ? 'Từ nào có nghĩa này?' : mode === 'liar' ? 'Tìm cụm bị tráo từ' : q.prompt}</p>
                {mode === 'detective' &&
                    shown.map((c, k) => (
                        <p key={k} className="text-ink">
                            <span className="font-mono text-xs text-accent mr-2">Manh mối {k + 1}</span>
                            {c}
                        </p>
                    ))}
                {(mode === 'blitz' || mode === 'liar') && <p className="text-lg font-semibold text-ink">{q.prompt}</p>}
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

            <div className="grid gap-2">
                {q.options.map((o, n) => {
                    const state = picked === null ? '' : n === q.answer ? 'border-accent bg-accent/10' : n === picked ? 'border-danger bg-danger/10' : 'opacity-50';
                    return (
                        <button key={n} onClick={() => choose(n)} disabled={picked !== null} className={`min-h-12 px-4 py-2 rounded-xl border border-line bg-surface text-ink text-left ${state}`}>
                            {o}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
