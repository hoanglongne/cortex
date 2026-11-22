'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { deleteMyAccount } from '../lib/auth';
import { useLexicaStore } from '../store/lexicaStore';

const CONFIRM_WORD = 'XÓA';

/**
 * Delete my account: the sign-in, the backup and what the server holds for it
 * (supabase/migration_delete_account.sql), plus the progress kept on this device.
 * Required in the app by Apple (5.1.1(v)) and Google Play. Shown only when signed in.
 */
export default function DeleteAccount() {
    const { user, signOut } = useAuth();
    const resetProgress = useLexicaStore((s) => s.resetProgress);
    const [open, setOpen] = useState(false);
    const [typed, setTyped] = useState('');
    const [busy, setBusy] = useState(false);
    const [state, setState] = useState<'idle' | 'failed' | 'done'>('idle');

    if (state === 'done') {
        return <p role="status" className="mb-6 rounded-[18px] bg-surface/60 p-4 text-center text-sm text-ink">Đã xóa tài khoản và dữ liệu của bạn.</p>;
    }
    if (!user) return null;

    const remove = async () => {
        setBusy(true);
        setState('idle');
        const ok = await deleteMyAccount();
        if (!ok) {
            setBusy(false);
            setState('failed');
            return;
        }
        resetProgress();
        await signOut();
        setBusy(false);
        setState('done');
    };

    return (
        <div className="lx-soft mb-6 rounded-[18px] bg-surface/60 p-4">
            {!open ? (
                <button type="button" onClick={() => setOpen(true)} className="text-xs font-semibold text-danger underline">
                    Xóa tài khoản
                </button>
            ) : (
                <div className="space-y-3">
                    <h2 className="text-sm font-bold text-ink">Xóa tài khoản {user.email}</h2>
                    <ul className="list-disc space-y-1 pl-5 text-xs text-muted">
                        <li>Xóa email đăng nhập, bản sao lưu tiến độ, Album, bạn học, thách đấu và bài viết đã nộp.</li>
                        <li>Xóa tiến độ học đang lưu trên máy này.</li>
                        <li>Nếu bạn là giáo viên, các lớp bạn tạo cũng bị xóa với học viên trong đó.</li>
                        <li>Không khôi phục được.</li>
                    </ul>
                    <label className="block text-xs text-muted">
                        Gõ <b className="text-ink">{CONFIRM_WORD}</b> để xác nhận
                        <input
                            value={typed}
                            onChange={(e) => setTyped(e.target.value)}
                            autoCapitalize="characters"
                            autoComplete="off"
                            className="mt-1 block w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink"
                        />
                    </label>
                    {state === 'failed' && <p role="alert" className="text-xs text-danger">Chưa xóa được. Kiểm tra mạng và thử lại, hoặc gửi yêu cầu ở trang Góp ý.</p>}
                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={busy || typed.trim().toUpperCase() !== CONFIRM_WORD}
                            onClick={remove}
                            className="rounded-lg bg-danger px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
                        >
                            {busy ? 'Đang xóa…' : 'Xóa vĩnh viễn'}
                        </button>
                        <button type="button" disabled={busy} onClick={() => { setOpen(false); setTyped(''); setState('idle'); }} className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-ink">
                            Giữ tài khoản
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
