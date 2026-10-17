'use client';

import { useEffect } from 'react';
import { startClassSync } from '../lib/classSync';

/** Mount once in the root layout; renders nothing (lib/classSync.ts). */
export default function ClassSync() {
    useEffect(() => startClassSync(), []);
    return null;
}
