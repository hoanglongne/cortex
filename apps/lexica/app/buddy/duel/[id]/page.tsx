'use client';

import Link from 'next/link';
import { use, useCallback, useEffect, useRef, useState } from 'react';
import { Check, Share2, Swords, Trophy, X } from 'lucide-react';
import { ARENA_SHAPES } from '@cortex/classroom';
import { useAuth } from '../../../context/AuthContext';
import AuthGate from '../../../components/AuthGate';
import { useLexicaStore } from '../../../store/lexicaStore';
import { duelAnswer, duelFinish, duelKindLabel, duelInviteText, duelResult, duelReview, duelTake, type DuelResult, type DuelTake } from '../../../lib/duels';

const TILE = ['bg-arena-1', 'bg-arena-2', 'bg-arena-3', 'bg-arena-4'];
const SECONDS = 20;

/**
 * One duel (docs: issue #70, B): the same questions for both buddies, in
 * their own time. A question at a time with a 20-second clock; answers go
 * to the server as they are given; the right answers and the other's score
 * show only after handing in (and the other's only once they finished too).
 */
export default function DuelPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen bg-bg" />;
    return (
        <div className="min-h-dvh bg-bg px-4 py-6">
            <div className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-xl flex-col">
                <div className="flex items-center justify-between">
                    <Link href="/buddy" className="text-sm text-muted hover:text-accent">
                        ← Buddy
                    </Link>
                    <p className="flex items-center gap-1.5 font-bold text-ink">
                        <Swords className="h-4 w-4 text-accent" /> Thách đấu
                    </p>
                    <span className="w-12" />
                </div>
                {user ? <Duel id={id} /> : <div className="mt-6"><AuthGate reason="Đăng nhập để chơi thách đấu." redirectPath={`/buddy/duel/${id}`} /></div>}
            </div>
        </div>
    );
}

