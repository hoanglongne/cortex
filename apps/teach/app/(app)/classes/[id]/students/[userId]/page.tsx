'use client';

import Link from 'next/link';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { activeLabel, studentState } from '@cortex/classroom';
import { Button, Card, CopyChip, ErrorNote, errorText, inputClass, Label, PageHeader, SectionTitle } from '../../../../../components/ui';
import AppDot from '../../../../../components/class/AppDot';
import { useBoard } from '../../../../../lib/teaching';
import { api } from '../../../../../lib/supabase';
import { parentMessage } from '../../../../../lib/today';
import { moduleFor, modulesOf } from '../../../../../modules';
import { boardForecasts, localDay } from '../../../../../lib/forecasts';
import { useScoreHistories } from '../../../../../lib/useForecasts';
import { ForecastBlock } from '../../../../../components/Forecast';
import ParentCard from '../../../../../components/parents/ParentCard';

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
    const histories = useScoreHistories([id]);

    if (!board) return <div className="h-64 animate-pulse rounded-[var(--radius-card)] bg-surface-2" />;
    if (!s) return <p className="text-muted">Không tìm thấy học viên này trong lớp.</p>;

    const state = studentState(s, now);
    const days = Array.from({ length: 30 }, (_, i) => {
        const t = new Date(now - (29 - i) * 86_400_000);
        return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    });
    const noteValue = note ?? s.note ?? '';
    const many = board.class.apps.length > 1;
    const ahead = boardForecasts(board, histories?.[id] ?? {}, localDay(now)).find((r) => r.userId === userId)?.forecast ?? null;

    return (
        <>
            <Link href={`/classes/${id}?tab=students`} className="text-muted hover:text-ink">
                ← {board.class.name}
            </Link>
            <div className="mt-4">
                <PageHeader
                    title={s.name}
                    sub={`${activeLabel(s.inactive_days, s.joined_at, now)} · vào lớp ${new Date(s.joined_at).toLocaleDateString('vi-VN')}${s.streak ? ` · chuỗi ${s.streak} ngày` : ''}`}
                    actions={<CopyChip text={parentMessage(s, board, moduleFor)} label="Chép tin cho phụ huynh" />}
                />
            </div>
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14">
                <div className="min-w-0 space-y-12">
                    {ahead && (
                        <section>
                            <SectionTitle>Sắp tới</SectionTitle>
                            <Card className={ahead.forecasts.length ? '!py-1' : ''}>
                            {ahead.forecasts.length === 0 ? (
                                <p className="text-ink-2">
                                    {/* Without review numbers there is nothing to say either way */}
                                    {ahead.notYet.some((n) => n.kind === 'forget') ? 'Chưa có dự báo nào cho em.' : 'Chưa thấy điều gì đáng lo: em không có nhiều từ quá hạn ôn và vẫn học đều.'}
                                </p>
                            ) : (
                                <ul className="divide-y divide-line">
                                    {ahead.forecasts.map((f) => (
                                        <li key={f.kind}>
                                            <ForecastBlock forecast={f} board={board} userId={userId} onAssigned={() => void reload()} />
                                        </li>
                                    ))}
                                </ul>
                            )}
                            </Card>
                            {ahead.notYet.length > 0 && (
                                <ul className="mt-4 space-y-1.5 px-1 text-[15px] text-muted">
                                    {ahead.notYet.map((n) => (
                                        <li key={n.kind}>{n.need}</li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    )}
                    {modulesOf(board).map((m) => (
                        <section key={m.core.id}>
                            <SectionTitle aside={state === 'nudge' ? 'Cần nhắc' : state === 'active' ? 'Đang học' : 'Mới vào'} tone={state === 'nudge' ? 'warm' : state === 'active' ? 'accent' : 'muted'}>
                                {many ? <AppDot app={m.core.id} /> : 'Tiến độ của em'}
                            </SectionTitle>
                            <Card>
                                <m.StudentSection student={s} board={board} />
                            </Card>
                        </section>
                    ))}
                </div>
                <div className="min-w-0 space-y-10 lg:pt-1">
                    <section>
                        <Label>30 ngày học</Label>
                        <div className="grid grid-cols-10 gap-1.5" role="img" aria-label={`${s.days.length} ngày học trong 30 ngày`}>
                            {days.map((day) => (
                                <span key={day} title={day} className={`aspect-square rounded-full ${s.days.includes(day) ? 'bg-step-dung' : 'bg-line'}`} />
                            ))}
                        </div>
                        <p className="mt-3 text-ink-2">{s.days.length} ngày có học</p>
                    </section>
                    <ParentCard board={board} userId={userId} name={s.name} />
                    <section>
                        <Label>Ghi chú riêng</Label>
                        <p className="-mt-1 mb-3 text-[15px] text-muted">Chỉ giáo viên và quản lý thấy.</p>
                        <textarea value={noteValue} onChange={(e) => setNote(e.target.value)} rows={4} maxLength={500} className={`${inputClass} h-auto py-3`} placeholder="Ví dụ: hay quên từ dài, thích chủ đề du lịch" />
                        <Button
                            size="sm"
                            className="mt-3"
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
                    </section>
                    <Button
                        kind="danger"
                        size="sm"
                        onClick={async () => {
                            if (!window.confirm(`Mời ${s.name} ra khỏi lớp? Em ấy vẫn giữ tiến độ học trong ứng dụng.`)) return;
                            try {
                                await api.removeStudent(id, userId);
                                await reload();
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
