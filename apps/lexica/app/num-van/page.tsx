'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Old address of Blend (was "Núm vặn"); keeps shared links and the share target working.
 * Done in the browser (not on the server) because the packaged app is a static export.
 */
export default function OldBlendPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace(`/blend${window.location.search}`);
    }, [router]);
    return null;
}
