'use client';

import Link from 'next/link';
import { weekDelta } from '@cortex/lexica-classes';
import { Card, Empty, PageHeader } from '../../components/ui';
import { useTeaching } from '../../lib/teaching';

/** The week across classes, one row per class; each opens its own report. */
export default function ReportsPage() {
    const { data } = useTeaching();
    const rows = data
        ? data.classes.map((c) => {
              const students = data.boards[c.id]?.students ?? [];
              const d = students.map(weekDelta);
              return {
                  c,
                  students: students.length,
                  active: students.filter((s) => s.inactive_days !== null && s.inactive_days <= 6).length,
                  nho: d.reduce((n, x) => n + x.nho, 0),
                  dung: d.reduce((n, x) => n + x.dung, 0),
              };
          })
        : [];

    return (
        <>
            <PageHeader title="Báo cáo tuần" sub="7 ngày qua. Mở một lớp để in báo cáo hoặc chép tin nhắn cho phụ huynh." />
            {data && rows.length === 0 ? (
                <Empty title="Chưa có lớp nào" />
            ) : (
                <Card flush>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-line text-left text-xs text-muted">
                                <th className="px-5 py-3 font-medium">Lớp</th>
                                <th className="px-3 py-3 text-right font-medium">Học tuần này</th>
                                <th className="px-3 py-3 text-right font-medium">+Nhớ</th>
                                <th className="px-5 py-3 text-right font-medium">+Dùng</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                            {rows.map((r) => (
                                <tr key={r.c.id} className="hover:bg-surface-2/60">
                                    <td className="px-5 py-3">
                                        <Link href={`/classes/${r.c.id}?tab=report`} className="font-medium text-ink hover:underline">
                                            {r.c.name}
                                        </Link>
                                    </td>
                                    <td className="px-3 py-3 text-right tabular">
                                        {r.active}/{r.students}
                                    </td>
                                    <td className="px-3 py-3 text-right tabular">{r.nho}</td>
                                    <td className="px-5 py-3 text-right tabular">{r.dung}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}
        </>
    );
}
