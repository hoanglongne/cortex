'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Plus, Sparkles } from 'lucide-react';
import { api, cached, errorText } from '../lib/api';
import { metricsText, PLACEHOLDER, prefillTrend, SOURCE_LABEL, timeAgo } from '../lib/capture';
import type { Capture, CaptureSource, Trend } from '../lib/types';
import { Badge, Button, Card, ErrorNote, Input, Label, Select, Textarea } from '../components/ui';

const splitList = (s: string) =>
    s
        .split(',')
        .map(x => x.trim())
        .filter(Boolean);

export default function RadarPage() {
    const [captures, setCaptures] = useState<Capture[]>(() => cached<Capture[]>('/captures?dismissed=false') ?? []);
    const [dismissed, setDismissed] = useState(false);
    const [source, setSource] = useState<CaptureSource | ''>('');
    const [error, setError] = useState('');
    const [loaded, setLoaded] = useState(() => cached('/captures?dismissed=false') !== undefined);

    const load = useCallback(async () => {
        try {
            setCaptures(await api<Capture[]>(`/captures?dismissed=${dismissed}`));
            setLoaded(true);
        } catch (err) {
            setError(errorText(err));
        }
    }, [dismissed]);

    useEffect(() => {
        void load();
    }, [load]);

    const shown = useMemo(() => (source ? captures.filter(c => c.source_id === source) : captures), [captures, source]);
    const replace = (c: Capture) => setCaptures(list => list.map(x => (x.id === c.id ? { ...x, ...c } : x)));
    const remove = (id: number) => setCaptures(list => list.filter(x => x.id !== id));

    return (
        <div className="flex flex-col gap-4">
            <div>
                <h1 className="text-lg font-bold">Radar</h1>
                <p className="text-sm text-muted">
                    Bài bạn gửi khi lướt Threads, Facebook, TikTok (extension, chia sẻ trên điện thoại). Chọn bài đáng làm thành trend; bài chưa xử lý vẫn được gom cụm và chấm điểm như các nguồn khác.
                </p>
            </div>

            <QuickAdd onAdded={c => setCaptures(list => [c, ...list.filter(x => x.id !== c.id)])} />

            <div className="flex flex-wrap items-center gap-2">
                <Select value={dismissed ? 'dismissed' : 'open'} onChange={e => setDismissed(e.target.value === 'dismissed')}>
                    <option value="open">Đang chờ</option>
                    <option value="dismissed">Đã bỏ qua</option>
                </Select>
                <Select value={source} onChange={e => setSource(e.target.value as CaptureSource | '')}>
                    <option value="">Mọi nguồn</option>
                    {(Object.keys(SOURCE_LABEL) as CaptureSource[]).map(s => (
                        <option key={s} value={s}>
                            {SOURCE_LABEL[s]}
                        </option>
                    ))}
                </Select>
                <span className="font-mono text-xs text-muted">{shown.length} bài</span>
            </div>

            <ErrorNote error={error} />
            {loaded && shown.length === 0 && (
                <Card className="text-sm text-muted">
                    {dismissed ? (
                        'Chưa bỏ qua bài nào.'
                    ) : (
                        <>
                            Chưa có bài nào. Tạo mã gửi bài ở{' '}
                            <Link href="/system#capture" className="text-accent hover:underline">
                                Hệ thống → Mã gửi bài
                            </Link>{' '}
                            rồi cài extension hoặc Phím tắt iOS (hướng dẫn trong README của Studio).
                        </>
                    )}
                </Card>
            )}
            {shown.map(c => (
                <CaptureCard key={c.id} capture={c} onChange={replace} onRemove={remove} />
            ))}
        </div>
    );
}

function QuickAdd({ onAdded }: { onAdded: (c: Capture) => void }) {
    const [value, setValue] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        const v = value.trim();
        if (!v) return;
        setBusy(true);
        setError('');
        try {
            const isUrl = /^https?:\/\/\S+$/i.test(v);
            onAdded(await api<Capture>('/captures', { method: 'POST', body: isUrl ? { url: v } : { text: v } }));
            setValue('');
        } catch (err) {
            setError(errorText(err));
        } finally {
            setBusy(false);
        }
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-2">
            <div className="flex gap-2">
                <Input value={value} onChange={e => setValue(e.target.value)} placeholder="Dán link bài hoặc nội dung…" className="flex-1 min-w-0" maxLength={2000} />
                <Button variant="secondary" disabled={busy || !value.trim()}>
                    <span className="flex items-center gap-1.5">
                        <Plus className="w-4 h-4" />
                        Thêm
                    </span>
                </Button>
            </div>
            <ErrorNote error={error} />
        </form>
    );
}

