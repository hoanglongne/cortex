'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EmailSignIn from '../components/EmailSignIn';
import { Button, ErrorNote, errorText, inputClass } from '../components/ui';
import { api } from '../lib/supabase';
import { hasAccess, useSession } from '../lib/session';

/**
 * Self sign-up: no invitation. Make an account (email and password), name your
 * class or center, and you are in with a free center of 30 student seats
 * (classroom_self_signup). Someone who already has access goes straight in.
 */
export default function SignUpPage() {
    const { loading, session, me, refresh } = useSession();
    const router = useRouter();
    const [name, setName] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (hasAccess(me)) router.replace('/?welcome=1');
    }, [me, router]);

    const create = async () => {
        setBusy(true);
        setError('');
        try {
            await api.selfSignup(name);
            await refresh();
            router.replace('/?welcome=1');
        } catch (e) {
            setError(errorText(e));
            setBusy(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
            <div className="w-full max-w-md rounded-[var(--radius-card)] border border-line bg-surface p-8 shadow-[var(--shadow-card)]">
                <p className="text-sm font-medium text-accent">Cortex cho lớp</p>
                <h1 className="mt-2 text-2xl font-semibold text-ink">Mở lớp của bạn trong vài phút</h1>
                <ul className="mt-3 space-y-1 text-sm text-ink-2">
                    <li>Học viên vào lớp bằng một mã, không cần bạn tạo tài khoản cho từng em.</li>
                    <li>Miễn phí cho 30 học viên. Không cần thẻ.</li>
                </ul>
                <div className="mt-6">
                    {loading ? (
                        <p className="text-sm text-muted">Đang mở…</p>
                    ) : !session ? (
                        <>
                            <p className="mb-3 text-sm font-medium text-ink">1. Tạo tài khoản</p>
                            <EmailSignIn back="/dang-ky" />
                        </>
                    ) : (
                        <form
                            className="space-y-3"
                            onSubmit={(e) => {
                                e.preventDefault();
                                void create();
                            }}
                        >
                            <label className="block text-sm font-medium text-ink" htmlFor="center-name">
                                2. Tên trung tâm, hoặc tên lớp của bạn
                            </label>
                            <input
                                id="center-name"
                                className={inputClass}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ví dụ: Trung tâm Sao Mai, hoặc Lớp cô Lan"
                                maxLength={80}
                                autoFocus
                            />
                            <ErrorNote error={error} />
                            <Button type="submit" disabled={busy || name.trim().length < 2} className="w-full">
                                {busy ? 'Đang tạo…' : 'Bắt đầu'}
                            </Button>
                            <p className="text-xs text-muted">Bạn có thể đổi tên và mời giáo viên khác sau.</p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
