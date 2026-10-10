'use client';

import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import { api, errorText } from '../lib/api';
import type { Trend, TrendStatus } from '../lib/types';
import { Badge, Button, Card, ErrorNote, Input, Label, Textarea } from '../components/ui';

const STATUS_TONE: Record<TrendStatus, 'muted' | 'accent' | 'warning' | 'danger'> = {
    new: 'accent',
    queued: 'accent',
    generated: 'muted',
    ignored: 'muted',
    blocked: 'danger',
};

const splitList = (s: string) =>
    s
        .split(',')
        .map(x => x.trim())
        .filter(Boolean);

export default function TrendsPage() {
    const [trends, setTrends] = useState<Trend[]>([]);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [busyId, setBusyId] = useState<string | null>(null);
    const [form, setForm] = useState({ label: '', summary: '', url: '', tags: '', words: '' });

    const load = useCallback(async () => {
        try {
            setTrends(await api<Trend[]>('/trends'));
        } catch (err) {
            setError(errorText(err));
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const act = async (id: string, fn: () => Promise<string | void>) => {
        setBusyId(id);
        setError('');
        setNotice('');
        try {
            const msg = await fn();
            if (msg) setNotice(msg);
            await load();
        } catch (err) {
            setError(errorText(err));
        } finally {
            setBusyId(null);
        }
    };

    const create = (e: React.FormEvent) => {
        e.preventDefault();
        void act('new', async () => {
            await api('/trends', {
                method: 'POST',
                body: {
                    label: form.label,
                    summary: form.summary || undefined,
                    url: form.url || undefined,
                    tags: splitList(form.tags),
                    targetWords: splitList(form.words),
                },
            });
            setForm({ label: '', summary: '', url: '', tags: '', words: '' });
            return 'Đã thêm trend.';
        });
    };

    const generate = (t: Trend) =>
        act(t.id, async () => {
            const r = await api<{ created: number; rejectedAuto: number }>(`/trends/${t.id}/generate`, { method: 'POST' });
            return `"${t.label}": ${r.created} nháp chờ duyệt, ${r.rejectedAuto} bị lọc tự động.`;
        });

    const setStatus = (t: Trend, status: TrendStatus) =>
        act(t.id, async () => {
            await api(`/trends/${t.id}`, { method: 'PATCH', body: { status } });
        });

    return (
        <div className="grid lg:grid-cols-[360px_minmax(0,1fr)] gap-6 items-start">
            <Card>
                <form onSubmit={create} className="flex flex-col gap-3">
                    <h2 className="font-bold">Thêm trend</h2>
                    <label className="flex flex-col gap-1.5">
                        <Label>Câu / cụm đang trend *</Label>
                        <Input required maxLength={120} value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="lương chưa về mà bill đã tới" />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <Label>Ngữ cảnh</Label>
                        <Textarea rows={3} maxLength={500} value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} placeholder="Ai hay nói, trong tình huống nào, tâm trạng gì" />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <Label>Link tham khảo</Label>
                        <Input type="url" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://www.tiktok.com/…" />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <Label>Chủ đề (phẩy ngăn cách)</Label>
                        <Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="money, work" />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <Label>Từ muốn dạy (tuỳ chọn, tối đa 5)</Label>
                        <Input value={form.words} onChange={e => setForm({ ...form, words: e.target.value })} placeholder="frugal, deficit" />
                        <span className="text-xs text-subtle">Để trống thì AI tự chọn từ trong danh sách từ (Hệ thống).</span>
                    </label>
                    <Button variant="primary" disabled={busyId === 'new'}>
                        Thêm
                    </Button>
                </form>
            </Card>

            <div className="flex flex-col gap-3">
                <ErrorNote error={error} />
                {notice && <p className="rounded-xl border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent">{notice}</p>}
                {trends.length === 0 && <p className="text-muted">Chưa có trend nào.</p>}
                {trends.map(t => (
                    <Card key={t.id} className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-start gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="font-medium">{t.label}</p>
                                {t.summary && <p className="text-sm text-muted mt-1">{t.summary}</p>}
                            </div>
                            <Badge tone={STATUS_TONE[t.status]}>{t.status}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-subtle">
                            {t.tags.map(tag => (
                                <Badge key={tag}>{tag}</Badge>
                            ))}
                            {t.target_words.length > 0 && <span>từ: {t.target_words.join(', ')}</span>}
                            {t.url && (
                                <a href={t.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-accent">
                                    nguồn <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                            <span className="ml-auto">{new Date(t.created_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="primary" onClick={() => generate(t)} disabled={busyId !== null || t.status === 'blocked'}>
                                <span className="flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4" />
                                    {busyId === t.id ? 'Đang sinh…' : t.generated_at ? 'Sinh thêm' : 'Sinh nháp'}
                                </span>
                            </Button>
                            {t.status !== 'ignored' && (
                                <Button variant="ghost" onClick={() => setStatus(t, 'ignored')} disabled={busyId !== null}>
                                    Bỏ qua
                                </Button>
                            )}
                            {t.status !== 'blocked' ? (
                                <Button variant="danger" onClick={() => setStatus(t, 'blocked')} disabled={busyId !== null}>
                                    Chặn
                                </Button>
                            ) : (
                                <Button variant="ghost" onClick={() => setStatus(t, 'new')} disabled={busyId !== null}>
                                    Bỏ chặn
                                </Button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
