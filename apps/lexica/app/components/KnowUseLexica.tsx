'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { MessageCircleMore } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { knowUseCount } from '../lib/journey/knowUse';
import { getCard } from '../lib/content/repository';

/** Biết – Dùng in Lexica (issue #137): learned words vs words said (Lexica or Oratio). */
export default function KnowUseLexica() {
    const learned = useLexicaStore((s) => s.learnedWords);
    const journeys = useLexicaStore((s) => s.journeys);
    const k = useMemo(() => knowUseCount(learned, journeys, (id) => getCard(id)?.word), [learned, journeys]);
    if (k.learned < 10) return null;
    const pct = Math.round((k.used / k.learned) * 100);
    const practice = k.unused.slice(0, 10);
    return (
        <section className="lx-soft max-w-5xl mx-auto mb-6 sm:mb-8 rounded-xl bg-surface/40 p-4" data-testid="know-use-lexica">
            <div className="flex items-center gap-2">
                <MessageCircleMore className="w-5 h-5 text-accent" />
                <h2 className="text-base font-bold text-ink">Biết {k.learned} · Dùng {k.used}</h2>
                <span className="ml-auto font-mono text-xs text-muted">{pct}%</span>
            </div>
            <p className="mt-1 text-xs text-muted">Từ bạn đã nói rõ ra, ở Lexica hoặc khi trả lời trong Oratio, trên tổng số từ đã học.{k.inOratio > 0 && <> <span className="text-accent">{k.inOratio} từ đã nói trong Oratio.</span></>}</p>
            <div className="mt-2 h-1.5 bg-bg rounded-full overflow-hidden"><div className="h-full bg-accent" style={{ width: `${Math.max(2, pct)}%` }} /></div>
            {practice.length > 0 && (
                <>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {practice.map((id) => (
                            <span key={id} className="lx-soft px-2.5 py-1 rounded-lg bg-surface text-sm text-ink lowercase">{getCard(id)?.word}</span>
                        ))}
                    </div>
                    <Link href={`/review?ids=${practice.join(',')}`} className="mt-3 w-full h-11 rounded-xl border border-accent/40 text-accent font-semibold text-sm flex items-center justify-center">
                        Ôn {practice.length} từ chưa nói lần nào
                    </Link>
                </>
            )}
        </section>
    );
}
