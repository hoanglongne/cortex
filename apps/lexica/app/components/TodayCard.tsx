'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, BookOpen, Check, Mic, Plus, RotateCcw } from 'lucide-react';
import { ringArcs } from '../lib/journey/ring';
import { useTodayPlan } from '../hooks/useTodayPlan';
import { planLine, STAGE_LABEL, STAGE_TITLE, type Stage } from '../lib/journey/today';

const ARCS = ringArcs(4, 108, 120, 120, 18);

const STAGE_ICON: Record<Stage, React.ReactNode> = {
    review: <RotateCcw className="w-4 h-4" />,
    learn: <Plus className="w-4 h-4" />,
    read: <BookOpen className="w-4 h-4" />,
    speak: <Mic className="w-4 h-4" />,
};

/**
 * The one main button of the app (docs/LEXICA_DIRECTION.md): today's four
 * stages as a path, how long they take, and where the learner is on it.
 * Everything else on Home is secondary.
 */
export default function TodayCard() {
    const { plan } = useTodayPlan();
    const doneCount = plan.stages.filter((s) => s.status === 'done').length;
    const started = doneCount > 0;
    const next = plan.stages.find((s) => s.status === 'todo')?.stage;
    const still = useReducedMotion();

    return (
        <section data-testid="today-card" className="w-full rounded-3xl border border-line bg-surface p-5 sm:p-6">
            <div className="flex items-baseline justify-between gap-3">
                <p className="font-mono text-[11px] uppercase tracking-wider text-accent">Hôm nay</p>
                {!plan.complete && <p className="font-mono text-[11px] text-muted">~{plan.minutes} phút</p>}
            </div>
            <h2 className="mt-1.5 text-2xl font-semibold text-ink">{plan.complete ? 'Xong hôm nay' : started ? 'Tiếp tục phiên hôm nay' : 'Phiên học hôm nay'}</h2>
            {next && <p className="mt-1 text-sm text-muted">Tiếp theo: {STAGE_TITLE[next].toLowerCase()}</p>}

            {/* The four stages as a ring of arcs around the one button (issue #146); their names sit below, not on the ring */}
            <div className="relative mx-auto mt-5 h-44 w-44">
                <svg viewBox="0 0 240 240" className="absolute inset-0 h-full w-full" aria-hidden>
                    {ARCS.map((d, i) => {
                        const s = plan.stages[i];
                        const isNext = s.stage === next;
                        return (
                            <g key={s.stage}>
                                <path d={d} fill="none" strokeWidth="12" strokeLinecap="round" className={s.status === 'empty' ? 'stroke-surface-3/40' : 'stroke-surface-3'} />
                                {(s.status === 'done' || isNext) && (
                                    <motion.path
                                        d={d}
                                        fill="none"
                                        strokeWidth="12"
                                        strokeLinecap="round"
                                        className={s.status === 'done' ? 'stroke-accent' : 'stroke-accent/40'}
                                        initial={still ? false : { pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 0.5, delay: i * 0.1 }}
                                    />
                                )}
                            </g>
                        );
                    })}
                </svg>
                <div className="absolute inset-[22%] flex items-center justify-center">
                    {plan.complete ? (
                        <span className="flex h-full w-full flex-col items-center justify-center rounded-full border border-accent/40 text-accent">
                            <Check className="h-7 w-7" />
                            <span className="mt-0.5 text-xs font-semibold">Xong</span>
                        </span>
                    ) : (
                        <Link
                            href="/today"
                            data-testid="today-start"
                            className="flex h-full w-full flex-col items-center justify-center rounded-full bg-accent text-on-accent transition active:scale-95 hover:bg-accent-strong"
                        >
                            <ArrowRight className="h-6 w-6" />
                            <span className="mt-0.5 text-sm font-bold">{started ? `Tiếp (${doneCount}/4)` : 'Bắt đầu'}</span>
                        </Link>
                    )}
                </div>
            </div>
            <ol className="mt-4 grid grid-cols-4 gap-2" aria-label="Các chặng">
                {plan.stages.map((s) => (
                    <li key={s.stage} className="flex flex-col items-center gap-1 text-center">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full border ${s.status === 'done' ? 'border-accent bg-accent text-on-accent' : s.stage === next ? 'border-accent text-accent' : 'border-line text-muted'}`}>
                            {s.status === 'done' ? <Check className="w-3.5 h-3.5" /> : STAGE_ICON[s.stage]}
                        </span>
                        <span className={`text-xs font-semibold ${s.status === 'empty' ? 'text-subtle line-through' : 'text-ink'}`}>{STAGE_LABEL[s.stage]}</span>
                    </li>
                ))}
            </ol>

            {plan.complete ? (
                <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link href="/today" className="h-12 px-5 rounded-xl border border-line-strong bg-surface text-ink font-semibold flex items-center gap-2 hover:border-accent">
                        Xem kết quả hôm nay
                    </Link>
                    {/* Another round of the four stages: new words, a reading and speaking. */}
                    <Link href="/today?more=1" className="h-12 px-4 rounded-xl text-sm text-muted hover:text-ink flex items-center gap-1.5">
                        <Plus className="w-4 h-4" /> Học thêm
                    </Link>
                </div>
            ) : (
                <p className="mt-3 text-center font-mono text-[11px] text-muted">{planLine(plan)}</p>
            )}
        </section>
    );
}
