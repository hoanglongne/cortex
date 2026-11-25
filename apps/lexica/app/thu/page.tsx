'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BadgeCheck } from 'lucide-react';
import type { TrialInfo } from '@cortex/classroom';
import PlacementTest, { type TestOutcome } from '../components/PlacementTest';
import { getGuestClient, guestApi, startGuestSession } from '../lib/guestSupabase';
import { setVerifiedClient } from '../lib/placement/verified';

/**
 * A trial session (Teach: "Buổi học thử"). A parent or student opens the link, leaves a
 * name (and a phone only if they choose), takes the placement test as a guest and
 * gets a score page. No account, no profile, nothing synced; the teacher sees the
 * entry in the teacher app. Docs: docs/TEACH_TRIAL_PLAN.md.
 */
export default function TrialPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-bg" />}>
            <Trial />
        </Suspense>
    );
}

type Step = 'form' | 'test' | 'done';

function Trial() {
    const code = (useSearchParams().get('code') ?? '').trim().toUpperCase();
    const [info, setInfo] = useState<TrialInfo | null>(null);
    const [step, setStep] = useState<Step>('form');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [consent, setConsent] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [scoreCode, setScoreCode] = useState<string | null>(null);

    useEffect(() => {
        if (!code) return;
        guestApi.trialInfo(code).then(setInfo, () => setInfo({ valid: false }));
    }, [code]);

    useEffect(() => {
        if (step !== 'test') return;
        setVerifiedClient(getGuestClient());
        return () => setVerifiedClient(null);
    }, [step]);

    const begin = async () => {
        setBusy(true);
        setError('');
        const failed = await startGuestSession();
        if (failed) {
            setError(failed);
            setBusy(false);
            return;
        }
        try {
            await guestApi.trialRegister(code, name, phone.trim() ? phone : null, consent);
            setStep('test');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Chưa vào được. Thử lại nhé.');
        }
        setBusy(false);
    };

    const finish = async (r: TestOutcome) => {
        if (r.code) {
            setScoreCode(r.code);
            await guestApi.trialAttach(code, r.code).catch(() => {});
        }
        setStep('done');
    };

    if (step === 'test') return <PlacementTest start={1000} verify onBack={() => setStep('form')} onDone={(r) => void finish(r)} />;

    return (
        <div className="min-h-screen bg-bg px-4 py-10">
            <div className="max-w-md mx-auto space-y-5">
                {!code || (info && !info.valid) ? (
                    <section className="lx-soft rounded-[20px] bg-surface p-6 space-y-2">
                        <h1 className="text-xl font-extrabold text-ink">Buổi học thử này đã đóng</h1>
                        <p className="text-sm text-muted">Link không đúng hoặc buổi học thử đã kết thúc. Hỏi giáo viên để lấy link mới nhé.</p>
                    </section>
                ) : step === 'done' ? (
                    <section className="lx-soft rounded-[20px] bg-surface p-6 space-y-3">
                        <h1 className="text-xl font-extrabold text-ink">Cảm ơn {name}!</h1>
                        <p className="text-sm text-muted">Bạn đã làm xong. Giáo viên sẽ xem kết quả và liên hệ lại.</p>
                        {scoreCode && (
                            <Link href={`/score/view?code=${encodeURIComponent(scoreCode)}`} className="lx-hard lx-press inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-extrabold text-on-accent">
                                <BadgeCheck className="w-4 h-4" /> Xem trang điểm của bạn
                            </Link>
                        )}
                    </section>
                ) : (
                    <form
                        className="lx-soft rounded-[20px] bg-surface p-6 space-y-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            void begin();
                        }}
                    >
                        <div>
                            <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted">{info?.center ?? 'Buổi học thử'}</p>
                            <h1 className="mt-1 text-2xl font-extrabold text-ink">{info?.title ?? 'Học thử'}</h1>
                            <p className="mt-2 text-sm text-muted">Làm bài xếp lớp khoảng 5 phút để biết vốn từ tiếng Anh của bạn. Không cần tài khoản.</p>
                        </div>
                        <label className="block text-sm font-semibold text-ink">
                            Tên của bạn
                            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="given-name" className="mt-1 block h-12 w-full rounded-xl border border-line bg-bg px-4 text-ink" />
                        </label>
                        <label className="block text-sm font-semibold text-ink">
                            Số điện thoại <span className="font-normal text-muted">(không bắt buộc)</span>
                            <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" maxLength={20} autoComplete="tel" className="mt-1 block h-12 w-full rounded-xl border border-line bg-bg px-4 text-ink" />
                        </label>
                        {phone.trim() && (
                            <label className="flex items-start gap-2 text-xs text-muted">
                                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
                                <span>
                                    Tôi đồng ý để {info?.center ?? 'trung tâm'} lưu số này và gọi lại về buổi học thử. Chỉ trung tâm thấy số, bị xoá sau 90 ngày nếu không ghi danh. Em dưới 16 tuổi: phụ huynh nhập số. Không tích thì số không được lưu.
                                </span>
                            </label>
                        )}
                        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
                        <button type="submit" disabled={busy || name.trim().length < 1 || !info?.valid} className="lx-hard lx-press h-12 w-full rounded-xl bg-accent text-sm font-extrabold text-on-accent disabled:opacity-50">
                            {busy ? 'Đang vào…' : 'Bắt đầu làm bài'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
