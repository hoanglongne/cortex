'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api, cached, errorText } from '../lib/api';
import type { Card as CardT, Lifecycle } from '../lib/types';
import Scenario from '../components/Scenario';
import { Badge, Button, Card, ErrorNote, Input, Select, Textarea } from '../components/ui';
import { BulkBar } from '../components/BulkBar';
import { IconAction, ReviewRow, useRowKeys } from '../components/review';
import { bulkSummary, runBulk, useSelection } from '../lib/bulk';

const LIFECYCLE_TONE: Record<Lifecycle, 'accent' | 'warning' | 'muted'> = {
    trend: 'accent',
    evergreen: 'warning',
    retired: 'muted',
};

/** Cards drawn per step: the API sends up to 300, and drawing them all at once froze the tab. */
const STEP = 40;

export default function CardsPage() {
    const [cards, setCards] = useState<CardT[]>(() => cached<CardT[]>('/cards?') ?? []);
    const [shown, setShown] = useState(STEP);
    const more = useRef<HTMLDivElement>(null);
    const [q, setQ] = useState('');
    const [lifecycle, setLifecycle] = useState<Lifecycle | ''>('');
    const [error, setError] = useState('');
    const [note, setNote] = useState('');
    const [progress, setProgress] = useState('');
    const visible = cards.slice(0, shown);
    const sel = useSelection(visible.map(c => c.id));
    const focused = useRowKeys({ ids: visible.map(c => c.id), onToggle: id => sel.toggle(id) });

    const setLifecycleMany = async (lifecycle: Lifecycle) => {
        const chosen = [...sel.selected];
        setError('');
        setNote('');
        setProgress(`0/${chosen.length}`);
        const updated = new Map<string, CardT>();
        const r = await runBulk(
            chosen,
            async id => updated.set(id, await api<CardT>(`/cards/${id}`, { method: 'PATCH', body: { lifecycle } })),
            n => setProgress(`${n}/${chosen.length}`),
        );
        setProgress('');
        setCards(list => list.map(x => (updated.has(x.id) ? { ...x, ...updated.get(x.id)! } : x)));
        sel.clear();
        setNote(bulkSummary(lifecycle === 'retired' ? 'retire' : 'giữ', r));
        if (r.failed.length) setError(r.failed[0].error);
    };

    const load = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (q) params.set('q', q);
            if (lifecycle) params.set('lifecycle', lifecycle);
            setCards(await api<CardT[]>(`/cards?${params}`));
            setShown(STEP);
        } catch (err) {
            setError(errorText(err));
        }
    }, [q, lifecycle]);

    useEffect(() => {
        // Wait for typing to pause; the first load goes at once.
        const t = setTimeout(() => void load(), q ? 250 : 0);
        return () => clearTimeout(t);
    }, [load, q]);

    // Draw the next cards as the end of the list comes near.
    useEffect(() => {
        const el = more.current;
        if (!el) return;
        const io = new IntersectionObserver(entries => entries[0].isIntersecting && setShown(n => n + STEP), { rootMargin: '800px' });
        io.observe(el);
        return () => io.disconnect();
    }, [shown, cards.length]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
                <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm theo từ…" className="w-60" />
                <Select value={lifecycle} onChange={e => setLifecycle(e.target.value as Lifecycle | '')}>
                    <option value="">Mọi trạng thái</option>
                    <option value="trend">trend</option>
                    <option value="evergreen">evergreen</option>
                    <option value="retired">retired</option>
                </Select>
                <span className="self-center font-mono text-xs text-muted">{cards.length} thẻ</span>
            </div>
            <ErrorNote error={error} />
            {note && <p className="text-sm text-accent">{note}</p>}
            <BulkBar
                total={visible.length}
                selected={sel.selected.size}
                all={sel.all}
                onToggleAll={sel.setAll}
                onApprove={() => void setLifecycleMany('evergreen')}
                onReject={() => void setLifecycleMany('retired')}
                progress={progress}
                approveLabel="Giữ vĩnh viễn"
                rejectLabel="Retire"
            />
            {visible.map(c => (
                <CardRow key={c.id} card={c} focused={focused === c.id} selected={sel.selected.has(c.id)} onToggle={() => sel.toggle(c.id)} onChange={updated => setCards(list => list.map(x => (x.id === updated.id ? { ...x, ...updated } : x)))} />
            ))}
            {shown < cards.length && <div ref={more} className="h-px" />}
        </div>
    );
}

