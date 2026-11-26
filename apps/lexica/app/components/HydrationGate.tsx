'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { loadCoreDeck, useDeckReady } from '../lib/content/repository';

const noopSubscribe = () => () => {};

// Start fetching the deck as soon as this code runs in the browser, not after React has
// hydrated the page (a useEffect would wait for that): the two then happen side by side.
if (typeof window !== 'undefined') void loadCoreDeck().catch(() => {});

/**
 * Lexica's state lives in localStorage (zustand persist), which the server
 * can't read. Server HTML was rendered from an empty store and then
 * mismatched the client ("Hydration failed" on /learned and similar).
 * Render the app only on the client, after the store is hydrated, so the
 * first paint is already the user's real data.
 *
 * It also waits for the IELTS deck, which loads in a chunk of its own
 * (lib/content/repository.ts, issue #178), so everything inside can read
 * cards synchronously as before.
 */
export default function HydrationGate({ children }: { children: React.ReactNode }) {
    // false during SSR and the hydration pass, true right after on the client
    const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
    const deckReady = useDeckReady();
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        loadCoreDeck().catch(() => setFailed(true));
    }, []);

    if (isClient && failed && !deckReady) {
        return (
            <div className="min-h-dvh bg-bg flex items-center justify-center px-6 text-center">
                <div className="space-y-3">
                    <p className="text-ink font-semibold">Chưa tải được bộ thẻ</p>
                    <p className="text-sm text-muted">Kiểm tra mạng rồi thử lại.</p>
                    <button
                        className="lx-hard lx-press h-11 px-5 rounded-xl bg-accent text-on-accent font-bold"
                        onClick={() => {
                            setFailed(false);
                            loadCoreDeck().catch(() => setFailed(true));
                        }}
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }
    if (!isClient || !deckReady) return <div className="min-h-dvh bg-bg" aria-busy="true" />;
    return <>{children}</>;
}
