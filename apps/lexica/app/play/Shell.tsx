'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import type { GameAnswer } from '../lib/games/rounds';

/** Top bar every game shares: back, title, and the running score. */
export function Bar({ title, score, right }: { title: string; score: number; right?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <Link href="/play" aria-label="Về trang chơi" className="w-10 h-10 -ml-2 flex items-center justify-center text-muted hover:text-ink">
                <ArrowLeft className="w-5 h-5" />
            </Link>
            <p className="font-semibold text-ink">{title}</p>
            <p className="min-w-10 text-right font-mono text-sm text-ink">
                {right}
                {score}
            </p>
        </div>
    );
}

/** The end of a game: score, how it went, and what it did to review. Applies the answers once. */
export function Over({ score, answers, onAgain, line }: { score: number; answers: GameAnswer[]; onAgain: () => void; line?: string }) {
    const applyGame = useLexicaStore((s) => s.applyGame);
    const done = useRef(false);
    useEffect(() => {
        if (done.current) return;
        done.current = true;
        if (answers.length) applyGame(answers, score);
    }, [answers, score, applyGame]);
    const right = answers.filter((a) => a.correct).length;
    return (
        <div data-testid="game-over" className="rounded-2xl border border-line bg-surface p-6 text-center space-y-3">
            <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">Kết quả</p>
            <p className="text-5xl font-bold text-ink">{score}</p>
            <p className="text-sm text-muted">
                {right}/{answers.length} đúng{line ? ` · ${line}` : ''}. Từ sai sẽ quay lại phần ôn của bạn.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
                <button onClick={onAgain} className="h-12 rounded-xl bg-accent text-on-accent font-bold flex items-center justify-center gap-2">
                    <RotateCcw className="w-4 h-4" /> Chơi lại
                </button>
                <Link href="/play" className="h-12 rounded-xl border border-line bg-surface text-ink font-medium flex items-center justify-center">
                    Chọn game khác
                </Link>
            </div>
        </div>
    );
}
