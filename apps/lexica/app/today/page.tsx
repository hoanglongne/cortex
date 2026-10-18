'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Flame, Hammer, LayoutGrid, Sparkles } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { useTodayPlan } from '../hooks/useTodayPlan';
import { STAGE_LABEL, STAGES, stepDelta, type Stage } from '../lib/journey/today';
import { countSteps } from '../lib/journey/steps';
import { BRANCH_LABEL, currentDay, dueCheckpoint, PATH_DAYS } from '../lib/journey/path';
import { localDate } from '../lib/engagement/ghost';
import { getAllCards, getCard, getCurrentDrop, getPassage, useContentVersion } from '../lib/content/repository';
import { generatedReading } from '../lib/content/generated';
import type { Passage } from '../lib/content/passages';
import { buildSets } from '../lib/engagement/collection';
import { nearestSet, type LuckyReward } from '../lib/engagement/session';
import { useEconomy } from '../lib/engagement/economy';
import { capture } from '../lib/productAnalytics';
import ReviewSession from '../components/ReviewSession';
import SwipeDeck from '../components/SwipeDeck';
import PassageReader from '../components/PassageReader';
import QuoteMeet from '../components/QuoteMeet';
import SpeakDrill from '../components/SpeakDrill';
import StepNumbers from '../components/StepNumbers';
import InstallCard from '../components/InstallCard';
import PledgeCard from '../components/PledgeCard';
import { classWordsToQueue, onlyClassWords } from '../lib/classes';

/**
 * A lesson assigned in "only" mode and not learned yet makes the whole Học
 * stage: fewer words than the day's pace means a shorter stage, never other
 * words slipped in among the teacher's. "Mixed" lessons are dealt first in a
 * normal stage.
 */
function learnSize(newLeft: number): number {
    const progress = useLexicaStore.getState().cardProgress;
    const pending = onlyClassWords((id) => Boolean(progress[id])).length;
    if (pending === 0) return newLeft;
    return newLeft > 0 ? Math.min(pending, newLeft) : pending;
}

/** What a stage works on, fixed when the stage starts so answers don't reshuffle it. */
type Frozen =
    | { stage: 'review'; ids: string[] }
    | { stage: 'learn'; size: number }
    | { stage: 'read'; passageId: string | null; generate: string[] | null; fallbackId: string | null; quoteWord: string | null }
    | { stage: 'speak'; ids: string[] };

/**
 * "Hôm nay" (docs/LEXICA_DIRECTION.md): Ôn → Học → Đọc → Nói in one run,
 * each stage moving words one step, then a recap with the four numbers and
 * the rewards. Leaving midway keeps what is done; the Home card resumes it.
 */
