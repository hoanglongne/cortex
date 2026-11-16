'use client';

import { useLexicaStore } from '../../store/lexicaStore';
import { meanLogLoss } from '../../lib/learner/model';

/**
 * Shadow check for issue #143: does FSRS predict this learner's recognition
 * answers better than the current SM-2 schedule? Lower log loss is better.
 * FSRS takes over scheduling only when it wins on enough answers.
 */
export default function LearnerDevPage() {
    const learner = useLexicaStore((s) => s.learner);
    const m = learner?.metrics;
    const row = (name: string, s?: { n: number; logLoss: number; brier: number }) => (
        <tr key={name} className="border-t border-line">
            <td className="py-2 pr-4">{name}</td>
            <td className="py-2 pr-4 font-mono">{s?.n ?? 0}</td>
            <td className="py-2 pr-4 font-mono">{s ? (meanLogLoss(s, 1)?.toFixed(3) ?? '—') : '—'}</td>
            <td className="py-2 font-mono">{s && s.n ? (s.brier / s.n).toFixed(3) : '—'}</td>
        </tr>
    );
    const f = m ? meanLogLoss(m.fsrs) : null;
    const s = m ? meanLogLoss(m.sm2) : null;
    return (
        <main className="min-h-dvh bg-bg text-ink px-4 py-6 max-w-2xl mx-auto">
            <h1 className="text-lg font-semibold">Mô hình người học (chạy song song)</h1>
            <p className="text-sm text-muted mt-1">So độ dự đoán trên các câu trả lời nhận ra có chấm điểm. Log loss thấp hơn là tốt hơn.</p>
            <table className="mt-4 w-full text-sm">
                <thead><tr className="text-left text-muted"><th className="pb-2">Mô hình</th><th className="pb-2">Số câu</th><th className="pb-2">Log loss</th><th className="pb-2">Brier</th></tr></thead>
                <tbody>{row('FSRS (4 tầng)', m?.fsrs)}{row('Lịch SM-2 hiện tại', m?.sm2)}</tbody>
            </table>
            <p className="mt-4 text-sm">
                {f === null || s === null ? 'Chưa đủ 30 câu để kết luận.' : f < s ? 'FSRS đang dự đoán tốt hơn.' : 'Lịch hiện tại vẫn dự đoán tốt hơn hoặc ngang.'}
            </p>
            <p className="mt-2 text-xs text-muted">Bằng chứng đã ghi: {learner?.log.length ?? 0} · Số từ có mô hình: {Object.keys(learner?.memories ?? {}).length}</p>
        </main>
    );
}