function CardRow({ card, focused, selected, onToggle, onChange }: { card: CardT; focused?: boolean; selected: boolean; onToggle: () => void; onChange: (c: CardT) => void }) {
    const [editing, setEditing] = useState(false);
    const [stats, setStats] = useState(false);
    const [scenario, setScenario] = useState(card.scenario);
    const [hint, setHint] = useState(card.translation_hint);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const patch = async (body: Record<string, unknown>) => {
        setBusy(true);
        setError('');
        try {
            onChange(await api<CardT>(`/cards/${card.id}`, { method: 'PATCH', body }));
            setEditing(false);
        } catch (err) {
            setError(errorText(err));
        } finally {
            setBusy(false);
        }
    };

    const actions = editing ? undefined : (
        <>
            <IconAction kind="edit" disabled={busy} onClick={() => setEditing(true)} />
            {card.lifecycle !== 'retired' ? (
                <IconAction kind="reject" label="Retire" withText disabled={busy} onClick={() => patch({ lifecycle: 'retired' })} />
            ) : (
                <IconAction kind="approve" label="Khôi phục" withText disabled={busy} onClick={() => patch({ lifecycle: 'trend' })} />
            )}
            {card.lifecycle === 'trend' && <IconAction kind="approve" label="Giữ vĩnh viễn" withText disabled={busy} onClick={() => patch({ lifecycle: 'evergreen' })} />}
        </>
    );

    return (
        <ReviewRow id={card.id} focused={focused} selected={selected} onToggle={onToggle} actions={actions}>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="font-bold text-ink">{card.word}</span>
                <Badge tone={LIFECYCLE_TONE[card.lifecycle]}>{card.lifecycle}</Badge>
                <span className="font-mono text-[11px] text-subtle">
                    {card.level} · ELO {card.elo} · r{card.revision}
                    {card.trend_label ? ` · ${card.trend_label}` : ''}
                </span>
                {card.flags?.map(f => (
                    <Badge key={f} tone="danger">
                        {f === 'reported' ? 'bị báo cáo' : f === 'too_hard' ? 'quá khó' : f}
                    </Badge>
                ))}
            </div>
            {editing ? (
                <div className="mt-2 flex flex-col gap-2">
                    <Textarea rows={2} value={scenario} onChange={e => setScenario(e.target.value)} />
                    <Input value={hint} onChange={e => setHint(e.target.value)} />
                    <div className="flex gap-2">
                        <Button onClick={() => setEditing(false)}>Huỷ</Button>
                        <Button variant="primary" disabled={busy} onClick={() => patch({ scenario: scenario.trim(), translationHint: hint.trim() })}>
                            Lưu (tăng revision)
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    <Scenario text={card.scenario} className="mt-1 text-sm" />
                    <p className="text-sm text-muted">{card.translation_hint}</p>
                </>
            )}
            {card.metrics && (
                <>
                    <button onClick={() => setStats(v => !v)} className="mt-1 text-xs text-accent hover:underline">
                        {stats ? 'Ẩn số liệu' : 'Số liệu'}
                    </button>
                    {stats && <Metrics m={card.metrics} />}
                </>
            )}
            {card.drops && card.drops.length > 0 && <p className="mt-1 font-mono text-[11px] text-subtle">trong {card.drops.join(', ')}</p>}
            <ErrorNote error={error} />
        </ReviewRow>
    );
}

function Metrics({ m }: { m: NonNullable<CardT['metrics']> }) {
    const swipes = m.known + m.unknown;
    const reviews = m.review_correct + m.review_wrong;
    const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : '—');
    const items = [
        ['Lượt xem', String(m.impressions)],
        ['Nhớ', pct(m.known, swipes)],
        ['Lật nghĩa', pct(m.reveals, m.impressions)],
        ['Ôn đúng', pct(m.review_correct, reviews)],
        ['Chia sẻ', String(m.shares)],
        ['Báo cáo', String(m.reports)],
        ['Đọc', m.dwell_count > 0 ? `${(m.dwell_ms_total / m.dwell_count / 1000).toFixed(1)}s` : '—'],
    ];
    return (
        <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-subtle">
            {items.map(([label, value]) => (
                <span key={label}>
                    {label} <span className="text-ink-2">{value}</span>
                </span>
            ))}
        </div>
    );
}
