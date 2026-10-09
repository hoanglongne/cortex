'use client';

import Link from 'next/link';
import { useLexicaStore } from '../store/lexicaStore';

export default function LearnedWordsCounter() {
    const learnedCount = useLexicaStore(state => state.getLearnedWordsCount());
    const masteredCount = useLexicaStore(state => state.getMasteredWordsCount());

    return (
        <Link href="/learned">
            <div className="flex items-center gap-4 text-sm px-4 py-2 rounded-lg bg-surface border border-line hover:border-accent transition-all hover:scale-[1.02] active:scale-95 cursor-pointer">
                <div className="flex items-center gap-2">
                    <span className="text-muted">Đã học:</span>
                    <span className="text-accent font-semibold">{learnedCount}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-muted">Thành thạo:</span>
                    <span className="text-warning font-semibold">{masteredCount} thành thạo</span>
                </div>
            </div>
        </Link>
    );
}
