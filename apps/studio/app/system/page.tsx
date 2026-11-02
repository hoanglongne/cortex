'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, cached, errorText } from '../lib/api';
import { LEVELS, type Lexeme, type Level } from '../lib/types';
import { Badge, Button, Card, ErrorNote, Input, Label, Select } from '../components/ui';
import { allSamples, clearSamples, summarize, type CallSummary } from '../lib/perf';
import { CaptureTokens } from './CaptureTokens';
import { Blocklist, Jobs, Sources } from './Pipeline';

interface Health {
    pendingDrafts: number;
    generationsLast24h: number;
    maxGenerationsPerDay: number;
    recentRuns: { id: number; job: string; started_at: string; ok: boolean | null; error: string | null; stats: Record<string, unknown> }[];
}

export default function SystemPage() {
    const [health, setHealth] = useState<Health | null>(() => cached<Health>('/health') ?? null);
    const [error, setError] = useState('');

    const loadHealth = useCallback(() => {
        api<Health>('/health')
            .then(setHealth)
            .catch(err => setError(errorText(err)));
    }, []);

    useEffect(() => {
        loadHealth();
    }, [loadHealth]);

    return (
        <div className="flex flex-col gap-6">
            <ErrorNote error={error} />
            {health && (
                <div className="grid sm:grid-cols-3 gap-3">
                    <Stat label="Nháp chờ duyệt" value={health.pendingDrafts} />
                    <Stat label="Lượt sinh 24h" value={`${health.generationsLast24h}/${health.maxGenerationsPerDay}`} />
                    <Stat label="Lần chạy gần nhất" value={health.recentRuns[0] ? new Date(health.recentRuns[0].started_at).toLocaleString('vi-VN') : '—'} />
                </div>
            )}

            <Jobs onDone={loadHealth} />

            {health && (
                <Card>
                    <h2 className="font-bold mb-3">Lịch sử chạy</h2>
                    <div className="flex flex-col divide-y divide-line">
                        {health.recentRuns.map(r => (
                            <div key={r.id} className="py-2 flex flex-wrap items-center gap-2 text-sm">
                                <Badge tone={r.ok ? 'accent' : r.ok === false ? 'danger' : 'warning'}>{r.job}</Badge>
                                <span className="font-mono text-xs text-muted">{new Date(r.started_at).toLocaleString('vi-VN')}</span>
                                <span className="font-mono text-xs text-subtle truncate flex-1">
                                    {r.error ?? Object.entries(r.stats).map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : String(v)}`).join(' · ')}
                                </span>
                            </div>
                        ))}
                        {health.recentRuns.length === 0 && <p className="text-sm text-muted">Chưa có lần chạy nào.</p>}
                    </div>
                </Card>
            )}

            <Perf />
            <CaptureTokens />
            <Sources />
            <Blocklist />
            <Lexemes />
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string | number }) {
    return (
        <Card>
            <Label>{label}</Label>
            <p className="font-mono text-2xl mt-1">{value}</p>
        </Card>
    );
}

function Lexemes() {
    const [q, setQ] = useState('');
    const [list, setList] = useState<Lexeme[]>([]);
    const [form, setForm] = useState<{ word: string; ipa: string; elo: string; level: Level }>({ word: '', ipa: '', elo: '1000', level: 'intermediate' });
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        try {
            setList(await api<Lexeme[]>(`/lexemes${q ? `?q=${encodeURIComponent(q)}` : ''}`));
        } catch (err) {
            setError(errorText(err));
        }
    }, [q]);

    useEffect(() => {
        const t = setTimeout(() => void load(), 250);
        return () => clearTimeout(t);
    }, [load]);

    const add = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await api('/lexemes', {
                method: 'POST',
                body: { word: form.word, ipa: form.ipa || undefined, elo: Number(form.elo), level: form.level },
            });
            setQ(form.word.toLowerCase());
            setForm({ word: '', ipa: '', elo: '1000', level: 'intermediate' });
        } catch (err) {
            setError(errorText(err));
        }
    };

    return (
        <Card className="flex flex-col gap-4">
            <div>
                <h2 className="font-bold">Danh sách từ</h2>
                <p className="text-sm text-muted">AI chỉ được dạy từ có trong danh sách này. Thêm từ mới ở đây trước khi dùng cho trend.</p>
            </div>
            <form onSubmit={add} className="flex flex-wrap items-end gap-2">
                <label className="flex flex-col gap-1.5">
                    <Label>Từ</Label>
                    <Input required value={form.word} onChange={e => setForm({ ...form, word: e.target.value })} className="w-40" />
                </label>
                <label className="flex flex-col gap-1.5">
                    <Label>IPA</Label>
                    <Input value={form.ipa} onChange={e => setForm({ ...form, ipa: e.target.value })} className="w-40" />
                </label>
                <label className="flex flex-col gap-1.5">
                    <Label>ELO</Label>
                    <Input type="number" min={600} max={2000} value={form.elo} onChange={e => setForm({ ...form, elo: e.target.value })} className="w-24" />
                </label>
                <label className="flex flex-col gap-1.5">
                    <Label>Level</Label>
                    <Select value={form.level} onChange={e => setForm({ ...form, level: e.target.value as Level })}>
                        {LEVELS.map(l => (
                            <option key={l}>{l}</option>
                        ))}
                    </Select>
                </label>
                <Button variant="primary">Thêm từ</Button>
            </form>
            <ErrorNote error={error} />
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm từ…" className="w-60" />
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
                {list.map(l => (
                    <div key={l.word} className="flex items-center gap-2 text-sm py-1 border-b border-line">
                        <span className="font-medium">{l.word}</span>
                        {l.ipa && <span className="font-mono text-xs text-subtle">/{l.ipa}/</span>}
                        <span className="ml-auto font-mono text-[11px] text-muted">
                            {l.level} · {l.elo} · dùng {l.times_used}
                        </span>
                    </div>
                ))}
            </div>
        </Card>
    );
}

const ms = (v: number | null) => (v === null ? '—' : `${Math.round(v)}`);

/** Where the time goes: browser-measured total vs. API time, per endpoint. */
function Perf() {
    const [rows, setRows] = useState<CallSummary[]>([]);
    const [copied, setCopied] = useState(false);
    const refresh = () => setRows(summarize(allSamples()));

    useEffect(() => {
        refresh();
        const t = setInterval(refresh, 3000);
        return () => clearInterval(t);
    }, []);

    const copy = async () => {
        await navigator.clipboard.writeText(JSON.stringify(rows, null, 1));
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <Card className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <div className="mr-auto">
                    <h2 className="font-bold">Hiệu năng</h2>
                    <p className="text-sm text-muted">
                        Đi qua các trang rồi quay lại đây. Đơn vị ms. Tổng − API = mạng; API − guard = xử lý + truy vấn.
                    </p>
                </div>
                <Button onClick={copy}>{copied ? 'Đã chép' : 'Chép JSON'}</Button>
                <Button
                    onClick={() => {
                        clearSamples();
                        refresh();
                    }}
                >
                    Xoá
                </Button>
            </div>
            {rows.length === 0 ? (
                <p className="text-sm text-muted">Chưa có lệnh gọi nào.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm font-mono">
                        <thead className="text-left text-xs text-subtle">
                            <tr>
                                <th className="py-1 pr-3">Lệnh</th>
                                <th className="pr-3">Lần</th>
                                <th className="pr-3">Tổng p50</th>
                                <th className="pr-3">p95</th>
                                <th className="pr-3">API</th>
                                <th className="pr-3">Guard</th>
                                <th className="pr-3">KB</th>
                                <th>Lỗi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(r => (
                                <tr key={r.key} className="border-t border-line">
                                    <td className="py-1 pr-3">{r.key}</td>
                                    <td className="pr-3">{r.count}</td>
                                    <td className="pr-3">{ms(r.medianTotal)}</td>
                                    <td className="pr-3">{ms(r.p95Total)}</td>
                                    <td className="pr-3">{ms(r.medianServer)}</td>
                                    <td className="pr-3">{ms(r.medianGuard)}</td>
                                    <td className="pr-3">{(r.medianBytes / 1024).toFixed(1)}</td>
                                    <td>{r.errors || ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
}
