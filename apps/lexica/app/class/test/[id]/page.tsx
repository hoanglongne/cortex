'use client';

import Link from 'next/link';
import { use, useCallback, useEffect, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ARENA_SHAPES, testScoreLine, type TestTake } from '@cortex/classroom';
import { useAuth } from '../../../context/AuthContext';
import AuthGate from '../../../components/AuthGate';
import { testAnswer, testSubmit, testTake } from '../../../lib/classes';
import { useLexicaStore } from '../../../store/lexicaStore';

const TILE = ['bg-arena-1', 'bg-arena-2', 'bg-arena-3', 'bg-arena-4'];

/**
 * A class test (docs/TEACH_PLAN.md, T3) taken in the student's own time: one
 * question at a time, answers saved as they go (a reload keeps them), hand
 * in once. Then the score, each question with the right answer, and the
 * missed words put back into review.
 */
export default function ClassTestPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen bg-bg" />;
    return (
        <div className="min-h-dvh bg-bg px-4 py-6">
            <div className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-xl flex-col">
                <Link href="/class" className="text-sm text-muted hover:text-accent">
                    ← Lớp học
                </Link>
                {user ? <Take id={id} /> : <div className="mt-6"><AuthGate reason="Đăng nhập để làm bài kiểm tra của lớp." redirectPath={`/class/test/${id}`} /></div>}
            </div>
        </div>
    );
}

