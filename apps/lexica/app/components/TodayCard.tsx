'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Check, Mic, Plus, RotateCcw } from 'lucide-react';
import { useTodayPlan } from '../hooks/useTodayPlan';
import { useLexicaStore } from '../store/lexicaStore';
import { getCard } from '../lib/content/repository';
import { planLine, STAGE_LABEL, STAGE_TITLE, type Stage } from '../lib/journey/today';
import WordFan from './brand/WordFan';
import { Burst } from './brand/Decor';
import { buttonClass } from './ui';

const STAGE_ICON: Record<Stage, React.ReactNode> = {
    review: <RotateCcw className="w-4 h-4" />,
    learn: <Plus className="w-4 h-4" />,
    read: <BookOpen className="w-4 h-4" />,
    speak: <Mic className="w-4 h-4" />,
};

/** The big line: what is waiting today, with the key word marked. */
function Headline({ review, learn }: { review: number; learn: number }) {
    const mark = (t: string) => <span className="rounded-lg bg-accent px-1.5 text-on-accent">{t}</span>;
    if (learn > 0 && review > 0) return <>{learn} thẻ mới đang chờ {mark('mở')}. {review} từ cần ôn.</>;
    if (learn > 0) return <>{learn} thẻ mới đang chờ {mark('mở')}.</>;
    if (review > 0) return <>{review} từ đang chờ {mark('ôn')}.</>;
    return <>Phiên hôm nay đã {mark('sẵn sàng')}.</>;
}

/**
 * The one main button of the app (docs/LEXICA_DIRECTION.md), direction B
 * (docs/LEXICA_UI_B_ROLLOUT.md D3): a big headline, the day's cards fanned
 * out in their topic colours, one lime button, and the four stages in a row.
 */
export default function TodayCard() {
    const { plan, reviewIds, newLeft } = useTodayPlan();
    const deck = useLexicaStore((s) => s.currentDeck);
    const doneCount = plan.stages.filter((s) => s.status === 'done').length;
    const started = doneCount > 0;
    const next = plan.stages.find((s) => s.status === 'todo')?.stage;
    const reviewLeft = plan.stages.find((s) => s.stage === 'review')?.status === 'todo' ? reviewIds.length : 0;
    const learnLeft = plan.stages.find((s) => s.stage === 'learn')?.status === 'todo' ? newLeft : 0;
    const fan = [...deck.map((c) => ({ id: c.id, word: c.word, scenario: c.scenario })), ...reviewIds.map((id) => getCard(id)).filter(Boolean).map((c) => ({ id: c!.id, word: c!.word, scenario: c!.scenario }))].slice(0, 3);

    return (
        <section data-testid="today-card" className="w-full">
            <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted">Hôm nay</p>
                {!plan.complete && <p className="font-mono text-[11px] text-muted whitespace-nowrap">~{plan.minutes} phút</p>}
            </div>

            {plan.complete ? (
                <div className="mt-3 flex items-center gap-5">
                    <Burst className="h-28 w-28 shrink-0">
                        <Check className="h-9 w-9" strokeWidth={3} />
                    </Burst>
                    <div>
                        <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-ink">Xong hôm nay</h2>
                        <p className="mt-1 text-sm text-muted">Mai quay lại, các từ sẽ chờ đúng lúc.</p>
                    </div>
                </div>
            ) : (
                <>
                    <h2 className="mt-2 text-[34px] font-extrabold leading-[1.05] tracking-tight text-ink lg:text-5xl">
                        <Headline review={reviewLeft} learn={learnLeft} />
                    </h2>
                    {next && <p className="mt-1.5 text-sm text-muted">Tiếp theo: {STAGE_TITLE[next].toLowerCase()}</p>}
                    <WordFan cards={fan} className="mt-4" />
                </>
            )}

            {plan.complete ? (
                <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link href="/today" className={buttonClass('secondary')}>Xem kết quả hôm nay</Link>
                    <Link href="/today?more=1" className={buttonClass('secondary', 'md', 'text-muted')}>
                        <Plus className="w-4 h-4" /> Học thêm
                    </Link>
                </div>
            ) : (
                <Link href="/today" data-testid="today-start" className={buttonClass('primary', 'lg', 'mt-4 w-full justify-between')}>
                    <span>{started ? `Tiếp tục (${doneCount}/4)` : 'Mở phiên hôm nay'}</span>
                    <span className="flex items-center gap-1 font-mono text-sm font-medium">{plan.minutes}′ <ArrowRight className="h-5 w-5" /></span>
                </Link>
            )}

            <ol className="mt-4 grid grid-cols-4 gap-2" aria-label="Các chặng">
                {plan.stages.map((s) => {
                    const isNext = s.stage === next;
                    return (
                        <li key={s.stage} className={`lx-soft flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 ${s.status === 'done' ? 'bg-ink text-bg' : 'bg-surface'} ${s.status === 'empty' ? 'opacity-50' : ''}`}>
                            <span className={s.status === 'done' ? '' : isNext ? 'text-ink' : 'text-muted'}>{s.status === 'done' ? <Check className="w-4 h-4" /> : STAGE_ICON[s.stage]}</span>
                            <span className={`text-sm font-bold whitespace-nowrap ${s.status === 'empty' ? 'line-through' : ''}`}>{STAGE_LABEL[s.stage]}</span>
                        </li>
                    );
                })}
            </ol>
            {!plan.complete && <p className="mt-2 text-center font-mono text-[11px] text-muted">{planLine(plan)}</p>}
        </section>
    );
}
