'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';

const GOAL = 3;

/**
 * First mission (#164): read something and tap 3 swapped words, here or in
 * the extension. Each tap also puts the word into review, so the first one
 * already counts as "saved". Hidden a day after it is done.
 */
export default function DialMission() {
    const m = useLexicaStore((s) => s.dialMission);
    const taps = Math.min(GOAL, m?.taps ?? 0);
    const done = !!m?.doneAt;
    const [now] = useState(() => Date.now());
    if (done && now - (m?.doneAt ?? 0) > 86_400_000) return null;
    return (
        <section data-testid="dial-mission" className="mb-4 rounded-2xl border border-line bg-surface p-4">
            <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">Nhiệm vụ đầu tiên</p>
            <p className="mt-1 text-sm text-ink">{done ? 'Xong! Các từ bạn chạm đã vào lượt ôn.' : 'Đọc một bài và chạm 3 từ được đổi để xem nghĩa.'}</p>
            <ol className="mt-3 flex gap-2" aria-label={`${taps}/${GOAL} từ`}>
                {Array.from({ length: GOAL }, (_, i) => (
                    <li key={i} className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs ${i < taps ? 'border-accent bg-accent text-on-accent' : 'border-line text-muted'}`}>
                        {i < taps ? <Check className="h-4 w-4" /> : i + 1}
                    </li>
                ))}
                <li className="ml-2 self-center text-xs text-muted">{taps >= 1 ? 'Đã lưu ít nhất 1 từ vào lượt ôn' : 'Mỗi từ chạm vào sẽ được lưu để ôn'}</li>
            </ol>
        </section>
    );
}
