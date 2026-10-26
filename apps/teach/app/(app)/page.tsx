'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { PartyPopper, Plus } from 'lucide-react';
import { Card, CopyChip, Empty, Label, LinkButton, PageHeader, SectionTitle, Stat } from '../components/ui';
import { useTeaching } from '../lib/teaching';
import { needs, praise, summaryLine, type Need } from '../lib/today';
import { moduleFor } from '../modules';
import { dueMessage, nudgeMessage, praiseMessage } from '../lib/messages';
import { dropoutStudents, forecastItems, localDay, type ForecastItem } from '../lib/forecasts';
import { useDone, useScoreHistories } from '../lib/useForecasts';
import { loadBoard } from '../lib/teaching';
import { ForecastBlock } from '../components/Forecast';

/**
 * "Hôm nay": the question is "what do I need to do today?". A to-do list,
 * most urgent first: the forecasts (W4) with a button each, work due, who to
 * nudge. Praise next, the classes last; numbers live on each class's page.
 */
export default function TodayPage() {
    const { data, error } = useTeaching();
    const [now] = useState(() => Date.now());
    const boards = useMemo(() => (data ? data.classes.map((c) => data.boards[c.id]).filter(Boolean) : []), [data]);
    const histories = useScoreHistories(boards.map((b) => b.class.id));
    const [done, markDone] = useDone();
    const forecasts = useMemo(() => forecastItems(boards, histories ?? {}, localDay(now), done, now), [boards, histories, done, now]);
    const leaving = dropoutStudents(forecasts.todo);
    // Students with a dropout forecast get its row (with why and what to do) instead of the plain nudge
    const plain = needs(boards, moduleFor, now).flatMap((n): Need[] => {
        if (n.kind !== 'nudge') return [n];
        const board = boards.find((b) => b.class.id === n.classId);
        const names = n.names.filter((name) => !board?.students.some((s) => s.name === name && leaving.has(`${n.classId}:${s.user_id}`)));
        return names.length ? [{ ...n, names }] : [];
    });
    const urgent = forecasts.todo.filter((i) => i.forecast.urgency === 'urgent');
    const watch = forecasts.todo.filter((i) => i.forecast.urgency !== 'urgent');
    const count = forecasts.todo.length + plain.length;
    const praised = new Set(forecasts.good.map((i) => `${i.classId}:${i.userId}`));
    const good = praise(boards, moduleFor).filter((p) => !praised.has(`${p.classId}:${p.userId}`));
    const item = (i: ForecastItem, variant: 'card' | 'row') => {
        const board = boards.find((b) => b.class.id === i.classId)!;
        return (
            <li key={i.key}>
                <ForecastBlock
                    variant={variant}
                    forecast={i.forecast}
                    board={board}
                    userId={i.userId}
                    onAssigned={() => void loadBoard(i.classId)}
                    onDone={() => markDone(i.key)}
                    who={{ name: i.name, className: i.className }}
                />
            </li>
        );
    };
    const due = plain.filter((n) => n.kind === 'due');
    const other = plain.filter((n) => n.kind !== 'due');
    const students = boards.reduce((n, b) => n + b.students.length, 0);
    const active = boards.reduce((n, b) => n + b.students.filter((s) => s.inactive_days !== null && s.inactive_days <= 6).length, 0);
    const dateLine = new Date(now).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' });
    const urgentCount = urgent.length + due.length;

    return (
        <>
            <PageHeader
                title={!data ? 'Hôm nay' : count ? `Hôm nay có ${count} việc` : 'Hôm nay không có việc gấp'}
                sub={
                    data
                        ? `${dateLine} · ${summaryLine(boards)}${urgentCount ? `. ${urgentCount} việc cần làm ngay, phần còn lại có thể để chiều.` : ''}`
                        : dateLine
                }
                actions={
                    data && data.classes.length > 0 ? (
                        <>
                            <LinkButton href="/classes?new=1" kind="secondary">
                                <Plus className="h-4 w-4" /> Tạo lớp
                            </LinkButton>
                            <LinkButton href={`/classes/${data.classes[0].id}?tab=assignments&assign=1`}>Giao bài mới</LinkButton>
                        </>
                    ) : null
                }
            />
            {error && <p className="mb-6 text-danger">{error}</p>}
            {!data ? (
                <div className="space-y-6">
                    <div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-surface-2" />
                    <div className="h-28 animate-pulse rounded-[var(--radius-card)] bg-surface-2" />
                </div>
            ) : data.classes.length === 0 ? (
                <Empty title="Bắt đầu với lớp đầu tiên" action={<LinkButton href="/classes?new=1">Tạo lớp</LinkButton>}>
                    Tạo lớp, gửi link mời cho học viên, rồi giao từ theo buổi học. Mỗi sáng trang này sẽ cho bạn biết em nào cần một lời nhắc và bài nào sắp hết hạn.
                </Empty>
            ) : (
                <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-14">
                    <div className="min-w-0 space-y-12">
                        {count === 0 && (
                            <Card>
                                <p className="flex items-center gap-3 text-ink-2">
                                    <PartyPopper className="h-5 w-5 text-accent" /> Mọi lớp đều đang vào nhịp. Không có gì cần nhắc hôm nay.
                                </p>
                            </Card>
                        )}
                        {urgentCount > 0 && (
                            <section>
                                <SectionTitle aside={`${urgentCount} việc`} tone="warm">
                                    Cần làm ngay
                                </SectionTitle>
                                <ul className="space-y-3">
                                    {urgent.map((i) => item(i, 'card'))}
                                    {due.map((n, k) => (
                                        <li key={`due-${k}`}>
                                            <NeedCard need={n} />
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                        {watch.length + other.length > 0 && (
                            <section>
                                <SectionTitle aside={`${watch.length + other.length} việc`}>Nên để ý</SectionTitle>
                                <Card className="!py-1">
                                    <ul className="divide-y divide-line">
                                        {watch.map((i) => item(i, 'row'))}
                                        {other.map((n, k) => (
                                            <li key={`n-${k}`}>
                                                <NeedRow need={n} />
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            </section>
                        )}
                        <section>
                            <SectionTitle>Đáng khen tuần này</SectionTitle>
                            <Card className={forecasts.good.length + good.length ? '!py-1' : ''}>
                                {good.length === 0 && forecasts.good.length === 0 ? (
                                    <p className="text-ink-2">Khi một em tiến bộ rõ (nhiều từ Dùng mới, chuỗi 7 ngày), em ấy sẽ hiện ở đây để bạn khen kịp lúc.</p>
                                ) : (
                                    <ul className="divide-y divide-line">
                                        {forecasts.good.map((i) => item(i, 'row'))}
                                        {good.map((p) => (
                                            <li key={`${p.classId}-${p.userId}`} className="flex flex-wrap items-center justify-between gap-4 py-5">
                                                <Link prefetch={false} href={`/classes/${p.classId}/students/${p.userId}`} className="min-w-0 text-ink hover:underline">
                                                    <b className="font-semibold">{p.name}</b> <span className="text-ink-2">{p.why}</span>
                                                </Link>
                                                <CopyChip text={praiseMessage(p.name, p.why)} label="Chép lời khen" />
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Card>
                        </section>
                    </div>

                    <aside className="min-w-0 space-y-10 lg:pt-2">
                        <section>
                            <Label>Tuần này</Label>
                            <div className="grid grid-cols-2 gap-6 lg:grid-cols-1">
                                <Stat label="Em có học" value={<>{active}<span className="text-xl text-muted"> / {students}</span></>} />
                                <Stat label="Có thể bỏ học" value={leaving.size} tone={leaving.size ? 'warm' : undefined} />
                            </div>
                        </section>
                        <section>
                            <div className="flex items-baseline justify-between">
                                <Label>Lớp của bạn</Label>
                                <Link href="/classes" className="text-[15px] text-accent-strong hover:underline">
                                    Tất cả
                                </Link>
                            </div>
                            <ul>
                                {data.classes.slice(0, 6).map((c) => (
                                    <li key={c.id}>
                                        <Link href={`/classes/${c.id}`} className="flex items-baseline justify-between gap-3 py-2.5 text-ink hover:text-accent-strong">
                                            <span className="min-w-0 truncate">{c.name}</span>
                                            <span className="shrink-0 text-[15px] text-muted tabular">{c.members} em</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </aside>
                </div>
            )}
        </>
    );
}

/** Work due soon: its own to-do card, the copy-ready reminder as the main action. Links don't prefetch. */
function NeedCard({ need }: { need: Extract<Need, { kind: 'due' }> }) {
    const when = need.days <= 0 ? 'hết hạn hôm nay' : need.days === 1 ? 'hết hạn ngày mai' : `còn ${need.days} ngày`;
    return (
        <div className="rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-card)] sm:p-7">
            <p className="text-[17px] text-ink">
                <b className="font-semibold">Bài “{need.title}”</b>
                <span className="text-[15px] text-muted"> · {need.className}</span>
            </p>
            <p className="mt-1 text-ink-2">
                {when[0].toUpperCase() + when.slice(1)}: {need.notDone} trên {need.total} em chưa học xong.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
                <CopyChip primary text={dueMessage(need.title, need.className, need.days)} label="Chép lời nhắc cho lớp" />
                <Link prefetch={false} href={`/classes/${need.classId}?tab=assignments`} className="px-1 text-[15px] text-accent-strong hover:underline">
                    Xem bài
                </Link>
            </div>
        </div>
    );
}

/** A quieter line: students to nudge, or what an app raises. */
function NeedRow({ need }: { need: Need }) {
    const href = `/classes/${need.classId}`;
    if (need.kind === 'nudge') {
        const names = need.names.length > 3 ? `${need.names.slice(0, 3).join(', ')} và ${need.names.length - 3} em khác` : need.names.join(', ');
        return (
            <div className="flex flex-wrap items-center justify-between gap-4 py-5">
                <Link prefetch={false} href={`${href}?tab=students&filter=nudge`} className="min-w-0 text-ink hover:underline">
                    <b className="font-semibold">{names}</b> <span className="text-ink-2">chưa học hơn 3 ngày</span>
                    <span className="text-[15px] text-muted"> · {need.className}</span>
                </Link>
                <CopyChip text={nudgeMessage(need.names, need.className)} label="Chép lời nhắc" />
            </div>
        );
    }
    if (need.kind === 'due') return null;
    return (
        <div className="py-5">
            <Link prefetch={false} href={`${href}${need.tab ? `?tab=${need.tab}` : ''}`} className="text-ink-2 hover:underline">
                {need.text} <span className="text-[15px] text-muted">· {need.className}</span>
            </Link>
        </div>
    );
}
