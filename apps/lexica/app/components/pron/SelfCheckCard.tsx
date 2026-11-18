'use client';

import { useState } from 'react';
import { Check, Hand } from 'lucide-react';
import { useLexicaStore } from '../../store/lexicaStore';
import { selfCheckFor, shouldOpen } from '../../lib/pronunciation/selfCheck';

/**
 * "Thử ngay" (issue #155): a check with an object for this sound. Opens on
 * its own until the learner says it worked; after that it stays folded for
 * two weeks.
 */
export default function SelfCheckCard({ phone }: { phone: string }) {
    const check = selfCheckFor(phone);
    const doneAt = useLexicaStore((s) => (check ? s.selfChecks?.[check.id] : undefined));
    const mark = useLexicaStore((s) => s.markSelfCheck);
    const [now] = useState(() => Date.now());
    const [open, setOpen] = useState(() => shouldOpen(doneAt, now));
    if (!check) return null;
    const done = doneAt !== undefined;
    return (
        <div data-testid="self-check" className="rounded-xl border border-line p-3">
            <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="w-full flex items-center justify-between gap-2 text-left">
                <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Hand className="w-4 h-4 text-accent" /> Thử ngay: {check.object}
                </span>
                {done && <span className="text-xs text-accent flex items-center gap-1"><Check className="w-3.5 h-3.5" /> đã làm được</span>}
            </button>
            {open && (
                <div className="mt-2 space-y-2">
                    <ol className="space-y-1 text-sm text-ink-2 list-decimal pl-5">
                        {check.steps.map((x) => <li key={x}>{x}</li>)}
                    </ol>
                    <button
                        type="button"
                        onClick={() => {
                            mark(check.id);
                            setOpen(false);
                        }}
                        className="h-9 px-3 rounded-lg bg-accent text-on-accent text-sm font-semibold"
                    >
                        Làm được
                    </button>
                </div>
            )}
        </div>
    );
}
