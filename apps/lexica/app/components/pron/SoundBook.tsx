'use client';

import { useMemo, useState } from 'react';
import { SOUND_LABEL } from '@cortex/classroom-lexica';
import { useLexicaStore } from '../../store/lexicaStore';
import { localDate } from '../../lib/engagement/ghost';
import { improved, practiceSuggestion, weakSounds } from '../../lib/pronunciation/soundLog';
import type { ErrorKind } from '../../lib/pronunciation/pairs';

const TREND = { better: 'đỡ hơn tuần trước', same: 'như tuần trước', worse: 'nhiều hơn tuần trước' } as const;

/**
 * "Âm hay sai" (docs/LEXICA_PRONUNCIATION_DESIGN.md, 7.1–7.2): the sound
 * groups the app heard off most in 14 days, their trend, a word of praise
 * when one got clearly better, and the 2-minute practice for the worst.
 */
export default function SoundBook({ onPractice }: { onPractice: (kind: ErrorKind) => void }) {
    const log = useLexicaStore((s) => s.soundLog);
    const [today] = useState(() => localDate());
    const weak = useMemo(() => weakSounds(log ?? {}, today), [log, today]);
    const better = useMemo(() => improved(log ?? {}, today), [log, today]);
    const suggest = useMemo(() => practiceSuggestion(log ?? {}, today), [log, today]);
    if (weak.length === 0 && better.length === 0) return null;
    return (
        <div data-testid="sound-book" className="rounded-2xl border border-line bg-surface p-5">
            <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">Âm hay sai · 14 ngày</p>
            {better.length > 0 && <p className="mt-2 text-sm text-accent">“{SOUND_LABEL[better[0]]}” của bạn rõ hơn hẳn tuần trước. Giữ nhé!</p>}
            <ul className="mt-3 space-y-3">
                {weak.map((w) => (
                    <li key={w.kind}>
                        <div className="flex items-baseline justify-between gap-3 text-sm">
                            <span className="text-ink">{SOUND_LABEL[w.kind]}</span>
                            <span className="text-muted shrink-0">
                                {w.misses}/{w.tries} lần chưa rõ
                            </span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                            <div className="h-full rounded-full bg-warning" style={{ width: `${Math.round((w.misses / w.tries) * 100)}%` }} />
                        </div>
                        {w.trend && <p className={`mt-1 text-xs ${w.trend === 'better' ? 'text-accent' : 'text-muted'}`}>{TREND[w.trend]}</p>}
                    </li>
                ))}
            </ul>
            {suggest && (
                <button onClick={() => onPractice(suggest)} className="mt-4 h-10 px-4 rounded-xl bg-accent text-on-accent font-semibold text-sm">
                    Luyện 2 phút: {SOUND_LABEL[suggest]}
                </button>
            )}
            <p className="mt-3 text-xs text-subtle">Đếm theo những lần máy nghe chưa rõ, nên chỉ là ước lượng.</p>
        </div>
    );
}
