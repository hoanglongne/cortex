'use client';

import { useState } from 'react';
import { cleanSchedule, DOW_SHORT, DOW_LONG, type Slot } from '@cortex/classroom';
import { Button, ErrorNote, errorText } from '../ui';
import { api } from '../../lib/supabase';

const LENGTHS = [45, 60, 75, 90, 105, 120, 150, 180];

/** The weekly timetable: tap the class days, set when each starts and how long it lasts. A new day copies the last one's time. */
export default function ScheduleEditor({ classId, schedule, onSaved }: { classId: string; schedule: Slot[]; onSaved: () => Promise<void> | void }) {
    const [slots, setSlots] = useState<Slot[]>(schedule);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const changed = JSON.stringify(cleanSchedule(slots)) !== JSON.stringify(cleanSchedule(schedule));

    const toggle = (dow: number) =>
        setSlots((xs) => {
            if (xs.some((s) => s.dow === dow)) return xs.filter((s) => s.dow !== dow);
            const like = xs[xs.length - 1] ?? { start: '18:00', minutes: 90 };
            return [...xs, { dow, start: like.start, minutes: like.minutes }].sort((a, b) => a.dow - b.dow);
        });
    const edit = (dow: number, patch: Partial<Slot>) => setSlots((xs) => xs.map((s) => (s.dow === dow ? { ...s, ...patch } : s)));

    return (
        <div>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Ngày học trong tuần">
                {[1, 2, 3, 4, 5, 6, 7].map((d) => {
                    const on = slots.some((s) => s.dow === d);
                    return (
                        <button
                            key={d}
                            type="button"
                            aria-pressed={on}
                            aria-label={DOW_LONG[d]}
                            onClick={() => toggle(d)}
                            className={`h-10 w-11 rounded-full border text-[15px] ${on ? 'border-accent bg-accent text-on-accent font-semibold' : 'border-line-strong text-ink-2 hover:bg-surface-2'}`}
                        >
                            {DOW_SHORT[d]}
                        </button>
                    );
                })}
            </div>
            {slots.length > 0 && (
                <ul className="mt-5 space-y-3">
                    {slots.map((s) => (
                        <li key={s.dow} className="flex items-center gap-2 text-[15px]">
                            <span className="w-8 shrink-0 font-medium text-ink">{DOW_SHORT[s.dow]}</span>
                            <input
                                type="time"
                                value={s.start}
                                onChange={(e) => e.target.value && edit(s.dow, { start: e.target.value })}
                                aria-label={`Giờ bắt đầu ${DOW_LONG[s.dow]}`}
                                className="h-10 min-w-0 flex-1 rounded-[10px] border border-line-strong bg-surface px-2 text-ink"
                            />
                            <select
                                value={s.minutes}
                                onChange={(e) => edit(s.dow, { minutes: +e.target.value })}
                                aria-label={`Thời lượng ${DOW_LONG[s.dow]}`}
                                className="h-10 min-w-0 flex-1 rounded-[10px] border border-line-strong bg-surface px-2 text-ink"
                            >
                                {[...new Set([...LENGTHS, s.minutes])].sort((a, b) => a - b).map((m) => (
                                    <option key={m} value={m}>
                                        {m} phút
                                    </option>
                                ))}
                            </select>
                        </li>
                    ))}
                </ul>
            )}
            <ErrorNote error={error} />
            <Button
                size="sm"
                className="mt-5"
                disabled={busy || !changed}
                onClick={async () => {
                    setBusy(true);
                    setError('');
                    try {
                        await api.setSchedule(classId, cleanSchedule(slots));
                        await onSaved();
                    } catch (e) {
                        setError(errorText(e));
                    } finally {
                        setBusy(false);
                    }
                }}
            >
                Lưu lịch học
            </Button>
        </div>
    );
}
