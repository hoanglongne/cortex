'use client';

import { useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import { UserCardProgress } from '../lib/eloAlgorithm';

interface SRSCalendarProps {
    cardProgress: Record<string, UserCardProgress>;
}

const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTH_LABELS = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];

export default function SRSCalendar({ cardProgress }: SRSCalendarProps) {
    const days = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);

        const progressList = Object.values(cardProgress);

        return Array.from({ length: 14 }, (_, i) => {
            const dayStart = new Date(today);
            dayStart.setDate(today.getDate() + i);
            dayStart.setHours(0, 0, 0, 0);

            const dayEnd = new Date(dayStart);
            dayEnd.setHours(23, 59, 59, 999);

            let count: number;
            if (i === 0) {
                // Today: includes overdue cards (nextReviewAt in the past)
                count = progressList.filter(p => p.nextReviewAt <= dayEnd.getTime()).length;
            } else {
                count = progressList.filter(
                    p => p.nextReviewAt >= dayStart.getTime() && p.nextReviewAt <= dayEnd.getTime()
                ).length;
            }

            return {
                date: dayStart,
                count,
                isToday: i === 0,
                dayLabel: DAY_LABELS[dayStart.getDay()],
                dateNum: dayStart.getDate(),
                monthLabel: MONTH_LABELS[dayStart.getMonth()],
                showMonth: dayStart.getDate() === 1 || i === 0,
            };
        });
    }, [cardProgress]);

    const maxCount = Math.max(...days.map(d => d.count), 1);

    return (
        <div className="bg-surface/30 border border-line rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="w-5 h-5 text-accent" />
                <h2 className="text-base font-bold text-ink">Lịch ôn tập SRS</h2>
                <span className="ml-auto text-xs text-muted">14 ngày tới</span>
            </div>

            <div className="overflow-x-auto">
                <div className="flex gap-1.5 min-w-max pb-1">
                    {days.map((day, i) => {
                        const intensity = day.count === 0 ? 0 : Math.ceil((day.count / maxCount) * 4);
                        const barColor =
                            day.isToday
                                ? 'bg-accent'
                                : intensity >= 4
                                    ? 'bg-warning'
                                    : intensity >= 3
                                        ? 'bg-accent'
                                        : intensity >= 2
                                            ? 'bg-accent'
                                            : intensity >= 1
                                                ? 'bg-surface-3'
                                                : 'bg-surface-2';

                        return (
                            <div
                                key={i}
                                className={`flex flex-col items-center gap-1 w-10 rounded-lg px-1 py-2 transition-all ${day.isToday
 ? 'bg-accent/10 border border-accent/30'
 : 'border border-transparent hover:border-line-strong'
 }`}
                            >
                                {/* Month label if needed */}
                                <span className="text-[9px] text-subtle h-3 leading-none">
                                    {day.showMonth ? day.monthLabel : ''}
                                </span>

                                {/* Day of week */}
                                <span className={`text-[10px] font-medium ${day.isToday ? 'text-accent' : 'text-muted'}`}>
                                    {day.dayLabel}
                                </span>

                                {/* Date number */}
                                <span className={`text-sm font-bold ${day.isToday ? 'text-accent' : 'text-ink-2'}`}>
                                    {day.dateNum}
                                </span>

                                {/* Bar + count */}
                                <div className="flex flex-col items-center gap-1 w-full mt-0.5">
                                    <div className="w-full h-12 bg-bg/50 rounded flex items-end overflow-hidden">
                                        {day.count > 0 && (
                                            <div
                                                className={`w-full ${barColor} rounded transition-all duration-500`}
                                                style={{ height: `${Math.max(20, (day.count / maxCount) * 100)}%` }}
                                            />
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-mono font-semibold ${day.isToday
 ? 'text-accent'
 : day.count > 0
 ? 'text-ink-2'
 : 'text-subtle'
 }`}>
                                        {day.count > 0 ? day.count : '·'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-line/50 text-xs text-muted">
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-accent" />
                    <span>Hôm nay</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-warning" />
                    <span>Nhiều từ</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-surface-2" />
                    <span>Rảnh</span>
                </div>
            </div>
        </div>
    );
}
