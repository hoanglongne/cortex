'use client';

import Link from 'next/link';
import { useState } from 'react';
import { activeLabel, studentState, type Board, type StudentState } from '@cortex/classroom';
import { Badge, Card, Empty } from '../ui';
import { modulesOf } from '../../modules';
import AppDot from './AppDot';
import InviteStudents from './InviteStudents';

const STATE: Record<StudentState, { label: string; tone: 'accent' | 'warm' | 'neutral' }> = {
    active: { label: 'Đang học', tone: 'accent' },
    new: { label: 'Mới vào', tone: 'neutral' },
    nudge: { label: 'Cần nhắc', tone: 'warm' },
};

/** "Ai đang ở đâu?": the class list with a filter by state, and how to invite more. */
export default function Students({ board, onChanged, welcome, filter }: { board: Board; onChanged: () => void; welcome: boolean; filter: string | null }) {
    const [show, setShow] = useState<StudentState | 'all'>(filter === 'nudge' || filter === 'new' || filter === 'active' ? filter : 'all');
    const [now] = useState(() => Date.now());
    const rows = board.students.map((s) => ({ s, state: studentState(s, now) }));
    const list = rows.filter((r) => show === 'all' || r.state === show);
    const count = (st: StudentState) => rows.filter((r) => r.state === st).length;

    return (
        <div className="space-y-5">
            {(welcome || board.students.length === 0) && <InviteStudents board={board} onChanged={onChanged} highlight={welcome} />}
            {board.students.length === 0 ? (
                <Empty title="Chưa có học viên">Khi học viên mở link mời và đăng nhập, các em sẽ hiện ở đây kèm tiến độ.</Empty>
            ) : (
                <Card flush>
                    <div className="flex flex-wrap gap-2 border-b border-line px-5 py-3" role="tablist" aria-label="Lọc học viên">
                        {(
                            [
                                ['all', `Tất cả ${rows.length}`],
                                ['nudge', `Cần nhắc ${count('nudge')}`],
                                ['active', `Đang học ${count('active')}`],
                                ['new', `Mới vào ${count('new')}`],
                            ] as const
                        ).map(([id, label]) => (
                            <button key={id} role="tab" aria-selected={show === id} onClick={() => setShow(id)} className={`rounded-full px-3 py-1 text-sm ${show === id ? 'bg-accent-soft font-semibold text-accent-strong' : 'text-muted hover:bg-surface-2'}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                    <ul className="divide-y divide-line">
                        {list.map(({ s, state }) => (
                            <li key={s.user_id}>
                                <Link href={`/classes/${board.class.id}/students/${s.user_id}`} className="grid items-center gap-3 px-5 py-3.5 hover:bg-surface-2/60 sm:grid-cols-[1.2fr_2fr_auto]">
                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-ink">{s.name}</p>
                                        <p className="text-xs text-muted">
                                            {activeLabel(s.inactive_days, s.joined_at, now)}
                                            {s.streak > 0 ? ` · chuỗi ${s.streak} ngày` : ''}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        {modulesOf(board).map((m) => (
                                            <div key={m.core.id}>
                                                {board.class.apps.length > 1 && <AppDot app={m.core.id} />}
                                                <m.StudentSummary app={s.apps[m.core.id] ?? null} />
                                            </div>
                                        ))}
                                    </div>
                                    <Badge tone={STATE[state].tone}>{STATE[state].label}</Badge>
                                </Link>
                            </li>
                        ))}
                        {list.length === 0 && <li className="px-5 py-6 text-center text-sm text-muted">Không có em nào ở nhóm này.</li>}
                    </ul>
                </Card>
            )}
            {!welcome && board.students.length > 0 && <InviteStudents board={board} onChanged={onChanged} />}
        </div>
    );
}
