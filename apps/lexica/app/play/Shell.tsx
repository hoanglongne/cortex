'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { capture } from '../lib/productAnalytics';
import type { GameAnswer } from '../lib/games/rounds';
import { edge, GAME_COLOR, tint, type GameId } from './theme';

/** Top bar every game shares: back, title, the running score, and a thin progress line in the game's hue. */
export function Bar({ game, title, score, progress, right }: { game: GameId; title: string; score: number; progress?: number; right?: React.ReactNode }) {
    const c = GAME_COLOR[game];
    return (
        <div>
            <div className="flex items-center justify-between gap-3">
                <Link href="/play" aria-label="Về trang chơi" className="w-10 h-10 -ml-2 flex items-center justify-center text-muted hover:text-ink">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <p className="flex items-center gap-2 font-semibold text-ink">
                    <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
                    {title}
                </p>
                <p className="flex min-w-10 items-center justify-end gap-2 rounded-full px-3 py-1 font-mono text-sm text-ink" style={{ background: tint(c, 16) }}>
                    {right}
                    <motion.span key={score} initial={{ scale: 1.35 }} animate={{ scale: 1 }} className="tabular-nums" style={{ color: c }}>
                        {score}
                    </motion.span>
                </p>
            </div>
            {progress !== undefined && (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
                    <motion.div className="h-full rounded-full" style={{ background: c }} animate={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }} transition={{ ease: 'linear', duration: 0.4 }} />
                </div>
            )}
        </div>
    );
}

/** A number that counts up from 0 when it appears. */
function CountUp({ to }: { to: number }) {
    const v = useMotionValue(0);
    const text = useTransform(v, (n) => Math.round(n).toString());
    useEffect(() => {
        const a = animate(v, to, { duration: 0.9, ease: 'easeOut' });
        return () => a.stop();
    }, [to, v]);
    return <motion.span>{text}</motion.span>;
}

/** The end of a game: score, accuracy, and what it did to review. Applies the answers once. */
export function Over({ game, score, answers, onAgain, line }: { game: GameId; score: number; answers: GameAnswer[]; onAgain: () => void; line?: string }) {
    const applyGame = useLexicaStore((s) => s.applyGame);
    const done = useRef(false);
    useEffect(() => {
        if (done.current) return;
        done.current = true;
        if (answers.length) applyGame(answers, score);
        // Which games are played to the end, with what result (docs/LEXICA_GAMES_PLAN.md, how to measure)
        capture('game_finish', { game, score, right: answers.filter((a) => a.correct).length, total: answers.length });
    }, [answers, score, applyGame, game]);
    const c = GAME_COLOR[game];
    const right = answers.filter((a) => a.correct).length;
    const pct = answers.length ? Math.round((right / answers.length) * 100) : 0;
    const wrong = answers.length - right;
    return (
        <motion.div
            data-testid="game-over"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl border p-6 text-center"
            style={{ background: tint(c, 12), borderColor: edge(c, 40) }}
        >
            <span aria-hidden className="pointer-events-none absolute -left-8 -top-10 h-36 w-36 rounded-full" style={{ background: edge(c, 14) }} />
            <span aria-hidden className="pointer-events-none absolute -right-6 bottom-10 h-24 w-24 rounded-full" style={{ background: edge(c, 10) }} />
            <div className="relative space-y-4">
                <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-on-status" style={{ background: c }}>
                    <Trophy className="h-8 w-8" />
                </motion.span>
                <div>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-muted">Điểm của bạn</p>
                    <p className="text-6xl font-bold tabular-nums text-ink">
                        <CountUp to={score} />
                    </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                    <span className="rounded-full px-3 py-1.5 font-medium text-on-status" style={{ background: c }}>
                        {right}/{answers.length} đúng · {pct}%
                    </span>
                    {line && <span className="rounded-full border border-line bg-surface px-3 py-1.5 text-ink-2">{line}</span>}
                </div>
                <p className="mx-auto max-w-xs text-sm text-muted">{wrong > 0 ? `${wrong} từ sai sẽ quay lại phần ôn của bạn.` : 'Không từ nào sai. Những từ đúng được tính một lần nhớ.'}</p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                    <button onClick={onAgain} className="h-12 rounded-2xl font-bold text-on-status flex items-center justify-center gap-2" style={{ background: c }}>
                        <RotateCcw className="w-4 h-4" /> Chơi lại
                    </button>
                    <Link href="/play" className="h-12 rounded-2xl border border-line bg-surface text-ink font-medium flex items-center justify-center">
                        Game khác
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
