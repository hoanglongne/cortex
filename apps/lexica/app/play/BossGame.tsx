'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Heart, Shield, Sparkles, Swords, X } from 'lucide-react';
import { answer, CRIT_COMBO, fightScore, liveScore, newFight, over, SHIELD_COMBO, STRIKE_SECONDS, won, type Strike } from '../lib/games/boss';
import type { BossRound, GameAnswer } from '../lib/games/rounds';
import { Bar, Over } from './Shell';
import { ANSWER_LETTER, ANSWER_TILE, edge, tint } from './theme';

const NAME = { blitz: 'Từ nghĩa', detective: 'Manh mối', liar: 'Cụm giả', cloze: 'Điền câu', upgrade: 'Nâng cấp' } as const;
const FEEDBACK: Record<Strike, string> = { hit: 'Trúng!', crit: 'ĐÒN MẠNH!', blocked: 'Khiên đỡ đòn', hurt: 'Trùm đánh trúng bạn', late: 'Hết giờ, trùm tấn công' };

/** The boss: a face that flinches when hurt and grins when it hits. */
function Boss({ life, state }: { life: number; state: 'idle' | 'hurt' | 'angry' }) {
    return (
        <motion.div animate={state === 'hurt' ? { x: [0, -10, 10, -6, 6, 0], rotate: [0, -4, 4, 0] } : state === 'angry' ? { scale: [1, 1.12, 1] } : { y: [0, -4, 0] }} transition={state === 'idle' ? { repeat: Infinity, duration: 2.4 } : { duration: 0.45 }} className="mx-auto w-40">
            <svg viewBox="0 0 120 110" aria-label={`Trùm còn ${life}% máu`} role="img">
                <path d="M18 98 C 4 60, 16 18, 60 14 C 104 18, 116 60, 102 98 C 88 106, 32 106, 18 98 Z" fill="var(--color-danger)" opacity={0.25 + life / 160} />
                <path d="M30 30 L 24 8 L 44 22 M 90 30 L 96 8 L 76 22" fill="none" stroke="var(--color-danger)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                {state === 'hurt' ? (
                    <>
                        <path d="M38 52 L 52 60 M 52 52 L 38 60 M 68 52 L 82 60 M 82 52 L 68 60" stroke="var(--color-ink)" strokeWidth="4" strokeLinecap="round" />
                        <path d="M46 82 Q 60 74 74 82" fill="none" stroke="var(--color-ink)" strokeWidth="4" strokeLinecap="round" />
                    </>
                ) : (
                    <>
                        <circle cx="45" cy="55" r="9" fill="var(--color-ink)" />
                        <circle cx="75" cy="55" r="9" fill="var(--color-ink)" />
                        <circle cx="47" cy="57" r="4" fill="var(--color-danger)" />
                        <circle cx="77" cy="57" r="4" fill="var(--color-danger)" />
                        <path d="M40 40 L 54 46 M 80 40 L 66 46" stroke="var(--color-ink)" strokeWidth="4" strokeLinecap="round" />
                        <path d={state === 'angry' ? 'M40 78 Q 60 98 80 78' : 'M44 82 Q 60 90 76 82'} fill="none" stroke="var(--color-ink)" strokeWidth="4" strokeLinecap="round" />
                    </>
                )}
            </svg>
        </motion.div>
    );
}

/**
 * Trùm cuối: twelve questions in three phases against a boss with a life bar.
 * Quick and chained right answers hit harder; wrong or late ones cost a heart.
 * Chain three for a critical hit, five for a shield. One 50/50.
 */
