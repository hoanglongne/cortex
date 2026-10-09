'use client';

import { useSyncExternalStore } from 'react';

const noopSubscribe = () => () => {};

/**
 * Lexica's state lives in localStorage (zustand persist), which the server
 * can't read. Server HTML was rendered from an empty store and then
 * mismatched the client ("Hydration failed" on /learned and similar).
 * Render the app only on the client, after the store is hydrated, so the
 * first paint is already the user's real data.
 */
export default function HydrationGate({ children }: { children: React.ReactNode }) {
    // false during SSR and the hydration pass, true right after on the client
    const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
    if (!isClient) return <div className="min-h-dvh bg-bg" aria-busy="true" />;
    return <>{children}</>;
}
