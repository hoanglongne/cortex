'use client';

import { useEffect, useState } from 'react';
import { api, errorText } from '../lib/api';
import { Badge, Card, ErrorNote } from '../components/ui';

/** "Góp ý": what people sent from Lexica's feedback form, newest first. */

interface Note {
    id: number;
    kind: 'bug' | 'idea' | 'other';
    message: string;
    contact: string | null;
    page: string | null;
    device: string | null;
    created_at: string;
}

const KIND = { bug: 'Lỗi', idea: 'Góp ý', other: 'Khác' } as const;

export default function FeedbackPage() {
    const [rows, setRows] = useState<Note[] | null>(null);
    const [error, setError] = useState('');
    const [kind, setKind] = useState<'all' | Note['kind']>('all');

    useEffect(() => {
        api<Note[]>('/feedback').then(setRows, (e) => {
            setError(errorText(e));
            setRows([]);
        });
    }, []);

    const shown = (rows ?? []).filter((r) => kind === 'all' || r.kind === kind);
    return (
        <div className="flex flex-col gap-4">
            <Card>
                <p className="text-sm text-ink-2">Lời góp ý và báo lỗi người dùng gửi từ Lexica (200 mới nhất). Có thông tin liên hệ thì trả lời trực tiếp.</p>
                <div className="mt-2 flex gap-1.5">
                    {(['all', 'bug', 'idea', 'other'] as const).map((k) => (
                        <button key={k} type="button" onClick={() => setKind(k)} className={`h-8 rounded-full border px-3 text-xs font-semibold ${kind === k ? 'border-accent bg-accent/12 text-accent' : 'border-line-strong text-ink-2'}`}>
                            {k === 'all' ? 'Tất cả' : KIND[k]}
                        </button>
                    ))}
                </div>
            </Card>
            <ErrorNote error={error} />
            {rows === null ? (
                <p className="text-sm text-muted">Đang tải…</p>
            ) : shown.length === 0 && !error ? (
                <Card>
                    <p className="text-sm text-muted">Chưa có góp ý nào.</p>
                </Card>
            ) : (
                <ul className="flex flex-col gap-2">
                    {shown.map((r) => (
                        <li key={r.id}>
                            <Card>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge tone={r.kind === 'bug' ? 'danger' : 'accent'}>{KIND[r.kind]}</Badge>
                                    <span className="text-xs text-muted">{new Date(r.created_at).toLocaleString('vi-VN')}</span>
                                    {r.page && <span className="text-xs text-muted">· {r.page}</span>}
                                </div>
                                <p className="mt-1.5 whitespace-pre-wrap text-sm text-ink">{r.message}</p>
                                {r.contact && <p className="mt-1 text-xs font-semibold text-ink-2">Liên hệ: {r.contact}</p>}
                                {r.device && <p className="mt-1 truncate text-[11px] text-muted">{r.device}</p>}
                            </Card>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
