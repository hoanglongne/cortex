'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, errorText } from '../lib/api';
import { Button, Card, ErrorNote } from '../components/ui';

interface Overview {
    pending: Record<string, number>;
    unpublished: Record<string, number>;
}

const ROWS: { key: 'variants' | 'quotes' | 'passages' | 'talk'; label: string; note?: string }[] = [
    { key: 'variants', label: 'Câu mẫu', note: 'luôn gửi lại toàn bộ câu đã duyệt' },
    { key: 'quotes', label: 'Ngoài đời', note: 'gửi cùng với Câu mẫu' },
    { key: 'passages', label: 'Bài đọc' },
    { key: 'talk', label: 'Giao tiếp' },
];

/** One place to send everything approved to Lexica. */
export default function PublishPage() {
    const [data, setData] = useState<Overview | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState<string[]>([]);

    const load = useCallback(() => {
        api<Overview>('/overview')
            .then(setData)
            .catch(err => setError(errorText(err)));
    }, []);

    useEffect(() => {
        const t = setTimeout(load, 0);
        return () => clearTimeout(t);
    }, [load]);

    const unpublished = data ? data.unpublished.quotes + data.unpublished.passages + data.unpublished.talk : 0;

    const publishAll = async () => {
        setBusy(true);
        setError('');
        setDone([]);
        const lines: string[] = [];
        // Câu mẫu and Ngoài đời go in one file, so one call covers both.
        const steps: [string, () => Promise<string>][] = [
            ['Câu mẫu và Ngoài đời', async () => {
                const r = await api<{ variants: number; quotes: number; cards: number }>('/variants/publish', { method: 'POST' });
                return `${r.variants} câu mẫu, ${r.quotes} câu trích, ${r.cards} thẻ`;
            }],
            ['Bài đọc', async () => `${(await api<{ passages: number }>('/passages/publish', { method: 'POST' })).passages} bài`],
            ['Giao tiếp', async () => `${(await api<{ cards: number }>('/talk/publish', { method: 'POST' })).cards} thẻ`],
        ];
        for (const [name, fn] of steps) {
            try {
                lines.push(`✓ ${name}: ${await fn()}`);
            } catch (err) {
                // Nothing approved yet is not a failure worth stopping for
                lines.push(`– ${name}: ${errorText(err)}`);
            }
            setDone([...lines]);
        }
        setBusy(false);
        load();
    };

    return (
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
            <div>
                <h1 className="text-xl font-bold text-ink">Xuất bản</h1>
                <p className="text-sm text-muted">Đưa mọi thứ đã duyệt lên Lexica. Lexica nhận trong lần mở app tới.</p>
            </div>
            <ErrorNote error={error} />

            <Card className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="mr-auto">
                        <p className="text-2xl font-bold text-ink">{data ? unpublished : '…'}</p>
                        <p className="text-sm text-muted">thay đổi chưa xuất bản (không tính Câu mẫu)</p>
                    </div>
                    <Button variant="primary" onClick={() => void publishAll()} disabled={busy}>
                        {busy ? 'Đang xuất bản…' : 'Xuất bản tất cả'}
                    </Button>
                </div>
                <div className="divide-y divide-line rounded-xl border border-line">
                    {ROWS.map(r => (
                        <div key={r.key} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                            <span className="font-medium text-ink">{r.label}</span>
                            {r.note && <span className="text-xs text-subtle">{r.note}</span>}
                            <span className="ml-auto font-mono text-xs text-muted">
                                {r.key === 'variants' ? '' : `${data?.unpublished[r.key] ?? '…'} chưa xuất bản`}
                            </span>
                        </div>
                    ))}
                </div>
                {done.length > 0 && (
                    <ul className="flex flex-col gap-1 font-mono text-xs text-ink-2">
                        {done.map(l => (
                            <li key={l}>{l}</li>
                        ))}
                    </ul>
                )}
            </Card>
        </div>
    );
}
