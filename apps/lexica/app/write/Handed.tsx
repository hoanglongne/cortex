'use client';

import { useCallback, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { readCachedClasses } from '../lib/classes';
import { bandText, myHandedPieces, takeBack, type HandedPiece } from '../lib/writing/handIn';

const KIND = { sentence: 'Câu', paragraph: 'Đoạn văn', task1: 'Task 1', task2: 'Task 2' } as const;
const LABEL = { task: 'Đúng yêu cầu đề', coherence: 'Mạch lạc', vocabulary: 'Từ vựng', grammar: 'Ngữ pháp' } as const;

/** "Bài đã nộp": what the student handed in, what the teacher said, and a way to take it back. Shown only when there is something or a class. */
export default function Handed() {
    const [pieces, setPieces] = useState<HandedPiece[] | null>(null);
    const inClass = readCachedClasses().some((c) => c.role === 'student');

    const load = useCallback(async () => setPieces(await myHandedPieces()), []);
    useEffect(() => {
        if (!inClass) return;
        const t = setTimeout(() => void load(), 0);
        return () => clearTimeout(t);
    }, [inClass, load]);

    if (!inClass) return null;
    return (
        <section className="space-y-3 rounded-2xl border border-line bg-surface p-4" aria-label="Bài đã nộp">
            <h2 className="font-semibold text-ink">Bài đã nộp cho lớp</h2>
            {pieces === null ? (
                <p className="text-sm text-muted">Đang tải…</p>
            ) : pieces.length === 0 ? (
                <p className="text-sm text-muted">Bạn chưa nộp bài nào. Viết xong ở các bậc trên, bấm “Nộp bài này”.</p>
            ) : (
                <ul className="space-y-3">
                    {pieces.map((p) => (
                        <li key={p.id} className="rounded-xl border border-line p-3">
                            <div className="flex items-start justify-between gap-2">
                                <p className="text-xs text-muted">
                                    {KIND[p.kind]} · {p.words} từ · {new Date(p.submitted_at).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })}
                                </p>
                                <button
                                    type="button"
                                    aria-label="Xoá bài này"
                                    onClick={async () => {
                                        if (await takeBack(p.id)) setPieces((l) => (l ?? []).filter((x) => x.id !== p.id));
                                    }}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-danger"
                                >
                                    <Trash2 className="h-4 w-4" aria-hidden />
                                </button>
                            </div>
                            <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-ink-2" lang="en">
                                {p.body}
                            </p>
                            {p.teacher_scores ? (
                                <div className="mt-2 rounded-lg bg-surface-2 p-2.5 text-sm">
                                    <p className="font-semibold text-ink">Giáo viên chấm: {bandText(p.teacher_scores.overall)}</p>
                                    <p className="text-xs text-muted">{(Object.keys(LABEL) as (keyof typeof LABEL)[]).map((k) => `${LABEL[k]} ${bandText(p.teacher_scores![k])}`).join(' · ')}</p>
                                    {p.teacher_comment && <p className="mt-1 whitespace-pre-wrap text-ink-2">{p.teacher_comment}</p>}
                                </div>
                            ) : (
                                <p className="mt-2 text-xs text-subtle">Giáo viên chưa chấm.</p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