export default function TodayPage() {
    useContentVersion();
    const picks = useTodayPlan();
    const { plan } = picks;
    const startToday = useLexicaStore((s) => s.startToday);
    const finishStage = useLexicaStore((s) => s.finishStage);
    const completeToday = useLexicaStore((s) => s.completeToday);
    const path = useLexicaStore((s) => s.path);
    const daysDone = useLexicaStore((s) => s.daysDone);
    const [frozen, setFrozen] = useState<Frozen | null>(null);
    const [lucky, setLucky] = useState<LuckyReward[]>([]);
    const [firstDay] = useState(() => useLexicaStore.getState().daysDone.length === 0);
    const started = useRef(false);

    // Open today's log, then enter the next stage with its words fixed.
    useEffect(() => {
        if (!started.current) {
            started.current = true;
            startToday();
            capture('today_start', { next: plan.next ?? 'done' });
        }
    }, [startToday, plan.next]);

    useEffect(() => {
        if (frozen || !plan.next) return;
        const stage = plan.next;
        const t = setTimeout(() => {
            if (stage === 'learn') {
                // Words a class assigned come first, then a fresh deck for the session.
                useLexicaStore.getState().queueCards(classWordsToQueue());
                useLexicaStore.getState().loadNewDeck();
            }
            setFrozen(
                stage === 'review'
                    ? { stage, ids: picks.reviewIds }
                    : stage === 'learn'
                      ? { stage, size: learnSize(picks.newLeft) }
                      : stage === 'read'
                        ? { stage, passageId: picks.passage?.id ?? null, generate: picks.generate, fallbackId: picks.fallback?.id ?? null, quoteWord: picks.quoteWord }
                        : { stage, ids: picks.speakIds.length > 0 ? picks.speakIds : picks.learnedToday.slice(0, 3) },
            );
        }, 0);
        return () => clearTimeout(t);
    }, [frozen, plan.next, picks]);

    useEffect(() => {
        if (plan.complete && !frozen) completeToday();
    }, [plan.complete, frozen, completeToday]);

    const done = (stage: Stage) => {
        finishStage(stage);
        capture('today_stage', { stage });
        setFrozen(null);
        window.scrollTo({ top: 0 });
    };

    const day = path ? currentDay(path, daysDone, localDate()) : null;

    return (
        <div className="min-h-screen bg-bg px-4 py-6">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <Link href="/" className="text-muted hover:text-accent text-sm">
                        ← {plan.complete ? 'Trang chủ' : 'Tạm dừng'}
                    </Link>
                    <p className="text-ink font-bold">Hôm nay</p>
                    <p className="font-mono text-[11px] text-muted w-16 text-right">{day ? `Ngày ${day}/${PATH_DAYS}` : ''}</p>
                </div>

                <StageBar plan={plan} active={frozen?.stage ?? null} />

                <div className="mt-5">
                    {frozen?.stage === 'review' && (
                        <ReviewSession dueCardIds={frozen.ids} subtitle={`${frozen.ids.length} từ đến hạn`} onDone={() => done('review')} />
                    )}
                    {frozen?.stage === 'learn' && (
                        <div className="relative w-full max-w-md mx-auto pb-24">
                            <SwipeDeck
                                sessionSize={frozen.size}
                                finishLabel="Tiếp tục"
                                onFinish={(session) => {
                                    setLucky((l) => [...l, ...session.lucky]);
                                    done('learn');
                                }}
                            />
                        </div>
                    )}
                    {frozen?.stage === 'read' && <ReadStage frozen={frozen} onDone={() => done('read')} />}
                    {frozen?.stage === 'speak' &&
                        (frozen.ids.length > 0 ? (
                            <SpeakDrill words={frozen.ids} steps={[2, 3]} onDone={() => done('speak')} />
                        ) : (
                            <Skip text="Chưa có từ nào để nói." onDone={() => done('speak')} />
                        ))}
                    {plan.complete && !frozen && <Recap lucky={lucky} firstDay={firstDay} />}
                </div>
            </div>
        </div>
    );
}

function StageBar({ plan, active }: { plan: ReturnType<typeof useTodayPlan>['plan']; active: Stage | null }) {
    return (
        <ol data-testid="stage-bar" className="grid grid-cols-4 gap-2" aria-label="Các chặng hôm nay">
            {STAGES.map((stage) => {
                const s = plan.stages.find((x) => x.stage === stage)!;
                const on = active === stage;
                return (
                    <li key={stage} aria-current={on ? 'step' : undefined} className="text-center">
                        <div className={`h-1.5 rounded-full ${s.status === 'done' ? 'bg-accent' : on ? 'bg-accent/50' : s.status === 'empty' ? 'bg-surface-3/40' : 'bg-surface-3'}`} />
                        <p className={`mt-1.5 text-xs ${on ? 'text-ink font-semibold' : s.status === 'empty' ? 'text-subtle line-through' : 'text-muted'}`}>
                            {s.status === 'done' && <Check className="inline w-3 h-3 mr-0.5" />}
                            {STAGE_LABEL[stage]}
                        </p>
                    </li>
                );
            })}
        </ol>
    );
}

