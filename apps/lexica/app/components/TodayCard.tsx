'use client';

import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { useTodayPlan } from '../hooks/useTodayPlan';
import { useLexicaStore } from '../store/lexicaStore';
import { planLine, STAGE_LABEL, STAGE_MINUTES } from '../lib/journey/today';
import { BRANCH_LABEL, currentDay, PATH_DAYS } from '../lib/journey/path';
import { localDate } from '../lib/engagement/ghost';

/**
 * The one main button of the app (docs/LEXICA_DIRECTION.md): today's four
 * stages and how long they take. Everything else on Home is secondary.
 */
export default function TodayCard({ onLearnMore }: { onLearnMore: () => void }) {
    const { plan } = useTodayPlan();
    const path = useLexicaStore((s) => s.path);
    const daysDone = useLexicaStore((s) => s.daysDone);
    const day = path ? currentDay(path, daysDone, localDate()) : null;
    const doneCount = plan.stages.filter((s) => s.status === 'done').length;
    const started = doneCount > 0;

    return (
        <section data-testid="today-card" className="w-full rounded-2xl border-2 border-accent/50 bg-accent/5 p-5 sm:p-6">
            <p className="font-mono text-[11px] uppercase tracking-wider text-accent">
                Hôm nay{day ? ` · Ngày ${day}/${PATH_DAYS}` : ''}
                {path ? ` · ${BRANCH_LABEL[path.branch]}` : ''}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">{plan.complete ? 'Xong hôm nay' : started ? 'Tiếp tục phiên hôm nay' : 'Phiên học hôm nay'}</h2>
            <ol className="mt-4 grid grid-cols-4 gap-2" aria-label="Các chặng">
                {plan.stages.map((s) => (
                    <li
                        key={s.stage}
                        className={`rounded-xl border px-2 py-2 text-center ${s.status === 'done' ? 'border-accent/50 bg-accent/10' : s.status === 'empty' ? 'border-line/50 opacity-50' : 'border-line bg-surface'}`}
                    >
                        <p className="text-sm font-semibold text-ink flex items-center justify-center gap-1">
                            {s.status === 'done' && <Check className="w-3.5 h-3.5 text-accent" />}
                            {STAGE_LABEL[s.stage]}
                        </p>
                        <p className="font-mono text-[10px] text-muted">{s.status === 'empty' ? 'không có' : s.status === 'done' ? 'xong' : `~${STAGE_MINUTES[s.stage]}′`}</p>
                    </li>
                ))}
            </ol>
            {plan.complete ? (
                <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link href="/today" className="h-12 px-5 rounded-xl border border-line-strong bg-surface text-ink font-semibold flex items-center gap-2 hover:border-accent">
                        Xem kết quả hôm nay
                    </Link>
                    <button onClick={onLearnMore} className="text-sm text-muted hover:text-ink underline">
                        Học thêm từ mới
                    </button>
                </div>
            ) : (
                <Link
                    href="/today"
                    data-testid="today-start"
                    className="mt-5 h-14 w-full rounded-xl bg-accent hover:bg-accent-strong text-on-accent font-bold text-lg flex items-center justify-center gap-2 active:scale-[0.99] transition"
                >
                    {started ? `Tiếp tục (${doneCount}/4)` : 'Bắt đầu hôm nay'} <ArrowRight className="w-5 h-5" />
                </Link>
            )}
            {!plan.complete && <p className="mt-2 text-center font-mono text-[11px] text-muted">{planLine(plan)}</p>}
        </section>
    );
}
