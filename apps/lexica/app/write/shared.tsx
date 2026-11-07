'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import type { Check as CheckResult } from '../lib/writing/checks';

/** A draft kept on this device only (never uploaded), so closing the tab does not lose it. */
export function useDraft(key: string, initial = ''): [string, (v: string) => void] {
    const [value, setValue] = useState(initial);
    useEffect(() => {
        try {
            const saved = localStorage.getItem(`lexica-write:${key}`);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            if (saved !== null) setValue(saved);
        } catch {
            // Private mode: the draft lasts until the tab closes.
        }
    }, [key]);
    return [
        value,
        (v: string) => {
            setValue(v);
            try {
                localStorage.setItem(`lexica-write:${key}`, v);
            } catch {
                // ignore
            }
        },
    ];
}

/** What the program could see in the text. Green: there. Amber: missing, with what to do. */
export function CheckList({ checks }: { checks: readonly CheckResult[] }) {
    return (
        <ul className="space-y-2" aria-label="Kết quả kiểm tra">
            {checks.map((c) => (
                <li key={c.id} className="flex items-start gap-2 text-sm">
                    {c.pass ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-label="Đạt" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-label="Chưa đạt" />}
                    <span className={c.pass ? 'text-muted' : 'text-ink'}>
                        {c.label}
                        {!c.pass && <span className="block text-xs text-muted">{c.tip}</span>}
                    </span>
                </li>
            ))}
        </ul>
    );
}

/** What only the learner can judge: ticked by hand, nothing is calculated from it. */
export function SelfCheck({ items }: { items: readonly string[] }) {
    const [ticked, setTicked] = useState<Set<number>>(new Set());
    return (
        <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-subtle">Tự kiểm (máy không đánh giá được)</p>
            <ul className="space-y-1.5">
                {items.map((t, i) => (
                    <li key={t}>
                        <label className="flex items-start gap-2 text-sm text-ink-2">
                            <input
                                type="checkbox"
                                className="mt-1 accent-[var(--color-accent)]"
                                checked={ticked.has(i)}
                                onChange={() =>
                                    setTicked((s) => {
                                        const n = new Set(s);
                                        if (n.has(i)) n.delete(i);
                                        else n.add(i);
                                        return n;
                                    })
                                }
                            />
                            {t}
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function Panel({ title, children, hint }: { title: string; children: React.ReactNode; hint?: string }) {
    return (
        <section className="rounded-2xl border border-line bg-surface p-4">
            <h2 className="font-semibold text-ink">{title}</h2>
            {hint && <p className="mt-0.5 text-sm text-muted">{hint}</p>}
            <div className="mt-3 space-y-3">{children}</div>
        </section>
    );
}

export const Privacy = () => <p className="text-xs text-subtle">Bài viết chỉ nằm trên máy bạn, trừ khi bạn bấm “Nộp cho lớp” (khi đó chỉ giáo viên của lớp đọc). Máy chỉ kiểm những gì nhìn thấy trong chữ (độ dài, từ nối, số liệu), không cho điểm.</p>;
