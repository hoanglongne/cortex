'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Presentation } from 'lucide-react';
import { addDays, classDays, dayLabel, MISSED_IN_ROW, scheduleLine, sessionCounts, slotTime, studentRecord, type Board, type ClassDay } from '@cortex/classroom';
import { Badge, Button, Card, Drawer, ErrorNote, errorText, inputClass, Label, LinkButton, SectionTitle } from '../ui';
import Roll from '../lessons/Roll';
import ScheduleEditor from '../lessons/ScheduleEditor';
import { api } from '../../lib/supabase';
import { localDay } from '../../lib/forecasts';
import { useClassAttendance } from '../../lib/useAttendance';

const PAST_SHOWN = 10;
const RECORD_WEEKS = 8;

/**
 * "Buổi học": the timetable, the lessons coming up (cancel one for a holiday),
 * the roll for each lesson held, and who has been missing class.
 */
export default function Lessons({ board, startRoll }: { board: Board; startRoll?: string | null }) {
    const [today] = useState(() => localDay(Date.now()));
    const { attendance, error, reload } = useClassAttendance(board.class.id, today);
    const [roll, setRoll] = useState<string | null>(startRoll && /^\d{4}-\d{2}-\d{2}$/.test(startRoll) && startRoll <= today ? startRoll : null);
    const [extra, setExtra] = useState(false);
    const [all, setAll] = useState(false);
    const [err, setErr] = useState('');

    if (!attendance) return <div className="h-64 animate-pulse rounded-[var(--radius-card)] bg-surface-2" />;
    const ids = board.students.map((s) => s.user_id);
    const ahead = classDays(attendance, today, addDays(today, 14), today).reverse();
    // Timetable days before the teacher's first roll are not "missing" a roll; the last week stays, to catch up
    const rolls = attendance.sessions.filter((x) => !x.cancelled && Object.keys(x.marks).length > 0).map((x) => x.date);
    const firstRoll = rolls.length ? rolls.reduce((a, b) => (a < b ? a : b)) : null;
    const catchUp = addDays(today, -7);
    const past = classDays(attendance, addDays(today, -RECORD_WEEKS * 7), addDays(today, -1), today).filter(
        (d) => d.state !== 'open' || d.date >= catchUp || (firstRoll !== null && d.date >= firstRoll),
    );
    const open = past.filter((d) => d.state === 'open').length;
    const since = addDays(today, -RECORD_WEEKS * 7);
    const records = board.students
        .map((s) => ({ s, r: studentRecord(attendance.sessions.filter((x) => x.date >= since), s.user_id) }))
        .filter((x) => x.r.held > 0)
        .sort((a, b) => b.r.missedInRow - a.r.missedInRow || a.r.came / a.r.held - b.r.came / b.r.held);
    const rollDay = roll ? (classDays(attendance, roll, roll, today)[0] ?? { date: roll, state: 'open' as const }) : null;

    const cancel = async (d: ClassDay, cancelled: boolean) => {
        if (cancelled && d.state === 'marked' && !window.confirm(`Nghỉ buổi ${dayLabel(d.date)}? Điểm danh của buổi này sẽ bị xoá.`)) return;
        setErr('');
        try {
            await api.setSession(board.class.id, d.date, { cancelled });
            await reload();
        } catch (e) {
            setErr(errorText(e));
        }
    };

    return (
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
            <div className="min-w-0 space-y-12">
                <ErrorNote error={error || err} />
                <section>
                    <SectionTitle>Sắp tới</SectionTitle>
                    {ahead.length === 0 ? (
                        <Card>
                            <p className="text-ink-2">
                                {attendance.schedule.length === 0
                                    ? 'Lớp chưa có lịch học. Chọn các ngày học trong tuần ở mục Lịch học, Teach sẽ nhắc bạn điểm danh và báo phụ huynh con đi học mấy buổi.'
                                    : 'Không có buổi nào trong hai tuần tới.'}
                            </p>
                        </Card>
                    ) : (
                        <Card className="!py-1">
                            <ul className="divide-y divide-line">
                                {ahead.map((d) => (
                                    <li key={d.date} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 py-5">
                                        <div className="min-w-0">
                                            <p className={`text-[17px] ${d.state === 'cancelled' ? 'text-muted line-through' : 'text-ink'}`}>
                                                <b className="font-semibold">{d.date === today ? 'Hôm nay' : dayLabel(d.date)}</b>
                                                {d.slot && <span className="text-ink-2"> · {slotTime(d.slot)}</span>}
                                            </p>
                                            {d.state === 'cancelled' && <p className="mt-0.5 text-[15px] text-muted">Nghỉ{d.session?.topic ? `: ${d.session.topic}` : ''}</p>}
                                            {d.date === today && d.state === 'marked' && <RollLine day={d} ids={ids} />}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            {d.date === today && d.state !== 'cancelled' && (
                                                <>
                                                    <Button size="sm" kind={d.state === 'marked' ? 'secondary' : 'primary'} onClick={() => setRoll(today)}>
                                                        {d.state === 'marked' ? 'Sửa điểm danh' : 'Điểm danh'}
                                                    </Button>
                                                    <LinkButton href={`/present/${board.class.id}`} kind="secondary" size="sm">
                                                        <Presentation className="h-4 w-4" /> Trên lớp
                                                    </LinkButton>
                                                </>
                                            )}
                                            {d.state === 'cancelled' ? (
                                                <button onClick={() => void cancel(d, false)} className="px-1 text-[15px] text-accent-strong hover:underline">
                                                    Vẫn học
                                                </button>
                                            ) : (
                                                d.slot &&
                                                d.state !== 'marked' && (
                                                    <button onClick={() => void cancel(d, true)} className="px-1 text-[15px] text-muted hover:text-ink hover:underline">
                                                        Nghỉ buổi này
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}
                </section>

                <section>
                    <SectionTitle aside={open > 0 ? `${open} buổi chưa điểm danh` : undefined} tone="warm">
                        Đã qua
                    </SectionTitle>
                    {past.length > 0 && (
                        <Card className="!py-1">
                            <ul className="divide-y divide-line">
                                {(all ? past : past.slice(0, PAST_SHOWN)).map((d) => (
                                    <li key={d.date} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 py-5">
                                        <div className="min-w-0">
                                            <p className={`text-[17px] ${d.state === 'cancelled' ? 'text-muted line-through' : 'text-ink'}`}>
                                                <b className="font-semibold">{dayLabel(d.date)}</b>
                                                {d.session?.topic && <span className="text-ink-2"> · {d.session.topic}</span>}
                                                {!d.slot && d.state !== 'cancelled' && <span className="text-[15px] text-muted"> · buổi bù</span>}
                                            </p>
                                            {d.state === 'marked' && <RollLine day={d} ids={ids} />}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            {d.state === 'open' && <Badge tone="warm">Chưa điểm danh</Badge>}
                                            {d.state === 'cancelled' && <Badge>Nghỉ</Badge>}
                                            {d.state === 'cancelled' ? (
                                                <button onClick={() => void cancel(d, false)} className="px-1 text-[15px] text-accent-strong hover:underline">
                                                    Có học
                                                </button>
                                            ) : (
                                                <>
                                                    <Button size="sm" kind={d.state === 'open' ? 'primary' : 'secondary'} onClick={() => setRoll(d.date)}>
                                                        {d.state === 'open' ? 'Điểm danh' : 'Sửa'}
                                                    </Button>
                                                    {d.state === 'open' && d.slot && (
                                                        <button onClick={() => void cancel(d, true)} className="px-1 text-[15px] text-muted hover:text-ink hover:underline">
                                                            Hôm đó nghỉ
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            {past.length > PAST_SHOWN && (
                                <button onClick={() => setAll((x) => !x)} className="mb-4 mt-1 text-[15px] text-accent-strong hover:underline">
                                    {all ? 'Thu gọn' : `Xem cả ${past.length} buổi`}
                                </button>
                            )}
                        </Card>
                    )}
                    <div className="mt-5">
                        {extra ? (
                            <label className="flex flex-wrap items-center gap-3 text-[15px] text-ink-2">
                                Ngày của buổi bù
                                <input
                                    type="date"
                                    max={today}
                                    min={addDays(today, -120)}
                                    className={`${inputClass} !h-10 !w-auto`}
                                    onChange={(e) => {
                                        if (e.target.value && e.target.value <= today) {
                                            setRoll(e.target.value);
                                            setExtra(false);
                                        }
                                    }}
                                />
                                <button onClick={() => setExtra(false)} className="text-muted hover:text-ink">
                                    Huỷ
                                </button>
                            </label>
                        ) : (
                            <Button size="sm" kind="secondary" onClick={() => setExtra(true)}>
                                Điểm danh buổi bù
                            </Button>
                        )}
                    </div>
                </section>
            </div>

            <aside className="min-w-0 space-y-10 lg:pt-2">
                <section>
                    <Label>Lịch học</Label>
                    {attendance.schedule.length > 0 && <p className="-mt-1 mb-4 text-ink-2">{scheduleLine(attendance.schedule)}</p>}
                    <ScheduleEditor key={JSON.stringify(attendance.schedule)} classId={board.class.id} schedule={attendance.schedule} onSaved={reload} />
                </section>
                <section>
                    <Label>Chuyên cần {RECORD_WEEKS} tuần</Label>
                    {records.length === 0 ? (
                        <p className="text-[15px] text-muted">Sau buổi điểm danh đầu tiên, số buổi đi học của từng em hiện ở đây.</p>
                    ) : (
                        <ul>
                            {records.map(({ s, r }) => (
                                <li key={s.user_id}>
                                    <Link prefetch={false} href={`/classes/${board.class.id}/students/${s.user_id}`} className="flex items-baseline justify-between gap-3 py-2 hover:text-accent-strong">
                                        <span className="min-w-0 truncate text-ink">{s.name}</span>
                                        <span className={`shrink-0 text-[15px] tabular ${r.missedInRow >= MISSED_IN_ROW ? 'font-semibold text-warm' : 'text-muted'}`}>
                                            {r.missedInRow >= MISSED_IN_ROW ? `vắng ${r.missedInRow} buổi liền` : `${r.came}/${r.held} buổi`}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </aside>

            <Drawer open={Boolean(rollDay)} title={rollDay ? `Điểm danh · ${rollDay.date === today ? 'hôm nay' : dayLabel(rollDay.date)}` : ''} onClose={() => setRoll(null)}>
                {rollDay && (
                    <Roll
                        key={rollDay.date}
                        classId={board.class.id}
                        date={rollDay.date}
                        students={board.students}
                        session={rollDay.session}
                        onSaved={async () => {
                            await reload();
                            setRoll(null);
                        }}
                    />
                )}
            </Drawer>
        </div>
    );
}

/** "12/14 có mặt · 1 muộn · 1 vắng · 1 có phép" */
function RollLine({ day, ids }: { day: ClassDay; ids: string[] }) {
    const c = sessionCounts(day.session, ids);
    return (
        <p className="mt-0.5 text-[15px] text-ink-2">
            <span className="tabular">
                {c.present + c.late}/{ids.length}
            </span>{' '}
            có mặt
            {c.late > 0 && <> · {c.late} muộn</>}
            {c.absent > 0 && <span className="text-warm"> · {c.absent} vắng</span>}
            {c.excused > 0 && <> · {c.excused} có phép</>}
        </p>
    );
}
