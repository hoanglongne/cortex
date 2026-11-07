'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Board } from '@cortex/classroom';
import { getSupabase } from '../../lib/supabase';
import { Badge, Button, ErrorNote, errorText, inputClass } from '../../components/ui';

/** One piece of writing handed in to the class (writing_class_list). */
interface Piece {
    id: string;
    name: string;
    assignment_id: string | null;
    kind: 'sentence' | 'paragraph' | 'task1' | 'task2';
    prompt: string | null;
    body: string;
    words: number;
    submitted_at: string;
    expires_at: string;
    teacher_scores: { task: number; coherence: number; vocabulary: number; grammar: number; overall: number } | null;
    teacher_comment: string | null;
    peers_ok: boolean;
    peer: { raters: number; task: number; coherence: number; vocabulary: number; grammar: number; comments: string[] } | null;
}

const KIND: Record<Piece['kind'], string> = { sentence: 'Câu', paragraph: 'Đoạn văn', task1: 'Task 1', task2: 'Task 2' };
const CRITERIA = [
    ['task', 'Đúng yêu cầu đề'],
    ['coherence', 'Mạch lạc, liên kết'],
    ['vocabulary', 'Từ vựng'],
    ['grammar', 'Ngữ pháp'],
] as const;
const BANDS = Array.from({ length: 17 }, (_, i) => 1 + i * 0.5);
const fmt = (n: number) => String(n).replace('.', ',');

/**
 * Bài viết đã nộp vào lớp: đọc, chấm bốn tiêu chí, viết nhận xét. Chỉ thầy cô
 * của lớp thấy; bài tự xoá sau 30 ngày, em cũng xoá được ngay (issue #105).
 */
export default function ClassWriting({ board }: { board: Board }) {
    const classId = board.class.id;
    const [rows, setRows] = useState<Piece[] | null>(null);
    const [error, setError] = useState('');
    const [open, setOpen] = useState<string | null>(null);

    const load = useCallback(async () => {
        const supabase = getSupabase();
        if (!supabase) return;
        const res = await supabase.rpc('writing_class_list', { p_class: classId });
        if (res.error) {
            setError(res.error.message.includes('Could not find') ? 'Chưa cài SQL cho bài viết của lớp (chạy supabase/teach_all.sql).' : errorText(res.error.message));
            setRows([]);
            return;
        }
        setRows(res.data as Piece[]);
    }, [classId]);

    useEffect(() => {
        const t = setTimeout(() => void load(), 0);
        return () => clearTimeout(t);
    }, [load]);

    if (rows === null) return <p className="text-sm text-muted">Đang tải bài viết của lớp…</p>;
    return (
        <div className="space-y-3">
            <ErrorNote error={error} />
            {rows.length === 0 ? (
                <p className="text-sm text-muted">Chưa em nào nộp bài viết vào lớp. Em nộp ở Lexica, mục Luyện → Viết, nút “Nộp cho lớp”. Chỉ thầy cô thấy bài, và bài tự xoá sau 30 ngày.</p>
            ) : (
                <>
                <p className="text-sm text-ink-2">
                    <b className="tabular text-ink">{rows.length}</b> bài, đã chấm <b className="tabular text-ink">{rows.filter((r) => r.teacher_scores).length}</b>
                    {rows.some((r) => r.peers_ok) ? `, ${rows.filter((r) => r.peers_ok).length} bài cho bạn cùng lớp chấm` : ''}.
                </p>
                <ul className="space-y-2">
                    {rows.map((r) => (
                        <li key={r.id} className="rounded-xl border border-line">
                            <button onClick={() => setOpen(open === r.id ? null : r.id)} aria-expanded={open === r.id} className="flex w-full items-center justify-between gap-3 p-3 text-left">
                                <span className="min-w-0">
                                    <span className="block truncate text-sm font-semibold text-ink">{r.name}</span>
                                    <span className="block truncate text-xs text-muted">
                                        {KIND[r.kind]} · {r.words} từ · {new Date(r.submitted_at).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })}
                                    </span>
                                </span>
                                <span className="flex shrink-0 gap-1.5">
                                    {r.teacher_scores ? <Badge tone="accent">Đã chấm {fmt(r.teacher_scores.overall)}</Badge> : <Badge tone="warm">Chưa chấm</Badge>}
                                    {r.peer && <Badge>{r.peer.raters} bạn chấm ~{fmt(Math.round(((r.peer.task + r.peer.coherence + r.peer.vocabulary + r.peer.grammar) / 4) * 2) / 2)}</Badge>}
                                </span>
                            </button>
                            {open === r.id && <PiecePanel piece={r} onRated={load} />}
                        </li>
                    ))}
                </ul>
                </>
            )}
        </div>
    );
}

function PiecePanel({ piece, onRated }: { piece: Piece; onRated: () => Promise<void> }) {
    const [scores, setScores] = useState<Record<(typeof CRITERIA)[number][0], number>>(() => ({
        task: piece.teacher_scores?.task ?? 6,
        coherence: piece.teacher_scores?.coherence ?? 6,
        vocabulary: piece.teacher_scores?.vocabulary ?? 6,
        grammar: piece.teacher_scores?.grammar ?? 6,
    }));
    const [comment, setComment] = useState(piece.teacher_comment ?? '');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const rate = async () => {
        setBusy(true);
        setError('');
        const { error: e } = await getSupabase()!.rpc('writing_teacher_rate', { p_id: piece.id, p_scores: scores, p_comment: comment });
        setBusy(false);
        if (e) return setError(errorText(e.message));
        await onRated();
    };

    return (
        <div className="space-y-3 border-t border-line p-3">
            {piece.prompt && <p className="text-sm text-muted">Đề: {piece.prompt}</p>}
            <p className="whitespace-pre-wrap rounded-lg bg-surface-2 p-3 text-sm leading-relaxed text-ink" lang="en">
                {piece.body}
            </p>
            {piece.peer && (
                <div className="rounded-lg border border-line p-2.5 text-sm">
                    <p className="font-medium text-ink">{piece.peer.raters} bạn đã chấm (ẩn danh)</p>
                    <p className="text-xs text-muted">{CRITERIA.map(([k, label]) => `${label} ${fmt(piece.peer![k])}`).join(' · ')}</p>
                    {piece.peer.comments.map((c, i) => (
                        <p key={i} className="mt-1 whitespace-pre-wrap text-ink-2">&ldquo;{c}&rdquo;</p>
                    ))}
                </div>
            )}
            <div className="grid grid-cols-2 gap-2">
                {CRITERIA.map(([key, label]) => (
                    <label key={key} className="text-sm text-ink-2">
                        {label}
                        <select value={scores[key]} onChange={(e) => setScores({ ...scores, [key]: Number(e.target.value) })} className={`${inputClass} mt-1`}>
                            {BANDS.map((b) => (
                                <option key={b} value={b}>
                                    {fmt(b)}
                                </option>
                            ))}
                        </select>
                    </label>
                ))}
            </div>
            <label className="block text-sm text-ink-2">
                Nhận xét cho em (em đọc được)
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={2000} rows={3} className="mt-1 w-full rounded-[10px] border border-line-strong bg-surface p-3 text-ink outline-none focus:border-accent" />
            </label>
            <ErrorNote error={error} />
            <Button disabled={busy} onClick={() => void rate()}>
                {busy ? 'Đang lưu…' : piece.teacher_scores ? 'Lưu chấm mới' : 'Lưu chấm'}
            </Button>
            <p className="text-xs text-subtle">Tự xoá lúc {new Date(piece.expires_at).toLocaleDateString('vi-VN')}.</p>
        </div>
    );
}
