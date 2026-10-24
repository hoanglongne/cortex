'use client';

import { useCallback, useEffect, useState } from 'react';
import { Play, Trash2 } from 'lucide-react';
import { api, errorText } from '../lib/api';
import type { BlockRule, Source } from '../lib/types';
import { Badge, Button, Card, ErrorNote, Input, Label, Select, Textarea } from '../components/ui';

const JOBS = [
    { id: 'collect', label: 'Thu thập', hint: 'Lấy tín hiệu từ các nguồn đang bật' },
    { id: 'cluster', label: 'Gom cụm', hint: 'Gom tín hiệu thành trend' },
    { id: 'score', label: 'Chấm điểm', hint: 'Tính độ nóng, đưa top 15 vào hàng chờ' },
    { id: 'generate', label: 'Sinh nháp', hint: 'Sinh nháp cho trend trong hàng chờ (tốn lượt AI)' },
    { id: 'lifecycle', label: 'Lifecycle', hint: 'Giữ / cho nghỉ thẻ theo phản hồi, phát hành lại drop đang chạy' },
    { id: 'quotes', label: 'Câu ngoài đời', hint: 'Dựng thêm sách vào kho câu, rồi tìm câu trích cho thẻ chưa tìm (chạy mỗi đêm)' },
    { id: 'passages', label: 'Bài đọc theo kế hoạch', hint: 'Viết tiếp bài đọc còn thiếu trong kế hoạch 100 bài, 5 bài mỗi lần, chờ duyệt ở trang Đọc (chạy 4h và 16h)' },
];

export function Jobs({ onDone }: { onDone: () => void }) {
    const [busy, setBusy] = useState<string | null>(null);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');

    const run = async (job: string) => {
        setBusy(job);
        setError('');
        setResult('');
        try {
            const stats = await api<Record<string, unknown>>(`/jobs/${job}`, { method: 'POST' });
            setResult(`${job}: ${JSON.stringify(stats)}`);
            onDone();
        } catch (err) {
            setError(errorText(err));
        } finally {
            setBusy(null);
        }
    };

    return (
        <Card className="flex flex-col gap-3">
            <div>
                <h2 className="font-bold">Chạy pipeline</h2>
                <p className="text-sm text-muted">
                    Server tự chạy theo lịch khi bật STUDIO_CRON=on (thu thập 6h/12h/18h/23h, sinh nháp 1h, lifecycle 3h giờ VN). Ở đây chạy tay từng bước.
                </p>
            </div>
            <div className="flex flex-wrap gap-2">
                {JOBS.map(j => (
                    <Button key={j.id} onClick={() => run(j.id)} disabled={busy !== null} title={j.hint}>
                        <span className="flex items-center gap-1.5">
                            <Play className="w-3.5 h-3.5" />
                            {busy === j.id ? 'Đang chạy…' : j.label}
                        </span>
                    </Button>
                ))}
            </div>
            <ErrorNote error={error} />
            {result && <p className="font-mono text-xs text-ink-2 break-all rounded-xl bg-surface-2 p-3">{result}</p>}
        </Card>
    );
}

