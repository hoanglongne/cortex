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
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="text-left text-subtle">
                                <th className="py-1 font-normal" />
                                <th className="py-1 font-semibold text-ink">{BRANCH_LABEL.cert}</th>
                                <th className="py-1 font-semibold text-ink">{BRANCH_LABEL.talk}</th>
                            </tr>
                        </thead>
                        <tbody className="text-ink-2 align-top">
                            {BRANCH_ROWS.map((r) => (
                                <tr key={r.label} className="border-t border-line">
                                    <td className="py-1.5 pr-2 text-subtle">{r.label}</td>
                                    <td className="py-1.5 pr-2">{r.cert}</td>
                                    <td className="py-1.5">{r.talk}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="text-xs text-muted">{BRANCH_SWITCH_NOTE}</p>
                </div>
            )}
        </div>
    );
}
