'use client';

import Link from 'next/link';
import { useState } from 'react';
import BackLink from '../components/BackLink';
import Handed from './Handed';
import PeerReview from './PeerReview';
import W2 from './W2';
import W3 from './W3';
import W4 from './W4';

/**
 * "Viết": a ladder from one sentence to a whole answer (issue #105). Each step
 * checks only what the program can see and leaves the rest to the learner;
 * nothing is scored by the program; a piece leaves the device only when the
 * student hands it in to their class (W6).
 */
const STEPS = [
    { id: 'w1', label: 'Câu của bạn', hint: 'Viết một câu với từ mới' },
    { id: 'w2', label: 'Viết lại câu', hint: 'Nói trang trọng hơn' },
    { id: 'w3', label: 'Đoạn văn', hint: 'Bốn phần có khung' },
    { id: 'w4', label: 'Biểu đồ', hint: 'Mô tả số liệu' },
] as const;
type Step = (typeof STEPS)[number]['id'];

export default function WritePage() {
    const [step, setStep] = useState<Step>('w2');
    return (
        <div className="min-h-screen bg-bg px-4 py-6">
            <div className="mx-auto max-w-2xl space-y-4">
                <div className="flex items-center justify-between">
                    <BackLink fallback="/practice" />
                    <h1 className="text-xl font-semibold text-ink">Viết</h1>
                    <div className="w-12" />
                </div>
                <p className="text-sm text-muted">Đi từ một câu đến cả bài. Máy kiểm những gì nhìn thấy trong chữ và nhắc bạn tự kiểm phần còn lại, không cho điểm.</p>

                <div className="grid grid-cols-4 gap-1 rounded-xl bg-surface-2 p-1" role="tablist" aria-label="Các bậc Viết">
                    {STEPS.map((s, i) => (
                        <button
                            key={s.id}
                            role="tab"
                            aria-selected={step === s.id}
                            onClick={() => setStep(s.id)}
                            className={`rounded-lg px-1 py-2 text-center text-xs sm:text-sm ${step === s.id ? 'bg-surface font-semibold text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
                        >
                            <span className="block font-mono text-[10px] text-subtle">W{i + 1}</span>
                            {s.label}
                        </button>
                    ))}
                </div>

                {step === 'w1' && (
                    <section className="space-y-3 rounded-2xl border border-line bg-surface p-4">
                        <h2 className="font-semibold text-ink">Câu của bạn</h2>
                        <p className="text-sm text-muted">Sau mỗi buổi Hôm nay, bạn viết một câu với từ vừa học và nhận phản hồi. Muốn xem lại những câu đã viết hoặc viết thêm:</p>
                        <Link href="/journal" className="inline-flex h-10 items-center rounded-xl bg-accent px-4 text-sm font-bold text-on-accent">
                            Mở nhật ký câu của bạn
                        </Link>
                    </section>
                )}
                {step === 'w2' && <W2 />}
                {step === 'w3' && <W3 />}
                {step === 'w4' && <W4 />}

                <Handed />

                <PeerReview />
            </div>
        </div>
    );
}
