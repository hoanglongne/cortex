'use client';

import { useEffect } from 'react';

/** Registers the minimal service worker that makes Studio installable. */
export default function RegisterSW() {
    useEffect(() => {
        if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
            navigator.serviceWorker.register('/sw.js').catch(() => {});
        }
    }, []);
    return null;
}
