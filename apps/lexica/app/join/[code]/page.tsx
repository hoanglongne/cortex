'use client';

import Link from 'next/link';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { School } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthGate from '../../components/AuthGate';
import { joinClass } from '../../lib/classes';
import { refreshClasses, reportNow } from '../../lib/classSync';

/**
 * A class link from a teacher (lexica…/join/ABC123): sign in, say the name the
 * teacher will see, then straight into today's session with the class words.
 * Typing the code in "Lớp học" does the same.
 */
export default function JoinPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = use(params);
    const clean = decodeURIComponent(code).toUpperCase().slice(0, 6);
    const { user, profile, loading } = useAuth();
    const router = useRouter();
    const [name, setName] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const shownName = name || profile?.nickname || '';

    const join = async () => {
        setBusy(true);
        setError('');
        try {
            await joinClass(clean, shownName.trim());
            await refreshClasses(true);
            void reportNow();
            router.push('/today');
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
            setBusy(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-bg" />;
    return (
        <div className="min-h-screen bg-bg px-4 py-10">
            <div className="max-w-md mx-auto space-y-4">
                <section className="rounded-2xl border border-line bg-surface p-5">
                    <p className="flex items-center gap-2 font-semibold text-ink">
                        <School className="w-4 h-4 text-accent" /> Vào lớp <span className="font-mono tracking-widest">{clean}</span>
                    </p>
                    <p className="mt-1 text-sm text-muted">Giáo viên sẽ thấy tên bạn và 4 con số Hiểu, Nhớ, Gặp, Dùng, cùng tiến độ trên những từ lớp giao. Không thấy gì khác.</p>
                    {user && (
                        <div className="mt-4 space-y-2">
                            <input
                                value={shownName}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={40}
                                placeholder="Tên hiện trong lớp"
                                aria-label="Tên hiện trong lớp"
                                className="w-full h-11 rounded-xl border border-line bg-bg px-3 text-ink"
                            />
                            <button onClick={() => void join()} disabled={busy || !shownName.trim()} className="w-full h-11 rounded-xl bg-accent text-on-accent font-bold disabled:opacity-40">
                                {busy ? 'Đang vào…' : 'Vào lớp và học hôm nay'}
                            </button>
                            {error && <p className="text-sm text-danger">{error}</p>}
                        </div>
                    )}
                </section>
                {!user && <AuthGate reason="Đăng nhập bằng email để vào lớp. Không cần mật khẩu." redirectPath={`/join/${clean}`} />}
                <p className="text-center">
                    <Link href="/" className="text-sm text-muted hover:text-accent">
                        ← Về Lexica
                    </Link>
                </p>
            </div>
        </div>
    );
}
