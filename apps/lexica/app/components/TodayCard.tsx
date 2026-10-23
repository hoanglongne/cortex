'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Check, Mic, Plus, RotateCcw } from 'lucide-react';
import { useTodayPlan } from '../hooks/useTodayPlan';
import { planLine, STAGE_LABEL, STAGE_MINUTES, STAGE_TITLE, type Stage } from '../lib/journey/today';

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

    return (
        <section data-testid="today-card" className="w-full rounded-3xl border border-accent/40 bg-gradient-to-b from-accent/10 to-accent/[0.03] p-5 sm:p-6">
            <div className="flex items-baseline justify-between gap-3">
                <p className="font-mono text-[11px] uppercase tracking-wider text-accent">Hôm nay</p>
                {!plan.complete && <p className="font-mono text-[11px] text-muted">~{plan.minutes} phút</p>}
            </div>
            <h2 className="mt-1.5 text-2xl font-semibold text-ink">{plan.complete ? 'Xong hôm nay' : started ? 'Tiếp tục phiên hôm nay' : 'Phiên học hôm nay'}</h2>
            {next && <p className="mt-1 text-sm text-muted">Tiếp theo: {STAGE_TITLE[next].toLowerCase()}</p>}

            {/* The four stages as one path: done, next, still to come, or nothing to do today */}
            <ol className="mt-5 grid grid-cols-4" aria-label="Các chặng">
                {plan.stages.map((s, i) => {
                    const isNext = s.stage === next;
                    const dot =
                        s.status === 'done'
                            ? 'bg-accent text-on-accent border-accent'
                            : isNext
                              ? 'bg-surface text-accent border-accent ring-4 ring-accent/15'
                              : s.status === 'empty'
                                ? 'bg-transparent text-subtle border-line border-dashed'
                                : 'bg-surface text-muted border-line-strong';
                    return (
                        <li key={s.stage} className="relative flex flex-col items-center text-center">
                            {i > 0 && <span aria-hidden className={`absolute top-5 right-1/2 w-full h-0.5 -translate-y-1/2 ${plan.stages[i - 1].status === 'done' ? 'bg-accent/60' : 'bg-line'}`} />}
                            <span className={`relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${dot}`}>
                                {s.status === 'done' ? <Check className="w-4 h-4" /> : STAGE_ICON[s.stage]}
                            </span>
                            <span className={`mt-1.5 text-sm font-semibold ${s.status === 'empty' ? 'text-subtle' : 'text-ink'}`}>{STAGE_LABEL[s.stage]}</span>
                            <span className="font-mono text-[10px] text-muted">{s.status === 'empty' ? 'không có' : s.status === 'done' ? 'xong' : `~${STAGE_MINUTES[s.stage]}′`}</span>
                        </li>
                    );
                })}
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
                <>
                    <Link
                        href="/today"
                        data-testid="today-start"
                        className="mt-6 h-14 w-full rounded-2xl bg-accent hover:bg-accent-strong text-on-accent font-bold text-lg flex items-center justify-center gap-2 active:scale-[0.99] transition"
                    >
                        {started ? `Tiếp tục (${doneCount}/4)` : 'Bắt đầu hôm nay'} <ArrowRight className="w-5 h-5" />
                    </Link>
                    <p className="mt-2 text-center font-mono text-[11px] text-muted">{planLine(plan)}</p>
                </>
            )}
        </section>
    );
}
