'use client';

import { assignmentProgress, daysUntil, studentState, type Board, type Counts } from '@cortex/lexica-classes';
import { Badge, Button, Card, CardTitle, Empty, StepBar } from '../ui';
import { activityByDay } from '../../lib/board';
import type { WordIndex } from '../../lib/words';
import InviteStudents from './InviteStudents';

/** "Lớp này đang thế nào?": the lessons in progress, the week's rhythm, the class's numbers. */
export default function Overview({ board, onGo }: { board: Board; words: WordIndex | null; onGo: (tab: 'students' | 'assignments') => void }) {
    const students = board.students;
    if (students.length === 0) {
        return <InviteStudents classId={board.class.id} code={board.class.code} onChanged={() => location.reload()} highlight />;
    }
    const states = students.map((s) => studentState(s));
    const avg = (step: keyof Counts) => Math.round(students.reduce((n, s) => n + (s.counts[step] ?? 0), 0) / students.length);
    const days = activityByDay(board);
    const maxDay = Math.max(1, ...days.map((d) => d.count));
    const lessons = (board.assignments ?? []).slice(0, 3);

    return (
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <Card>
                <CardTitle aside={<Button kind="ghost" size="sm" onClick={() => onGo('assignments')}>Tất cả bài</Button>}>Bài đang giao</CardTitle>
                {lessons.length === 0 ? (
                    <Empty title="Chưa giao bài nào" action={<Button size="sm" onClick={() => onGo('assignments')}>Giao bài đầu tiên</Button>}>
                        Giao từ theo buổi học: phiên Hôm nay của học viên sẽ học đúng những từ này trước.
                    </Empty>
                ) : (
                    <ul className="space-y-4">
                        {lessons.map((a) => {
                            const p = assignmentProgress(a, students);
                            return (
                                <li key={a.id}>
                                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                                        <p className="font-medium text-ink">{a.title}</p>
                                        <span className="text-xs text-muted">
                                            {a.card_ids.length} từ{a.due_on ? ` · ${dueText(a.due_on)}` : ''}
                                        </span>
                                    </div>
                                    <Progress label="đã học hết" value={p.learned} total={p.total} tone="bg-step-nho" />
                                    <Progress label="đã nói được hết" value={p.used} total={p.total} tone="bg-step-dung" />
                                </li>
                            );
                        })}
                    </ul>
                )}
            </Card>
            <div className="space-y-5">
                <Card>
                    <CardTitle>Nhịp học 7 ngày</CardTitle>
                    <div className="flex h-24 items-end gap-2" role="img" aria-label="Số em học mỗi ngày trong 7 ngày qua">
                        {days.map((d) => (
                            <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                                <span className="text-xs text-muted tabular">{d.count}</span>
                                <div className="w-full rounded-t-md bg-step-gap" style={{ height: `${(d.count / maxDay) * 64}px`, minHeight: d.count ? 4 : 1, opacity: d.count ? 1 : 0.25 }} />
                                <span className="text-[11px] text-subtle">{d.date.slice(8)}/{d.date.slice(5, 7)}</span>
                            </div>
                        ))}
                    </div>
                    <p className="mt-3 flex flex-wrap gap-2">
                        <Badge tone="accent">{states.filter((s) => s === 'active').length} đang học</Badge>
                        {states.includes('new') && <Badge>{states.filter((s) => s === 'new').length} mới vào</Badge>}
                        {states.includes('nudge') && (
                            <button onClick={() => onGo('students')}>
                                <Badge tone="warm">{states.filter((s) => s === 'nudge').length} cần nhắc</Badge>
                            </button>
                        )}
                    </p>
                </Card>
                <Card>
                    <CardTitle>Trung bình mỗi em</CardTitle>
                    <StepBar counts={{ hieu: avg('hieu'), nho: avg('nho'), gap: avg('gap'), dung: avg('dung'), doi: avg('doi') }} />
                </Card>
            </div>
        </div>
    );
}

function Progress({ label, value, total, tone }: { label: string; value: number; total: number; tone: string }) {
    return (
        <div className="mt-2">
            <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                <div className={`h-full rounded-full ${tone}`} style={{ width: `${total ? (value / total) * 100 : 0}%` }} />
            </div>
            <p className="mt-0.5 text-xs text-muted tabular">
                {value}/{total} em {label}
            </p>
        </div>
    );
}

export function dueText(dueOn: string): string {
    const d = daysUntil(dueOn);
    const date = `${dueOn.slice(8)}/${dueOn.slice(5, 7)}`;
    return d < 0 ? `đã hết hạn ${date}` : d === 0 ? 'hết hạn hôm nay' : d === 1 ? 'hết hạn ngày mai' : `hạn ${date}`;
}
