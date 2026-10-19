'use client';

import { useEffect } from 'react';
import { startClassSync } from '../lib/classSync';
import { syncOratioWords } from '../lib/oratioSync';

/** Mount once in the root layout; renders nothing (lib/classSync.ts, lib/oratioSync.ts). */
export default function ClassSync() {
    useEffect(() => startClassSync(), []);
    useEffect(() => {
        void syncOratioWords();
    }, []);
    return null;
}
