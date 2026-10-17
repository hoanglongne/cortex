'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Check, Flag, Share2 } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import StepNumbers from '../components/StepNumbers';
import { BRANCH_LABEL, CHECKPOINTS, currentDay, expectedBy, pathCells, pathDays, PATH_DAYS } from '../lib/journey/path';
import { STEP_HINT, STEP_LABEL, STEPS, type StepCounts } from '../lib/journey/steps';
import { localDate } from '../lib/engagement/ghost';
import { levelDef } from '../lib/levels';
import { sharePathImage } from '../lib/engagement/shareCard';

/**
 * "Lộ trình" (docs/LEXICA_DIRECTION.md): 30 days, the checkpoints, and the
 * four numbers over time against what the pace promises.
 */
export default function PathPage() {
    const path = useLexicaStore((s) => s.path);
    const daysDone = useLexicaStore((s) => s.daysDone);
    const history = useLexicaStore((s) => s.stepHistory);

    if (!path) {
        return (
            <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 px-4 text-center">
                <p className="text-ink font-semibold">Bạn chưa bắt đầu lộ trình nào.</p>
                <Link href="/path/setup" className="h-12 px-6 rounded-xl bg-accent text-on-accent font-bold flex items-center">
                    Bắt đầu lộ trình 30 ngày
                </Link>
            </div>
        );
    }

    const today = localDate();
    const day = currentDay(path, daysDone, today);
    const done = pathDays(path, daysDone);
    const cells = pathCells(path, daysDone, today);
    const expected = expectedBy(path.pace, done.length);

    return (
        <div className="min-h-screen bg-bg px-4 py-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-muted hover:text-accent text-sm">
                        ← Học
                    </Link>
                    <p className="text-ink font-bold">Lộ trình</p>
                    <div className="w-12" />
                </div>

                <section>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-accent">
                        {BRANCH_LABEL[path.branch]} · {levelDef(path.level).label} · {path.pace ? `${path.pace} từ/ngày` : 'duy trì'}
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold text-ink">{path.finished ? 'Đã về đích 30 ngày' : `Ngày ${day}/${PATH_DAYS}`}</h1>
                    <p className="mt-1 text-sm text-muted">
                        {done.length} ngày đã học xong. Bỏ một ngày thì lộ trình dời theo, không mất gì.
                    </p>
                </section>

                <ol data-testid="path-days" className="grid grid-cols-10 gap-1.5 max-w-lg" aria-label="30 ngày">
                    {cells.map((c, i) => {
                        const n = i + 1;
                        const mark = (CHECKPOINTS as readonly number[]).includes(n);
                        return (
                            <li
                                key={n}
                                title={`Ngày ${n}${mark ? ' · mốc' : ''}`}
                                className={`relative aspect-square rounded-md flex items-center justify-center font-mono text-[10px] ${c === 'done' ? 'bg-accent text-on-accent' : c === 'today' ? 'border-2 border-accent text-ink' : 'bg-surface-2 text-subtle'}`}
                            >
                                {c === 'done' ? <Check className="w-3 h-3" /> : n}
                                {mark && <Flag className={`absolute -top-1 -right-1 w-3 h-3 ${c === 'done' ? 'text-ink' : 'text-warning'}`} />}
                            </li>
                        );
                    })}
                </ol>

                <section className="space-y-3">
                    <StepNumbers href={null} />
                    <p className="text-sm text-ink-2">
                        Mục tiêu tới hôm nay: <span className="font-semibold text-ink">{expected.nho} từ Nhớ</span> · về đích: {expected.goal} từ Nhớ.
                    </p>
                    <ul className="text-xs text-muted space-y-1">
                        {STEPS.map((s) => (
                            <li key={s}>
                                <span className="text-ink-2 font-medium">{STEP_LABEL[s]}</span>: {STEP_HINT[s]}
                            </li>
                        ))}
                    </ul>
                </section>

                <Chart history={history} start={path.startDate} pace={path.pace} />

                <section className="space-y-2">
                    <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">Mốc</p>
                    {CHECKPOINTS.map((c) => {
                        const reached = done.length >= c;
                        return (
                            <div key={c} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm">
                                <Flag className={`w-4 h-4 ${reached ? 'text-accent' : 'text-subtle'}`} />
                                <span className="flex-1 text-ink">{c === 30 ? 'Ngày 30: kiểm tra về đích' : `Mốc ngày ${c}`}</span>
                                {reached ? (
                                    <Link href={`/path/checkpoint?day=${c}`} className="text-accent text-xs font-semibold">
                                        {c === 30 && !path.finished ? 'Làm bài' : 'Xem'}
                                    </Link>
                                ) : (
                                    <span className="text-xs text-subtle">còn {c - done.length} ngày</span>
                                )}
                            </div>
                        );
                    })}
                </section>

                {path.finished && (
                    <section className="rounded-2xl border border-accent/40 bg-accent/5 p-5 space-y-3">
                        <p className="text-ink font-semibold">Kiểm tra cuối: {path.finished.score}/{path.finished.total} từ</p>
                        <button
                            onClick={() => void sharePathImage({ counts: path.finished!.counts, branch: BRANCH_LABEL[path.branch], score: path.finished!.score, total: path.finished!.total })}
                            className="h-11 px-4 rounded-xl border border-line bg-surface text-ink text-sm font-medium flex items-center gap-2"
                        >
                            <Share2 className="w-4 h-4" /> Chia sẻ kết quả
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                            <Link href="/path/setup?next=1" className="h-11 rounded-xl bg-accent text-on-accent font-bold text-sm flex items-center justify-center">
                                Lộ trình mới
                            </Link>
                            <MaintainButton />
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

function MaintainButton() {
    const path = useLexicaStore((s) => s.path);
    const setPath = useLexicaStore((s) => s.setPath);
    if (!path) return null;
    const on = path.pace === 0;
    return (
        <button
            onClick={() => setPath({ ...path, pace: on ? 10 : 0 })}
            className="h-11 rounded-xl border border-line bg-surface text-ink text-sm font-medium"
            title="Chỉ ôn và đọc, không thêm từ mới"
        >
            {on ? 'Đang duy trì · bật lại từ mới' : 'Chế độ duy trì'}
        </button>
    );
}

/** Nhớ and Dùng since the start of the path, with the pace's Nhớ line dashed. */
function Chart({ history, start, pace }: { history: Record<string, StepCounts>; start: string; pace: number }) {
    const points = useMemo(
        () =>
            Object.keys(history)
                .filter((d) => d >= start)
                .sort()
                .map((d) => ({ d, ...history[d] })),
        [history, start],
    );
    if (points.length < 2) return <p className="text-xs text-muted">Biểu đồ hiện từ ngày học thứ hai.</p>;
    const w = 600;
    const h = 180;
    // Scaled to what the pace asks by now, so the first weeks are not a flat line at the bottom.
    const max = Math.max(pace * points.length, ...points.map((p) => p.nho), 1) * 1.15;
    const x = (i: number) => (i / (points.length - 1)) * w;
    const y = (v: number) => h - (v / max) * h;
    const line = (key: 'nho' | 'dung' | 'hieu') => points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join(' ');
    return (
        <section aria-label="Tiến độ theo ngày">
            <div className="flex items-center gap-4 font-mono text-[11px] text-muted">
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-ink" />Nhớ</span>
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-accent" />Dùng</span>
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 border-t border-dashed border-subtle" />mục tiêu Nhớ</span>
            </div>
            <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 w-full h-40" preserveAspectRatio="none" role="img" aria-label="Số từ Nhớ và Dùng theo ngày">
                {pace > 0 && <line x1="0" y1={h} x2={w} y2={y(pace * points.length)} strokeDasharray="6 6" strokeWidth="1.5" className="stroke-subtle" />}
                <path d={line('nho')} fill="none" strokeWidth="2.5" className="stroke-ink" />
                <path d={line('dung')} fill="none" strokeWidth="2.5" className="stroke-accent" />
            </svg>
        </section>
    );
}
