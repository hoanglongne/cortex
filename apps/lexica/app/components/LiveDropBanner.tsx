'use client';

import { useState } from 'react';
import { TrendingUp, ChevronRight } from 'lucide-react';
import { getCurrentDrop, useContentVersion } from '../lib/content/repository';
import { useLexicaStore } from '../store/lexicaStore';

const DAY_MS = 86_400_000;

/** Home-screen entry for the live Trend Drop from Lexica Studio. */
export default function LiveDropBanner({ onStart }: { onStart: () => void }) {
    useContentVersion();
    const [now] = useState(() => Date.now());
    const cardProgress = useLexicaStore(state => state.cardProgress);
    const loadNewDeck = useLexicaStore(state => state.loadNewDeck);
    const drop = getCurrentDrop(now);
    if (!drop) return null;

    const fresh = drop.cards.filter(c => !cardProgress[c.id]).length;
    const daysLeft = drop.expiresAt ? Math.max(0, Math.ceil((Date.parse(drop.expiresAt) - now) / DAY_MS)) : null;

    return (
        <button
            type="button"
            onClick={() => {
                // Fresh deck so the drop's cards are dealt now (up to 3 per deck)
                if (fresh > 0) loadNewDeck();
                onStart();
            }}
            className="w-full max-w-md mb-4 rounded-2xl border border-accent/40 bg-accent/10 p-4 flex items-center gap-3 text-left hover:bg-accent/15 transition-colors"
        >
            <span className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
            </span>
            <span className="flex-1 min-w-0">
                <span className="block font-mono text-[11px] uppercase text-accent">Drop tuần này</span>
                <span className="block font-medium text-ink truncate">{drop.title}</span>
                <span className="block font-mono text-xs text-muted">
                    {fresh > 0 ? `${fresh} thẻ mới` : 'Đã học hết'}
                    {daysLeft !== null && ` · còn ${daysLeft} ngày`}
                </span>
            </span>
            <ChevronRight className="w-5 h-5 text-muted shrink-0" />
        </button>
    );
}
