'use client';

import { useCallback, useEffect, useState } from 'react';
import { CRITERIA, CRITERION_LABEL, fmtBand, type Criterion } from '@cortex/classroom-oratio';
import type { Board } from '@cortex/classroom';
import { getSupabase } from '../../lib/supabase';
import { Badge, Button, ErrorNote, errorText, inputClass } from '../../components/ui';

/** One answer handed in to the class (oratio_class_answers). */
interface ClassAnswer {
    id: string;
    name: string;
    assignment_id: string | null;
    part: number;
    question_text: string;
    duration_ms: number;
    wpm: number | null;
    fillers: number | null;
    word_count: number | null;
    transcript: string | null;
    submitted_at: string;
    audio_path: string | null;
    teacher_scores: (Record<Criterion, number> & { overall: number }) | null;
    peer_overall: number | null;
    peer_raters: number;
}

interface Calibration {
    rated: number;
    calibrated: boolean;
    compared: number;
    gap: number | null;
}

const BANDS = Array.from({ length: 17 }, (_, i) => 1 + i * 0.5);

/**
 * Bài nói đã nộp vào lớp: nghe, chấm bốn tiêu chí, xem điểm bạn chấm. Câu thầy
 * cô đã chấm thành "câu neo" của lớp: từ 10 câu thì so được độ lệch với điểm
 * bạn chấm.
 */