function ReadStage({ frozen, onDone }: { frozen: Extract<Frozen, { stage: 'read' }>; onDone: () => void }) {
    const passage = frozen.passageId ? (getPassage(frozen.passageId) ?? null) : null;
    if (passage) return <PassageReader passage={passage} onDone={onDone} />;
    if (frozen.generate) return <WrittenForYou ids={frozen.generate} fallbackId={frozen.fallbackId} quoteWord={frozen.quoteWord} onDone={onDone} />;
    if (frozen.quoteWord) return <QuoteMeet cardId={frozen.quoteWord} onDone={onDone} />;
    return <Skip text="Chưa có đoạn văn nào có từ bạn vừa học. Bài đọc riêng cho bạn cần kết nối mạng." onDone={onDone} />;
}

/** A passage written for the words learned today (lib/content/generated.ts). */
function WrittenForYou({ ids, fallbackId, quoteWord, onDone }: { ids: string[]; fallbackId: string | null; quoteWord: string | null; onDone: () => void }) {
    const level = useLexicaStore((s) => (s.selectedLevel && s.selectedLevel !== 'all' ? s.selectedLevel : 'beginner'));
    const branch = useLexicaStore((s) => s.path?.branch ?? 'cert');
    const [state, setState] = useState<{ passage: Passage } | { failed: true } | null>(null);
    useEffect(() => {
        let live = true;
        generatedReading(ids, level, branch === 'talk' ? 'dialogue' : 'text')
            .then((passage) => live && setState({ passage }))
            .catch(() => live && setState({ failed: true }));
        return () => {
            live = false;
        };
    }, [ids, level, branch]);
    if (!state) {
        return (
            <div data-testid="reading-writing" className="rounded-2xl border border-line bg-surface p-6 text-center">
                <div className="mx-auto w-7 h-7 rounded-full border-2 border-line border-t-accent animate-spin" />
                <p className="mt-3 text-ink">Đang viết một đoạn đọc với các từ bạn vừa học…</p>
                <p className="mt-1 text-sm text-muted lowercase">{ids.map((id) => getCard(id)?.word).filter(Boolean).join(' · ')}</p>
            </div>
        );
    }
    if ('passage' in state) return <PassageReader passage={state.passage} onDone={onDone} />;
    const fallback = fallbackId ? getPassage(fallbackId) : undefined;
    if (fallback) return <PassageReader passage={fallback} onDone={onDone} />;
    if (quoteWord) return <QuoteMeet cardId={quoteWord} onDone={onDone} />;
    return <Skip text="Chưa viết được đoạn đọc cho từ của bạn (mất kết nối). Mai thử lại nhé." onDone={onDone} />;
}

function Skip({ text, onDone }: { text: string; onDone: () => void }) {
    return (
        <div className="rounded-2xl border border-line bg-surface p-5 text-center">
            <p className="text-ink">{text}</p>
            <button data-testid="stage-next" onClick={onDone} className="mt-4 h-11 px-5 rounded-xl bg-accent text-on-accent font-bold">
                Tiếp tục →
            </button>
        </div>
    );
}

