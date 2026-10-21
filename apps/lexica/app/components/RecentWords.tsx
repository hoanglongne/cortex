'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { getCard, useContentVersion } from '../lib/content/repository';
import { StepDots } from './StepNumbers';

const SHOWN = 8;

/** Home's "Từ của bạn": the words learned most recently with how far each got, and the way to all of them. */
export default function RecentWords() {
    useContentVersion();
    const journeys = useLexicaStore((s) => s.journeys);
    const ids = Object.keys(journeys).sort((a, b) => journeys[b].understoodAt - journeys[a].understoodAt);
    const shown = ids.filter((id) => getCard(id)).slice(0, SHOWN);
    if (shown.length === 0) return null;
    return (
        <section aria-label="Từ của bạn" className="w-full rounded-2xl border border-line bg-surface p-4">
            <Link href="/learned" className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-subtle">Từ vừa học</span>
                <span className="flex items-center gap-1 text-sm text-accent">
                    Tất cả {ids.length} từ <ChevronRight className="w-4 h-4" />
                </span>
            </Link>
            <ul className="mt-3 flex flex-wrap gap-1.5">
                {shown.map((id) => (
                    <li key={id} className="flex items-center gap-1.5 rounded-full border border-line bg-bg px-3 py-1.5" title={getCard(id)?.translationHint}>
                        <span className="text-sm text-ink lowercase">{getCard(id)?.word}</span>
                        <StepDots journey={journeys[id]} />
                    </li>
                ))}
            </ul>
        </section>
    );
}
