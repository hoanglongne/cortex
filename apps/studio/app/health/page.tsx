'use client';

import { useEffect, useState } from 'react';
import { api, errorText } from '../lib/api';
import { Badge, Card, ErrorNote } from '../components/ui';

/**
 * Sức khoẻ nội dung (issue #62): the worst cards this week, from the nightly
 * numbers: many reports, or few right answers in the Đấu trường, the class
 * tests and the duels. Counts only, put together from many students.
 */

interface Row {
    card_id: string;
    word: string | null;
    meaning: string | null;
    answers: number;
    rate: number | null;
    quiz_median_ms: number | null;
    reports: number;
    reasons: Record<string, number>;
    flags: ('low_rate' | 'reported')[];
}

const REASON: Record<string, string> = { wrong_meaning: 'Sai nghĩa', odd_example: 'Ví dụ lạ', wrong_audio: 'Giọng đọc sai', too_hard: 'Quá khó' };

export default function HealthPage() {
    const [rows, setRows] = useState<Row[] | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        api<Row[]>('/card-health').then(setRows, (e) => {
            setError(errorText(e));
            setRows([]);
        });
    }, []);

    return (
        <div className="flex flex-col gap-4">
            <Card>
                <p className="text-sm text-ink-2">
                    Các thẻ cần xem lại nhất tuần này. Số liệu cập nhật mỗi đêm từ Đấu trường, bài kiểm tra lớp, thách đấu và nút "Báo thẻ này có vấn đề" trong Lexica. Một thẻ chỉ có tỉ lệ đúng khi đã có ít nhất 8 lượt trả lời.
                </p>
            </Card>
            <ErrorNote error={error} />
            {rows === null ? (
                <p className="text-sm text-muted">Đang tải…</p>
            ) : rows.length === 0 && !error ? (
                <Card>
                    <p className="text-sm text-muted">Chưa có thẻ nào cần xem. Số liệu có sau đêm đầu tiên khi có người chơi Đấu trường hoặc báo thẻ.</p>
                </Card>
            ) : (
                <ul className="flex flex-col gap-2">
                    {rows.map((r) => (
                        <li key={r.card_id}>
                            <Card>
                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                    <p className="font-semibold text-ink">
                                        <span lang="en">{r.word ?? r.card_id}</span> <span className="font-mono text-xs text-muted">{r.card_id}</span>
                                    </p>
                                    <span className="flex gap-1.5">
                                        {r.flags.includes('reported') && <Badge tone="warning">{r.reports} báo lỗi</Badge>}
                                        {r.flags.includes('low_rate') && <Badge>đúng {Math.round((r.rate ?? 0) * 100)}%</Badge>}
                                    </span>
                                </div>
                                {r.meaning && <p className="mt-1 text-sm text-ink-2">{r.meaning}</p>}
                                <p className="mt-1 text-xs text-muted">
                                    {r.answers} lượt trả lời
                                    {r.quiz_median_ms ? ` · trung vị ${(r.quiz_median_ms / 1000).toFixed(1)}s` : ''}
                                    {Object.keys(r.reasons).length > 0 ? ` · ${Object.entries(r.reasons).map(([k, n]) => `${REASON[k] ?? k} ${n}`).join(', ')}` : ''}
                                </p>
                            </Card>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
