'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Bug, Check, Lightbulb, Loader2, MessageCircle } from 'lucide-react';
import { sendFeedback, type FeedbackKind } from '../lib/feedback';

const KINDS: { id: FeedbackKind; label: string; icon: React.ReactNode; placeholder: string }[] = [
    { id: 'bug', label: 'Báo lỗi', icon: <Bug className="w-4 h-4" />, placeholder: 'Bạn đang làm gì thì gặp lỗi? Máy hiện gì? (ví dụ: bấm Xong ở Luyện nói thì nút không đổi)' },
    { id: 'idea', label: 'Góp ý', icon: <Lightbulb className="w-4 h-4" />, placeholder: 'Bạn muốn Lexica có thêm gì, hoặc sửa chỗ nào cho dễ dùng hơn?' },
    { id: 'other', label: 'Khác', icon: <MessageCircle className="w-4 h-4" />, placeholder: 'Bạn muốn nói gì với nhóm làm Lexica?' },
];

const chip = (on: boolean) => `h-10 rounded-xl border text-sm font-medium flex items-center justify-center gap-1.5 ${on ? 'bg-accent/12 border-accent/40 text-accent' : 'bg-surface-2/40 border-line-strong/50 text-ink-2'}`;

/** "Góp ý": bug reports and ideas go to the team (Supabase lexica_feedback). */
export default function FeedbackPage() {
    return (
        <Suspense>
            <FeedbackForm />
        </Suspense>
    );
}

function FeedbackForm() {
    const from = useSearchParams().get('from') ?? '';
    const [kind, setKind] = useState<FeedbackKind>('bug');
    const [message, setMessage] = useState('');
    const [contact, setContact] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);
    const current = KINDS.find((k) => k.id === kind)!;

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        const err = await sendFeedback(kind, message, contact, from);
        setBusy(false);
        if (err) setError(err);
        else setSent(true);
    };

    return (
        <div className="min-h-screen bg-bg px-4 py-6">
            <div className="max-w-xl mx-auto space-y-5">
                <div>
                    <h1 className="text-xl font-semibold text-ink">Góp ý và báo lỗi</h1>
                    <p className="mt-1 text-sm text-muted">Lexica đang thử nghiệm. Mỗi lời góp ý đều được đọc, và giúp app tốt lên nhanh hơn.</p>
                </div>

                {sent ? (
                    <section className="rounded-2xl border border-line bg-surface p-5 space-y-3 text-center">
                        <div className="mx-auto w-10 h-10 rounded-full bg-accent/12 text-accent flex items-center justify-center">
                            <Check className="w-5 h-5" />
                        </div>
                        <p className="font-medium text-ink">Cảm ơn bạn, nhóm đã nhận được.</p>
                        <div className="flex gap-2 justify-center">
                            <button onClick={() => { setSent(false); setMessage(''); }} className="h-10 px-4 rounded-xl border border-line-strong/50 text-sm text-ink-2">
                                Gửi thêm
                            </button>
                            <Link href="/me" className="h-10 px-4 rounded-xl bg-accent text-on-accent text-sm font-medium flex items-center">
                                Về trang Tôi
                            </Link>
                        </div>
                    </section>
                ) : (
                    <form onSubmit={submit} className="rounded-2xl border border-line bg-surface p-4 space-y-4">
                        <div className="grid grid-cols-3 gap-1.5">
                            {KINDS.map((k) => (
                                <button key={k.id} type="button" onClick={() => setKind(k.id)} aria-pressed={kind === k.id} className={chip(kind === k.id)}>
                                    {k.icon} {k.label}
                                </button>
                            ))}
                        </div>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={2000}
                            rows={6}
                            placeholder={current.placeholder}
                            aria-label="Nội dung"
                            className="w-full rounded-xl border border-line-strong/50 bg-surface-2/40 p-3 text-sm text-ink placeholder:text-subtle focus:outline-none focus:border-accent/60"
                        />
                        <input
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            maxLength={200}
                            placeholder="Email hoặc Zalo, nếu bạn muốn được trả lời (không bắt buộc)"
                            aria-label="Liên hệ"
                            className="w-full h-11 rounded-xl border border-line-strong/50 bg-surface-2/40 px-3 text-sm text-ink placeholder:text-subtle focus:outline-none focus:border-accent/60"
                        />
                        {error && <p className="text-sm text-danger">{error}</p>}
                        <button type="submit" disabled={busy || message.trim().length === 0} className="w-full h-11 rounded-xl bg-accent hover:bg-accent-strong disabled:opacity-40 text-on-accent font-semibold flex items-center justify-center gap-2">
                            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Gửi
                        </button>
                        <p className="text-xs text-muted">
                            Kèm theo: loại máy và trình duyệt, trang bạn vừa ở, để dễ tìm lỗi. Xem <Link href="/privacy" className="underline">Chính sách riêng tư</Link>.
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
