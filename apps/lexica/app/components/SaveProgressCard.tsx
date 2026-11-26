'use client';

import Link from 'next/link';
import { CloudUpload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSupabaseClient } from '../lib/supabase';

/**
 * After a session, for someone not signed in: their progress lives only in this
 * browser, and Safari clears a site's data after 7 days without a visit. Signing
 * in backs it up (issue #178). Shows nothing when signed in or with no server.
 */
export default function SaveProgressCard() {
    const { user, loading } = useAuth();
    if (loading || user || !getSupabaseClient()) return null;
    return (
        <Link href="/settings" data-testid="save-progress" className="flex items-start gap-3 rounded-2xl bg-surface-2 p-4 text-ink lx-soft hover:border-ink">
            <CloudUpload className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <span>
                <span className="block font-semibold">Lưu tiến độ của bạn</span>
                <span className="block text-sm text-muted">Tiến độ đang chỉ nằm trên trình duyệt này. Safari xoá dữ liệu trang web sau 7 ngày không mở. Đăng nhập để sao lưu và học tiếp trên máy khác.</span>
            </span>
        </Link>
    );
}
