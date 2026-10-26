'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { classMessage, weekLabel, type ParentView } from '@cortex/classroom';
import ReportView from '../../components/parents/ReportView';
import { api } from '../../lib/supabase';
import { inputClass } from '../../components/ui';

/**
 * The parent page (docs/TEACH_PLAN.md 3.1, 3.2): no account, the link is the
 * key, plus a PIN when the class asks for one. Only reports the teacher
 * approved: the newest open, the weeks before folded. Big type, one column.
 */
export default function ParentPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = use(params);
    const [view, setView] = useState<ParentView | null>(null);
    const [error, setError] = useState('');
    const [pin, setPin] = useState('');
    const [busy, setBusy] = useState(false);

    const open = useCallback(
        async (p?: string) => {
            setBusy(true);
            try {
                setView(await api.parentView(code, p));
                setError('');
            } catch (e) {
                setError(classMessage(e instanceof Error ? e.message : String(e)));
            } finally {
                setBusy(false);
            }
        },
        [code],
    );

    useEffect(() => {
        const t = setTimeout(() => void open(), 0);
        return () => clearTimeout(t);
    }, [open]);

    return (
        <main className="mx-auto min-h-dvh max-w-xl bg-bg px-4 py-8 sm:py-12">
            <p className="text-sm text-muted">Báo cáo học của con · Cortex</p>
            {error ? (
                <p className="mt-6 rounded-xl bg-warm-soft px-4 py-3 text-ink">{error}</p>
            ) : !view ? (
                <div className="mt-6 h-64 animate-pulse rounded-[var(--radius-card)] bg-surface-2" />
            ) : view.need_pin ? (
                <form
                    className="mt-6 rounded-[var(--radius-card)] border border-line bg-surface p-5"
                    onSubmit={(e) => {
                        e.preventDefault();
                        void open(pin);
                    }}
                >
                    <label htmlFor="pin" className="text-lg font-medium text-ink">
                        Nhập mã PIN giáo viên gửi kèm link
                    </label>
                    <input
                        id="pin"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        className={`${inputClass} mt-3 text-center font-mono text-2xl tracking-[0.5em]`}
                        aria-invalid={view.wrong}
                    />
                    {view.wrong && <p className="mt-2 text-sm text-danger">{view.locked ? 'Sai mã nhiều lần. Thử lại sau 15 phút.' : 'Mã chưa đúng, thử lại nhé.'}</p>}
                    <button type="submit" disabled={busy || pin.length !== 4} className="mt-4 h-12 w-full rounded-xl bg-accent font-medium text-on-accent disabled:opacity-40">
                        Xem báo cáo
                    </button>
                </form>
            ) : (
                <>
                    <h1 className="mt-1 text-2xl font-semibold text-ink">{view.name}</h1>
                    <p className="text-ink-2">{view.class}</p>
                    {view.reports.length === 0 ? (
                        <p className="mt-6 rounded-[var(--radius-card)] border border-line bg-surface p-5 text-ink-2">Chưa có báo cáo tuần nào. Giáo viên sẽ gửi báo cáo đầu tiên sau tuần học này.</p>
                    ) : (
                        <>
                            <section className="mt-6 rounded-[var(--radius-card)] border border-line bg-surface p-5">
                                <p className="mb-3 text-sm text-muted">Tuần {weekLabel(view.reports[0].week)}</p>
                                <ReportView content={view.reports[0].content} large />
                            </section>
                            {view.reports.length > 1 && (
                                <section className="mt-6">
                                    <p className="mb-2 text-sm font-medium text-muted">Các tuần trước</p>
                                    <div className="space-y-2">
                                        {view.reports.slice(1).map((r) => (
                                            <details key={r.week} className="rounded-[var(--radius-card)] border border-line bg-surface px-5 py-3">
                                                <summary className="cursor-pointer text-ink">
                                                    Tuần {weekLabel(r.week)} <span className="text-sm text-muted">· học {r.content.days}/7 ngày</span>
                                                </summary>
                                                <div className="mt-3">
                                                    <ReportView content={r.content} />
                                                </div>
                                            </details>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </>
                    )}
                    <p className="mt-8 text-xs text-subtle">Link này chỉ dành cho phụ huynh của em. Số liệu lấy từ ứng dụng học Lexica; giáo viên đọc và duyệt trước khi gửi.</p>
                </>
            )}
        </main>
    );
}
