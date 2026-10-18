'use client';

import Link from 'next/link';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { activeLabel, studentState } from '@cortex/classroom';
import { Badge, Button, Card, CardTitle, CopyChip, ErrorNote, errorText, inputClass, PageHeader } from '../../../../../components/ui';
import AppDot from '../../../../../components/class/AppDot';
import { useBoard } from '../../../../../lib/board';
import { api } from '../../../../../lib/supabase';
import { parentMessage } from '../../../../../lib/today';
import { moduleFor, modulesOf } from '../../../../../modules';

/** "Em này kẹt ở đâu?": each app's own section, 30 days of learning, a private note. */
export default function StudentPage({ params }: { params: Promise<{ id: string; userId: string }> }) {
    const { id, userId } = use(params);
    const { board, reload } = useBoard(id);
    const router = useRouter();
    const [now] = useState(() => Date.now());
    const [note, setNote] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const s = board?.students.find((x) => x.user_id === userId);

    if (!board) return <div className="h-64 animate-pulse rounded-[var(--radius-card)] bg-surface-2" />;
    if (!s) return <p className="text-muted">Không tìm thấy học viên này trong lớp.</p>;

    const state = studentState(s, now);
    const days = Array.from({ length: 30 }, (_, i) => {
        const t = new Date(now - (29 - i) * 86_400_000);
        return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    });
    const noteValue = note ?? s.note ?? '';
    const many = board.class.apps.length > 1;

    return (
        <>
            <Link href={`/classes/${id}?tab=students`} className="text-sm text-muted hover:text-ink">
                ← {board.class.name}
            </Link>
            <div className="mt-2">
                <PageHeader
                    title={s.name}
                    sub={`${activeLabel(s.inactive_days, s.joined_at, now)} · vào lớp ${new Date(s.joined_at).toLocaleDateString('vi-VN')}${s.streak ? ` · chuỗi ${s.streak} ngày` : ''}`}
                    actions={<CopyChip text={parentMessage(s, board, moduleFor)} label="Chép tin cho phụ huynh" />}
                />
            </div>
            <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
                <div className="space-y-5">
                    {modulesOf(board).map((m) => (
                        <Card key={m.core.id}>
                            <CardTitle aside={<Badge tone={state === 'nudge' ? 'warm' : state === 'active' ? 'accent' : 'neutral'}>{state === 'nudge' ? 'Cần nhắc' : state === 'active' ? 'Đang học' : 'Mới vào'}</Badge>}>
                                {many ? <AppDot app={m.core.id} /> : 'Tiến độ của em'}
                            </CardTitle>
                            <m.StudentSection student={s} board={board} />
                        </Card>
                    ))}
                </div>
                <div className="space-y-5">
                    <Card>
                        <CardTitle>30 ngày học</CardTitle>
                        <div className="grid grid-cols-10 gap-1.5" role="img" aria-label={`${s.days.length} ngày học trong 30 ngày`}>
                            {days.map((day) => (
                                <span key={day} title={day} className={`aspect-square rounded-md ${s.days.includes(day) ? 'bg-step-gap' : 'bg-surface-2'}`} />
                            ))}
                        </div>
                        <p className="mt-2 text-xs text-muted">{s.days.length} ngày có học</p>
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
                            if (!window.confirm(`Mời ${s.name} ra khỏi lớp? Em ấy vẫn giữ tiến độ học trong ứng dụng.`)) return;
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