export default function BossGame({ rounds, onAgain }: { rounds: BossRound[]; onAgain: () => void }) {
    const [fight, setFight] = useState(() => newFight(rounds.length));
    const [i, setI] = useState(0);
    const [picked, setPicked] = useState<number | null>(null);
    const [strike, setStrike] = useState<Strike | null>(null);
    const [hidden, setHidden] = useState<number[]>([]);
    const [left, setLeft] = useState(STRIKE_SECONDS);
    const [answers, setAnswers] = useState<GameAnswer[]>([]);
    const startedAt = useRef(0);
    const next = useRef<ReturnType<typeof setTimeout> | null>(null);
    const q = rounds[i];
    const finished = over(fight, rounds.length);

    useEffect(() => {
        startedAt.current = Date.now();
    }, [i]);
    useEffect(() => () => { if (next.current) clearTimeout(next.current); }, []);

    const settle = (correct: boolean, late: boolean, choice: number | null) => {
        if (picked !== null || strike !== null || finished) return;
        const ms = late ? null : Date.now() - startedAt.current;
        const r = answer(fight, correct, ms);
        setPicked(choice ?? -1);
        setStrike(r.strike);
        setFight(r.fight);
        setAnswers((a) => [...a, { cardId: q.cardId, correct }]);
        next.current = setTimeout(() => {
            setPicked(null);
            setStrike(null);
            setHidden([]);
            setLeft(STRIKE_SECONDS);
            setI((x) => x + 1);
        }, correct ? 900 : 1500);
    };

    // The boss's clock: it strikes when time runs out
    useEffect(() => {
        if (finished || picked !== null) return;
        const t = setInterval(() => setLeft((l) => l - 1), 1000);
        return () => clearInterval(t);
    }, [finished, picked, i]);
    useEffect(() => {
        if (left <= 0) settle(false, true, null);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- once when the clock runs out
    }, [left]);

    const fifty = () => {
        if (fight.fiftyLeft <= 0 || picked !== null) return;
        const wrong = q.options.map((_, n) => n).filter((n) => n !== q.answer);
        setHidden(wrong.sort(() => Math.random() - 0.5).slice(0, 2));
        setFight({ ...fight, fiftyLeft: 0 });
    };

    if (finished) {
        const win = won(fight);
        return (
            <div className="space-y-4">
                <Bar game="boss" title="Trùm cuối" score={fightScore(fight)} progress={1 - fight.boss / 100} />
                <Over game="boss" score={fightScore(fight)} answers={answers} onAgain={onAgain} line={win ? 'Trùm đã gục' : `Trùm còn ${fight.boss}% máu`} />
            </div>
        );
    }

    const face = strike === 'hit' || strike === 'crit' ? 'hurt' : strike === 'hurt' || strike === 'late' ? 'angry' : 'idle';
    const critReady = fight.combo % CRIT_COMBO === CRIT_COMBO - 1;
    return (
        <div className="space-y-4">
            <Bar game="boss" title="Trùm cuối" score={liveScore(fight)} progress={1 - fight.boss / 100} />

            {/* The boss and its life */}
            <div className="relative rounded-3xl border p-4" style={{ background: tint('var(--color-danger)', 8), borderColor: edge('var(--color-danger)', 32) }}>
                <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                        {Array.from({ length: 3 }, (_, n) => (
                            <Heart key={n} className={`h-4 w-4 ${n < fight.hearts ? 'fill-danger text-danger' : 'text-subtle'}`} />
                        ))}
                        {fight.shield && <Shield className="ml-1 h-4 w-4 text-game-sky" style={{ color: 'var(--color-game-sky)' }} aria-label="Khiên sẵn sàng" />}
                    </span>
                    <span className={`font-mono ${left <= 5 ? 'text-danger' : 'text-muted'}`}>{left}s</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-3">
                    <motion.div className="h-full rounded-full bg-danger" animate={{ width: `${fight.boss}%` }} transition={{ type: 'spring', stiffness: 120, damping: 18 }} />
                </div>
                <div className="mt-3">
                    <Boss life={fight.boss} state={face} />
                </div>
                <AnimatePresence>
                    {strike && (
                        <motion.p key={`${i}-${strike}`} initial={{ opacity: 0, y: 10, scale: 0.8 }} animate={{ opacity: 1, y: -4, scale: 1 }} exit={{ opacity: 0 }} className={`absolute inset-x-0 bottom-3 text-center font-bold ${strike === 'crit' ? 'text-warning text-lg' : strike === 'hit' ? 'text-accent' : strike === 'blocked' ? 'text-ink' : 'text-danger'}`}>
                            {FEEDBACK[strike]}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex items-center justify-between text-xs text-muted">
                <span className="rounded-md px-2 py-0.5 font-mono uppercase tracking-wide" style={{ background: edge('var(--color-danger)', 16), color: 'var(--color-danger)' }}>
                    {NAME[q.mode]} · {i + 1}/{rounds.length}
                </span>
                <span className="flex items-center gap-1.5">
                    {fight.combo > 0 && (
                        <span className="flex items-center gap-1 font-semibold text-warning">
                            <Sparkles className="h-3.5 w-3.5" /> ×{fight.combo}
                            {critReady && <span className="text-[10px]">đòn mạnh kế tiếp</span>}
                            {fight.combo % SHIELD_COMBO === SHIELD_COMBO - 1 && !fight.shield && <span className="text-[10px]">khiên kế tiếp</span>}
                        </span>
                    )}
                    <button onClick={fifty} disabled={fight.fiftyLeft <= 0 || picked !== null} className="h-7 rounded-lg border border-line px-2 font-semibold text-ink-2 disabled:opacity-40">
                        50/50
                    </button>
                </span>
            </div>

            {/* The question */}
            <div className="rounded-2xl border border-line bg-surface p-4 space-y-2">
                {q.mode === 'detective' ? (
                    q.clues?.map((c, k) => (
                        <p key={k} className="text-ink text-sm">
                            <span className="mr-2 font-mono text-xs text-game-sky" style={{ color: 'var(--color-game-sky)' }}>#{k + 1}</span>
                            {c}
                        </p>
                    ))
                ) : (
                    <p lang={q.mode === 'blitz' ? undefined : 'en'} className="whitespace-pre-line text-lg font-semibold text-ink">
                        {q.mode === 'liar' ? 'Cụm nào bị tráo từ?' : q.prompt}
                    </p>
                )}
            </div>
            <div className="grid gap-2.5">
                {q.options.map((o, n) => {
                    if (hidden.includes(n)) return <div key={n} className="h-14 rounded-2xl border border-dashed border-line opacity-30" />;
                    const isRight = picked !== null && n === q.answer;
                    const isWrong = picked === n && n !== q.answer;
                    return (
                        <button
                            key={n}
                            onClick={() => settle(n === q.answer, false, n)}
                            disabled={picked !== null}
                            className={`flex min-h-14 items-center gap-3 rounded-2xl border px-3 py-2 text-left text-ink transition-colors ${picked !== null && !isRight && !isWrong ? 'opacity-40' : ''} ${isRight ? 'border-accent bg-accent text-on-accent' : isWrong ? 'border-danger bg-danger/15' : 'border-line bg-surface hover:border-line-strong'}`}
                        >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold text-on-arena" style={{ background: isRight ? 'rgb(0 0 0 / 0.25)' : ANSWER_TILE[n % 4] }}>
                                {isRight ? <Check className="h-4 w-4" /> : isWrong ? <X className="h-4 w-4" /> : ANSWER_LETTER[n % 4]}
                            </span>
                            <span className="flex-1">{o}</span>
                        </button>
                    );
                })}
            </div>
            <p className="flex items-center justify-center gap-1.5 text-xs text-subtle">
                <Swords className="h-3.5 w-3.5" /> Đúng nhanh thì đau hơn. Đúng liền ba câu là đòn mạnh.
            </p>
        </div>
    );
}
