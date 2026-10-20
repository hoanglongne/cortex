'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronRight, Flame, Mic, Swords } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { getCard, useContentVersion } from '../lib/content/repository';
import { countSteps, STEP_HINT, STEP_LABEL, STEPS, type StepCounts } from '../lib/journey/steps';
import { localDate } from '../lib/engagement/ghost';
import { hardWords } from '../lib/engagement/hard';
import { hardToSay } from '../lib/pronunciation/drill';
import { actionsByDay, calendar, DAY_LABELS, dueForecast, intensity, stepSeries, weeks } from '../lib/stats';

const CELL = ['bg-surface-2', 'bg-accent/25', 'bg-accent/50', 'bg-accent/75', 'bg-accent'] as const;
const dm = (date: string) => `${Number(date.slice(8))}/${Number(date.slice(5, 7))}`;

/**
 * "Thống kê" from what the learner really did (lib/stats.ts): this week
 * against the last, the four steps over 30 days, the days they studied,
 * the reviews coming up and the words that need attention. Settings live
 * at /settings.
 */
export default function StatsPage() {
    useContentVersion();
    const journeys = useLexicaStore((s) => s.journeys);
    const stepHistory = useLexicaStore((s) => s.stepHistory);
    const studyHistory = useLexicaStore((s) => s.studyHistory);
    const daysDone = useLexicaStore((s) => s.daysDone);
    const sightings = useLexicaStore((s) => s.sightings);
    const spokenAt = useLexicaStore((s) => s.spokenAt);
    const mySentences = useLexicaStore((s) => s.mySentences);
    const cardProgress = useLexicaStore((s) => s.cardProgress);
    const speakMisses = useLexicaStore((s) => s.speakMisses);
    const currentStreak = useLexicaStore((s) => s.currentStreak);
    const longestStreak = useLexicaStore((s) => s.longestStreak);
    const [now] = useState(() => Date.now());
    const today = localDate(now);

    const actions = useMemo(
        () => actionsByDay({ journeys, studyHistory, daysDone, sightings, spokenAt, mySentences }),
        [journeys, studyHistory, daysDone, sightings, spokenAt, mySentences],
    );
    const week = weeks(journeys, actions, today);
    const counts = countSteps(journeys);
    const series = stepSeries(stepHistory, counts, today);
    const cols = calendar(actions, today);
    const all = [...actions.values()];
    const due = dueForecast(cardProgress, now);
    const hard = hardWords(cardProgress).slice(0, 6);
    const hardSay = hardToSay(speakMisses).filter((h) => getCard(h.cardId)).slice(0, 6);
    const empty = Object.keys(journeys).length === 0;

    return (
        <div className="min-h-screen bg-bg px-4 py-6">
            <div className="max-w-2xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                    <Link href="/me" className="text-muted hover:text-accent text-sm">
                        ← Tôi
                    </Link>
                    <h1 className="text-ink font-bold">Thống kê</h1>
                    <span className="w-10" />
                </div>

                {empty ? (
                    <p className="rounded-2xl border border-dashed border-line-strong p-6 text-center text-sm text-muted">Học vài từ đầu tiên, số liệu của bạn sẽ hiện ở đây.</p>
                ) : (
                    <>
                        <Week now={week.now} before={week.before} />
                        <Steps counts={counts} series={series} />
                        <section className="rounded-2xl border border-line bg-surface p-4">
                            <div className="flex items-baseline justify-between gap-2">
                                <h2 className="font-semibold text-ink">Ngày học</h2>
                                <p className="flex items-center gap-1.5 text-sm text-ink-2">
                                    <Flame className={`w-4 h-4 ${currentStreak > 0 ? 'text-warning' : 'text-subtle'}`} />
                                    Chuỗi {currentStreak} ngày · dài nhất {longestStreak}
                                </p>
                            </div>
                            <p className="mt-1 text-xs text-muted">12 tuần qua. Ô càng đậm là ngày bạn làm càng nhiều (học, ôn, đọc, nói, bắt gặp từ).</p>
                            <div className="mt-3 flex gap-1.5">
                                <div className="grid grid-rows-7 gap-1 text-[10px] text-subtle pr-1">
                                    {DAY_LABELS.map((d, i) => (
                                        <span key={d} className="h-4 leading-4">
                                            {i % 2 === 0 ? d : ''}
                                        </span>
                                    ))}
                                </div>
                                <div className="grid grid-flow-col grid-rows-7 gap-1 flex-1" role="img" aria-label="Lịch ngày học 12 tuần qua">
                                    {cols.flat().map((c, i) =>
                                        c ? (
                                            <span key={c.date} title={`${dm(c.date)}: ${c.n > 0 ? `${c.n} hoạt động` : 'không học'}`} className={`h-4 rounded-[3px] ${CELL[intensity(c.n, all)]} ${c.date === today ? 'ring-1 ring-ink-2' : ''}`} />
                                        ) : (
                                            <span key={`x${i}`} className="h-4" />
                                        ),
                                    )}
                                </div>
                            </div>
                            <p className="mt-2 flex items-center justify-end gap-1 text-[10px] text-subtle">
                                Ít {CELL.map((c) => <span key={c} className={`w-3 h-3 rounded-[3px] ${c}`} />)} Nhiều
                            </p>
                        </section>
                        <Due due={due} />
                        {(hard.length > 0 || hardSay.length > 0) && (
                            <section className="rounded-2xl border border-line bg-surface p-4 space-y-4">
                                <h2 className="font-semibold text-ink">Từ cần chú ý</h2>
                                {hard.length > 0 && (
                                    <WordList title="Hay quên" href="/review?hard=1" action="Luyện riêng" icon={<Swords className="w-4 h-4" />} items={hard.map((p) => ({ id: p.cardId, note: `sai ${p.wrongCount ?? 0} lần` }))} />
                                )}
                                {hardSay.length > 0 && (
                                    <WordList title="Khó nói" href="/speak" action="Luyện nói" icon={<Mic className="w-4 h-4" />} items={hardSay.map((h) => ({ id: h.cardId, note: `chưa rõ ${h.misses} lần` }))} />
                                )}
                            </section>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function Week({ now, before }: { now: ReturnType<typeof weeks>['now']; before: ReturnType<typeof weeks>['before'] }) {
    return (
        <section className="rounded-2xl border border-accent/40 bg-accent/5 p-4">
            <p className="font-mono text-[11px] uppercase tracking-wider text-accent">7 ngày qua</p>
            <p className="mt-1 text-2xl font-semibold text-ink">
                Học {now.activeDays}/7 ngày
                <Change now={now.activeDays} before={before.activeDays} unit="ngày" />
            </p>
            <div className="mt-3 grid grid-cols-4 gap-2">
                {STEPS.map((s) => (
                    <div key={s} className="rounded-xl border border-line bg-surface px-2 py-2 text-center" title={STEP_HINT[s]}>
                        <p className="font-mono text-lg font-bold text-ink">+{now.reached[s]}</p>
                        <p className="text-[11px] text-muted">{STEP_LABEL[s]}</p>
                        <p className="text-[10px] text-subtle">tuần trước +{before.reached[s]}</p>
                    </div>
                ))}
            </div>
            <p className="mt-2 text-xs text-muted">Số từ mới tới mỗi bước trong 7 ngày.</p>
        </section>
    );
}

function Change({ now, before, unit }: { now: number; before: number; unit: string }) {
    if (now === before) return null;
    const up = now > before;
    return (
        <span className={`ml-2 inline-flex items-center gap-0.5 align-middle text-sm font-medium ${up ? 'text-accent' : 'text-muted'}`}>
            {up ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
            {Math.abs(now - before)} {unit} so với tuần trước
        </span>
    );
}

/** Each step: the count now and a 30-day line, one small chart per step so each reads on its own scale. */
function Steps({ counts, series }: { counts: StepCounts; series: { date: string; counts: StepCounts }[] }) {
    const [hover, setHover] = useState<number | null>(null);
    return (
        <section className="rounded-2xl border border-line bg-surface p-4">
            <h2 className="font-semibold text-ink">Bốn bước, 30 ngày qua</h2>
            <p className="mt-1 text-xs text-muted">Số từ đã tới mỗi bước. Rê hoặc chạm vào đường để xem từng ngày.</p>
            <div className="mt-3 space-y-3">
                {STEPS.map((s) => {
                    const ys = series.map((x) => x.counts[s]);
                    const max = Math.max(1, ...ys);
                    const pts = ys.map((y, i) => `${(i / (ys.length - 1)) * 100},${28 - (y / max) * 26}`).join(' ');
                    const gain = ys[ys.length - 1] - ys[0];
                    const at = hover ?? ys.length - 1;
                    return (
                        <div key={s} className="grid grid-cols-[4.5rem_1fr_4.5rem] items-center gap-3">
                            <div>
                                <p className="text-sm text-ink">{STEP_LABEL[s]}</p>
                                <p className="font-mono text-lg font-bold text-ink leading-tight">{hover === null ? counts[s] : ys[at]}</p>
                            </div>
                            <svg
                                viewBox="0 0 100 30"
                                preserveAspectRatio="none"
                                className="h-10 w-full overflow-visible"
                                onMouseLeave={() => setHover(null)}
                                onPointerMove={(e) => {
                                    const r = e.currentTarget.getBoundingClientRect();
                                    setHover(Math.max(0, Math.min(ys.length - 1, Math.round(((e.clientX - r.left) / r.width) * (ys.length - 1)))));
                                }}
                                role="img"
                                aria-label={`${STEP_LABEL[s]}: từ ${ys[0]} lên ${ys[ys.length - 1]} trong 30 ngày`}
                            >
                                <line x1="0" y1="28" x2="100" y2="28" className="stroke-line" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                                <polyline points={pts} fill="none" className="stroke-accent" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
                                {hover !== null && <line x1={(at / (ys.length - 1)) * 100} y1="0" x2={(at / (ys.length - 1)) * 100} y2="28" className="stroke-ink-2" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
                            </svg>
                            <p className="text-right text-xs text-muted">{hover === null ? (gain > 0 ? `+${gain} trong 30 ngày` : 'chưa đổi') : dm(series[at].date)}</p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

function Due({ due }: { due: { date: string; n: number }[] }) {
    const max = Math.max(1, ...due.map((d) => d.n));
    const total = due.reduce((n, d) => n + d.n, 0);
    return (
        <section className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-semibold text-ink">Cần ôn 7 ngày tới</h2>
                <span className="text-sm text-muted">{total} lượt</span>
            </div>
            <p className="mt-1 text-xs text-muted">Hôm nay gồm cả từ đã quá hạn. Ôn đúng hẹn là cách nhanh nhất để từ lên Nhớ.</p>
            <div className="mt-3 grid grid-cols-7 gap-2 items-end h-28" role="img" aria-label={due.map((d) => `${dm(d.date)}: ${d.n}`).join(', ')}>
                {due.map((d, i) => (
                    <div key={d.date} className="flex flex-col items-center justify-end h-full gap-1" title={`${dm(d.date)}: ${d.n} từ`}>
                        <span className="text-[11px] text-ink-2 font-mono">{d.n > 0 ? d.n : ''}</span>
                        <div className={`w-full max-w-8 rounded-t ${i === 0 ? 'bg-accent' : 'bg-accent/50'}`} style={{ height: `${d.n > 0 ? Math.max(6, (d.n / max) * 72) : 2}px` }} />
                        <span className="text-[10px] text-subtle">{i === 0 ? 'Nay' : dm(d.date)}</span>
                    </div>
                ))}
            </div>
            {due[0].n > 0 && (
                <Link href="/review" className="mt-3 inline-flex items-center gap-1 text-sm text-accent">
                    Ôn {due[0].n} từ hôm nay <ChevronRight className="w-4 h-4" />
                </Link>
            )}
        </section>
    );
}

function WordList({ title, href, action, icon, items }: { title: string; href: string; action: string; icon: React.ReactNode; items: { id: string; note: string }[] }) {
    return (
        <div>
            <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-sm text-ink-2">
                    {icon} {title}
                </p>
                <Link href={href} className="text-sm text-accent">
                    {action} →
                </Link>
            </div>
            <ul className="mt-2 flex flex-wrap gap-1.5">
                {items.map((w) => (
                    <li key={w.id} className="rounded-lg bg-surface-2 px-2.5 py-1 text-sm text-ink" title={getCard(w.id)?.translationHint}>
                        {getCard(w.id)?.word.toLowerCase()} <span className="text-[11px] text-muted">{w.note}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
