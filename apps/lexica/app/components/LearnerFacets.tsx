'use client';

import { useMemo } from 'react';
import { Layers } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { FACETS, facetRecall, type Facet } from '../lib/learner/model';
import { getCard } from '../lib/content/repository';

const LABEL: Record<Facet, string> = { recog: 'Nhận ra', recall: 'Nhớ lại', produce: 'Dùng trong câu', wild: 'Dùng ngoài đời' };

/**
 * The four facets of knowing a word (issue #143): how many words reached each,
 * and per word, how likely it is still held. From the shadow learner model.
 */
export default function LearnerFacets() {
    const learner = useLexicaStore((s) => s.learner);
    const { counts, rows } = useMemo(() => {
        const now = Date.now();
        const counts: Record<Facet, number> = { recog: 0, recall: 0, produce: 0, wild: 0 };
        const rows: { id: string; word: string; r: Partial<Record<Facet, number>> }[] = [];
        for (const id of Object.keys(learner?.memories ?? {})) {
            const r = facetRecall(learner, id, now);
            for (const f of FACETS) if (r[f] !== undefined) counts[f]++;
            const card = getCard(id);
            if (card) rows.push({ id, word: card.word.toLowerCase(), r });
        }
        // Words with the most facets first, then the weakest recognition.
        rows.sort((a, b) => Object.keys(b.r).length - Object.keys(a.r).length || (a.r.recog ?? 1) - (b.r.recog ?? 1));
        return { counts, rows: rows.slice(0, 12) };
    }, [learner]);

    if (rows.length === 0) return null;
    return (
        <section className="lx-soft max-w-5xl mx-auto mb-6 sm:mb-8 rounded-xl bg-surface/40 p-4" data-testid="learner-facets">
            <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-accent" />
                <h2 className="text-base font-bold text-ink">Bốn tầng của từ</h2>
            </div>
            <p className="mt-1 text-xs text-muted">Biết một từ có nhiều tầng: nhận ra, tự nhớ lại, dùng trong câu của mình, dùng ngoài đời.</p>
            <div className="mt-3 grid grid-cols-4 gap-2">
                {FACETS.map((f) => (
                    <div key={f} className="rounded-lg bg-bg/60 border border-line/60 px-2 py-2 text-center">
                        <div className="font-mono text-lg text-ink">{counts[f]}</div>
                        <div className="text-[11px] text-muted leading-tight">{LABEL[f]}</div>
                    </div>
                ))}
            </div>
            <ul className="mt-3 space-y-1.5">
                {rows.map((row) => (
                    <li key={row.id} className="flex items-center gap-3 text-sm">
                        <span className="w-28 truncate text-ink">{row.word}</span>
                        <span className="flex gap-1 flex-1" aria-label={FACETS.map((f) => `${LABEL[f]}: ${row.r[f] === undefined ? 'chưa có' : `${Math.round(row.r[f]! * 100)}%`}`).join(', ')}>
                            {FACETS.map((f) => {
                                const p = row.r[f];
                                return (
                                    <span key={f} title={LABEL[f]} className="h-2 flex-1 rounded-full bg-bg overflow-hidden border border-line/60">
                                        {p !== undefined && <span className="block h-full bg-accent" style={{ width: `${Math.round(p * 100)}%`, opacity: 0.35 + 0.65 * p }} />}
                                    </span>
                                );
                            })}
                        </span>
                    </li>
                ))}
            </ul>
            <p className="mt-2 text-[11px] text-subtle">Mỗi vạch là khả năng bạn còn nhớ ở tầng đó hôm nay. Vạch trống: chưa có bằng chứng.</p>
        </section>
    );
}
