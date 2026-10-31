'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarClock, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dateList, dateStatus, type StudyDate } from '../lib/buddySocial';

/**
 * A study date is on: from 15 minutes before to 90 after, a bar on every page
 * ("Hà hẹn học cùng lúc này") that leads to Buddy, where each taps "Vào học".
 * There is no push notification (that needs the server keys); the bar shows
 * while the app is open and a calendar file reminds the phone.
 */
export default function StudyDateBanner() {
    const { user } = useAuth();
    const [open, setOpen] = useState<StudyDate | null>(null);
    const [hidden, setHidden] = useState<string | null>(null);
    useEffect(() => {
        if (!user) return;
        let live = true;
        const check = () =>
            dateList().then(
                (list) => live && setOpen(list.find((d) => dateStatus(d, Date.now()) === 'open' && !d.my_in) ?? null),
                () => undefined,
            );
        const first = setTimeout(() => void check(), 3000);
        const t = setInterval(() => void check(), 60_000);
        return () => {
            live = false;
            clearTimeout(first);
            clearInterval(t);
        };
    }, [user]);
    if (!open || hidden === open.id) return null;
    return (
        <div role="status" className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-2 border-b border-accent/40 bg-surface px-4 py-2 text-sm text-ink">
            <Link href="/buddy" className="flex min-w-0 items-center gap-2">
                <CalendarClock className="h-4 w-4 shrink-0 text-accent" />
                <span className="truncate">{open.their_in ? `${open.with_name ?? 'Bạn học'} đang học, vào học cùng nhé` : `Đến giờ học chung với ${open.with_name ?? 'bạn học'}`}</span>
                <span className="shrink-0 font-bold text-accent">Vào học</span>
            </Link>
            <button onClick={() => setHidden(open.id)} aria-label="Ẩn" className="shrink-0 text-muted">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
