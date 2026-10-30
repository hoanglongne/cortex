'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { BRANCH_LABEL } from '../lib/journey/path';
import { BRANCH_ROWS, BRANCH_SWITCH_NOTE } from '../lib/journey/branchInfo';

/** "So sánh hai hướng": a collapsed table, with the note that switching keeps progress. */
export default function BranchCompare({ defaultOpen = false }: { defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="rounded-xl border border-line bg-surface-2/30">
            <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="w-full h-10 px-3 flex items-center justify-between text-xs font-medium text-ink-2">
                So sánh hai hướng
                <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div data-testid="branch-compare" className="px-3 pb-3 space-y-3">
                    {BRANCH_ROWS.map((r) => (
                        <div key={r.label} className="text-xs">
                            <p className="font-mono text-[10px] uppercase tracking-wider text-subtle">{r.label}</p>
                            <p className="mt-1 text-ink-2">
                                <span className="font-semibold text-ink">{BRANCH_LABEL.cert}:</span> {r.cert}
                            </p>
                            <p className="mt-0.5 text-ink-2">
                                <span className="font-semibold text-ink">{BRANCH_LABEL.talk}:</span> {r.talk}
                            </p>
                        </div>
                    ))}
                    <p className="text-xs text-muted">{BRANCH_SWITCH_NOTE}</p>
                </div>
            )}
        </div>
    );
}
