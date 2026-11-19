'use client';

import { useMemo, useState } from 'react';
import { DialControls, DialParagraph, DialSheet, useDialParagraphs } from '../components/DialText';
import type { DialPrefs } from '../lib/dial/level';
import { estimate, estimateLine, INTENSITY } from '../lib/dial/prefs';
import type { DialHit } from '../lib/dial/match';

/**
 * Try it here (#164): one sample paragraph that changes as the learner moves
 * the intensity and the display mode, before reading anything of their own.
 * Taps here only show the meaning; they do not touch the review schedule.
 */
export default function DialDemo({ text, prefs, onChange }: { text: string; prefs: DialPrefs; onChange: (p: Partial<DialPrefs>) => void }) {
    const paras = useMemo(() => [text.split('\n')[0]], [text]);
    const dial = useDialParagraphs(paras, INTENSITY[prefs.intensity].share, undefined, INTENSITY[prefs.intensity].cap);
    const [open, setOpen] = useState<DialHit | null>(null);
    return (
        <section data-testid="dial-demo" className="lx-soft rounded-[18px] bg-surface p-4 space-y-3">
            <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">Thử ngay</p>
            <DialControls intensity={prefs.intensity} mode={prefs.mode} onChange={onChange} estimate={estimateLine(estimate(prefs.intensity, null, null))} />
            <p className="text-[16px] leading-[1.75] text-ink-2">
                <DialParagraph text={paras[0]} hits={dial.hits[0]} shown={dial.shown[0]} onOpen={setOpen} mode={prefs.mode} />
            </p>
            <DialSheet hit={open} onClose={() => setOpen(null)} />
        </section>
    );
}
