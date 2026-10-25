'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { BadgeCheck } from 'lucide-react';
import { levelDef } from '../../lib/levels';
import { ieltsRange, vocabSize } from '../../lib/placement/engine';
import { publicScore, type PublicScore } from '../../lib/placement/verified';

/**
 * A verified vocabulary score by its code, for anyone the learner shares it
 * with: only the score, its date and what it is roughly worth; no name, no
 * answers (supabase/migration_placement.sql, lexica_score_public).
 */
export default function PublicScorePage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = use(params);
    const [state, setState] = useState<{ score: PublicScore | null; error: boolean } | null>(null);

    useEffect(() => {
        let live = true;
        publicScore(code)
            .then((score) => live && setState({ score, error: false }))
            .catch(() => live && setState({ score: null, error: true }));
        return () => {
            live = false;
        };
    }, [code]);

    const s = state?.score;
    return (
        <div className="min-h-screen bg-bg px-4 py-10">
            <div className="max-w-md mx-auto space-y-5">
                <p className="text-center font-semibold tracking-wide text-ink">LEXICA</p>
                {!state ? (
                    <div className="h-72 rounded-3xl bg-surface animate-pulse" />
                ) : !s ? (
                    <section className="rounded-2xl border border-line bg-surface p-5 text-center text-sm text-muted">
                        {state.error ? 'Chưa kiểm tra được điểm lúc này. Thử lại sau nhé.' : 'Không tìm thấy điểm với mã này.'}
                    </section>
                ) : (
                    <section className="rounded-3xl border border-accent/40 bg-gradient-to-b from-accent/10 to-accent/[0.02] p-6 text-center">
                        <p className="flex items-center justify-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-accent">
                            <BadgeCheck className="w-4 h-4" /> Điểm từ vựng đã xác minh
                        </p>
                        <p className="mt-3 font-mono text-6xl font-bold text-ink">{s.score}</p>
                        <p className="mt-1 text-sm text-muted">
                            ± {s.sd} điểm · {new Date(s.at).toLocaleDateString('vi-VN')}
                        </p>
                        <div className="mt-5 grid grid-cols-2 gap-2 text-left">
                            <div className="rounded-xl bg-bg/60 border border-line p-3">
                                <p className="text-[11px] text-subtle">Tương đương IELTS từ vựng</p>
                                <p className="mt-0.5 font-semibold text-ink">khoảng {ieltsRange(s.score, s.sd)}</p>
                            </div>
                            <div className="rounded-xl bg-bg/60 border border-line p-3">
                                <p className="text-[11px] text-subtle">Vốn từ ước lượng</p>
                                <p className="mt-0.5 font-semibold text-ink">~{vocabSize(s.score).toLocaleString('vi-VN')} từ</p>
                            </div>
                        </div>
                        <p className="mt-4 text-sm text-ink-2">
                            Level {levelDef(s.level).label} · {levelDef(s.level).cefr}
                        </p>
                        <p className="mt-4 text-[11px] text-subtle">
                            Bài kiểm tra thích ứng do máy chủ Lexica chọn câu và chấm, có giới hạn thời gian từng câu{s.sound ? ', có câu nghe' : ''}. Ước lượng, không phải điểm thi IELTS chính thức.
                        </p>
                    </section>
                )}
                <Link href="/test" className="block text-center text-sm text-accent hover:underline">
                    Đo vốn từ của bạn với Lexica
                </Link>
            </div>
        </div>
    );
}
