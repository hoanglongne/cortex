import { useSyncExternalStore } from 'react';

const QUERY = '(min-width: 1024px)'; // Tailwind lg

function subscribe(onChange: () => void) {
    const mq = window.matchMedia(QUERY);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
}

/** True on the lg breakpoint and up, for parts that differ in structure, not just style. */
export function useIsDesktop(): boolean {
    return useSyncExternalStore(
        subscribe,
        () => window.matchMedia(QUERY).matches,
        () => false,
    );
}
