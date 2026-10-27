'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { lastWeek, parentLink, weekLabel, type Board, type ReportContent } from '@cortex/classroom';
import { Badge, Button, Card, CopyChip, Empty, ErrorNote, errorText, inputClass } from '../ui';
import ReportView from '../parents/ReportView';
import { api } from '../../lib/supabase';
import { TEACH_URL } from '../../lib/config';
import { localDay } from '../../lib/forecasts';
import { linksMessage, NOTE_CHIPS } from '../../lib/parentReport';
import { useClassParents, useDrafts } from '../../lib/useParents';

/**
 * "Báo cáo tuần" (docs/TEACH_PLAN.md 3.3): for a finished week, each
 * student's report as the system wrote it; the teacher adds a line and
 * approves. Parents see only approved reports, through their own link.
 */
export default function Report({ board }: { board: Board }) {
    const [today] = useState(() => localDay(Date.now()));
    const weeks = [0, 1, 2, 3].map((n) => lastWeek(today, n));
    const [week, setWeek] = useState(weeks[0]);
    const { parents, error, reload } = useClassParents(board.class.id, week);
    const drafts = useDrafts(board, week);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');

    if (board.students.length === 0) return <Empty title="Chưa có gì để báo cáo">Khi học viên bắt đầu học, báo cáo tuần cho phụ huynh sẽ hiện ở đây.</Empty>;
    const approved = parents ? board.students.filter((s) => parents.reports[s.user_id]) : [];
    const opened = approved.filter((s) => (parents?.reports[s.user_id]?.opens ?? 0) > 0);
    const linkable = approved.filter((s) => parents?.links[s.user_id]);
    const pending = parents && drafts ? board.students.filter((s) => !parents.reports[s.user_id]) : [];

    const approveAll = async () => {
        if (!drafts || !window.confirm(`Duyệt ${pending.length} báo cáo còn lại như hệ thống đã soạn (chưa có lời nhắn riêng)?`)) return;
        setBusy(true);
        setErr('');
        try {
            for (const s of pending) await api.approveReport(board.class.id, s.user_id, week, drafts[s.user_id]);
            await reload();
        } catch (e) {
            setErr(errorText(e));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Chọn tuần">
                    {weeks.map((w, i) => (
                        <button
                            key={w}
                            onClick={() => setWeek(w)}
                            aria-pressed={w === week}
                            className={`h-9 rounded-full border px-3 text-sm ${w === week ? 'border-accent bg-accent-soft font-medium text-accent-strong' : 'border-line-strong text-ink-2 hover:bg-surface-2'}`}
                        >
                            {i === 0 ? `Tuần trước · ${weekLabel(w)}` : weekLabel(w)}
                        </button>
                    ))}
                </div>
                {parents && (
                    <p className="text-sm text-ink-2">
                        Đã duyệt <b className="text-ink tabular">{approved.length}</b>/{board.students.length} · phụ huynh đã xem <b className="text-ink tabular">{opened.length}</b>/{approved.length}
                    </p>
                )}
            </div>
            <ErrorNote error={error || err} />
            {parents && (
                <div className="flex flex-wrap gap-2">
                    {pending.length > 0 && (
                        <Button size="sm" onClick={approveAll} disabled={busy}>
                            Duyệt {pending.length} báo cáo còn lại
                        </Button>
                    )}
                    {linkable.length > 0 && (
                        <CopyChip
                            text={linksMessage(
                                linkable.map((s) => ({ name: s.name, link: parentLink(TEACH_URL, parents.links[s.user_id].code) })),
                                weekLabel(week),
                            )}
                            label={`Chép ${linkable.length} link gửi Zalo`}
                        />
                    )}
                    {approved.length > linkable.length && (
                        <span className="self-center text-xs text-muted">{approved.length - linkable.length} em chưa có link phụ huynh: tạo ở trang của em.</span>
                    )}
                </div>
            )}
            {!parents || !drafts ? (
                <div className="h-48 animate-pulse rounded-[var(--radius-card)] bg-surface-2" />
            ) : (
                <ul className="space-y-6">
                    {board.students.map((s) => (
                        <li key={s.user_id}>
                            <StudentReport
                                board={board}
                                userId={s.user_id}
                                name={s.name}
                                week={week}
                                draft={drafts[s.user_id]}
                                approved={parents.reports[s.user_id] ?? null}
                                hasLink={Boolean(parents.links[s.user_id])}
                                onSaved={reload}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function StudentReport({
    board,
    userId,
    name,
    week,
    draft,
    approved,
    hasLink,
    onSaved,
}: {
    board: Board;
    userId: string;
    name: string;
    week: string;
    draft: ReportContent;
    approved: { content: ReportContent; opens: number } | null;
    hasLink: boolean;
    onSaved: () => Promise<void>;
}) {
    // Once approved, the numbers stay as approved; only the teacher's line can change
    const base = approved?.content ?? draft;
    const [note, setNote] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const value = note ?? base.note ?? '';
    const shown: ReportContent = { ...base, ...(value.trim() ? { note: value.trim() } : { note: undefined }) };
    const changed = !approved || (approved.content.note ?? '') !== value.trim();

    return (
        <Card>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <p className="font-serif text-xl font-semibold text-ink">{name}</p>
                <span className="flex flex-wrap gap-1.5">
                    {approved ? (
                        <Badge tone="accent">
                            <Check className="h-3.5 w-3.5" /> Đã duyệt{approved.opens ? ` · phụ huynh đã xem ${approved.opens} lần` : ' · chưa xem'}
                        </Badge>
                    ) : (
                        <Badge tone="warm">Chờ duyệt</Badge>
                    )}
                    {!hasLink && <Badge>Chưa có link</Badge>}
                </span>
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
                <div className="rounded-[12px] bg-bg p-5">
                    <ReportView content={shown} />
                </div>
                <div>
                    <label className="text-[15px] font-medium text-ink-2" htmlFor={`note-${userId}`}>
                        Lời nhắn của bạn (không bắt buộc)
                    </label>
                    <textarea id={`note-${userId}`} value={value} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={500} className={`${inputClass} mt-2 h-auto py-3`} placeholder="Một câu cho phụ huynh" />
                    <div className="mt-3 flex flex-wrap gap-2">
                        {NOTE_CHIPS.map((c) => (
                            <button key={c} type="button" onClick={() => setNote(value.trim() ? `${value.trim()} ${c}` : c)} className="rounded-full border border-line-strong px-3 py-1 text-[13px] text-ink-2 hover:bg-surface-2">
                                {c}
                            </button>
                        ))}
                    </div>
                    <Button
                        size="sm"
                        className="mt-4"
                        disabled={busy || !changed}
                        onClick={async () => {
                            setBusy(true);
                            setError('');
                            try {
                                await api.approveReport(board.class.id, userId, week, shown);
                                await onSaved();
                                setNote(null);
                            } catch (e) {
                                setError(errorText(e));
                            } finally {
                                setBusy(false);
                            }
                        }}
                    >
                        {approved ? 'Cập nhật lời nhắn' : 'Duyệt'}
                    </Button>
                    <ErrorNote error={error} />
                </div>
            </div>
        </Card>
    );
}
