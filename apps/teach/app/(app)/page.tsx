'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { PartyPopper, Plus } from 'lucide-react';
import { Badge, Card, CardTitle, CopyChip, Empty, LinkButton, PageHeader } from '../components/ui';
import { useTeaching } from '../lib/teaching';
import { greeting, needs, praise, summaryLine, type Need } from '../lib/today';
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
    const row = (i: ForecastItem) => {
        const board = boards.find((b) => b.class.id === i.classId)!;
        return (
            <li key={i.key}>
                <ForecastBlock
                    forecast={i.forecast}
                    board={board}
                    userId={i.userId}
                    onAssigned={() => void loadBoard(i.classId)}
                    onDone={() => markDone(i.key)}
                    who={
                        <>
                            <b className="font-semibold">{i.name}</b> <span className="text-muted">· {i.className}</span>
                            <br />
                        </>
                    }
                />
            </li>
        );
    };
    const dateLine = new Date(now).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' });

    return (
        <>
            <PageHeader
                title={greeting(new Date(now).getHours())}
                sub={data ? `${dateLine} · ${summaryLine(boards)}` : dateLine}
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
            {error && <p className="mb-4 text-sm text-danger">{error}</p>}
            {!data ? (
                <div className="space-y-4">
                    <div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-surface-2" />
                    <div className="h-28 animate-pulse rounded-[var(--radius-card)] bg-surface-2" />
                </div>
            ) : data.classes.length === 0 ? (
                <Empty title="Bắt đầu với lớp đầu tiên" action={<LinkButton href="/classes?new=1">Tạo lớp</LinkButton>}>
                    Tạo lớp, gửi link mời cho học viên, rồi giao từ theo buổi học. Mỗi sáng trang này sẽ cho bạn biết em nào cần một lời nhắc và bài nào sắp hết hạn.
                </Empty>
            ) : (
                <div className="space-y-5">
                    <Card tone={count ? 'warm' : 'accent'}>
                        <CardTitle aside={count ? <Badge tone="warm">{count} việc</Badge> : null}>Việc nên làm hôm nay</CardTitle>
                        {count === 0 ? (
                            <p className="flex items-center gap-2 text-ink-2">
                                <PartyPopper className="h-4 w-4 text-accent" /> Mọi lớp đều đang vào nhịp. Không có gì cần nhắc hôm nay.
                            </p>
                        ) : (
                            <ul className="divide-y divide-warm/15">
                                {urgent.map(row)}
                                {plain
                                    .filter((n) => n.kind === 'due')
                                    .map((n, i) => (
                                        <NeedRow key={`due-${i}`} need={n} />
                                    ))}
                                {watch.map(row)}
                                {plain
                                    .filter((n) => n.kind !== 'due')
                                    .map((n, i) => (
                                        <NeedRow key={`n-${i}`} need={n} />
                                    ))}
                            </ul>
                        )}
                    </Card>

                    <div className="grid gap-5 md:grid-cols-2">
                        <Card tone="lilac">
                            <CardTitle>Đáng khen tuần này</CardTitle>
                            {forecasts.good.length > 0 && <ul className="mb-2 divide-y divide-lilac/15">{forecasts.good.map(row)}</ul>}
                            {good.length === 0 && forecasts.good.length === 0 ? (
                                <p className="text-sm text-muted">Khi một em tiến bộ rõ (nhiều từ Dùng mới, chuỗi 7 ngày), em ấy sẽ hiện ở đây để bạn khen kịp lúc.</p>
                            ) : (
                                <ul className="space-y-2.5">
                                    {good.map((p) => (
                                        <li key={`${p.classId}-${p.userId}`} className="flex items-center justify-between gap-3">
                                            <Link prefetch={false} href={`/classes/${p.classId}/students/${p.userId}`} className="min-w-0 text-ink hover:underline">
                                                <b className="font-semibold">{p.name}</b> <span className="text-ink-2">{p.why}</span>
                                            </Link>
                                            <CopyChip text={praiseMessage(p.name, p.why)} label="Chép lời khen" />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>
                        <Card>
                            <CardTitle aside={<Link href="/classes" className="text-sm text-accent hover:underline">Tất cả</Link>}>Lớp của tôi</CardTitle>
                            <ul className="space-y-2">
                                {data.classes.slice(0, 5).map((c) => (
                                    <li key={c.id}>
                                        <Link href={`/classes/${c.id}`} className="flex items-center justify-between rounded-xl px-2 py-1.5 hover:bg-surface-2">
                                            <span className="text-ink">{c.name}</span>
                                            <span className="text-sm text-muted tabular">{c.members} em</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>
                </div>
            )}
        </>
    );
}

/** Links here don't prefetch: one server request each, for pages the teacher may not open. */
function NeedRow({ need }: { need: Need }) {
    const href = `/classes/${need.classId}`;
    if (need.kind === 'due') {
        const when = need.days <= 0 ? 'hết hạn hôm nay' : need.days === 1 ? 'hết hạn mai' : `còn ${need.days} ngày`;
        return (
            <li className="flex flex-wrap items-center justify-between gap-2 py-3">
                <Link prefetch={false} href={`${href}?tab=assignments`} className="text-ink hover:underline">
                    Bài “{need.title}” {when}: <b>{need.notDone}/{need.total}</b> em chưa làm xong · <span className="text-muted">{need.className}</span>
                </Link>
                <CopyChip text={dueMessage(need.title, need.className, need.days)} label="Chép lời nhắc lớp" />
            </li>
        );
    }
    if (need.kind === 'nudge') {
        const names = need.names.length > 3 ? `${need.names.slice(0, 3).join(', ')} và ${need.names.length - 3} em khác` : need.names.join(', ');
        return (
            <li className="flex flex-wrap items-center justify-between gap-2 py-3">
                <Link prefetch={false} href={`${href}?tab=students&filter=nudge`} className="text-ink hover:underline">
                    {need.names.length} em chưa học hơn 3 ngày: <b>{names}</b> · <span className="text-muted">{need.className}</span>
                </Link>
                <CopyChip text={nudgeMessage(need.names, need.className)} label="Chép lời nhắc" />
            </li>
        );
    }
    return (
        <li className="py-3">
            <Link prefetch={false} href={`${href}${need.tab ? `?tab=${need.tab}` : ''}`} className="text-ink-2 hover:underline">
                {need.text} · <span className="text-muted">{need.className}</span>
            </Link>
        </li>
    );
}