export default function ClassAnswers({ board }: { board: Board }) {
    const classId = board.class.id;
    const [rows, setRows] = useState<ClassAnswer[] | null>(null);
    const [calibration, setCalibration] = useState<Calibration | null>(null);
    const [error, setError] = useState('');
    const [open, setOpen] = useState<string | null>(null);

    const load = useCallback(async () => {
        const supabase = getSupabase();
        if (!supabase) return;
        const [a, c] = await Promise.all([supabase.rpc('oratio_class_answers', { p_class: classId }), supabase.rpc('oratio_class_calibration', { p_class: classId })]);
        if (a.error) {
            setError(a.error.message.includes('Could not find') ? 'Chưa cài SQL cho bài nói của lớp (chạy supabase/oratio_2026_10.sql).' : errorText(a.error.message));
            setRows([]);
            return;
        }
        setRows(a.data as ClassAnswer[]);
        if (!c.error) setCalibration(c.data as Calibration);
    }, [classId]);

    useEffect(() => {
        const t = setTimeout(() => void load(), 0);
        return () => clearTimeout(t);
    }, [load]);

    if (rows === null) return <p className="text-sm text-muted">Đang tải bài nói của lớp…</p>;
    const titles = new Map(board.assignments.filter((a) => a.app === 'oratio').map((a) => [a.id, a.title]));
    return (
        <div className="space-y-3">
            <ErrorNote error={error} />
            {calibration && calibration.rated > 0 && (
                <p className="text-sm text-ink-2">
                    Thầy cô đã chấm <b className="tabular text-ink">{calibration.rated}</b> câu.{' '}
                    {calibration.calibrated
                        ? calibration.gap !== null
                            ? `Điểm bạn chấm lệch trung bình ${fmtBand(calibration.gap)} band so với điểm của thầy cô (trên ${calibration.compared} câu có cả hai).`
                            : 'Chưa câu nào có cả điểm thầy cô và điểm bạn chấm để so.'
                        : `Cần ít nhất 10 câu thầy cô chấm mới so được độ lệch với điểm bạn chấm.`}
                </p>
            )}
            {rows.length === 0 ? (
                <p className="text-sm text-muted">Chưa em nào nộp bài nói vào lớp. Em nộp ở Oratio, sau khi nói xong một câu ở Tập một mình, mục “Nộp vào lớp”.</p>
            ) : (
                <ul className="space-y-2">
                    {rows.map((r) => (
                        <li key={r.id} className="rounded-xl border border-line">
                            <button onClick={() => setOpen(open === r.id ? null : r.id)} aria-expanded={open === r.id} className="flex w-full items-center justify-between gap-3 p-3 text-left">
                                <span className="min-w-0">
                                    <span className="block truncate text-sm font-semibold text-ink">{r.name}</span>
                                    <span className="block truncate text-xs text-muted">
                                        Part {r.part} · {r.assignment_id ? titles.get(r.assignment_id) ?? 'Bài của lớp' : 'Tập tự do'} · {new Date(r.submitted_at).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })}
                                    </span>
                                </span>
                                <span className="flex shrink-0 gap-1.5">
                                    {r.teacher_scores ? <Badge tone="accent">Thầy cô {fmtBand(r.teacher_scores.overall)}</Badge> : <Badge tone="warm">Chưa chấm</Badge>}
                                    {r.peer_overall !== null && <Badge>Bạn chấm ~{fmtBand(r.peer_overall)}</Badge>}
                                </span>
                            </button>
                            {open === r.id && <AnswerPanel answer={r} onRated={load} />}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function AnswerPanel({ answer, onRated }: { answer: ClassAnswer; onRated: () => Promise<void> }) {
    const [url, setUrl] = useState<string | null>(null);
    const [scores, setScores] = useState<Record<Criterion, number>>(() => ({
        fluency: answer.teacher_scores?.fluency ?? 6,
        vocabulary: answer.teacher_scores?.vocabulary ?? 6,
        grammar: answer.teacher_scores?.grammar ?? 6,
        pronunciation: answer.teacher_scores?.pronunciation ?? 6,
    }));
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let live = true;
        const supabase = getSupabase();
        if (!supabase || !answer.audio_path) return;
        supabase.storage
            .from('oratio-answers')
            .createSignedUrl(answer.audio_path, 3600)
            .then(({ data, error: e }) => {
                if (!live) return;
                if (e || !data) setError('Không mở được bản ghi (đã quá 30 ngày hoặc chưa cài quyền nghe cho thầy cô).');
                else setUrl(data.signedUrl);
            });
        return () => {
            live = false;
        };
    }, [answer.audio_path]);

    const rate = async () => {
        setBusy(true);
        setError('');
        const { error: e } = await getSupabase()!.rpc('oratio_teacher_rate', { p_answer: answer.id, p_scores: scores });
        setBusy(false);
        if (e) return setError(errorText(e.message));
        await onRated();
    };

    return (
        <div className="space-y-3 border-t border-line p-3">
            <p className="text-sm text-ink-2">{answer.question_text}</p>
            {url ? <audio controls src={url} className="w-full" aria-label="Bản ghi của em" /> : !error && <p className="text-xs text-muted">Đang mở bản ghi…</p>}
            <p className="text-xs text-muted">
                {Math.round(answer.duration_ms / 1000)} giây{answer.wpm ? ` · ${Math.round(answer.wpm)} từ/phút` : ''}
                {answer.fillers !== null ? ` · ${answer.fillers} từ đệm` : ''}
            </p>
            {answer.transcript && <p className="rounded-lg bg-surface-2 p-2 text-sm text-ink-2">{answer.transcript}</p>}
            <div className="grid grid-cols-2 gap-2">
                {CRITERIA.map((c) => (
                    <label key={c} className="text-sm text-ink-2">
                        {CRITERION_LABEL[c]}
                        <select value={scores[c]} onChange={(e) => setScores({ ...scores, [c]: Number(e.target.value) })} className={`${inputClass} mt-1`}>
                            {BANDS.map((b) => (
                                <option key={b} value={b}>
                                    {fmtBand(b)}
                                </option>
                            ))}
                        </select>
                    </label>
                ))}
            </div>
            <ErrorNote error={error} />
            <Button disabled={busy} onClick={() => void rate()}>
                {busy ? 'Đang lưu…' : answer.teacher_scores ? 'Lưu điểm mới' : 'Lưu điểm'}
            </Button>
        </div>
    );
}