function CaptureCard({ capture: c, onChange, onRemove }: { capture: Capture; onChange: (c: Capture) => void; onRemove: (id: number) => void }) {
    const [mode, setMode] = useState<'view' | 'edit' | 'trend'>('view');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [expanded, setExpanded] = useState(false);
    const empty = c.phrase === PLACEHOLDER && !c.body;

    const run = async (fn: () => Promise<void>) => {
        setBusy(true);
        setError('');
        setNotice('');
        try {
            await fn();
        } catch (err) {
            setError(errorText(err));
        } finally {
            setBusy(false);
        }
    };

    const toggleDismiss = () =>
        run(async () => {
            await api<Capture>(`/captures/${c.id}`, { method: 'PATCH', body: { dismissed: !c.dismissed } });
            onRemove(c.id);
        });

    const long = (c.body?.length ?? 0) > 280;
    const metrics = metricsText(c.metrics);

    return (
        <Card className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-subtle">
                <Badge tone={c.source_id === 'capture_threads' ? 'accent' : 'muted'}>{SOURCE_LABEL[c.source_id] ?? c.source_id}</Badge>
                {c.author && <span className="text-ink-2">{c.author}</span>}
                <span>{timeAgo(c.seen_at)}</span>
                {metrics && <span>· {metrics}</span>}
                {c.url && (
                    <a href={c.url} target="_blank" rel="noreferrer" className="ml-auto flex items-center gap-1 hover:text-accent">
                        mở bài <ExternalLink className="w-3 h-3" />
                    </a>
                )}
            </div>

            {mode === 'edit' ? (
                <EditForm capture={c} busy={busy} onCancel={() => setMode('view')} onSave={body => run(async () => {
                    onChange(await api<Capture>(`/captures/${c.id}`, { method: 'PATCH', body }));
                    setMode('view');
                })} />
            ) : (
                <>
                    {empty ? (
                        <p className="text-sm text-muted">Chưa đọc được nội dung bài (trang cần đăng nhập hoặc chặn bot). Bấm “Sửa” để dán nội dung.</p>
                    ) : (
                        <div>
                            <p className={`whitespace-pre-line ${long && !expanded ? 'line-clamp-5' : ''}`}>{c.body ?? c.phrase}</p>
                            {long && (
                                <button onClick={() => setExpanded(!expanded)} className="mt-1 text-xs text-muted hover:text-ink">
                                    {expanded ? 'Thu gọn' : 'Xem thêm'}
                                </button>
                            )}
                        </div>
                    )}
                    {c.note && <p className="rounded-xl bg-accent/10 px-3 py-2 text-sm text-ink-2">{c.note}</p>}
                </>
            )}

            {c.trend && (
                <p className="text-sm text-muted">
                    Đã vào trend{' '}
                    <Link href="/trends" className="text-accent hover:underline">
                        {c.trend.label}
                    </Link>{' '}
                    <Badge>{c.trend.status}</Badge>
                </p>
            )}

            {mode === 'trend' && (
                <TrendForm
                    capture={c}
                    busy={busy}
                    onCancel={() => setMode('view')}
                    onSubmit={body =>
                        run(async () => {
                            const r = await api<{ trend: Trend; generated?: { created: number; rejectedAuto: number }; generateError?: string }>(
                                `/captures/${c.id}/trend`,
                                { method: 'POST', body },
                            );
                            onChange({ ...c, trend: { id: r.trend.id, label: r.trend.label, status: r.trend.status } });
                            setMode('view');
                            if (r.generateError) setError(`Đã tạo trend nhưng sinh nháp lỗi: ${r.generateError}`);
                            else if (r.generated) setNotice(`Đã tạo trend và sinh ${r.generated.created} nháp chờ duyệt (${r.generated.rejectedAuto} bị lọc tự động).`);
                            else setNotice('Đã tạo trend.');
                        })
                    }
                />
            )}

            <ErrorNote error={error} />
            {notice && <p className="rounded-xl border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent">{notice}</p>}

            {mode === 'view' && (
                <div className="flex flex-wrap gap-2">
                    {!c.trend && !c.dismissed && (
                        <Button variant="primary" onClick={() => setMode('trend')} disabled={busy}>
                            <span className="flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4" />
                                Tạo trend
                            </span>
                        </Button>
                    )}
                    <Button variant="ghost" onClick={() => setMode('edit')} disabled={busy}>
                        Sửa
                    </Button>
                    <Button variant="ghost" onClick={toggleDismiss} disabled={busy}>
                        {c.dismissed ? 'Khôi phục' : 'Bỏ qua'}
                    </Button>
                </div>
            )}
        </Card>
    );
}