function Duel({ id }: { id: string }) {
    const applyArena = useLexicaStore((s) => s.applyArena);
    const [take, setTake] = useState<DuelTake | null>(null);
    const [result, setResult] = useState<DuelResult | null>(null);
    const [error, setError] = useState('');
    const [i, setI] = useState(0);
    const [picked, setPicked] = useState<number | null>(null);
    const [left, setLeft] = useState(SECONDS);
    const [busy, setBusy] = useState(false);
    const [shared, setShared] = useState('');
    const shownAt = useRef(0);

    const load = useCallback(async () => {
        try {
            const t = await duelTake(id);
            setTake(t);
            if (t.finished) setResult(await duelResult(id));
            else setI(Math.max(0, t.questions.findIndex((q) => q.choice === undefined)));
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
    }, [id]);
    useEffect(() => {
        const t = setTimeout(() => void load(), 0);
        return () => clearTimeout(t);
    }, [load]);

    const finish = useCallback(async () => {
        setBusy(true);
        try {
            setResult(await duelFinish(id));
            setTake((t) => (t ? { ...t, finished: true } : t));
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setBusy(false);
        }
    }, [id]);

    const q = take && !take.finished ? take.questions[i] : undefined;
    // A clock per question; time out counts as no answer
    useEffect(() => {
        if (!q) return;
        shownAt.current = Date.now();
        const t0 = setTimeout(() => {
            setLeft(SECONDS);
            setPicked(null);
        }, 0);
        const t = setInterval(() => setLeft(Math.max(0, SECONDS - Math.floor((Date.now() - shownAt.current) / 1000))), 250);
        return () => {
            clearTimeout(t0);
            clearInterval(t);
        };
    }, [q]);

    const advance = useCallback(() => {
        if (!take) return;
        if (i < take.questions.length - 1) setI(i + 1);
        else void finish();
    }, [take, i, finish]);

    const choose = async (choice: number) => {
        if (!q || picked !== null) return;
        setPicked(choice);
        try {
            await duelAnswer(id, q.idx, choice, Date.now() - shownAt.current);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
        setTimeout(advance, 450);
    };
    useEffect(() => {
        // Out of time: move on without an answer
        if (q && left === 0 && picked === null) {
            const t = setTimeout(advance, 0);
            return () => clearTimeout(t);
        }
    }, [q, left, picked, advance]);

    // A finished duel: the words missed go back into my review, once
    const resultId = result?.id;
    useEffect(() => {
        if (result && resultId) applyArena([duelReview(result)]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resultId]);

    if (!take) return <p className="mt-10 text-center text-muted">{error || 'Đang mở…'}</p>;

    if (result) {
        const them = result.theirs;
        const won = result.winner === 'me';
        return (
            <div className="mt-8 flex flex-1 flex-col items-center text-center">
                {them ? <Trophy className={`h-12 w-12 ${won ? 'text-warning' : 'text-subtle'}`} /> : <Swords className="h-12 w-12 text-accent" />}
                <p className="mt-4 text-2xl font-bold text-ink">{!them ? 'Bạn xong rồi' : result.winner === 'tie' ? 'Hoà!' : won ? 'Bạn thắng!' : `${result.with_name ?? 'Bạn học'} thắng`}</p>
                <p className="mt-2 font-mono text-3xl text-ink">
                    {result.mine.correct}
                    <span className="text-muted">/{result.total}</span>
                    {them && (
                        <>
                            <span className="mx-3 text-muted">–</span>
                            {them.correct}
                            <span className="text-muted">/{result.total}</span>
                        </>
                    )}
                </p>
                {!them && <p className="mt-2 text-sm text-muted">Đang chờ {result.with_name ?? 'bạn học'}. Điểm của bạn ấy hiện khi bạn ấy xong.</p>}
                {!them && (
                    <button
                        onClick={async () => {
                            const text = duelInviteText(result.with_name ?? 'Bạn', window.location.origin);
                            try {
                                if (navigator.share) await navigator.share({ text });
                                else await navigator.clipboard.writeText(text);
                                setShared('Đã gửi lời nhắc');
                            } catch {
                                setShared('');
                            }
                        }}
                        className="mt-4 h-11 rounded-xl border border-line px-4 text-sm text-ink flex items-center gap-2"
                    >
                        <Share2 className="h-4 w-4" /> {shared || 'Nhắn bạn vào chơi'}
                    </button>
                )}
                <ol className="mt-8 w-full space-y-2 text-left">
                    {result.questions.map((x) => {
                        const right = x.mine === x.answer;
                        const theirRight = x.theirs !== undefined && x.theirs === x.answer;
                        return (
                            <li key={x.idx} className="flex items-start gap-3 rounded-xl border border-line bg-surface p-3 text-sm">
                                {right ? <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent" /> : <X className="mt-0.5 h-5 w-5 shrink-0 text-danger" />}
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-ink">{x.prompt}</p>
                                    <p className="text-ink-2">
                                        Đáp án: <b className="text-ink">{x.options[x.answer]}</b>
                                    </p>
                                </div>
                                {them && <span className={`shrink-0 text-xs ${theirRight ? 'text-accent' : 'text-muted'}`}>{theirRight ? 'bạn ấy đúng' : 'bạn ấy sai'}</span>}
                            </li>
                        );
                    })}
                </ol>
                <p className="mt-4 text-xs text-muted">Từ bạn sai đã được thêm vào bài ôn của bạn.</p>
                <Link href="/buddy" className="mt-6 h-11 rounded-xl bg-accent px-6 font-bold leading-[2.75rem] text-on-accent">
                    Về Buddy
                </Link>
            </div>
        );
    }

    if (take.state === 'expired') return <p className="mt-10 text-center text-muted">Thách đấu này đã hết hạn.</p>;
    if (!q) return <p className="mt-10 text-center text-muted">{error || 'Đang tải câu hỏi…'}</p>;

    return (
        <div className="mt-4 flex flex-1 flex-col">
            <p className="text-sm text-muted">{take.mine ? `Bạn thách ${take.with_name ?? 'bạn học'}` : `${take.with_name ?? 'Bạn học'} thách bạn`} · {take.questions.length} câu</p>
            <div className="mt-3 flex gap-1" aria-label="Tiến độ">
                {take.questions.map((x, k) => (
                    <span key={x.idx} className={`h-1.5 flex-1 rounded-full ${k < i ? 'bg-accent' : k === i ? 'bg-ink' : 'bg-surface-3'}`} />
                ))}
            </div>
            <div className="mt-5 flex items-center justify-between font-mono text-sm text-muted">
                <span>
                    Câu {i + 1}/{take.questions.length} · {duelKindLabel(q.kind)}
                </span>
                <span className={left <= 5 ? 'text-warning' : 'text-ink'}>{left}s</span>
            </div>
            <p lang="en" className={`mt-3 whitespace-pre-line font-bold text-ink ${q.kind === 'clue' ? 'text-xl' : 'text-3xl'}`}>
                {q.prompt}
            </p>
            <div className="mt-6 grid gap-3">
                {q.options.map((o, k) => (
                    <button
                        key={k}
                        disabled={picked !== null || busy}
                        onClick={() => void choose(k)}
                        className={`flex min-h-16 items-center gap-3 rounded-2xl px-4 py-3 text-left text-lg font-bold ${picked === k ? `${TILE[k % 4]} text-on-arena` : 'border border-line bg-surface text-ink'} disabled:opacity-80`}
                    >
                        <span aria-hidden className={picked === k ? '' : 'text-subtle'}>
                            {ARENA_SHAPES[k % 4]}
                        </span>
                        {o}
                    </button>
                ))}
            </div>
            {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        </div>
    );
}
