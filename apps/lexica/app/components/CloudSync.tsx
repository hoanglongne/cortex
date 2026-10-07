'use client';

import { useEffect } from 'react';
import { startCloudSync } from '../lib/cloudSync';

/** Mount once in the root layout; renders nothing. */
export default function CloudSync() {
    useEffect(() => startCloudSync(), []);
    return null;
}
