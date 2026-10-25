'use client';

import { useEffect, useRef, useState } from 'react';
import { Shuffle } from 'lucide-react';
import { pickOne, weekKey, type Person } from '../../lib/classroom/tools';

/** Who was called this week in this class, on this device (localStorage). */
function useCalled(classId: string) {
    const key = `teach-called-${classId}-${weekKey(new Date())}`;
    const [called, setCalled] = useState<Record<string, number>>(() => {
        try {
            return JSON.parse(localStorage.getItem(key) ?? '{}') as Record<string, number>;
        } catch {
            return {};
        }
    });
    const add = (id: string) =>
        setCalled((c) => {
            const next = { ...c, [id]: (c[id] ?? 0) + 1 };
            try {
                localStorage.setItem(key, JSON.stringify(next));
            } catch {
                // private mode: counts last for this visit
            }
            return next;
        });
    return { called, add };
}

/**
 * "Gọi tên": a short spin through the names present, landing on one; by
 * default those called less this week come up more. "Em này vắng" marks the
 * student absent for today and calls another, without counting.
 */
export default function Picker({ classId, people, onAbsent }: { classId: string; people: Person[]; onAbsent: (id: string) => void }) {
    const { called, add } = useCalled(classId);
    const [fair, setFair] = useState(true);
    const [shown, setShown] = useState<Person | null>(null);
    const [spinning, setSpinning] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => () => {
        if (timer.current) clearTimeout(timer.current);
    }, []);

    const spin = (count = true, without?: string) => {
        const pool = without ? people.filter((p) => p.id !== without) : people;
        if (pool.length === 0 || spinning) return;
        const pick = pickOne(pool, called, Math.random, fair)!;
        setSpinning(true);
        // A few quick names, slowing down, then the pick.
        let step = 0;
        const steps = 12;
        const tick = () => {
            step++;
            if (step >= steps) {
                setShown(pick);
                setSpinning(false);
                if (count) add(pick.id);
                return;
            }
            setShown(pool[Math.floor(Math.random() * pool.length)]);
            timer.current = setTimeout(tick, 40 + step * step * 3);
        };
        tick();
    };

    return (
        <div className="flex h-full flex-col items-center justify-center gap-8 px-6 text-center">
            <p className={`min-h-[6rem] text-6xl font-semibold tracking-tight md:text-8xl ${spinning ? 'text-muted' : 'text-ink'}`}>{shown?.name ?? 'Ai sẽ trả lời?'}</p>
            {!spinning && shown && <p className="-mt-6 text-lg text-muted">Tuần này được gọi {called[shown.id] ?? 0} lần</p>}
            <div className="flex flex-wrap justify-center gap-3">
                <button onClick={() => spin()} disabled={people.length === 0 || spinning} className="flex h-14 items-center gap-2 rounded-2xl bg-accent px-6 text-lg font-semibold text-on-accent disabled:opacity-50">
                    <Shuffle className="h-6 w-6" /> {shown ? 'Gọi em khác' : 'Gọi tên'}
                </button>
                {shown && !spinning && (
                    <button
                        onClick={() => {
                            onAbsent(shown.id);
                            spin(false, shown.id);
                        }}
                        className="h-14 rounded-2xl border border-line-strong px-5 text-lg text-ink-2 hover:border-accent">
                        Em này vắng, đổi
                    </button>
                )}
            </div>
            <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" checked={fair} onChange={(e) => setFair(e.target.checked)} className="h-4 w-4 accent-[var(--color-accent)]" />
                Ưu tiên em ít được gọi tuần này
            </label>
            {people.length === 0 && <p className="text-sm text-warm">Cả lớp đang bị đánh dấu vắng. Mở “Điểm danh” để sửa.</p>}
        </div>
    );
}
