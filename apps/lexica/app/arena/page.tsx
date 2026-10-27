'use client';

import Link from 'next/link';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Swords, Trophy, X } from 'lucide-react';
import { ARENA_SHAPES, timeLeft, type ArenaPlayerView, type ArenaRoomOpen } from '@cortex/classroom';
import { useAuth } from '../context/AuthContext';
import AuthGate from '../components/AuthGate';
import { arenaJoin, arenaOpenRooms } from '../lib/classes';
import { useArenaPlayer } from './useArenaPlayer';

const TILE = ['bg-arena-1', 'bg-arena-2', 'bg-arena-3', 'bg-arena-4'];
const ROOM_KEY = 'lexica-arena-room';

function readRoom(): string | null {
    try {
        return sessionStorage.getItem(ROOM_KEY);
    } catch {
        return null;
    }
}
function writeRoom(id: string | null) {
    try {
        if (id) sessionStorage.setItem(ROOM_KEY, id);
        else sessionStorage.removeItem(ROOM_KEY);
    } catch {
        // private mode: a reload asks for the code again
    }
}

/**
 * "Đấu trường từ vựng", the student's phone (docs/TEACH_PLAN.md 4): join the
 * room the teacher opened for the class (one tap, or the 6-digit code), then
 * answer each question on the projector with four big buttons. Right or
 * wrong, points and rank show once the teacher closes the question.
 */
export default function ArenaPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-bg" />}>
            <Arena />
        </Suspense>
    );
}

function Arena() {
    const { user, loading } = useAuth();
    const params = useSearchParams();
    const [room, setRoom] = useState<string | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        // After mount: sessionStorage is not there on the server
        const t = setTimeout(() => {
            setRoom(readRoom());
            setReady(true);
        }, 0);
        return () => clearTimeout(t);
    }, []);

    const enter = (id: string | null) => {
        writeRoom(id);
        setRoom(id);
    };

    if (loading || !ready) return <div className="min-h-screen bg-bg" />;
    return (
        <div className="min-h-dvh bg-bg px-4 py-6">
            <div className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-xl flex-col">
                <div className="flex items-center justify-between">
                    <Link href="/class" className="text-sm text-muted hover:text-accent" onClick={() => enter(null)}>
                        ← Lớp học
                    </Link>
                    <p className="flex items-center gap-1.5 font-bold text-ink">
                        <Swords className="h-4 w-4 text-accent" /> Đấu trường
                    </p>
                    <span className="w-16" />
                </div>
                {!user ? (
                    <div className="mt-6">
                        <AuthGate reason="Đăng nhập để vào đấu trường của lớp." redirectPath="/arena" />
                    </div>
                ) : room ? (
                    <Play roomId={room} onLeave={() => enter(null)} />
                ) : (
                    <Join code={params.get('code')} onJoined={enter} />
                )}
            </div>
        </div>
    );
}

