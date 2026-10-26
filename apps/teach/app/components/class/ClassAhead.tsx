'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LEXICA, courseInput } from '@cortex/classroom-lexica';
import type { Board } from '@cortex/classroom';
import { Badge, Card, CardTitle } from '../ui';
import { boardClassForecast, boardForecasts, localDay } from '../../lib/forecasts';
import { useScoreHistories } from '../../lib/useForecasts';

/**
 * "Cả lớp" (W4, docs/TEACH_PLAN.md 2.2): how many students each forecast
 * touches, where the class's verified scores are heading by the end of the
 * course, whether it reaches the target, and who pulls it down.
 */
export default function ClassAhead({ board }: { board: Board }) {
    const [now] = useState(() => Date.now());
    const histories = useScoreHistories([board.class.id]);
    if (!board.class.apps.includes(LEXICA) || board.students.length === 0) return null;
    const rows = boardForecasts(board, histories?.[board.class.id] ?? {}, localDay(now));
    const c = boardClassForecast(board, rows);
    const course = courseInput(board.class.settings[LEXICA]);
    const ranges = rows
        .flatMap((r) => {
            const f = r.forecast.forecasts.find((x) => x.kind === 'score');
            return f?.score ? [{ userId: r.userId, name: r.name, ...f.score }] : [];
        })
        .sort((a, b) => a.low + a.high - (b.low + b.high));
    const chips: [number, string, 'warm' | 'neutral' | 'accent'][] = [
        [c.counts.dropout, 'có thể bỏ học', 'warm'],
        [c.counts.forget, 'sắp quên nhiều từ', 'warm'],
        [c.counts.weak_recall, 'nhớ kém', 'neutral'],
        [c.counts.fast, 'tiến nhanh', 'accent'],
    ];
    const ends = course.endsOn ? `${Number(course.endsOn.slice(8))}/${Number(course.endsOn.slice(5, 7))}` : null;

    return (
        <Card>
            <CardTitle>Cả lớp sắp tới</CardTitle>
            <p className="flex flex-wrap gap-2">
                {chips.some(([n]) => n > 0) ? (
                    chips
                        .filter(([n]) => n > 0)
                        .map(([n, label, tone]) => (
                            <Badge key={label} tone={tone}>
                                {n} em {label}
                            </Badge>
                        ))
                ) : (
                    <span className="text-sm text-ink-2">Chưa em nào có dấu hiệu đáng lo.</span>
                )}
            </p>

            {c.score && (
                <div className="mt-4">
                    <p className="text-ink">
                        Cuối khoá{ends ? ` (${ends})` : ''}, trung bình <b className="tabular">{c.score.low}–{c.score.high}</b> · IELTS từ vựng khoảng {c.score.ielts}
                    </p>
                    <p className="text-xs text-muted">
                        Dự báo nếu giữ nhịp hiện tại, từ {c.score.students}/{c.students} em đủ số lần kiểm tra.
                    </p>
                    {c.target && <TargetLine target={c.target} avgLow={c.score.low} avgHigh={c.score.high} />}
                    <ScoreRanges ranges={ranges} target={course.targetScore} classId={board.class.id} />
                </div>
            )}

            {c.pullingDown.length > 0 && (
                <div className="mt-4">
                    <p className="text-sm font-medium text-ink">Em cần kéo lên</p>
                    <ul className="mt-1 space-y-1 text-sm">
                        {c.pullingDown.map((p) => (
                            <li key={p.userId}>
                                <Link prefetch={false} href={`/classes/${board.class.id}/students/${p.userId}`} className="text-ink hover:underline">
                                    <b className="font-semibold">{p.name}</b> <span className="text-ink-2">{p.reasons.join(', ')}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {c.notYet.length > 0 && (
                <ul className="mt-4 space-y-1 border-t border-line pt-3 text-xs text-muted">
                    {c.notYet.map((n) => (
                        <li key={n}>{n}</li>
                    ))}
                </ul>
            )}
        </Card>
    );
}

function TargetLine({ target, avgLow, avgHigh }: { target: { score: number; yes: number; maybe: number; no: number }; avgLow: number; avgHigh: number }) {
    const verdict = avgLow >= target.score ? 'Lớp sẽ đạt mục tiêu nếu giữ nhịp.' : avgHigh < target.score ? 'Lớp khó đạt mục tiêu nếu không tăng nhịp.' : 'Lớp có thể đạt mục tiêu, chưa chắc.';
    return (
        <p className="mt-2 text-sm text-ink-2">
            Mục tiêu {target.score}: {verdict} {target.yes} em chắc đạt, {target.maybe} em có thể, {target.no} em khó đạt.
        </p>
    );
}

/** Each student's forecast range on one axis, with the target as a line. */
function ScoreRanges({ ranges, target, classId }: { ranges: { userId: string; name: string; low: number; high: number }[]; target: number | null; classId: string }) {
    if (ranges.length === 0) return null;
    const lo = Math.min(...ranges.map((r) => r.low), target ?? Infinity) - 30;
    const hi = Math.max(...ranges.map((r) => r.high), target ?? -Infinity) + 30;
    const x = (v: number) => `${((v - lo) / (hi - lo)) * 100}%`;
    return (
        <div className="mt-3" role="img" aria-label="Khoảng điểm dự báo cuối khoá của từng em">
            <ul className="space-y-1.5">
                {ranges.map((r) => (
                    <li key={r.userId} className="grid grid-cols-[6.5rem_1fr] items-center gap-2 text-xs">
                        <Link prefetch={false} href={`/classes/${classId}/students/${r.userId}`} className="truncate text-ink-2 hover:underline">
                            {r.name}
                        </Link>
                        <div className="relative h-4 rounded-full bg-surface-2">
                            {target !== null && <span className="absolute inset-y-[-3px] w-px bg-warm" style={{ left: x(target) }} />}
                            <span
                                className={`absolute inset-y-1 rounded-full ${target !== null && r.high < target ? 'bg-warm/70' : 'bg-step-nho'}`}
                                style={{ left: x(r.low), width: `calc(${x(r.high)} - ${x(r.low)})`, minWidth: 6 }}
                                title={`${r.low}–${r.high}`}
                            />
                        </div>
                    </li>
                ))}
            </ul>
            <p className="mt-1 flex justify-between pl-[7rem] text-[11px] text-subtle tabular">
                <span>{Math.round(lo)}</span>
                {target !== null && <span className="text-warm">mục tiêu {target}</span>}
                <span>{Math.round(hi)}</span>
            </p>
        </div>
    );
}
