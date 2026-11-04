'use client';

import { useEffect } from 'react';
import { reportError } from './lib/errorReport';

/** The page itself failed to start (nothing of the app is available): a plain screen that needs no styles. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => reportError(error, { source: 'global' }), [error]);
    return (
        <html lang="vi">
            <body style={{ background: '#0E0F11', color: '#fff', fontFamily: 'system-ui, sans-serif', display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
                <div>
                    <h1 style={{ fontSize: 18 }}>Lexica gặp lỗi khi mở</h1>
                    <p style={{ color: '#B8BBC2', fontSize: 14 }}>Tiến trình học của bạn vẫn được giữ trên máy.</p>
                    <button type="button" onClick={reset} style={{ marginTop: 12, height: 44, padding: '0 20px', borderRadius: 12, border: 0, background: '#C6F432', color: '#0E0F11', fontWeight: 600 }}>
                        Thử lại
                    </button>
                </div>
            </body>
        </html>
    );
}
