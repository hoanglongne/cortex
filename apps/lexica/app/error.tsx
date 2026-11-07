'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { reportError } from './lib/errorReport';

/** A screen crashed: say so in plain words, offer to try again, and tell the team. */
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => reportError(error, { source: 'route' }), [error]);
    return (
        <div className="min-h-screen bg-bg px-6 flex flex-col items-center justify-center text-center gap-3">
            <h1 className="text-lg font-semibold text-ink">Màn hình này gặp lỗi</h1>
            <p className="text-sm text-muted max-w-sm">Tiến trình học của bạn vẫn được giữ. Thử tải lại màn hình; nếu vẫn lỗi, bạn báo giúp nhóm ở mục Góp ý nhé.</p>
            <div className="flex gap-2">
                <button type="button" onClick={reset} className="h-11 px-5 rounded-xl bg-accent text-on-accent font-semibold">
                    Thử lại
                </button>
                <Link href="/feedback?from=error" className="h-11 px-5 rounded-xl border border-line-strong text-ink-2 font-semibold flex items-center">
                    Báo lỗi
                </Link>
            </div>
        </div>
    );
}