function Join({ code: fromLink, onJoined }: { code: string | null; onJoined: (id: string) => void }) {
    const [rooms, setRooms] = useState<ArenaRoomOpen[] | null>(null);
    const [code, setCode] = useState(fromLink?.replace(/\D/g, '').slice(0, 6) ?? '');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const tried = useRef(false);

    const join = async (c: string) => {
        setBusy(true);
        setError('');
        try {
            const r = await arenaJoin(c);
            onJoined(r.id);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setBusy(false);
        }
    };

    useEffect(() => {
        let live = true;
        const load = () =>
            arenaOpenRooms()
                .then((r) => live && setRooms(r))
                .catch(() => live && setRooms([]));
        const first = setTimeout(load, 0);
        const t = setInterval(load, 5000);
        return () => {
            live = false;
            clearTimeout(first);
            clearInterval(t);
        };
    }, []);

    useEffect(() => {
        // A link with ?code= joins straight away, once
        if (tried.current || !fromLink || !/^\d{6}$/.test(fromLink)) return;
        tried.current = true;
        const t = setTimeout(() => void join(fromLink), 0);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fromLink]);

    return (
        <div className="mt-8 space-y-6">
            {rooms && rooms.length > 0 && (
                <section className="space-y-3">
                    {rooms.map((r) => (
                        <button key={r.id} disabled={busy} onClick={() => void join(r.code)} className="w-full rounded-2xl bg-accent p-5 text-left text-on-accent disabled:opacity-50">
                            <p className="text-lg font-bold">Vào đấu trường của {r.class}</p>
                            <p className="mt-0.5 text-sm opacity-80">{r.state === 'lobby' ? 'Cô/thầy đang chờ cả lớp vào' : 'Đang chơi: vào ngay vẫn kịp câu tiếp theo'}</p>
                        </button>
                    ))}
                </section>
            )}
            <section className="rounded-2xl border border-line bg-surface p-5">
                <p className="font-semibold text-ink">Nhập mã phòng</p>
                <p className="mt-1 text-xs text-muted">6 chữ số trên màn hình của giáo viên.</p>
                <div className="mt-3 flex gap-2">
                    <input
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="000000"
                        aria-label="Mã phòng"
                        className="h-14 min-w-0 flex-1 rounded-xl border border-line bg-bg px-4 text-center font-mono text-2xl tracking-[0.3em] text-ink"
                    />
                    <button onClick={() => void join(code)} disabled={busy || code.length !== 6} className="h-14 rounded-xl bg-accent px-6 font-bold text-on-accent disabled:opacity-40">
                        {busy ? '…' : 'Vào'}
                    </button>
                </div>
                {error && <p className="mt-3 text-sm text-danger">{error}</p>}
            </section>
            {rooms && rooms.length === 0 && <p className="text-center text-sm text-muted">Lớp của bạn chưa mở đấu trường nào. Khi giáo viên mở, phòng sẽ hiện ở đây.</p>}
        </div>
    );
}

