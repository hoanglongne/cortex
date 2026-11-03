'use client';

import { useEffect, useState } from 'react';
import { api, errorText } from '../lib/api';
import { Badge, Button, Card, ErrorNote, Textarea } from '../components/ui';

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
    scenario: string | null;
    hidden: boolean;
    /** A new sentence waiting for "Xuất bản" (cards of the app itself) */
    rewritten: string | null;
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
                    Các thẻ cần xem lại nhất tuần này. Số liệu cập nhật mỗi đêm từ Đấu trường, bài kiểm tra lớp, thách đấu và nút “Báo thẻ này có vấn đề” trong Lexica. Một thẻ chỉ có tỉ lệ đúng khi đã có ít nhất 8 lượt trả lời.
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
                            <HealthCard row={r} onChange={(next) => setRows((list) => (list ?? []).map((x) => (x.card_id === next.card_id ? next : x)))} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/** One flagged card with its two fixes: write it again, or hide it for now. */
function HealthCard({ row: r, onChange }: { row: Row; onChange: (r: Row) => void }) {
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(r.rewritten ?? r.scenario ?? '');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [note, setNote] = useState('');

    const act = async (path: string, body: object, apply: () => Row, message?: string) => {
        setBusy(true);
        setError('');
        setNote('');
        try {
            await api(`/cards/${r.card_id}/${path}`, { method: 'POST', body });
            onChange(apply());
            if (message) setNote(message);
            setEditing(false);
        } catch (err) {
            setError(errorText(err));
        } finally {
            setBusy(false);
        }
    };

    return (
        <Card className={r.hidden ? 'opacity-70' : ''}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold text-ink">
                    <span lang="en">{r.word ?? r.card_id}</span> <span className="font-mono text-xs text-muted">{r.card_id}</span>
                </p>
                <span className="flex flex-wrap gap-1.5">
                    {r.hidden && <Badge tone="danger">đang ẩn</Badge>}
                    {r.rewritten && <Badge tone="accent">đã viết lại</Badge>}
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

            {editing ? (
                <div className="mt-3 flex flex-col gap-2">
                    <label className="flex flex-col gap-1.5">
                        <span className="font-mono text-[11px] uppercase text-subtle">Câu mới (phải chứa từ “{r.word}”)</span>
                        <Textarea autoFocus rows={3} value={text} onChange={(e) => setText(e.target.value)} />
                    </label>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="primary"
                            disabled={busy || text.trim().length === 0}
                            onClick={() => act('rewrite', { scenario: text.trim() }, () => ({ ...r, rewritten: text.trim() }), 'Đã lưu. Bấm Xuất bản để đưa lên Lexica.')}
                        >
                            Lưu câu mới
                        </Button>
                        <Button disabled={busy} onClick={() => setEditing(false)}>
                            Huỷ
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    {(r.rewritten ?? r.scenario) && <p className="mt-2 rounded-lg bg-surface-2 p-3 text-sm text-ink-2">{r.rewritten ?? r.scenario}</p>}
                    <div className="mt-3 flex flex-wrap gap-2">
                        <Button disabled={busy} onClick={() => setEditing(true)}>
                            Viết lại câu
                        </Button>
                        {r.rewritten && (
                            <Button variant="ghost" disabled={busy} onClick={() => act('unrewrite', {}, () => ({ ...r, rewritten: null }), 'Đã bỏ bản viết lại. Bấm Xuất bản để cập nhật.')}>
                                Bỏ bản viết lại
                            </Button>
                        )}
                        {r.hidden ? (
                            <Button disabled={busy} onClick={() => act('unhide', {}, () => ({ ...r, hidden: false }), 'Đã hiện lại thẻ trong Lexica.')}>
                                Hiện lại thẻ
                            </Button>
                        ) : (
                            <Button variant="danger" disabled={busy} onClick={() => act('hide', { reason: 'từ Sức khoẻ thẻ' }, () => ({ ...r, hidden: true }), 'Đã ẩn: thẻ rời Lexica ngay, người dùng nhận trong lần mở app tới.')}>
                                Tạm ẩn
                            </Button>
                        )}
                    </div>
                </>
            )}
            <ErrorNote error={error} />
            {note && <p className="mt-2 text-sm text-accent">{note}</p>}
        </Card>
    );
}
