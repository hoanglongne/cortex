'use client';

import Link from 'next/link';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { activeLabel, parentNote, STEP_LABEL, studentState, weekDelta } from '@cortex/lexica-classes';
import { Badge, Button, Card, CardTitle, CopyChip, ErrorNote, errorText, inputClass, PageHeader, StepBar } from '../../../../../components/ui';
import { useBoard } from '../../../../../lib/board';
import { api } from '../../../../../lib/supabase';

const STEP_NAMES = ['Chưa học', STEP_LABEL.hieu, STEP_LABEL.nho, STEP_LABEL.gap, STEP_LABEL.dung, STEP_LABEL.doi];

/** "Em này kẹt ở đâu?": assigned words by the step they reached, 30 days of learning, a private note. */
export default function StudentPage({ params }: { params: Promise<{ id: string; userId: string }> }) {
    const { id, userId } = use(params);
    const { board, words, reload } = useBoard(id);
    const router = useRouter();
    const [now] = useState(() => Date.now());
    const s = board?.students.find((x) => x.user_id === userId);
    const [note, setNote] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    if (!board) return <div className="h-64 animate-pulse rounded-[var(--radius-card)] bg-surface-2" />;
    if (!s) return <p className="text-muted">Không tìm thấy học viên này trong lớp.</p>;

    const state = studentState(s, now);
    const d = weekDelta(s);
    const assigned = [...new Set((board.assignments ?? []).flatMap((a) => a.card_ids))];
    // Words grouped by the furthest step: the lowest groups are where the student is stuck.
    const groups = STEP_NAMES.map((label, n) => ({ label, n, ids: assigned.filter((cid) => (s.words?.[cid] ?? 0) === n) })).filter((g) => g.ids.length > 0);
    const days = Array.from({ length: 30 }, (_, i) => {
        const t = new Date(now - (29 - i) * 86_400_000);
        return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    });
    const noteValue = note ?? s.note ?? '';

    return (
        <>
            <Link href={`/classes/${id}?tab=students`} className="text-sm text-muted hover:text-ink">
                ← {board.class.name}
            </Link>
            <div className="mt-2">
                <PageHeader
                    title={s.name}
                    sub={`${activeLabel(s.inactive_days, s.joined_at, now)} · vào lớp ${new Date(s.joined_at).toLocaleDateString('vi-VN')}${s.streak ? ` · chuỗi ${s.streak} ngày` : ''}`}
                    actions={<CopyChip text={parentNote(s, board.class.name)} label="Chép tin cho phụ huynh" />}
                />
            </div>
            <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
                <div className="space-y-5">
                    <Card>
                        <CardTitle aside={<Badge tone={state === 'nudge' ? 'warm' : state === 'active' ? 'accent' : 'neutral'}>{state === 'nudge' ? 'Cần nhắc' : state === 'active' ? 'Đang học' : 'Mới vào'}</Badge>}>Tất cả từ của em</CardTitle>
                        <StepBar counts={s.counts} />
                        <p className="mt-3 text-sm text-muted">
                            Tuần này: +{d.nho} Nhớ, +{d.gap} Gặp, +{d.dung} Dùng
                        </p>
                    </Card>
                    <Card>
                        <CardTitle>Từ của lớp: em đang ở bước nào</CardTitle>
                        {assigned.length === 0 ? (
                            <p className="text-sm text-muted">Lớp chưa giao bài nào.</p>
                        ) : (
                            <div className="space-y-4">
                                {groups.map((g) => (
                                    <div key={g.n}>
                                        <p className={`text-sm font-medium ${g.n <= 1 ? 'text-warm' : 'text-ink-2'}`}>
                                            {g.label} · {g.ids.length} từ
                                        </p>
                                        <ul className="mt-1.5 flex flex-wrap gap-1.5">
                                            {g.ids.map((cid) => (
                                                <li key={cid} className={`rounded-full px-2.5 py-1 text-sm ${g.n === 0 ? 'border border-dashed border-line-strong text-muted' : g.n >= 4 ? 'bg-accent-soft text-accent-strong' : 'bg-surface-2 text-ink-2'}`} title={words?.byId.get(cid)?.meaning}>
                                                    {words?.byId.get(cid)?.word.toLowerCase() ?? cid}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
                <div className="space-y-5">
                    <Card>
                        <CardTitle>30 ngày học</CardTitle>
                        <div className="grid grid-cols-10 gap-1.5" role="img" aria-label={`${s.days?.length ?? 0} ngày học trong 30 ngày`}>
                            {days.map((day) => (
                                <span key={day} title={day} className={`aspect-square rounded-md ${s.days?.includes(day) ? 'bg-step-gap' : 'bg-surface-2'}`} />
                            ))}
                        </div>
                        <p className="mt-2 text-xs text-muted">{s.days?.length ?? 0} ngày có học</p>
                    </Card>
                    <Card>
                        <CardTitle>Ghi chú riêng</CardTitle>
                        <p className="mb-2 text-xs text-muted">Chỉ giáo viên và quản lý thấy.</p>
                        <textarea value={noteValue} onChange={(e) => setNote(e.target.value)} rows={4} maxLength={500} className={`${inputClass} h-auto py-2`} placeholder="Ví dụ: hay quên từ dài, thích chủ đề du lịch" />
                        <Button
                            size="sm"
                            className="mt-2"
                            disabled={busy || note === null}
                            onClick={async () => {
                                setBusy(true);
                                try {
                                    await api.setNote(id, userId, noteValue);
                                    setNote(null);
                                    await reload();
                                } catch (e) {
                                    setError(errorText(e));
                                } finally {
                                    setBusy(false);
                                }
                            }}
                        >
                            Lưu ghi chú
                        </Button>
                    </Card>
                    <Button
                        kind="danger"
                        size="sm"
                        onClick={async () => {
                            if (!window.confirm(`Mời ${s.name} ra khỏi lớp? Em ấy vẫn giữ tiến độ học trong Lexica.`)) return;
                            try {
                                await api.removeStudent(id, userId);
                                router.push(`/classes/${id}?tab=students`);
                            } catch (e) {
                                setError(errorText(e));
                            }
                        }}
                    >
                        Mời ra khỏi lớp
                    </Button>
                    <ErrorNote error={error} />
                </div>
            </div>
        </>
    );
}
