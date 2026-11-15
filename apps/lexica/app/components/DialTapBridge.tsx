'use client';

import { useEffect } from 'react';
import { useLexicaStore } from '../store/lexicaStore';
import { parseTaps, TAPS_EVENT, TAPS_KEY } from '../lib/dial/bridge';

/** Applies words tapped in the Núm vặn extension (see lib/dial/bridge.ts). */
export default function DialTapBridge() {
    useEffect(() => {
        const apply = () => {
            let raw: string | null = null;
            try { raw = localStorage.getItem(TAPS_KEY); } catch { return; }
            const taps = parseTaps(raw);
            if (raw !== null) {
                try { localStorage.removeItem(TAPS_KEY); } catch { /* private mode */ }
            }
            const { dialTap } = useLexicaStore.getState();
            for (const t of taps) dialTap(t.cardId);
        };
        apply();
        window.addEventListener(TAPS_EVENT, apply);
        return () => window.removeEventListener(TAPS_EVENT, apply);
    }, []);
    return null;
}
