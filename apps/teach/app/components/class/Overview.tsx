'use client';

import { daysUntil, studentState, type Board } from '@cortex/classroom';
import { Badge, Button, Card, CardTitle, Empty } from '../ui';
import { activityByDay } from '../../lib/board';
import { moduleFor, modulesOf } from '../../modules';
import InviteStudents from './InviteStudents';
import AppDot from './AppDot';

/** "Lớp này đang thế nào?": work in progress, the week's rhythm, each app's numbers. */
export default function Overview({ board, onGo, onChanged }: { board: Board; onGo: (tab: 'students' | 'assignments') => void; onChanged: () => void }) {
    const students = board.students;
    if (students.length === 0) return <InviteStudents board={board} onChanged={onChanged} highlight />;
    const states = students.map((s) => studentState(s));
    const days = activityByDay(board);
    const maxDay = Math.max(1, ...days.map((d) => d.count));
    const lessons = board.assignments.slice(0, 3);
    const many = board.class.apps.length > 1;

    return (
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <Card>
                <CardTitle aside={<Button kind="ghost" size="sm" onClick={() => onGo('assignments')}>Tất cả bài</Button>}>Bài đang giao</CardTitle>
                {lessons.length === 0 ? (
                    <Empty title="Chưa giao bài nào" action={<Button size="sm" onClick={() => onGo('assignments')}>Giao bài đầu tiên</Button>}>
                        Bài giao đi thẳng vào phiên học của học viên trong ứng dụng.
                    </Empty>
                ) : (
                    <ul className="space-y-4">
                        {lessons.map((a) => {
                            const m = moduleFor(a.app);
                            if (!m) return null;
                            const p = m.core.assignmentProgress({ ...a, payload: m.core.parsePayload(a.kind, a.payload) }, students);
                            return (
                                <li key={a.id}>
                                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                                        <p className="font-medium text-ink">
                                            {a.title} {many && <AppDot app={a.app} />}
                                        </p>
                                        <span className="text-xs text-muted">{a.due_on ? dueText(a.due_on) : m.core.kinds[a.kind]}</span>
                                    </div>
                                    <Progress label={m.progressLabels.done} value={p.done} total={p.total} tone="bg-step-nho" />
                                    {p.deep !== undefined && m.progressLabels.deep && <Progress label={m.progressLabels.deep} value={p.deep} total={p.total} tone="bg-step-dung" />}
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
                                <span className="text-[11px] text-subtle">
                                    {d.date.slice(8)}/{d.date.slice(5, 7)}
                                </span>
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
                {modulesOf(board).map((m) => (
                    <Card key={m.core.id}>
                        <CardTitle aside={many ? <AppDot app={m.core.id} /> : null}>{many ? m.core.name : 'Tiến độ của lớp'}</CardTitle>
                        <m.ClassSummary board={board} />
                    </Card>
                ))}
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
