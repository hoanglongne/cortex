'use client';

import { Printer } from 'lucide-react';
import { parentNote, weekDelta, type Board } from '@cortex/lexica-classes';
import { Button, Card, CopyChip, Empty } from '../ui';

/** "Tuần này có gì để kể?": each student's week, praise first, and a message for parents. Prints cleanly. */
export default function Report({ board }: { board: Board }) {
    if (board.students.length === 0) return <Empty title="Chưa có gì để báo cáo">Khi học viên bắt đầu học, báo cáo tuần sẽ hiện ở đây.</Empty>;
    const rows = board.students.map((s) => ({ s, d: weekDelta(s) })).sort((a, b) => b.d.dung - a.d.dung || b.d.nho - a.d.nho);
    const sum = rows.reduce((acc, r) => ({ nho: acc.nho + r.d.nho, dung: acc.dung + r.d.dung }), { nho: 0, dung: 0 });

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-ink-2">
                    Tuần này cả lớp nhớ thêm <b className="text-ink">{sum.nho}</b> từ và nói được thêm <b className="text-ink">{sum.dung}</b> từ.
                </p>
                <Button kind="secondary" size="sm" onClick={() => window.print()}>
                    <Printer className="h-4 w-4" /> In báo cáo
                </Button>
            </div>
            <Card flush>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-line text-left text-xs text-muted">
                            <th className="px-5 py-3 font-medium">Học viên</th>
                            <th className="px-3 py-3 text-right font-medium">+Nhớ</th>
                            <th className="px-3 py-3 text-right font-medium">+Dùng</th>
                            <th className="px-3 py-3 text-right font-medium">Chuỗi</th>
                            <th className="px-5 py-3 text-right font-medium print:hidden">Phụ huynh</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                        {rows.map(({ s, d }) => (
                            <tr key={s.user_id}>
                                <td className="px-5 py-3 font-medium text-ink">{s.name}</td>
                                <td className="px-3 py-3 text-right tabular">{d.nho}</td>
                                <td className="px-3 py-3 text-right tabular">{d.dung}</td>
                                <td className="px-3 py-3 text-right tabular">{s.streak}</td>
                                <td className="px-5 py-2 text-right print:hidden">
                                    <CopyChip text={parentNote(s, board.class.name)} label="Chép tin" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
