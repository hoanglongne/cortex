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
        <main className="mx-auto min-h-dvh max-w-xl bg-bg px-5 pb-16 pt-8 sm:pt-14">
            <p className="text-sm text-muted">Báo cáo học của con</p>
            {error ? (
                <p role="alert" className="mt-8 rounded-[var(--radius-card)] bg-surface p-5 text-ink shadow-[var(--shadow-card)]">{error}</p>
            ) : !view ? (
                <div className="mt-6 h-64 animate-pulse rounded-[var(--radius-card)] bg-surface-2" />
            ) : view.need_pin ? (
                <form
                    className="mt-8 rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-card)]"
                    onSubmit={(e) => {
                        e.preventDefault();
                        void open(pin);
                    }}
                >
                    <label htmlFor="pin" className="font-serif text-xl font-semibold text-ink">
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
                    <button type="submit" disabled={busy || pin.length !== 4} className="mt-5 h-12 w-full rounded-[10px] bg-accent font-semibold text-on-accent disabled:opacity-40">
                        Xem báo cáo
                    </button>
                </form>
            ) : (
                <>
                    <h1 className="mt-1 font-serif text-[34px] font-semibold leading-tight text-ink">{view.name}</h1>
                    <p className="mt-1 text-ink-2">Lớp {view.class}</p>
                    {view.reports.length === 0 ? (
                        <p className="mt-8 rounded-[var(--radius-card)] bg-surface p-6 text-ink-2 shadow-[var(--shadow-card)]">Chưa có báo cáo tuần nào. Giáo viên sẽ gửi báo cáo đầu tiên sau tuần học này.</p>
                    ) : (
                        <>
                            <section className="mt-8">
                                <p className="mb-4 text-[15px] font-medium text-accent-strong">Tuần {weekLabel(view.reports[0].week)}</p>
                                <ReportView content={view.reports[0].content} large />
                            </section>
                            {view.reports.length > 1 && (
                                <section className="mt-12 border-t border-line pt-8">
                                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.06em] text-muted">Các tuần trước</p>
                                    <div className="space-y-3">
                                        {view.reports.slice(1).map((r) => (
                                            <details key={r.week} className="rounded-[var(--radius-card)] bg-surface px-5 py-4 shadow-[var(--shadow-card)]">
                                                <summary className="cursor-pointer text-ink">
                                                    Tuần {weekLabel(r.week)} <span className="text-sm text-muted">· học {r.content.days}/7 ngày</span>
                                                </summary>
                                                <div className="mt-5">
                                                    <ReportView content={r.content} />
                                                </div>
                                            </details>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </>
                    )}
                    <p className="mt-12 text-[13px] text-muted">Link này chỉ dành cho phụ huynh của em. Số liệu lấy từ ứng dụng học Lexica; giáo viên đọc và duyệt trước khi gửi.</p>
                </>
            )}
        </main>
    );
}
