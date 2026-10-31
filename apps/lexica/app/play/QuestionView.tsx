'use client';

import { Check, X } from 'lucide-react';
import type { BossRound } from '../lib/games/rounds';
import { ANSWER_LETTER, ANSWER_TILE } from './theme';

/** A question of any kind and its four answer tiles (used by the boss and the run). */
export default function QuestionView({ q, picked, hidden = [], onPick }: { q: BossRound; picked: number | null; hidden?: number[]; onPick: (n: number) => void }) {
    return (
        <>
            <div className="rounded-2xl border border-line bg-surface p-4 space-y-2">
                {q.mode === 'detective' ? (
                    q.clues?.map((c, k) => (
                        <p key={k} className="text-ink text-sm">
                            <span className="mr-2 font-mono text-xs" style={{ color: 'var(--color-game-sky)' }}>#{k + 1}</span>
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
                            onClick={() => onPick(n)}
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
        </>
    );
}
