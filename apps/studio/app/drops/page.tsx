'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Rocket, RotateCcw, X } from 'lucide-react';
import { api, errorText } from '../lib/api';
import type { Card as CardT, Drop } from '../lib/types';
import Scenario from '../components/Scenario';
import { Badge, Button, Card, ErrorNote, Input, Label } from '../components/ui';

const STATUS_TONE = { draft: 'muted', published: 'accent', archived: 'muted' } as const;

const inTwoWeeks = () => new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10);

export default function DropsPage() {
    const [drops, setDrops] = useState<Drop[]>([]);
    const [selected, setSelected] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [form, setForm] = useState({ title: '', id: '', expires: inTwoWeeks() });

    const load = useCallback(async () => {
        try {
            const list = await api<Drop[]>('/drops');
            setDrops(list);
            setSelected(s => s ?? list[0]?.id ?? null);
        } catch (err) {
            setError(errorText(err));
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const create = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const drop = await api<Drop>('/drops', {
                method: 'POST',
                body: {
                    title: form.title,
                    id: form.id || undefined,
                    expiresAt: form.expires ? new Date(`${form.expires}T23:59:59+07:00`).toISOString() : undefined,
                },
            });
            setForm({ title: '', id: '', expires: inTwoWeeks() });
            setSelected(drop.id);
            await load();
        } catch (err) {
            setError(errorText(err));
        }
    };

    const rollback = async () => {
        if (!confirm('Quay manifest về drop phát hành trước đó?')) return;
        setError('');
        try {
            const r = await api<{ manifest: { current: { id: string } | null } }>('/publish/rollback', { method: 'POST' });
            setNotice(`Đã quay lại ${r.manifest.current?.id ?? ''}.`);
            await load();
        } catch (err) {
            setError(errorText(err));
        }
    };

    return (
        <div className="grid lg:grid-cols-[300px_minmax(0,1fr)] gap-6 items-start">
            <div className="flex flex-col gap-4">
                <Card>
                    <form onSubmit={create} className="flex flex-col gap-3">
                        <h2 className="font-bold">Drop mới</h2>
                        <label className="flex flex-col gap-1.5">
                            <Label>Tên *</Label>
                            <Input required maxLength={80} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Tuần lương chưa về" />
                        </label>
                        <label className="flex flex-col gap-1.5">
                            <Label>Mã (mặc định theo tuần)</Label>
                            <Input value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} placeholder="drop-2026-w42" />
                        </label>
                        <label className="flex flex-col gap-1.5">
                            <Label>Ngừng phát thẻ mới sau</Label>
                            <Input type="date" value={form.expires} onChange={e => setForm({ ...form, expires: e.target.value })} />
                        </label>
                        <Button variant="primary">Tạo</Button>
                    </form>
                </Card>
                <div className="flex flex-col gap-2">
                    {drops.map(d => (
                        <button
                            key={d.id}
                            onClick={() => setSelected(d.id)}
                            className={`text-left rounded-2xl border p-4 transition-colors ${
                                selected === d.id ? 'border-accent/40 bg-accent/10' : 'border-line bg-surface hover:bg-surface-2'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="font-medium flex-1 truncate">{d.title}</span>
                                <Badge tone={STATUS_TONE[d.status]}>{d.status}</Badge>
                            </div>
                            <p className="font-mono text-[11px] text-subtle mt-1">
                                {d.id} · {d.card_count ?? 0} thẻ
                            </p>
                        </button>
                    ))}
                </div>
                <Button variant="ghost" onClick={rollback} className="self-start">
                    <span className="flex items-center gap-1.5">
                        <RotateCcw className="w-4 h-4" /> Rollback bản phát hành
                    </span>
                </Button>
            </div>

            <div className="flex flex-col gap-3">
                <ErrorNote error={error} />
                {notice && <p className="rounded-xl border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent break-all">{notice}</p>}
                {selected ? (
                    <DropEditor key={selected} id={selected} onChanged={load} onNotice={setNotice} />
                ) : (
                    <p className="text-muted">Tạo drop đầu tiên ở bên trái.</p>
                )}
            </div>
        </div>
    );
}

function DropEditor({ id, onChanged, onNotice }: { id: string; onChanged: () => Promise<void>; onNotice: (s: string) => void }) {
    const [drop, setDrop] = useState<Drop | null>(null);
    const [cards, setCards] = useState<CardT[]>([]);
    const [available, setAvailable] = useState<CardT[]>([]);
    const [dirty, setDirty] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        try {
            const [d, free] = await Promise.all([api<Drop>(`/drops/${id}`), api<CardT[]>('/cards?unassigned=true')]);
            setDrop(d);
            setCards(d.cards ?? []);
            setAvailable(free.filter(c => c.lifecycle !== 'retired'));
            setDirty(false);
        } catch (err) {
            setError(errorText(err));
        }
    }, [id]);

    useEffect(() => {
        void load();
    }, [load]);

    const inDrop = useMemo(() => new Set(cards.map(c => c.id)), [cards]);

    const move = (index: number, delta: number) => {
        const next = [...cards];
        const [c] = next.splice(index, 1);
        next.splice(Math.max(0, Math.min(next.length, index + delta)), 0, c);
        setCards(next);
        setDirty(true);
    };

    const save = async () => {
        setBusy(true);
        setError('');
        try {
            await api(`/drops/${id}/cards`, { method: 'PUT', body: { cardIds: cards.map(c => c.id) } });
            await load();
            await onChanged();
        } catch (err) {
            setError(errorText(err));
        } finally {
            setBusy(false);
        }
    };

    const publish = async () => {
        if (dirty) await save();
        if (!confirm(`Phát hành "${drop?.title}" tới tất cả người dùng Lexica?`)) return;
        setBusy(true);
        setError('');
        try {
            const r = await api<{ manifestUrl: string }>(`/drops/${id}/publish`, { method: 'POST' });
            onNotice(`Đã phát hành. Manifest: ${r.manifestUrl}`);
            await load();
            await onChanged();
        } catch (err) {
            setError(errorText(err));
        } finally {
            setBusy(false);
        }
    };

    if (!drop) return <p className="text-muted">Đang tải…</p>;

    return (
        <>
            <Card className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold">{drop.title}</h2>
                    <p className="font-mono text-[11px] text-subtle mt-1">
                        {drop.id} · {cards.length} thẻ
                        {drop.expires_at && <> · hết hạn {new Date(drop.expires_at).toLocaleDateString('vi-VN')}</>}
                        {drop.published_at && <> · phát hành {new Date(drop.published_at).toLocaleString('vi-VN')}</>}
                    </p>
                </div>
                <Button onClick={save} disabled={!dirty || busy}>
                    Lưu thứ tự
                </Button>
                <Button variant="primary" onClick={publish} disabled={busy || cards.length === 0}>
                    <span className="flex items-center gap-1.5">
                        <Rocket className="w-4 h-4" /> {drop.status === 'published' ? 'Phát hành lại' : 'Phát hành'}
                    </span>
                </Button>
            </Card>
            <ErrorNote error={error} />
            <p className="text-xs text-subtle">Thay đổi trạng thái thẻ (retire, giữ vĩnh viễn, sửa câu) chỉ tới người dùng ở lần phát hành tiếp theo.</p>

            <Label>Trong drop</Label>
            {cards.length === 0 && <p className="text-sm text-muted">Chưa có thẻ. Thêm từ danh sách bên dưới.</p>}
            {cards.map((c, i) => (
                <div key={c.id} className="flex items-start gap-3 rounded-2xl bg-surface border border-line p-4">
                    <span className="font-mono text-xs text-subtle w-5 pt-1">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                        <Scenario text={c.scenario} />
                        <p className="text-xs text-muted mt-1">
                            {c.translation_hint} · {c.level}
                            {c.lifecycle !== 'trend' && <> · {c.lifecycle}</>}
                        </p>
                    </div>
                    <div className="flex gap-1">
                        <IconBtn label="Lên" onClick={() => move(i, -1)} disabled={i === 0}>
                            <ArrowUp className="w-4 h-4" />
                        </IconBtn>
                        <IconBtn label="Xuống" onClick={() => move(i, 1)} disabled={i === cards.length - 1}>
                            <ArrowDown className="w-4 h-4" />
                        </IconBtn>
                        <IconBtn
                            label="Bỏ khỏi drop"
                            onClick={() => {
                                setCards(cards.filter(x => x.id !== c.id));
                                setAvailable(a => [c, ...a]);
                                setDirty(true);
                            }}
                        >
                            <X className="w-4 h-4" />
                        </IconBtn>
                    </div>
                </div>
            ))}

            <div className="mt-4">
                <Label>Thẻ đã duyệt chưa thuộc drop nào ({available.filter(c => !inDrop.has(c.id)).length})</Label>
            </div>
            {available
                .filter(c => !inDrop.has(c.id))
                .map(c => (
                    <div key={c.id} className="flex items-start gap-3 rounded-2xl border border-dashed border-line-strong p-4">
                        <div className="flex-1 min-w-0">
                            <Scenario text={c.scenario} className="text-sm" />
                            <p className="text-xs text-muted mt-1">
                                {c.translation_hint} · {c.level}
                                {c.trend_label && <> · {c.trend_label}</>}
                            </p>
                        </div>
                        <IconBtn
                            label="Thêm vào drop"
                            onClick={() => {
                                setCards([...cards, c]);
                                setAvailable(a => a.filter(x => x.id !== c.id));
                                setDirty(true);
                            }}
                        >
                            <Plus className="w-4 h-4" />
                        </IconBtn>
                    </div>
                ))}
        </>
    );
}

function IconBtn({ label, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
    return (
        <button
            {...props}
            aria-label={label}
            title={label}
            className="w-9 h-9 rounded-xl border border-line bg-surface-2 flex items-center justify-center text-muted hover:text-ink disabled:opacity-30"
        >
            {children}
        </button>
    );
}
