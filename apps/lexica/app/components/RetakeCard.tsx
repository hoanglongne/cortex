'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Gauge, X } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { localDate } from '../lib/engagement/ghost';
import { weekOf } from '../lib/journey/sightings';
import { retake } from '../lib/placement/engine';

/** Learned this many words before suggesting a first test to someone who skipped it. */
const FIRST_AFTER = 30;

/**
 * Home: "Thi lại lấy điểm mới" once a re-take counts (14 days and 100
 * reviews after the last test), or a first test for someone who chose a
 * level by hand and has learned a while. Put away for the week with ×.
 */
export default function RetakeCard() {
    const placements = useLexicaStore((s) => s.placements);
    const progress = useLexicaStore((s) => s.cardProgress);
    const dismissed = useLexicaStore((s) => s.tipsDismissed);
    const dismissTip = useLexicaStore((s) => s.dismissTip);
    const startTest = useLexicaStore((s) => s.startTest);
    const [now] = useState(() => Date.now());

    const reviews = Object.values(progress).reduce((n, c) => n + c.reviewCount + c.wrongCount, 0);
    const last = placements[placements.length - 1];
    const first = !last;
    if (first ? Object.keys(progress).length < FIRST_AFTER : !retake(placements, reviews, now).ok) return null;
    const id = `retake-${weekOf(localDate(now))}`;
    if (dismissed[id]) return null;

    return (
        <section className="w-full rounded-2xl border border-line bg-surface p-4 flex items-start gap-3">
            <span className="w-9 h-9 rounded-xl bg-accent/12 text-accent flex items-center justify-center shrink-0">
                <Gauge className="w-4 h-4" />
            </span>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{first ? 'Đo vốn từ của bạn?' : 'Thi lại để lấy điểm mới?'}</p>
                <p className="mt-0.5 text-xs text-muted">
                    {first
                        ? 'Khoảng 6 phút: điểm từ vựng Lexica, mức tương đương IELTS và vốn từ ước lượng.'
                        : `Lần trước bạn được ${last.score} điểm. Từ đó bạn đã ôn thêm ${reviews - last.reviewsAt} lượt, thử xem điểm lên bao nhiêu.`}
                </p>
                <Link href="/test/quiz" onClick={() => startTest()} className="mt-2 inline-block text-xs font-medium text-accent hover:underline">
                    {first ? 'Làm bài kiểm tra' : 'Thi lại'}
                </Link>
            </div>
            <button onClick={() => dismissTip(id)} aria-label="Ẩn tuần này" className="p-1 text-subtle hover:text-ink">
                <X className="w-4 h-4" />
            </button>
        </section>
    );
}
