'use client';

import { useState } from 'react';
import { Users } from 'lucide-react';
import { makeGroups, type GroupMode, type Person } from '../../lib/classroom/tools';

const MODES: { id: GroupMode; label: string; hint: string }[] = [
    { id: 'mixed', label: 'Đồng đều', hint: 'Mỗi nhóm có em mạnh và em đang cố gắng' },
    { id: 'random', label: 'Ngẫu nhiên', hint: 'Bốc thăm' },
    { id: 'similar', label: 'Cùng trình độ', hint: 'Em cùng sức ngồi với nhau' },
];

/**
 * "Chia nhóm": groups of 2–6 from those present, three ways. The level
 * behind "Đồng đều" is the verified vocabulary score, else words
 * remembered; never shown on the projector.
 */
export default function Groups({ people }: { people: Person[] }) {
    const [size, setSize] = useState(4);
    const [mode, setMode] = useState<GroupMode>('mixed');
    const [groups, setGroups] = useState<Person[][] | null>(null);
    const make = () => setGroups(makeGroups(people, size, mode, Math.random));

    return (
        <div className="flex h-full flex-col gap-6 overflow-y-auto px-6 py-6">
            <div className="flex flex-wrap items-end justify-center gap-6">
                <div>
                    <p className="mb-1.5 text-sm text-muted">Mỗi nhóm</p>
                    <div className="flex gap-1">
                        {[2, 3, 4, 5, 6].map((n) => (
                            <button key={n} onClick={() => setSize(n)} aria-pressed={size === n} className={`h-11 w-11 rounded-xl border text-lg ${size === n ? 'border-accent bg-accent-soft font-semibold text-accent-strong' : 'border-line-strong text-ink-2'}`}>
                                {n}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <p className="mb-1.5 text-sm text-muted">Cách chia</p>
                    <div className="flex gap-1">
                        {MODES.map((m) => (
                            <button key={m.id} onClick={() => setMode(m.id)} aria-pressed={mode === m.id} title={m.hint} className={`h-11 rounded-xl border px-3 text-sm ${mode === m.id ? 'border-accent bg-accent-soft font-semibold text-accent-strong' : 'border-line-strong text-ink-2'}`}>
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>
                <button onClick={make} disabled={people.length < 2} className="flex h-11 items-center gap-2 rounded-xl bg-accent px-5 font-semibold text-on-accent disabled:opacity-50">
                    <Users className="h-5 w-5" /> {groups ? 'Chia lại' : 'Chia nhóm'}
                </button>
            </div>
            {groups && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {groups.map((g, i) => (
                        <section key={i} className="rounded-2xl border border-line bg-surface p-5">
                            <p className="font-mono text-sm text-accent-strong">Nhóm {i + 1}</p>
                            <ul className="mt-2 space-y-1">
                                {g.map((p) => (
                                    <li key={p.id} className="text-2xl text-ink">
                                        {p.name}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            )}
            {!groups && <p className="text-center text-muted">{people.length} em có mặt. Chọn cách chia rồi bấm “Chia nhóm”.</p>}
        </div>
    );
}