function EditForm({ capture, busy, onCancel, onSave }: { capture: Capture; busy: boolean; onCancel: () => void; onSave: (body: { text: string; note: string }) => void }) {
    const [text, setText] = useState(capture.body ?? (capture.phrase === PLACEHOLDER ? '' : capture.phrase));
    const [note, setNote] = useState(capture.note ?? '');
    return (
        <div className="flex flex-col gap-2">
            <label className="flex flex-col gap-1.5">
                <Label>Nội dung bài</Label>
                <Textarea rows={4} maxLength={2000} value={text} onChange={e => setText(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1.5">
                <Label>Ghi chú</Label>
                <Textarea rows={2} maxLength={500} value={note} onChange={e => setNote(e.target.value)} />
            </label>
            <div className="flex gap-2">
                <Button onClick={onCancel}>Huỷ</Button>
                <Button variant="primary" disabled={busy} onClick={() => onSave({ text: text.trim(), note: note.trim() })}>
                    Lưu
                </Button>
            </div>
        </div>
    );
}

function TrendForm({
    capture,
    busy,
    onCancel,
    onSubmit,
}: {
    capture: Capture;
    busy: boolean;
    onCancel: () => void;
    onSubmit: (body: { label: string; summary?: string; tags: string[]; targetWords: string[]; generate: boolean }) => void;
}) {
    const initial = prefillTrend(capture);
    const [label, setLabel] = useState(initial.label);
    const [summary, setSummary] = useState(initial.summary);
    const [tags, setTags] = useState('');
    const [words, setWords] = useState('');
    const [generate, setGenerate] = useState(true);

    return (
        <form
            className="flex flex-col gap-3 rounded-xl border border-line p-3"
            onSubmit={e => {
                e.preventDefault();
                onSubmit({ label: label.trim(), summary: summary.trim() || undefined, tags: splitList(tags), targetWords: splitList(words), generate });
            }}
        >
            <label className="flex flex-col gap-1.5">
                <Label>Câu / cụm đang trend *</Label>
                <Input required maxLength={120} value={label} onChange={e => setLabel(e.target.value)} placeholder="Rút gọn thành câu người ta hay nói" />
            </label>
            <label className="flex flex-col gap-1.5">
                <Label>Ngữ cảnh cho AI</Label>
                <Textarea rows={3} maxLength={500} value={summary} onChange={e => setSummary(e.target.value)} />
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                    <Label>Chủ đề (phẩy ngăn cách)</Label>
                    <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="money, work" />
                </label>
                <label className="flex flex-col gap-1.5">
                    <Label>Từ muốn dạy (tuỳ chọn)</Label>
                    <Input value={words} onChange={e => setWords(e.target.value)} placeholder="frugal, deficit" />
                </label>
            </div>
            <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={generate} onChange={e => setGenerate(e.target.checked)} className="accent-[var(--color-accent)]" />
                Sinh nháp luôn (tốn 1 lượt AI)
            </label>
            <div className="flex gap-2">
                <Button type="button" onClick={onCancel}>
                    Huỷ
                </Button>
                <Button variant="primary" disabled={busy || !label.trim()}>
                    {busy ? 'Đang tạo…' : 'Tạo trend'}
                </Button>
            </div>
        </form>
    );
}
