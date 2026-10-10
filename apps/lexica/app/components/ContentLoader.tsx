'use client';

import { useEffect } from 'react';
import { loadRemoteContent } from '../lib/content/loader';

/** Fetches Studio content packs in the background. Renders nothing. */
export default function ContentLoader() {
    useEffect(() => {
        void loadRemoteContent();
    }, []);
    return null;
}