export function Sources() {
    const [sources, setSources] = useState<Source[]>([]);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        try {
            setSources(await api<Source[]>('/sources'));
        } catch (err) {
            setError(errorText(err));
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const patch = async (id: string, body: Record<string, unknown>) => {
        setError('');
        try {
            const updated = await api<Source>(`/sources/${id}`, { method: 'PATCH', body });
            setSources(list => list.map(s => (s.id === id ? updated : s)));
        } catch (err) {
            setError(errorText(err));
        }
    };

    return (
        <Card className="flex flex-col gap-4">
            <div>
                <h2 className="font-bold">Nguồn trend</h2>
                <p className="text-sm text-muted">
                    TikTok, Threads, Facebook không có API công khai và cấm scrape, nên thêm tay ở trang Trend. YouTube cần YOUTUBE_API_KEY trên server.
                </p>
            </div>
            <ErrorNote error={error} />
            {sources.map(s => (
                <SourceRow key={s.id} source={s} onPatch={body => patch(s.id, body)} />
            ))}
        </Card>
    );
}

function SourceRow({ source, onPatch }: { source: Source; onPatch: (body: Record<string, unknown>) => Promise<void> }) {
    const [feeds, setFeeds] = useState((source.config.feeds ?? []).join('\n'));
    const [weight, setWeight] = useState(String(source.weight));

    return (
        <div className="rounded-2xl border border-line p-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{source.label}</span>
                <Badge>{source.kind}</Badge>
                {source.last_error ? <Badge tone="danger">lỗi</Badge> : source.last_run_at ? <Badge tone="accent">ok</Badge> : null}
                <label className="ml-auto flex items-center gap-2 text-sm text-muted">
                    <input type="checkbox" checked={source.enabled} onChange={e => void onPatch({ enabled: e.target.checked })} className="accent-[#C6F432] w-4 h-4" />
                    Bật
                </label>
            </div>
            <div className="flex flex-wrap items-end gap-3 font-mono text-[11px] text-subtle">
                <label className="flex flex-col gap-1">
                    <Label>Trọng số</Label>
                    <Input
                        type="number"
                        step="0.1"
                        min={0}
                        max={5}
                        value={weight}
                        onChange={e => setWeight(e.target.value)}
                        onBlur={() => Number(weight) !== source.weight && void onPatch({ weight: Number(weight) })}
                        className="w-24"
                    />
                </label>
                <span>chạy lần cuối: {source.last_run_at ? new Date(source.last_run_at).toLocaleString('vi-VN') : 'chưa'}</span>
            </div>
            {source.last_error && <p className="text-xs text-danger break-all">{source.last_error}</p>}
            {source.kind === 'rss' && (
                <div className="flex flex-col gap-2">
                    <Label>Feed (mỗi dòng một URL)</Label>
                    <Textarea rows={3} value={feeds} onChange={e => setFeeds(e.target.value)} className="font-mono text-xs" />
                    <Button
                        className="self-start"
                        onClick={() =>
                            void onPatch({
                                feeds: feeds
                                    .split('\n')
                                    .map(f => f.trim())
                                    .filter(Boolean),
                            })
                        }
                    >
                        Lưu feed
                    </Button>
                </div>
            )}
        </div>
    );
}

export function Blocklist() {
    const [rules, setRules] = useState<BlockRule[]>([]);
    const [form, setForm] = useState<{ pattern: string; kind: BlockRule['kind']; note: string }>({ pattern: '', kind: 'word', note: '' });
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        try {
            setRules(await api<BlockRule[]>('/blocklist'));
        } catch (err) {
            setError(errorText(err));
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const add = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await api('/blocklist', { method: 'POST', body: { ...form, note: form.note || undefined } });
            setForm({ pattern: '', kind: form.kind, note: '' });
            await load();
        } catch (err) {
            setError(errorText(err));
        }
    };

    const remove = async (pattern: string) => {
        if (!confirm(`Bỏ "${pattern}" khỏi danh sách chặn?`)) return;
        try {
            await api('/blocklist/remove', { method: 'POST', body: { pattern } });
            await load();
        } catch (err) {
            setError(errorText(err));
        }
    };

    return (
        <Card className="flex flex-col gap-4">
            <div>
                <h2 className="font-bold">Danh sách chặn</h2>
                <p className="text-sm text-muted">
                    Áp dụng cho nháp AI và cho trend tự thu thập. word: khớp nguyên từ · topic/person: chứa cụm · regex: biểu thức.
                </p>
            </div>
            <form onSubmit={add} className="flex flex-wrap items-end gap-2">
                <label className="flex flex-col gap-1.5">
                    <Label>Mẫu</Label>
                    <Input required value={form.pattern} onChange={e => setForm({ ...form, pattern: e.target.value })} className="w-48" />
                </label>
                <label className="flex flex-col gap-1.5">
                    <Label>Loại</Label>
                    <Select value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value as BlockRule['kind'] })}>
                        <option value="word">word</option>
                        <option value="topic">topic</option>
                        <option value="person">person</option>
                        <option value="regex">regex</option>
                    </Select>
                </label>
                <label className="flex flex-col gap-1.5">
                    <Label>Ghi chú</Label>
                    <Input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} className="w-48" />
                </label>
                <Button variant="primary">Thêm</Button>
            </form>
            <ErrorNote error={error} />
            <div className="flex flex-wrap gap-2">
                {rules.map(r => (
                    <span key={r.pattern} className="inline-flex items-center gap-2 rounded-xl border border-line px-3 h-9 text-sm" title={r.note ?? ''}>
                        <span className="font-mono text-[11px] text-subtle">{r.kind}</span>
                        {r.pattern}
                        <button onClick={() => void remove(r.pattern)} className="text-muted hover:text-danger" aria-label={`Bỏ ${r.pattern}`}>
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </span>
                ))}
            </div>
        </Card>
    );
}
