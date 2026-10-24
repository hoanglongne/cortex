'use client';

import Link from 'next/link';
import { useState } from 'react';
import { TrendingDown, TrendingUp, X } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { levelHint } from '../lib/journey/levelHint';
import { localDate } from '../lib/engagement/ghost';
import { weekOf } from '../lib/journey/sightings';
import { LEVELS } from '../lib/levels';

/**
 * Home: "Thử level cao hơn?" when recalls are almost always right for two
 * weeks, "Chậm lại một chút?" when most are wrong (lib/journey/levelHint.ts).
 * Put away for the week with ×.
 */
export default function LevelHintCard() {
    const progress = useLexicaStore((s) => s.cardProgress);
    const level = useLexicaStore((s) => s.selectedLevel);
    const dismissed = useLexicaStore((s) => s.tipsDismissed);
    const dismissTip = useLexicaStore((s) => s.dismissTip);
    const [now] = useState(() => Date.now());
    const hint = levelHint(progress, now);
    if (!hint) return null;
    const id = `level-${hint.kind}-${weekOf(localDate(now))}`;
    if (dismissed[id]) return null;

    const index = LEVELS.findIndex((l) => l.id === level);
    const next = hint.kind === 'up' ? LEVELS[index + 1] : null;
    if (hint.kind === 'up' && !next) return null;
    const pct = Math.round(hint.rate * 100);

    return (
        <section className="w-full rounded-2xl border border-line bg-surface p-4 flex items-start gap-3">
            <span className="w-9 h-9 rounded-xl bg-accent/12 text-accent flex items-center justify-center shrink-0">
                {hint.kind === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </span>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{hint.kind === 'up' ? `Thử level ${next!.label}?` : 'Chậm lại một chút?'}</p>
                <p className="mt-0.5 text-xs text-muted">
                    {hint.kind === 'up'
                        ? `Hai tuần qua bạn nhớ lại đúng ${pct}% khi ôn. Từ ở level này có vẻ đã dễ với bạn.`
                        : `Hai tuần qua bạn nhớ lại đúng ${pct}% khi ôn. Bớt từ mới mỗi ngày, hoặc lùi một level, sẽ dễ nhớ hơn.`}
                </p>
                <Link href={hint.kind === 'up' ? '/level-select' : '/me'} className="mt-2 inline-block text-xs font-medium text-accent hover:underline">
                    {hint.kind === 'up' ? 'Xem các level' : 'Đổi nhịp học hoặc level'}
                </Link>
            </div>
            <button onClick={() => dismissTip(id)} aria-label="Ẩn tuần này" className="p-1 text-subtle hover:text-ink">
                <X className="w-4 h-4" />
            </button>
        </section>
    );
}
