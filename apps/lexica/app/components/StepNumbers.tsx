'use client';

import Link from 'next/link';
import { useLexicaStore } from '../store/lexicaStore';
import { countSteps, STEP_HINT, STEP_LABEL, STEPS, stepIndex, stepOf, type StepCounts, type WordJourney } from '../lib/journey/steps';

/**
 * The four numbers (docs/LEXICA_DIRECTION.md): how many words reached Hiểu,
 * Nhớ, Gặp, Dùng. The one progress measure the app shows. Links to the path.
 */
export default function StepNumbers({ counts, delta, href = '/path', compact = false }: { counts?: StepCounts; delta?: StepCounts; href?: string | null; compact?: boolean }) {
    const journeys = useLexicaStore((s) => s.journeys);
    const c = counts ?? countSteps(journeys);
    const body = (
        <div data-testid="step-numbers" className="grid grid-cols-4 gap-2">
            {STEPS.map((step, i) => (
                <div key={step} className={`rounded-xl border px-2 ${compact ? 'py-2' : 'py-3'} text-center ${i === 3 ? 'border-accent/40 bg-accent/5' : 'border-line bg-surface'}`} title={STEP_HINT[step]}>
                    <p className={`font-mono font-bold text-ink ${compact ? 'text-lg' : 'text-2xl'}`}>{c[step]}</p>
                    <p className="text-[11px] text-muted">{STEP_LABEL[step]}</p>
                    {delta && delta[step] > 0 && <p className="font-mono text-[11px] text-accent">+{delta[step]}</p>}
                </div>
            ))}
        </div>
    );
    if (!href) return body;
    return (
        <Link href={href} aria-label={`${c.hieu} Hiểu, ${c.nho} Nhớ, ${c.gap} Gặp, ${c.dung} Dùng. Xem lộ trình`} className="block hover:opacity-90">
            {body}
        </Link>
    );
}

/** Four dots for one word: filled up to its step. */
export function StepDots({ journey }: { journey: WordJourney | undefined }) {
    const n = stepIndex(stepOf(journey));
    return (
        <span className="inline-flex items-center gap-0.5" aria-label={n ? `Bước ${STEP_LABEL[STEPS[n - 1]]}` : 'Chưa học'} title={n ? STEP_LABEL[STEPS[n - 1]] : 'Chưa học'}>
            {STEPS.map((s, i) => (
                <span key={s} className={`w-1.5 h-1.5 rounded-full ${i < n ? (i === 3 ? 'bg-accent' : 'bg-ink-2') : 'bg-surface-3'}`} />
            ))}
        </span>
    );
}