/** End of the day: the four numbers and what moved, then the rewards. */
function Recap({ lucky, firstDay }: { lucky: LuckyReward[]; firstDay: boolean }) {
    const journeys = useLexicaStore((s) => s.journeys);
    const log = useLexicaStore((s) => s.todayLog);
    const streak = useLexicaStore((s) => s.currentStreak);
    const path = useLexicaStore((s) => s.path);
    const daysDone = useLexicaStore((s) => s.daysDone);
    const cardProgress = useLexicaStore((s) => s.cardProgress);
    const readyToMint = useEconomy((s) => s.state?.ready.length ?? 0);
    const now = countSteps(journeys);
    const delta = log ? stepDelta(now, log.start) : undefined;
    const checkpoint = path ? dueCheckpoint(path, daysDone) : null;
    const drop = getCurrentDrop();
    const nearest = nearestSet(buildSets(getAllCards(), drop ? { [drop.id]: drop.title } : {}), cardProgress);
    const dust = lucky.filter((l) => l.item === 'dust').reduce((n, l) => n + l.amount, 0);
    const boxes = lucky.filter((l) => l.item === 'box').reduce((n, l) => n + l.amount, 0);

    return (
        <motion.div data-testid="today-recap" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-2xl border border-line bg-surface p-5">
                <p className="font-mono text-[11px] uppercase tracking-wider text-accent">Xong hôm nay</p>
                <h1 className="mt-2 text-xl font-semibold text-ink">{headline(delta)}</h1>
                <div className="mt-4">
                    <StepNumbers counts={now} delta={delta} />
                </div>
                {path && <p className="mt-3 text-xs text-muted">Nhánh {BRANCH_LABEL[path.branch]} · số trên là từ đã tới mỗi bước, từ đầu tới giờ.</p>}
            </div>

            <PledgeCard offer />

            {checkpoint && (
                <Link href={`/path/checkpoint?day=${checkpoint}`} className="block rounded-2xl border border-accent/40 bg-accent/5 p-4 text-ink hover:border-accent">
                    <p className="font-semibold">{checkpoint === 30 ? 'Ngày 30: bài kiểm tra về đích' : `Mốc ngày ${checkpoint}`} →</p>
                    <p className="text-sm text-muted">{checkpoint === 30 ? '30 từ ngẫu nhiên từ 30 ngày qua.' : 'Xem bạn đã đi được bao xa so với mục tiêu.'}</p>
                </Link>
            )}

            {firstDay && <InstallCard />}

            <div className="rounded-2xl border border-line bg-surface p-4 space-y-2 text-sm">
                <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">Phần thưởng</p>
                <p className="flex items-center gap-2 text-ink">
                    <Flame className={`w-4 h-4 ${streak > 0 ? 'text-warning' : 'text-subtle'}`} /> Chuỗi {streak} ngày
                </p>
                {(dust > 0 || boxes > 0) && (
                    <p className="flex items-center gap-2 text-accent">
                        <Sparkles className="w-4 h-4" /> Thẻ may mắn: {[dust > 0 && `+${dust} Bụi`, boxes > 0 && `+${boxes} Hộp`].filter(Boolean).join(' · ')}
                    </p>
                )}
                {readyToMint > 0 && (
                    <Link href="/album" className="flex items-center gap-2 text-ink hover:text-accent">
                        <Hammer className="w-4 h-4 text-accent" /> {readyToMint} thẻ sẵn sàng đúc
                    </Link>
                )}
                {nearest && (
                    <Link href="/album" className="flex items-center gap-2 text-ink-2 hover:text-ink">
                        <LayoutGrid className="w-4 h-4 text-muted" /> Còn {nearest.missing} từ là đủ bộ {nearest.label}
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2">
                <Link href="/path" className="h-12 rounded-xl border border-line bg-surface text-ink font-medium flex items-center justify-center hover:border-line-strong">
                    Xem lộ trình
                </Link>
                <Link href="/" className="h-12 rounded-xl bg-accent text-on-accent font-bold flex items-center justify-center hover:bg-accent-strong">
                    Về trang chủ
                </Link>
            </div>
        </motion.div>
    );
}

function headline(delta: ReturnType<typeof stepDelta> | undefined): string {
    if (!delta) return 'Bạn đã xong phiên hôm nay.';
    const parts = [delta.hieu > 0 && `${delta.hieu} từ mới Hiểu`, delta.nho > 0 && `${delta.nho} từ lên Nhớ`, delta.gap > 0 && `${delta.gap} từ Gặp`, delta.dung > 0 && `${delta.dung} từ Dùng`].filter(Boolean);
    return parts.length > 0 ? `Hôm nay: ${parts.join(', ')}.` : 'Bạn đã giữ nhịp hôm nay.';
}
