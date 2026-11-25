'use client';

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import EmailSignIn from '../components/EmailSignIn';
import { useSession } from '../lib/session';

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-bg" />}>
            <Login />
        </Suspense>
    );
}

function Login() {
    const next = useSearchParams().get('next') || '/';
    const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';
    const { session } = useSession();
    const router = useRouter();
    useEffect(() => {
        if (session) router.replace(safeNext);
    }, [session, router, safeNext]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-bg px-4">
            <div className="w-full max-w-sm rounded-[var(--radius-card)] border border-line bg-surface p-8 shadow-[var(--shadow-card)]">
                <p className="text-lg font-semibold text-ink">Cortex cho lớp</p>
                <p className="mt-1 mb-5 text-sm text-muted">Dành cho giáo viên và trung tâm. Chưa có tài khoản? Nhập email và mật khẩu mới bên dưới, hoặc mở link mời nếu có.</p>
                <EmailSignIn back={safeNext} />
                <p className="mt-4 text-sm text-muted">
                    Mới mở lớp hoặc trung tâm? <Link href="/dang-ky" className="text-accent underline">Bắt đầu miễn phí</Link>
                </p>
            </div>
        </div>
    );
}
