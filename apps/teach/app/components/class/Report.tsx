'use client';

import { useState } from 'react';
import { Printer } from 'lucide-react';
import type { Board } from '@cortex/classroom';
import { Button, Card, CopyChip, Empty } from '../ui';
import { moduleFor } from '../../modules';
import { parentMessage } from '../../lib/today';

/** "Tuần này có gì để kể?": each student's week across the class's apps, and a message for parents. Prints cleanly. */
export default function Report({ board }: { board: Board }) {
    const [weekAgo] = useState(() => new Date(Date.now() - 6 * 86_400_000).toISOString().slice(0, 10));
    if (board.students.length === 0) return <Empty title="Chưa có gì để báo cáo">Khi học viên bắt đầu học, báo cáo tuần sẽ hiện ở đây.</Empty>;
    const rows = board.students
        .map((s) => ({ s, days: s.days.filter((d) => d >= weekAgo).length, note: parentMessage(s, board, moduleFor) }))
        .sort((a, b) => b.days - a.days || b.s.streak - a.s.streak);
    const active = rows.filter((r) => r.days > 0).length;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-ink-2">
                    Tuần này <b className="text-ink">{active}</b>/{rows.length} em có học.
                </p>
                <Button kind="secondary" size="sm" onClick={() => window.print()}>
                    <Printer className="h-4 w-4" /> In báo cáo
                </Button>
            </div>
            <Card flush>
                <ul className="divide-y divide-line">
                    {rows.map(({ s, days, note }) => (
                        <li key={s.user_id} className="grid gap-2 px-5 py-3.5 sm:grid-cols-[1fr_auto]">
                            <div className="min-w-0">
                                <p className="font-medium text-ink">
                                    {s.name} <span className="text-xs font-normal text-muted">· {days}/7 ngày học · chuỗi {s.streak}</span>
                                </p>
                                <p className="mt-0.5 text-sm text-ink-2">{note.slice(note.indexOf('tuần này:') + 10)}</p>
                            </div>
                            <div className="print:hidden">
                                <CopyChip text={note} label="Chép tin phụ huynh" />
                            </div>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
}
