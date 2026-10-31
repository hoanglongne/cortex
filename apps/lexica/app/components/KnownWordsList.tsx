'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { getCard } from '../lib/content/repository';

/** "Từ đã biết": words marked "Đã biết, không học", with a way to put one back into learning. */
export default function KnownWordsList() {
    const known = useLexicaStore((s) => s.knownWords);
    const unmark = useLexicaStore((s) => s.unmarkKnown);
    const [open, setOpen] = useState(false);
    const ids = Object.keys(known ?? {}).sort((a, b) => known[b] - known[a]);
    if (ids.length === 0) return null;
    return (
        <section aria-label="Từ đã biết" className="rounded-2xl border border-line bg-surface">
            <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="w-full h-12 px-4 flex items-center justify-between text-sm font-medium text-ink">
                Từ đã biết, không học ({ids.length})
                <ChevronDown className={`w-4 h-4 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <ul className="divide-y divide-line border-t border-line">
                    {ids.map((id) => (
                        <li key={id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                            <span className="text-ink lowercase">{getCard(id)?.word ?? id}</span>
                            <button onClick={() => unmark(id)} className="text-xs text-accent underline underline-offset-4">
                                Học lại
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