function Take({ id }: { id: string }) {
    const [t, setT] = useState<TestTake | null>(null);
    const [i, setI] = useState(0);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [review, setReview] = useState<{ again: number; queued: number; recalled: number } | null>(null);
    const applyArena = useLexicaStore((s) => s.applyArena);

    const load = useCallback(async () => {
        try {
            const v = await testTake(id);
            setT(v);
            // Pick up where they left off
            setI(Math.max(0, v.questions.findIndex((q) => q.choice === undefined)));
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
    }, [id]);
    useEffect(() => {
        const x = setTimeout(() => void load(), 0);
        return () => clearTimeout(x);
    }, [load]);

    // Handed in: the words they missed go back into review, once (as a quiz "room")
    const handedIn = Boolean(t?.submitted);
    useEffect(() => {
        if (!handedIn || !t) return;
        const r = applyArena([
            {
                room_id: `test:${t.id}`,
                seconds: 1e6,
                finished_at: new Date().toISOString(),
                answers: t.questions.filter((q) => q.card_id && q.choice !== undefined).map((q) => ({ card_id: q.card_id!, correct: q.choice === q.answer, ms: 0 })),
            },
        ]);
        const x = setTimeout(() => setReview(r), 0);
        return () => clearTimeout(x);
    }, [handedIn, t, applyArena]);

    if (!t) return <p className="mt-10 text-center text-muted">{error || 'Đang mở bài…'}</p>;
    const total = t.questions.length;
    const answered = t.questions.filter((q) => q.choice !== undefined).length;

    if (t.submitted || t.closed) {
        const correct = t.correct ?? t.questions.filter((q) => q.choice !== undefined && q.choice === q.answer).length;
        return (
            <div className="mt-6 space-y-6">
                <div className="text-center">
                    <p className="text-sm text-muted">{t.class}</p>
                    <p className="mt-1 text-xl font-bold text-ink">{t.title}</p>
                    {t.submitted ? (
                        <p className="mt-4 text-3xl font-bold text-ink">{testScoreLine(correct, total)}</p>
                    ) : (
                        <p className="mt-4 text-muted">Bài đã đóng, bạn chưa nộp. Đây là đáp án để bạn xem lại.</p>
                    )}
                    {review && review.again + review.queued > 0 && <p className="mt-2 text-sm text-ink-2">Đã thêm {review.again + review.queued} từ bạn sai vào bài ôn.</p>}
                </div>
                <ol className="space-y-2">
                    {t.questions.map((q) => {
                        const right = q.choice !== undefined && q.choice === q.answer;
                        return (
                            <li key={q.idx} className="flex items-start gap-3 rounded-xl border border-line bg-surface p-3">
                                {right ? <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent" /> : <X className="mt-0.5 h-5 w-5 shrink-0 text-danger" />}
                                <div className="min-w-0 text-sm">
                                    <p className="font-semibold text-ink">{q.prompt}</p>
                                    <p className="text-ink-2">
                                        Đáp án: <b className="text-ink">{q.answer !== undefined ? q.options[q.answer] : '–'}</b>
                                        {!right && q.choice !== undefined && <span className="text-muted"> · bạn chọn {q.options[q.choice]}</span>}
                                        {q.choice === undefined && <span className="text-muted"> · bạn bỏ trống</span>}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ol>
                <Link href="/class" className="block h-11 rounded-xl bg-accent text-center font-bold leading-[2.75rem] text-on-accent">
                    Về Lớp học
                </Link>
            </div>
        );
    }

    const q = t.questions[i];
    const choose = async (choice: number) => {
        setError('');
        const prev = t;
        setT({ ...t, questions: t.questions.map((x) => (x.idx === q.idx ? { ...x, choice } : x)) });
        try {
            await testAnswer(t.id, q.idx, choice);
            if (i < total - 1) setTimeout(() => setI((n) => Math.min(n + 1, total - 1)), 250);
        } catch (e) {
            setT(prev);
            setError(e instanceof Error ? e.message : String(e));
        }
    };

    return (
        <div className="mt-4 flex flex-1 flex-col">
            <p className="text-sm text-muted">{t.class}</p>
            <p className="font-bold text-ink">{t.title}</p>
            <div className="mt-3 flex gap-1" aria-label={`Đã trả lời ${answered}/${total} câu`}>
                {t.questions.map((x, k) => (
                    <button key={x.idx} onClick={() => setI(k)} aria-label={`Câu ${k + 1}`} className={`h-2 flex-1 rounded-full ${k === i ? 'bg-ink' : x.choice !== undefined ? 'bg-accent' : 'bg-surface-3'}`} />
                ))}
            </div>
            <p className="mt-6 font-mono text-sm text-muted">
                Câu {i + 1}/{total} · {q.kind === 'word' ? 'Từ nào có nghĩa này?' : 'Từ này nghĩa là gì?'}
            </p>
            <p lang={q.kind === 'word' ? 'vi' : 'en'} className="mt-2 text-3xl font-bold text-ink">
                {q.prompt}
            </p>
            <div className="mt-6 grid gap-3">
                {q.options.map((o, k) => (
                    <button
                        key={k}
                        onClick={() => void choose(k)}
                        aria-pressed={q.choice === k}
                        className={`flex min-h-16 items-center gap-3 rounded-2xl px-4 py-3 text-left text-lg font-bold ${q.choice === k ? `${TILE[k]} text-on-arena` : 'border border-line bg-surface text-ink'}`}
                    >
                        <span aria-hidden className={q.choice === k ? '' : 'text-subtle'}>
                            {ARENA_SHAPES[k]}
                        </span>
                        <span lang={q.kind === 'word' ? 'en' : 'vi'}>{o}</span>
                    </button>
                ))}
            </div>
            {error && <p className="mt-3 text-sm text-danger">{error}</p>}
            <div className="mt-auto flex items-center justify-between gap-3 pt-8">
                <button onClick={() => setI((n) => Math.max(0, n - 1))} disabled={i === 0} className="flex h-11 items-center gap-1 rounded-xl px-3 text-muted disabled:opacity-30">
                    <ChevronLeft className="h-4 w-4" /> Trước
                </button>
                {i < total - 1 ? (
                    <button onClick={() => setI((n) => n + 1)} className="flex h-11 items-center gap-1 rounded-xl px-3 text-ink">
                        Tiếp <ChevronRight className="h-4 w-4" />
                    </button>
                ) : (
                    <button
                        disabled={busy}
                        onClick={async () => {
                            if (answered < total && !window.confirm(`Còn ${total - answered} câu bỏ trống. Nộp luôn?`)) return;
                            setBusy(true);
                            setError('');
                            try {
                                setT(await testSubmit(t.id));
                            } catch (e) {
                                setError(e instanceof Error ? e.message : String(e));
                            } finally {
                                setBusy(false);
                            }
                        }}
                        className="h-11 rounded-xl bg-accent px-6 font-bold text-on-accent disabled:opacity-40"
                    >
                        {busy ? 'Đang nộp…' : `Nộp bài (${answered}/${total})`}
                    </button>
                )}
            </div>
        </div>
    );
}
