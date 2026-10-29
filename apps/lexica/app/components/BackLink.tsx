'use client';

import { useRouter } from 'next/navigation';

/**
 * "← Quay lại": back to the page the learner came from inside the app
 * (Luyện, Hôm nay, a passage…), and to `fallback` when the page was opened
 * directly (a link, a reload). A fixed "← Học" sent people from Luyện to Học.
 */
export default function BackLink({ fallback = '/practice', label = 'Quay lại', className = 'text-muted hover:text-accent text-sm' }: { fallback?: string; label?: string; className?: string }) {
    const router = useRouter();
    return (
        <button
            type="button"
            className={className}
            onClick={() => {
                let sameApp = false;
                try {
                    sameApp = window.history.length > 1 && document.referrer !== '' && new URL(document.referrer).origin === window.location.origin;
                } catch {
                    sameApp = false;
                }
                if (sameApp) router.back();
                else router.push(fallback);
            }}
        >
            ← {label}
        </button>
    );
}
