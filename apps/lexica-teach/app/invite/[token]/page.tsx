'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EmailSignIn from '../../components/EmailSignIn';
import { Button, ErrorNote, errorText } from '../../components/ui';
import { api } from '../../lib/supabase';
import { useSession } from '../../lib/session';

const WHAT: Record<string, string> = {
    org_admin: 'quản lý trung tâm',
    org_teacher: 'giáo viên của trung tâm',
    indie: 'giáo viên tự mở lớp riêng',
};

/** An invitation link: what it is for, sign in, accept. One use, 7 days. */
export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const { session, refresh } = useSession();
    const router = useRouter();
    const [info, setInfo] = useState<{ valid: boolean; kind?: string; org?: string | null } | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api.inviteInfo(token)
            .then(setInfo)
            .catch(() => setInfo({ valid: false }));
    }, [token]);

    const accept = async () => {
        setBusy(true);
        setError('');
        try {
            const r = await api.acceptInvite(token);
            await refresh();
            router.replace(r.kind === 'org_admin' ? '/center' : '/');
        } catch (e) {
            setError(errorText(e));
            setBusy(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-bg px-4">
            <div className="w-full max-w-md rounded-[var(--radius-card)] border border-line bg-surface p-8 shadow-[var(--shadow-card)]">
                <p className="text-sm font-medium text-accent">Lexica cho lớp</p>
                {!info ? (
                    <p className="mt-3 text-muted">Đang mở lời mời…</p>
                ) : !info.valid ? (
                    <>
                        <p className="mt-2 text-lg font-semibold text-ink">Lời mời đã hết hạn hoặc đã được dùng</p>
                        <p className="mt-1 text-sm text-muted">Mỗi link mời chỉ dùng một lần trong 7 ngày. Nhờ người mời gửi lại link mới nhé.</p>
                    </>
                ) : (
                    <>
                        <p className="mt-2 text-lg font-semibold text-ink">Bạn được mời làm {WHAT[info.kind ?? ''] ?? 'giáo viên'}</p>
                        {info.org && <p className="mt-1 text-muted">{info.org}</p>}
                        <div className="mt-6">
                            {session ? (
                                <div className="space-y-3">
                                    <p className="text-sm text-muted">
                                        Nhận bằng tài khoản <b className="text-ink-2">{session.user.email}</b>.
                                    </p>
                                    <Button onClick={() => void accept()} disabled={busy} className="w-full">
                                        {busy ? 'Đang nhận…' : 'Nhận lời mời'}
                                    </Button>
                                    <ErrorNote error={error} />
                                </div>
                            ) : (
                                <>
                                    <p className="mb-3 text-sm text-muted">Đăng nhập bằng email (cùng tài khoản Lexica nếu bạn đã có), rồi quay lại trang này để nhận.</p>
                                    <EmailSignIn back={`/invite/${token}`} />
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
