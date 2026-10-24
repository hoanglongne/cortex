'use client';

import Link from 'next/link';
import { ChevronRight, Flame } from 'lucide-react';
import { useState } from 'react';
import { useLexicaStore } from '../store/lexicaStore';
import { BRANCH_LABEL, currentDay, PATH_DAYS } from '../lib/journey/path';
import { localDate } from '../lib/engagement/ghost';

const WEEKDAY = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/** The last seven days, oldest first, as local dates. */
function lastWeek(today: Date): { date: string; label: string; isToday: boolean }[] {
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        return { date: localDate(d.getTime()), label: WEEKDAY[d.getDay()], isToday: i === 6 };
    });
}

/**
 * "Nhịp học" on Home: the streak, which of the last seven days had a finished
 * session, and how far along the 30-day path the learner is. Links to the path.
 */
export default function PaceCard() {
    const streak = useLexicaStore((s) => s.currentStreak);
    const daysDone = useLexicaStore((s) => s.daysDone);
    const path = useLexicaStore((s) => s.path);
    const [today] = useState(() => new Date());
    const week = lastWeek(today);
    const done = new Set(daysDone);
    const day = path ? currentDay(path, daysDone, localDate(today.getTime())) : null;

    return (
        <Link href="/path" aria-label="Nhịp học, xem lộ trình" className="block w-full rounded-2xl border border-line bg-surface p-4 hover:border-line-strong transition-colors">
            <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">Nhịp học</p>
                <span className="flex items-center gap-1 text-sm font-semibold text-ink">
                    <Flame className={`w-4 h-4 ${streak > 0 ? 'text-warning' : 'text-subtle'}`} /> {streak} ngày liền
                </span>
            </div>
            <ol className="mt-3 grid grid-cols-7 gap-1.5" aria-label="7 ngày qua">
                {week.map((d) => {
                    const on = done.has(d.date);
                    return (
                        <li key={d.date} className="flex flex-col items-center gap-1">
                            <span
                                className={`w-full aspect-square max-w-9 rounded-lg border flex items-center justify-center ${on ? 'bg-accent/80 border-accent' : d.isToday ? 'border-accent/60 border-dashed' : 'border-line bg-surface-2/40'}`}
                                title={on ? 'Đã học' : d.isToday ? 'Hôm nay' : 'Chưa học'}
                            />
                            <span className={`text-[10px] ${d.isToday ? 'text-ink font-semibold' : 'text-subtle'}`}>{d.label}</span>
                        </li>
                    );
                })}
            </ol>
            {path && day && (
                <div className="mt-4">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted">
                            Lộ trình {BRANCH_LABEL[path.branch].toLowerCase()} · <span className="font-mono text-ink">ngày {day}/{PATH_DAYS}</span>
                        </span>
                        <ChevronRight className="w-4 h-4 text-subtle" />
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-surface-3 overflow-hidden">
                        <div className="h-full rounded-full bg-accent/70" style={{ width: `${Math.min(100, Math.round((day / PATH_DAYS) * 100))}%` }} />
                    </div>
                </div>
            )}
        </Link>
    );
}
