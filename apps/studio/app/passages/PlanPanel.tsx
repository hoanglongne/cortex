'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, cached } from '../lib/api';
import { quoteError } from '../lib/quotes';
import { Button, Card, ErrorNote } from '../components/ui';

/**
 * The 100-passage plan (docs/LEXICA_READING_PLAN.md): a kind × level table
 * of what is approved, waiting and missing, and a button that writes the
 * passages missing most, rotating topics. One request per passage, so the
 * editor sees each one land and a slow model cannot time out the batch.
 */

type Kind = 'text' | 'dialogue';
type Level = 'beginner' | 'intermediate' | 'advanced' | 'expert';

interface Cell {
    kind: Kind;
    level: Level;
    target: number;
    bundled: number;
    approved: number;
    pending: number;
    missing: number;
}

interface Plan {
    cells: Cell[];
    total: { target: number; done: number; pending: number; missing: number };
    topics: Record<Kind, Record<string, number>>;
    usedToday: number;
    maxPerDay: number;
}

interface Result {
    kind: Kind;
    level: Level;
    topic: string;
    saved: 0 | 1;
    failed?: string;
    note?: string;
}

const LEVELS: { id: Level; label: string }[] = [
    { id: 'beginner', label: 'Cơ bản' },
    { id: 'intermediate', label: 'Trung cấp' },
    { id: 'advanced', label: 'Nâng cao' },
    { id: 'expert', label: 'Chuyên gia' },
];
const KINDS: { id: Kind; label: string }[] = [
    { id: 'text', label: 'Đoạn văn' },
    { id: 'dialogue', label: 'Hội thoại' },
];
const BATCH = 5;
const levelLabel = (l: Level) => LEVELS.find((x) => x.id === l)?.label ?? l;
const kindLabel = (k: Kind) => (k === 'dialogue' ? 'hội thoại' : 'đoạn văn');

export default function PlanPanel({ onWritten }: { onWritten: () => void }) {
    const [plan, setPlan] = useState<Plan | null>(() => cached<Plan>('/passages/plan') ?? null);
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [results, setResults] = useState<Result[]>([]);
    const [stopped, setStopped] = useState('');
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        try {
            setPlan(await api<Plan>('/passages/plan'));
        } catch (err) {
            setError(quoteError(err));
        }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => void load(), 0);
        return () => clearTimeout(t);
    }, [load]);

    const left = plan ? Math.max(0, plan.maxPerDay - plan.usedToday) : 0;
    const batch = plan ? Math.min(BATCH, plan.total.missing, left) : 0;

    const write = async () => {
        setBusy(true);
        setError('');
        setStopped('');
        setResults([]);
        try {
            for (let i = 0; i < batch; i++) {
                const r = await api<{ results: Result[]; stopped?: string }>('/passages/plan/generate', { method: 'POST', body: { count: 1 } });
                setResults((rs) => [...rs, ...r.results]);
                if (r.stopped) {
                    setStopped(r.stopped);
                    break;
                }
            }
        } catch (err) {
            setError(quoteError(err));
        } finally {
            setBusy(false);
            await load();
            onWritten();
        }
    };

    if (!plan) return error ? <ErrorNote error={error} /> : null;
    const { total } = plan;
    const pct = (n: number) => `${Math.round((n / total.target) * 100)}%`;

    return (
        <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="font-semibold text-ink">Kế hoạch {total.target} bài đọc</p>
                    <p className="text-sm text-muted">
                        {total.done} đã có · {total.pending} chờ duyệt · {total.missing} còn thiếu
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button onClick={() => setOpen((o) => !o)}>{open ? 'Thu gọn' : 'Xem bảng'}</Button>
                    <Button variant="primary" onClick={() => void write()} disabled={busy || batch === 0}>
                        {busy ? `Đang viết ${results.length + 1}/${batch}…` : `Viết ${batch} bài còn thiếu`}
                    </Button>
                </div>
            </div>

            <div className="mt-3 h-2 rounded-full bg-line overflow-hidden flex" aria-hidden>
                <div className="h-full bg-accent" style={{ width: pct(total.done) }} />
                <div className="h-full bg-accent/40" style={{ width: pct(total.pending) }} />
            </div>
            <p className="mt-2 text-xs text-subtle">
                Đã dùng {plan.usedToday}/{plan.maxPerDay} lượt viết trong 24 giờ (chung với thẻ).
                {left === 0 && ' Hết lượt hôm nay, mai viết tiếp.'}
                {total.missing === 0 && ' Đã đủ bài theo kế hoạch.'}
            </p>

            {results.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm">
                    {results.map((r, i) => (
                        <li key={i} className={r.saved ? 'text-ink-2' : 'text-warning'}>
                            {r.saved ? '✓' : '✗'} {kindLabel(r.kind)} {levelLabel(r.level)}, {r.topic}
                            {r.saved ? (r.note ? ` (lưu ý: ${r.note})` : '') : `: ${r.failed}`}
                        </li>
                    ))}
                    {!busy && <li className="text-muted">Bài mới nằm ở tab Chờ duyệt bên dưới.</li>}
                </ul>
            )}
            {stopped && <p className="mt-2 text-sm text-warning">{stopped}</p>}
            <ErrorNote error={error} />

            {open && (
                <div className="mt-4 space-y-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-muted">
                                    <th className="py-1 pr-3 font-normal" />
                                    {LEVELS.map((l) => (
                                        <th key={l.id} className="py-1 px-2 font-normal">
                                            {l.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {KINDS.map((k) => (
                                    <tr key={k.id} className="border-t border-line align-top">
                                        <td className="py-2 pr-3 text-ink">{k.label}</td>
                                        {LEVELS.map((l) => {
                                            const c = plan.cells.find((x) => x.kind === k.id && x.level === l.id);
                                            if (!c) return <td key={l.id} className="py-2 px-2 text-subtle">–</td>;
                                            const have = c.bundled + c.approved;
                                            return (
                                                <td key={l.id} className="py-2 px-2 whitespace-nowrap">
                                                    <span className="text-ink font-medium">
                                                        {have}/{c.target}
                                                    </span>
                                                    {c.pending > 0 && <span className="block text-xs text-muted">{c.pending} chờ</span>}
                                                    {c.missing > 0 ? (
                                                        <span className="block text-xs text-warning">thiếu {c.missing}</span>
                                                    ) : (
                                                        <span className="block text-xs text-accent">đủ</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-subtle">&ldquo;Đã có&rdquo; gồm bài có sẵn trong app và bài đã duyệt. Bài chờ duyệt cũng được tính để không viết thừa.</p>
                    {KINDS.map((k) => (
                        <div key={k.id}>
                            <p className="text-xs text-muted mb-1">Chủ đề ({k.label.toLowerCase()})</p>
                            <div className="flex flex-wrap gap-1.5">
                                {Object.entries(plan.topics[k.id]).map(([t, n]) => (
                                    <span key={t} className="rounded-full border border-line px-2.5 py-0.5 text-xs text-ink-2">
                                        {t} {n}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
