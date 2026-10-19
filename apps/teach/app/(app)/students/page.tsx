'use client';

import Link from 'next/link';
import { useState } from 'react';
import { activeLabel, studentState, type StudentState } from '@cortex/classroom';
import { Badge, Card, Empty, inputClass, PageHeader } from '../../components/ui';
import { moduleFor } from '../../modules';
import { useTeaching } from '../../lib/teaching';

/** Every student across the teacher's classes, findable by name, nudges first. */
export default function StudentsPage() {
    const { data } = useTeaching();
    const [q, setQ] = useState('');
    const [now] = useState(() => Date.now());
    const order: Record<StudentState, number> = { nudge: 0, new: 1, active: 2 };
    const rows = data
        ? data.classes
              .flatMap((c) => (data.boards[c.id]?.students ?? []).map((s) => ({ c, s, state: studentState(s, now) })))
              .filter((r) => r.s.name.toLowerCase().includes(q.trim().toLowerCase()))
              .sort((a, b) => order[a.state] - order[b.state] || a.s.name.localeCompare(b.s.name, 'vi'))
        : [];

    return (
        <>
            <PageHeader title="Học viên" sub={data ? `${rows.length} em trong ${data.classes.length} lớp` : undefined} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tên" aria-label="Tìm học viên" className={`${inputClass} mb-4 max-w-sm`} />
            {data && rows.length === 0 ? (
                <Empty title={q ? 'Không có ai tên như vậy' : 'Chưa có học viên'}>{q ? 'Thử tên khác.' : 'Mở một lớp để lấy link mời gửi cho học viên.'}</Empty>
            ) : (
                <Card flush>
                    <ul className="divide-y divide-line">
                        {rows.map(({ c, s, state }) => (
                            <li key={`${c.id}-${s.user_id}`}>
                                {/* No prefetch: each student page is a server request, one per row. */}
                                <Link href={`/classes/${c.id}/students/${s.user_id}`} prefetch={false} className="grid items-center gap-3 px-5 py-3.5 hover:bg-surface-2/60 sm:grid-cols-[1.2fr_2fr_auto]">
                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-ink">{s.name}</p>
                                        <p className="truncate text-xs text-muted">
                                            {c.name} · {activeLabel(s.inactive_days, s.joined_at, now)}
                                        </p>
                                    </div>
                                    <Summary app={c.apps[0]} data={s.apps[c.apps[0]] ?? null} />
                                    <Badge tone={state === 'nudge' ? 'warm' : state === 'active' ? 'accent' : 'neutral'}>{state === 'nudge' ? 'Cần nhắc' : state === 'active' ? 'Đang học' : 'Mới vào'}</Badge>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Card>
            )}
        </>
    );
}

/** The class's first app's one-line progress. */
function Summary({ app, data }: { app: string; data: Parameters<NonNullable<ReturnType<typeof moduleFor>>['StudentSummary']>[0]['app'] }) {
    const m = moduleFor(app);
    return m ? <m.StudentSummary app={data} /> : <span />;
}