function Play({ roomId, onLeave }: { roomId: string; onLeave: () => void }) {
    const { view, receivedAt, error, answer } = useArenaPlayer(roomId);
    const [clock, setClock] = useState(0);
    const [picked, setPicked] = useState<{ idx: number; choice: number } | null>(null);
    const [sendError, setSendError] = useState('');
    const open = view?.state === 'question';

    useEffect(() => {
        if (!open) return;
        const t = setInterval(() => setClock(Date.now()), 250);
        return () => clearInterval(t);
    }, [open]);

    if (!view) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                {error ? (
                    <>
                        <p className="text-danger">{error}</p>
                        <button onClick={onLeave} className="text-accent underline">
                            Nhập mã khác
                        </button>
                    </>
                ) : (
                    <p className="text-muted">Đang vào phòng…</p>
                )}
            </div>
        );
    }

    const q = view.question;
    const mineChoice = view.mine?.choice ?? (picked && q && picked.idx === q.idx ? picked.choice : null);
    const left = open ? timeLeft(view, receivedAt, Math.max(clock, receivedAt)) : 0;

    return (
        <div className="mt-4 flex flex-1 flex-col">
            <div className="flex items-center justify-between font-mono text-sm text-muted">
                <span>{view.state === 'lobby' || view.state === 'finished' ? view.class : `Câu ${view.q_index + 1}/${view.total}`}</span>
                <span className="text-ink">
                    {view.name} · {view.score}
                </span>
            </div>

            {view.state === 'lobby' && (
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <Check className="h-12 w-12 text-accent" />
                    <p className="mt-4 text-2xl font-bold text-ink">Đã vào phòng</p>
                    <p className="mt-2 text-muted">Nhìn lên màn hình và chờ cô/thầy bắt đầu.</p>
                    <p className="mt-6 font-mono text-sm text-subtle">{view.players} em đã vào</p>
                </div>
            )}

            {view.state === 'question' && q && (
                <div className="mt-4 flex flex-1 flex-col">
                    <div className="flex items-center justify-between">
                        <p lang={q.kind === 'word' ? 'vi' : 'en'} className="min-w-0 text-xl font-bold text-ink">
                            {q.prompt}
                        </p>
                        <span className={`ml-3 font-mono text-2xl font-bold tabular-nums ${left <= 5000 ? 'text-warning' : 'text-ink'}`}>{Math.ceil(left / 1000)}</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
                        <div className="h-full bg-accent transition-[width] duration-200" style={{ width: `${(left / (view.seconds * 1000)) * 100}%` }} />
                    </div>
                    {mineChoice !== null ? (
                        <div className="flex flex-1 flex-col items-center justify-center text-center">
                            <div className={`flex h-20 w-20 items-center justify-center rounded-2xl text-4xl text-on-arena ${TILE[mineChoice]}`}>{ARENA_SHAPES[mineChoice]}</div>
                            <p className="mt-4 text-xl font-bold text-ink">Đã gửi</p>
                            <p className="mt-1 text-muted">Chờ cả lớp trả lời…</p>
                        </div>
                    ) : left === 0 ? (
                        <div className="flex flex-1 items-center justify-center text-center text-xl font-bold text-muted">Hết giờ</div>
                    ) : (
                        <div className="mt-4 grid flex-1 grid-cols-2 gap-3">
                            {q.options.map((o, i) => (
                                <button
                                    key={i}
                                    onClick={async () => {
                                        setPicked({ idx: q.idx, choice: i });
                                        setSendError('');
                                        try {
                                            await answer(q.idx, i);
                                        } catch (e) {
                                            setPicked(null);
                                            setSendError(e instanceof Error ? e.message : String(e));
                                        }
                                    }}
                                    className={`flex min-h-32 flex-col items-start justify-between rounded-2xl p-4 text-left text-on-arena active:scale-[0.98] ${TILE[i]}`}
                                >
                                    <span aria-hidden className="text-2xl">
                                        {ARENA_SHAPES[i]}
                                    </span>
                                    <span lang={q.kind === 'word' ? 'en' : 'vi'} className="text-lg font-bold leading-snug">
                                        {o}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                    {sendError && <p className="mt-3 text-center text-sm text-danger">{sendError}</p>}
                </div>
            )}

            {view.state === 'reveal' && q && <Reveal view={view} />}

            {view.state === 'finished' && (
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <Trophy className="h-12 w-12 text-warning" />
                    <p className="mt-4 text-3xl font-bold text-ink">
                        Hạng {view.rank}
                        <span className="text-lg text-muted">/{view.players}</span>
                    </p>
                    <p className="mt-1 font-mono text-muted">{view.score} điểm</p>
                    {view.top && view.top.length > 0 && (
                        <ol className="mt-6 w-full max-w-xs space-y-1.5 text-left">
                            {view.top.map((t) => (
                                <li key={`${t.rank}-${t.name}`} className="flex justify-between rounded-lg bg-surface px-3 py-2 text-sm">
                                    <span className="text-ink">
                                        <span className="mr-2 font-mono text-muted">{t.rank}</span>
                                        {t.name}
                                    </span>
                                    <span className="font-mono text-ink-2">{t.score}</span>
                                </li>
                            ))}
                        </ol>
                    )}
                    <Link href="/class" onClick={onLeave} className="mt-8 h-11 rounded-xl bg-accent px-6 font-bold leading-[2.75rem] text-on-accent">
                        Về Lớp học
                    </Link>
                </div>
            )}
        </div>
    );
}

function Reveal({ view }: { view: ArenaPlayerView }) {
    const q = view.question!;
    const right = q.answer !== undefined ? q.options[q.answer] : '';
    const m = view.mine;
    return (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
            {m?.correct ? (
                <>
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-on-accent">
                        <Check className="h-10 w-10" />
                    </div>
                    <p className="mt-4 text-3xl font-bold text-ink">Đúng rồi!</p>
                    <p className="mt-1 font-mono text-xl text-accent">+{m.points}</p>
                    {view.streak >= 2 && <p className="mt-2 text-sm text-muted">Đúng {view.streak} câu liền</p>}
                </>
            ) : (
                <>
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-2 text-muted">
                        <X className="h-10 w-10" />
                    </div>
                    <p className="mt-4 text-2xl font-bold text-ink">{m ? 'Chưa đúng' : 'Bạn chưa trả lời câu này'}</p>
                    <p className="mt-2 text-muted">
                        Đáp án:{' '}
                        <b lang={q.kind === 'word' ? 'en' : 'vi'} className="text-ink">
                            {right}
                        </b>
                    </p>
                </>
            )}
            <p className="mt-8 font-mono text-sm text-ink-2">
                {view.score} điểm · hạng {view.rank}/{view.players}
            </p>
        </div>
    );
}
