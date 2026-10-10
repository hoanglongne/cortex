'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, errorText } from '../lib/api';
import type { Card as CardT, Lifecycle } from '../lib/types';
import Scenario from '../components/Scenario';
import { Badge, Button, Card, ErrorNote, Input, Select, Textarea } from '../components/ui';

const LIFECYCLE_TONE: Record<Lifecycle, 'accent' | 'warning' | 'muted'> = {
    trend: 'accent',
    evergreen: 'warning',
    retired: 'muted',
};

export default function CardsPage() {
    const [cards, setCards] = useState<CardT[]>([]);
    const [q, setQ] = useState('');
    const [lifecycle, setLifecycle] = useState<Lifecycle | ''>('');
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (q) params.set('q', q);
            if (lifecycle) params.set('lifecycle', lifecycle);
            setCards(await api<CardT[]>(`/cards?${params}`));
        } catch (err) {
            setError(errorText(err));
        }
    }, [q, lifecycle]);

    useEffect(() => {
        const t = setTimeout(() => void load(), 250);
        return () => clearTimeout(t);
    }, [load]);

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
            {cards.map(c => (
                <CardRow key={c.id} card={c} onChange={updated => setCards(list => list.map(x => (x.id === updated.id ? { ...x, ...updated } : x)))} />
            ))}
        </div>
    );
}

function CardRow({ card, onChange }: { card: CardT; onChange: (c: CardT) => void }) {
    const [editing, setEditing] = useState(false);
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

    return (
        <Card className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-subtle">
                <span className="text-ink font-sans text-base font-bold">{card.word}</span>
                <Badge tone={LIFECYCLE_TONE[card.lifecycle]}>{card.lifecycle}</Badge>
                <span>{card.level} · ELO {card.elo} · r{card.revision}</span>
                {card.trend_label && <span>· {card.trend_label}</span>}
                <span className="ml-auto">{card.id}</span>
            </div>
            {editing ? (
                <div className="flex flex-col gap-2">
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
                    <Scenario text={card.scenario} />
                    <p className="text-sm text-muted">{card.translation_hint}</p>
                </>
            )}
            <ErrorNote error={error} />
            {!editing && (
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="ghost" onClick={() => setEditing(true)}>
                        Sửa
                    </Button>
                    {card.lifecycle !== 'evergreen' && (
                        <Button variant="ghost" disabled={busy} onClick={() => patch({ lifecycle: 'evergreen' })}>
                            Giữ vĩnh viễn
                        </Button>
                    )}
                    {card.lifecycle !== 'retired' ? (
                        <Button variant="danger" disabled={busy} onClick={() => patch({ lifecycle: 'retired' })}>
                            Retire
                        </Button>
                    ) : (
                        <Button variant="ghost" disabled={busy} onClick={() => patch({ lifecycle: 'trend' })}>
                            Khôi phục
                        </Button>
                    )}
                    {card.drops && card.drops.length > 0 && (
                        <span className="ml-auto font-mono text-[11px] text-subtle">trong {card.drops.join(', ')}</span>
                    )}
                </div>
            )}
        </Card>
    );
}
