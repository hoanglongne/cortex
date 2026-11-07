'use client';

import { useEffect, useState } from 'react';
import { lexicaModule } from '@cortex/classroom-lexica';
import { readCachedClasses } from '../lib/classes';
import { nextToRate, ratePiece, type PeerPiece, type PeerScores } from '../lib/writing/handIn';

const ROWS = [
    ['task', 'Đúng yêu cầu đề', 'Bài trả lời đúng điều đề hỏi, đủ ý?'],
    ['coherence', 'Mạch lạc', 'Ý nối với nhau, dễ theo dõi?'],
    ['vocabulary', 'Từ vựng', 'Từ ngữ phù hợp, không lặp lại một từ mãi?'],
    ['grammar', 'Ngữ pháp', 'Câu đúng ngữ pháp, có câu dài và câu ngắn?'],
] as const;

/**
 * "Chấm bài cho bạn": for a student in a class where the teacher turned on peer
 * rating. One piece at a time, no name. Not an exam: the number is a hint to the
 * author, next to the teacher's.
 */
export default function PeerReview() {
    const classes = readCachedClasses().filter((c) => c.role === 'student' && lexicaModule.parseSettings(c.settings?.lexica).peers_write);
    const [piece, setPiece] = useState<PeerPiece | null | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);
    const [scores, setScores] = useState<PeerScores>({ task: 5, coherence: 5, vocabulary: 5, grammar: 5 });
    const [comment, setComment] = useState('');
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(0);
    const classId = classes[0]?.id;

    const load = async () => {
        if (!classId) return;
        const r = await nextToRate(classId);
        setError(r.error);
        setPiece(r.piece);
        setScores({ task: 5, coherence: 5, vocabulary: 5, grammar: 5 });
        setComment('');
    };

    useEffect(() => {
        if (!classId) return;
        const t = setTimeout(() => void load(), 0);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classId]);

    if (!classId) return null;
    const send = async () => {
        if (!piece) return;
        setBusy(true);
        const err = await ratePiece(piece.id, scores, comment);
        setBusy(false);
        if (err) return setError(err);
        setDone((n) => n + 1);
        await load();
    };

    return (
        <section className="space-y-3 rounded-2xl border border-line bg-surface p-4" aria-label="Chấm bài cho bạn">
            <h2 className="font-semibold text-ink">Chấm bài cho bạn cùng lớp</h2>
            <p className="text-xs text-muted">Bài ẩn danh, chỉ những bạn đồng ý mới hiện ở đây. Bạn chấm theo cảm nhận của người đọc; điểm chỉ để tác giả tham khảo, không thay điểm giáo viên.{done > 0 ? ` Bạn đã chấm ${done} bài.` : ''}</p>
            {error && (
                <p className="text-xs font-semibold text-danger" role="alert">
                    {error}
                </p>
            )}
            {piece === undefined ? (
                <p className="text-sm text-muted">Đang tìm bài…</p>
            ) : piece === null ? (
                <p className="text-sm text-muted">Chưa có bài nào để chấm. Quay lại sau khi các bạn nộp thêm.</p>
            ) : (
                <div className="space-y-3">
                    {piece.prompt && <p className="text-xs text-muted">Đề: {piece.prompt}</p>}
                    <p className="whitespace-pre-wrap rounded-xl bg-surface-2 p-3 text-sm leading-relaxed text-ink" lang="en">
                        {piece.body}
                    </p>
                    {ROWS.map(([key, label, hint]) => (
                        <label key={key} className="block text-sm text-ink-2">
                            <span className="font-medium text-ink">{label}</span> <span className="text-xs text-muted">· {hint}</span>
                            <select value={scores[key]} onChange={(e) => setScores({ ...scores, [key]: Number(e.target.value) })} className="mt-1 h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </select>
                        </label>
                    ))}
                    <label className="block text-sm text-ink-2">
                        Một lời góp ý ngắn (không bắt buộc, hãy lịch sự)
                        <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} rows={2} className="mt-1 w-full rounded-lg border border-line-strong bg-surface p-2 text-sm text-ink" />
                    </label>
                    <button type="button" disabled={busy} onClick={() => void send()} className="h-10 rounded-xl bg-accent px-4 text-sm font-bold text-on-accent disabled:opacity-50">
                        {busy ? 'Đang gửi…' : 'Gửi điểm và xem bài tiếp'}
                    </button>
                </div>
            )}
        </section>
    );
}
