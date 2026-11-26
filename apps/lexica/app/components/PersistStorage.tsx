'use client';

import { useEffect } from 'react';

/**
 * Asks the browser to keep this site's storage (progress lives in localStorage).
 * Browsers decide for themselves; Chrome usually grants it to sites people use
 * often or installed, Safari to apps added to the home screen. Harmless when
 * refused. Issue #178.
 */
export default function PersistStorage() {
    useEffect(() => {
        const s = typeof navigator !== 'undefined' ? navigator.storage : undefined;
        if (!s?.persist || !s.persisted) return;
        void s.persisted().then((done) => (done ? undefined : s.persist())).catch(() => {});
    }, []);
    return null;
}
