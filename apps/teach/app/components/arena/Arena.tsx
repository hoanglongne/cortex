'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Presentation, Shuffle, Users } from 'lucide-react';
import { ARENA_SHAPES, ARENA_TEAMS, timeLeft, type ArenaHost, type ArenaMode, type ArenaTeamScore, type Board } from '@cortex/classroom';
import { LEXICA } from '@cortex/classroom-lexica';
import { api } from '../../lib/supabase';
import { LEXICA_URL } from '../../lib/config';
import { arenaQuestions, arenaTeams, fillTeams, forgettingWords, guessers, hardWords, shortMeaning, sourceWords, type ArenaSource } from '../../lib/arena';
import type { Person } from '../../lib/classroom/tools';
import { useArenaHost } from '../../lib/useArenaHost';
import type { IndexCard, WordIndex } from '../../modules/lexica/words';
import { ErrorNote, errorText } from '../ui';

/** Answer tiles: colour and shape, the same as on the phones. */
export const TILE = ['bg-arena-1', 'bg-arena-2', 'bg-arena-3', 'bg-arena-4'];

const roomKey = (classId: string) => `teach-arena-${classId}`;
function storedRoom(classId: string): string | null {
    try {
        return sessionStorage.getItem(roomKey(classId));
    } catch {
        return null;
    }
}
function storeRoom(classId: string, id: string | null) {
    try {
        if (id) sessionStorage.setItem(roomKey(classId), id);
        else sessionStorage.removeItem(roomKey(classId));
    } catch {
        // private mode: a reload starts a new room
    }
}

/**
 * "Đấu trường" (docs/TEACH_PLAN.md 4): pick the words and the mode (each
 * for themselves, or 2–4 even teams), open a room, students join from Lexica
 * with the code; each question on the projector, answers on the phones, then
 * the answer, how the class chose and the ranking; at the end a podium, the
 * words to teach again (on the slides, one tap) and, for the teacher only,
 * how each student did.
 */
export default function Arena({ board, words, people, onTeach }: { board: Board; words: WordIndex | null; people: Person[]; onTeach: (cardIds: string[]) => void }) {
    const [room, setRoom] = useState<string | null>(() => storedRoom(board.class.id));
    const [retry, setRetry] = useState<string[] | null>(null);
    const open = (id: string | null) => {
        storeRoom(board.class.id, id);
        setRoom(id);
    };
    if (room) return <Stage roomId={room} words={words} people={people} onTeach={onTeach} onClose={(again) => { setRetry(again); open(null); }} />;
    return <Setup board={board} words={words} retry={retry} onOpened={open} />;
}

const COUNTS = [10, 15, 20];
const SECONDS = [10, 20, 30];

function Setup({ board, words, retry, onOpened }: { board: Board; words: WordIndex | null; retry: string[] | null; onOpened: (id: string) => void }) {
    const lessons = board.assignments.filter((a) => a.app === LEXICA && !a.for_user);
    const forgetting = useMemo(() => forgettingWords(board), [board]);
    const [source, setSource] = useState<ArenaSource>(() =>
        retry && retry.length >= 3 ? { kind: 'cards', ids: retry } : lessons[0] ? { kind: 'lesson', assignmentId: lessons[0].id } : { kind: 'all' },
    );
    const [count, setCount] = useState(10);
    const [seconds, setSeconds] = useState(20);
    const [hide, setHide] = useState(true);
    const [mode, setMode] = useState<ArenaMode>('classic');
    const [teams, setTeams] = useState(2);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const cards = useMemo<IndexCard[]>(() => (words ? sourceWords(board, source).map((id) => words.byId.get(id)).filter((c): c is IndexCard => Boolean(c)) : []), [board, source, words]);
    const usable = Math.min(count, cards.length);

    const chip = (on: boolean) => `h-11 rounded-full border px-4 text-[15px] ${on ? 'border-accent bg-accent-soft font-semibold text-accent-strong' : 'border-line-strong text-ink-2 hover:bg-surface-2'}`;

    return (
        <div className="h-full overflow-y-auto px-5 py-10">
            <div className="mx-auto max-w-2xl">
                <h2 className="font-serif text-[34px] font-semibold leading-tight text-ink">Đấu trường từ vựng</h2>
                <p className="mt-2 text-ink-2">Cả lớp trả lời trên điện thoại trong Lexica. Đúng và nhanh thì nhiều điểm; máy chủ tính giờ nên không ai gian được.</p>

                <section className="mt-10">
                    <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">Hỏi từ nào</p>
                    <div className="flex flex-wrap gap-2">
                        {retry && retry.length >= 3 && (
                            <button className={chip(source.kind === 'cards')} onClick={() => setSource({ kind: 'cards', ids: retry })}>
                                {retry.length} từ khó ván trước
                            </button>
                        )}
                        {lessons.length > 0 && (
                            <button className={chip(source.kind === 'lesson')} onClick={() => setSource({ kind: 'lesson', assignmentId: lessons[0].id })}>
                                Một bài giao
                            </button>
                        )}
                        <button className={chip(source.kind === 'forgetting')} disabled={forgetting.length < 3} onClick={() => setSource({ kind: 'forgetting' })} title={forgetting.length < 3 ? 'Chưa đủ từ: cần số liệu ôn từ Lexica' : undefined}>
                            Từ cả lớp sắp quên{forgetting.length >= 3 ? ` (${forgetting.length})` : ''}
                        </button>
                        <button className={chip(source.kind === 'all')} onClick={() => setSource({ kind: 'all' })}>
                            Mọi bài của lớp
                        </button>
                    </div>
                    {source.kind === 'lesson' && (
                        <select
                            value={source.assignmentId}
                            onChange={(e) => setSource({ kind: 'lesson', assignmentId: e.target.value })}
                            aria-label="Bài giao"
                            className="mt-3 h-11 w-full max-w-md rounded-[10px] border border-line-strong bg-surface px-3 text-ink"
                        >
                            {lessons.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.title}
                                </option>
                            ))}
                        </select>
                    )}
                </section>

                <section className="mt-8 grid gap-8 sm:grid-cols-2">
                    <div>
                        <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">Số câu</p>
                        <div className="flex gap-2">
                            {COUNTS.map((n) => (
                                <button key={n} className={chip(count === n)} onClick={() => setCount(n)}>
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">Mỗi câu</p>
                        <div className="flex gap-2">
                            {SECONDS.map((n) => (
                                <button key={n} className={chip(seconds === n)} onClick={() => setSeconds(n)}>
                                    {n} giây
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mt-8">
                    <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">Cách chơi</p>
                    <div className="flex flex-wrap items-center gap-2">
                        <button className={chip(mode === 'classic')} onClick={() => setMode('classic')}>
                            Mỗi em một mình
                        </button>
                        <button className={chip(mode === 'team')} onClick={() => setMode('team')}>
                            Theo đội
                        </button>
                        {mode === 'team' && (
                            <span className="ml-2 flex items-center gap-2">
                                {[2, 3, 4].map((n) => (
                                    <button key={n} className={chip(teams === n)} onClick={() => setTeams(n)} aria-label={`${n} đội`}>
                                        {n} đội
                                    </button>
                                ))}
                            </span>
                        )}
                    </div>
                    {mode === 'team' && <p className="mt-2 text-[15px] text-muted">Teach chia đội đều sức. Điểm đội là điểm trung bình của các thành viên, nên em nào cũng góp sức.</p>}
                </section>

                <label className="mt-8 flex items-start gap-3 text-ink-2">
                    <input type="checkbox" checked={hide} onChange={(e) => setHide(e.target.checked)} className="mt-1 h-4 w-4 accent-[var(--color-accent)]" />
                    <span>
                        Bảng xếp hạng chỉ hiện tên top 3
                        <span className="block text-[15px] text-muted">Các em khác xem hạng của mình trên điện thoại, không ai bị bêu tên.</span>
                    </span>
                </label>

                <div className="mt-10 flex flex-wrap items-center gap-4">
                    <button
                        disabled={busy || !words || usable < 3}
                        onClick={async () => {
                            if (!words) return;
                            const qs = arenaQuestions(cards, words.cards, count);
                            if (qs.length < 3) {
                                setError('Chưa đủ từ có nghĩa để ra 3 câu. Chọn bài khác hoặc "Mọi bài của lớp".');
                                return;
                            }
                            setBusy(true);
                            setError('');
                            try {
                                const r = await api.arenaOpen(board.class.id, seconds, qs, { hideNames: hide, mode, teams });
                                onOpened(r.id);
                            } catch (e) {
                                setError(errorText(e));
                            } finally {
                                setBusy(false);
                            }
                        }}
                        className="h-12 rounded-[10px] bg-accent px-6 text-[17px] font-semibold text-on-accent hover:bg-accent-strong disabled:opacity-40"
                    >
                        {busy ? 'Đang mở…' : 'Mở phòng'}
                    </button>
                    <p className="text-[15px] text-muted">
                        {!words ? 'Đang tải danh sách từ…' : words.error ? words.error : usable < 3 ? 'Nguồn này chưa đủ 3 từ.' : `${usable} câu từ ${cards.length} từ`}
                    </p>
                </div>
                <div className="mt-4">
                    <ErrorNote error={error} />
                </div>
            </div>
        </div>
    );
}

function Stage({ roomId, words, people, onTeach, onClose }: { roomId: string; words: WordIndex | null; people: Person[]; onTeach: (cardIds: string[]) => void; onClose: (again: string[] | null) => void }) {
    const { host, receivedAt, error, act } = useArenaHost(roomId);
    // The device's time, ticked while a question is open (not read during render)
    const [clock, setClock] = useState(0);
    const lockedIdx = useRef(-1);

    const running = host?.state === 'question';
    useEffect(() => {
        if (!running) return;
        const t = setInterval(() => setClock(Date.now()), 250);
        return () => clearInterval(t);
    }, [running]);

    const left = host && running ? timeLeft(host, receivedAt, Math.max(clock, receivedAt)) : 0;
    const everyone = Boolean(host?.question && host.players.length > 0 && host.question.answered >= host.players.length);
    // Time's up, or every player answered: close the question once
    useEffect(() => {
        if (!host || host.state !== 'question' || lockedIdx.current === host.q_index) return;
        if (left > 0 && !everyone) return;
        lockedIdx.current = host.q_index;
        void act(() => api.arenaLock(roomId));
    }, [host, left, everyone, act, roomId]);

    if (!host) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-10 text-center">
                {error ? (
                    <>
                        <ErrorNote error={error} />
                        <button onClick={() => onClose(null)} className="text-accent-strong hover:underline">
                            Mở phòng mới
                        </button>
                    </>
                ) : (
                    <div className="h-40 w-full max-w-xl animate-pulse rounded-[var(--radius-card)] bg-surface-2" />
                )}
            </div>
        );
    }

    const next = () => act(() => api.arenaNext(roomId));
    const isLast = host.q_index + 1 >= host.total;

    return (
        <div className="flex h-full flex-col overflow-y-auto">
            {error && (
                <div className="px-5 pt-3">
                    <ErrorNote error={error} />
                </div>
            )}
            {host.state === 'lobby' && (
                <Lobby
                    host={host}
                    people={people}
                    onStart={(split) => act(async () => {
                        if (split) await api.arenaTeamsSet(roomId, split);
                        await api.arenaNext(roomId);
                    })}
                    onCancel={() => void act(() => api.arenaFinish(roomId)).then(() => onClose(null))}
                />
            )}
            {(host.state === 'question' || host.state === 'reveal') && host.question && (
                <Question host={host} left={left} onLock={() => void act(() => api.arenaLock(roomId))} onNext={() => void next()} isLast={isLast} />
            )}
            {host.state === 'finished' && <Finished host={host} words={words} onTeach={onTeach} onClose={onClose} />}
        </div>
    );
}

function Lobby({ host, people, onStart, onCancel }: { host: ArenaHost; people: Person[]; onStart: (split: Record<string, number> | null) => Promise<void>; onCancel: () => void }) {
    const team = host.mode === 'team';
    const strength = (id: string) => people.find((p) => p.id === id)?.strength ?? null;
    const [base, setBase] = useState<Record<string, number>>({});
    // Who is in which team so far: the last split, newcomers to the smallest team
    const split = fillTeams(base, host.players.map((p) => p.user_id), host.teams || 1);
    const reshuffle = () => setBase(arenaTeams(host.players.map((p) => ({ id: p.user_id, strength: strength(p.user_id) })), host.teams, Math.random));
    const link = LEXICA_URL ? `${LEXICA_URL.replace(/^https?:\/\//, '')}/arena` : 'Lexica → Lớp học';
    return (
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-5 py-10 text-center">
            <p className="text-[17px] text-ink-2">Mở Lexica trên điện thoại → Lớp học → Vào đấu trường, hoặc vào</p>
            <p className="mt-1 font-mono text-[22px] font-semibold text-accent-strong">{link}</p>
            <p className="mt-8 text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">Mã phòng</p>
            <p className="mt-1 font-mono text-[72px] font-bold leading-none tracking-[0.18em] text-ink tabular sm:text-[112px]">{host.code}</p>
            <p className="mt-10 flex items-center gap-2 text-[17px] text-ink-2">
                <Users className="h-5 w-5" /> {host.players.length} em đã vào
            </p>
            {team ? (
                <div className="mt-4 grid w-full gap-3" style={{ gridTemplateColumns: `repeat(${host.teams}, minmax(0, 1fr))` }}>
                    {Array.from({ length: host.teams }, (_, i) => i + 1).map((t) => (
                        <div key={t} className="rounded-[var(--radius-card)] bg-surface p-4 text-left shadow-[var(--shadow-card)]">
                            <p className={`inline-block rounded-full px-3 py-1 text-[15px] font-semibold text-on-arena ${TILE[t - 1]}`}>{ARENA_TEAMS[t]}</p>
                            <ul className="mt-3 space-y-1 text-[17px] text-ink">
                                {host.players.filter((p) => split[p.user_id] === t).map((p) => (
                                    <li key={p.user_id}>{p.name}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            ) : (
                <ul className="mt-4 flex max-w-3xl flex-wrap justify-center gap-2">
                    {host.players.map((p) => (
                        <li key={p.user_id} className="rounded-full bg-surface px-4 py-2 text-[17px] text-ink shadow-[var(--shadow-card)]">
                            {p.name}
                        </li>
                    ))}
                </ul>
            )}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                {team && host.players.length > 1 && (
                    <button onClick={reshuffle} className="flex h-14 items-center gap-2 rounded-[12px] border border-line-strong bg-surface px-5 text-[17px] text-ink hover:bg-surface-2">
                        <Shuffle className="h-5 w-5" /> Chia đều lại
                    </button>
                )}
                <button disabled={host.players.length === 0} onClick={() => void onStart(team ? split : null)} className="h-14 rounded-[12px] bg-accent px-8 text-[19px] font-semibold text-on-accent hover:bg-accent-strong disabled:opacity-40">
                    Bắt đầu · {host.total} câu
                </button>
                <button onClick={onCancel} className="text-muted hover:text-ink hover:underline">
                    Huỷ phòng
                </button>
            </div>
        </div>
    );
}

function Question({ host, left, onLock, onNext, isLast }: { host: ArenaHost; left: number; onLock: () => void; onNext: () => void; isLast: boolean }) {
    const q = host.question!;
    const reveal = host.state === 'reveal';
    const secs = Math.ceil(left / 1000);
    const most = Math.max(1, ...(q.counts ?? [0]));
    const top = host.players.filter((p) => p.score > 0).slice(0, host.hide_names ? 3 : 5);
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-6">
            <div className="flex flex-wrap items-center justify-between gap-3 text-[17px] text-ink-2">
                <span>
                    Câu <b className="text-ink tabular">{q.idx + 1}</b>/{host.total}
                </span>
                {reveal ? (
                    <span>{q.answered}/{host.players.length} em đã trả lời</span>
                ) : (
                    <span className="flex items-center gap-4">
                        <span className="tabular">{q.answered}/{host.players.length} em đã trả lời</span>
                        <span className={`font-mono text-[34px] font-bold tabular ${secs <= 5 ? 'text-warm' : 'text-ink'}`}>{secs}</span>
                    </span>
                )}
            </div>
            {!reveal && (
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-accent transition-[width] duration-200" style={{ width: `${(left / (host.seconds * 1000)) * 100}%` }} />
                </div>
            )}
            <p className="mt-8 text-center text-[17px] text-muted">{q.kind === 'word' ? 'Từ nào có nghĩa này?' : 'Từ này nghĩa là gì?'}</p>
            <p lang={q.kind === 'word' ? 'vi' : 'en'} className="mt-2 text-center font-serif text-[44px] font-semibold leading-tight text-ink sm:text-[64px]">
                {q.prompt}
            </p>
            <div className={`mt-10 grid gap-4 ${reveal && (top.length || host.team_scores?.length) ? 'lg:grid-cols-[minmax(0,1fr)_300px]' : ''}`}>
                <ul className="grid gap-3 sm:grid-cols-2">
                    {q.options.map((o, i) => {
                        const right = reveal && q.answer === i;
                        const dim = reveal && q.answer !== i;
                        return (
                            <li key={i} className={`relative flex min-h-24 items-center gap-4 overflow-hidden rounded-[14px] px-5 py-4 text-on-arena ${TILE[i]} ${dim ? 'opacity-35' : ''}`}>
                                <span aria-hidden className="text-[26px]">
                                    {ARENA_SHAPES[i]}
                                </span>
                                <span lang={q.kind === 'word' ? 'en' : 'vi'} className="min-w-0 flex-1 text-[24px] font-semibold leading-snug sm:text-[28px]">
                                    {o}
                                </span>
                                {right && <Check className="h-8 w-8 shrink-0" aria-label="Đáp án đúng" />}
                                {reveal && q.counts && (
                                    <span className="shrink-0 text-right font-mono text-[22px] font-bold tabular">
                                        {q.counts[i]}
                                        <span className="mt-1 block h-1.5 rounded-full bg-on-arena/80" style={{ width: `${Math.max(6, (q.counts[i] / most) * 64)}px` }} />
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ul>
                {reveal && host.team_scores && host.team_scores.length > 0 ? (
                    <aside className="rounded-[var(--radius-card)] bg-surface p-5 shadow-[var(--shadow-card)]">
                        <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">Các đội</p>
                        <TeamBars teams={host.team_scores} />
                    </aside>
                ) : reveal && top.length > 0 && (
                    <aside className="rounded-[var(--radius-card)] bg-surface p-5 shadow-[var(--shadow-card)]">
                        <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">Dẫn đầu</p>
                        <ol className="space-y-2">
                            {top.map((p) => (
                                <li key={p.user_id} className="flex items-baseline justify-between gap-3 text-[19px]">
                                    <span className="min-w-0 truncate text-ink">
                                        <span className="mr-2 font-mono text-muted tabular">{p.rank}</span>
                                        {p.name}
                                    </span>
                                    <span className="font-mono font-semibold tabular text-ink">{p.score}</span>
                                </li>
                            ))}
                        </ol>
                    </aside>
                )}
            </div>
            <div className="mt-8 flex justify-center">
                {reveal ? (
                    <button onClick={onNext} className="h-14 rounded-[12px] bg-accent px-8 text-[19px] font-semibold text-on-accent hover:bg-accent-strong">
                        {isLast ? 'Xem kết quả' : 'Câu tiếp'}
                    </button>
                ) : (
                    <button onClick={onLock} className="h-11 rounded-[10px] border border-line-strong bg-surface px-5 text-ink hover:bg-surface-2">
                        Khoá câu ngay
                    </button>
                )}
            </div>
        </div>
    );
}

function Finished({ host, words, onTeach, onClose }: { host: ArenaHost; words: WordIndex | null; onTeach: (cardIds: string[]) => void; onClose: (again: string[] | null) => void }) {
    const [details, setDetails] = useState(false);
    const podium = host.players.filter((p) => p.score > 0).slice(0, 3);
    // Second, first, third: the winner in the middle
    const order = [podium[1], podium[0], podium[2]].filter(Boolean);
    const summary = host.summary ?? [];
    const hard = [...summary].filter((q) => q.answered > 0).sort((a, b) => a.correct / a.answered - b.correct / b.answered).slice(0, 5);
    const again = hardWords(summary);
    // The word and its meaning, whichever way the question asked
    const pair = (q: (typeof summary)[number]) => {
        const c = q.card_id ? words?.byId.get(q.card_id) : undefined;
        return c ? { word: c.word, meaning: shortMeaning(c.meaning) } : { word: q.prompt, meaning: q.right };
    };
    const height = (p: (typeof podium)[number]) => (p === podium[0] ? 'h-44' : p === podium[1] ? 'h-32' : 'h-24');
    return (
        <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
            <h2 className="text-center font-serif text-[40px] font-semibold text-ink">Kết quả</h2>
            {host.team_scores && host.team_scores.length > 0 && (
                <section className="mx-auto mt-8 max-w-2xl">
                    <p className="text-center font-serif text-[30px] font-semibold text-ink">{host.team_scores.filter((t) => t.rank === 1).map((t) => ARENA_TEAMS[t.team]).join(' và ')} thắng!</p>
                    <div className="mt-6">
                        <TeamBars teams={host.team_scores} large />
                    </div>
                    <p className="mt-10 text-center text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">Ghi nhiều điểm nhất</p>
                </section>
            )}
            {order.length === 0 ? (
                <p className="mt-6 text-center text-ink-2">Chưa em nào ghi điểm ván này.</p>
            ) : (
                <div className="mt-10 flex items-end justify-center gap-4">
                    {order.map((p) => (
                        <div key={p.user_id} className="flex w-36 flex-col items-center sm:w-48">
                            <p className="text-center text-[22px] font-semibold leading-tight text-ink">{p.name}</p>
                            <p className="mt-1 font-mono text-[17px] text-ink-2 tabular">{p.score}</p>
                            <div className={`mt-3 flex w-full items-start justify-center rounded-t-[14px] pt-3 font-serif text-[40px] font-bold text-on-arena ${height(p)} ${p === podium[0] ? 'bg-arena-1' : p === podium[1] ? 'bg-arena-3' : 'bg-arena-4'}`}>
                                {p.rank}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {hard.length > 0 && (
                <section className="mx-auto mt-12 max-w-2xl">
                    <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">Câu khó nhất</p>
                    <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface px-5 shadow-[var(--shadow-card)]">
                        {hard.map((q) => (
                            <li key={q.idx} className="flex items-baseline justify-between gap-4 py-3.5 text-[17px]">
                                <span className="min-w-0 text-ink">
                                    <b lang="en" className="font-semibold">
                                        {pair(q).word}
                                    </b>{' '}
                                    <span className="text-ink-2">· {pair(q).meaning}</span>
                                </span>
                                <span className={`shrink-0 tabular ${q.correct / q.answered < 0.6 ? 'font-semibold text-warm' : 'text-muted'}`}>
                                    {q.correct}/{q.answered} đúng
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                {again.length > 0 && (
                    <button onClick={() => onTeach(again)} className="flex h-12 items-center gap-2 rounded-[10px] border border-line-strong bg-surface px-6 text-ink hover:bg-surface-2">
                        <Presentation className="h-5 w-5" /> Giảng lại {again.length} từ
                    </button>
                )}
                {again.length >= 3 && (
                    <button onClick={() => onClose(again)} className="h-12 rounded-[10px] bg-accent px-6 text-[17px] font-semibold text-on-accent hover:bg-accent-strong">
                        Chơi lại {again.length} từ khó
                    </button>
                )}
                <button onClick={() => onClose(null)} className="h-12 rounded-[10px] border border-line-strong bg-surface px-6 text-ink hover:bg-surface-2">
                    Ván mới
                </button>
            </div>
            {host.stats && host.stats.length > 0 && (
                <section className="mx-auto mt-12 max-w-2xl">
                    <button onClick={() => setDetails((d) => !d)} aria-expanded={details} className="text-[15px] text-accent-strong hover:underline">
                        {details ? 'Ẩn phân tích từng em' : 'Xem phân tích từng em (chỉ giáo viên nên xem, nhớ tắt máy chiếu)'}
                    </button>
                    {details && <Stats stats={host.stats} />}
                </section>
            )}
        </div>
    );
}

/** Teams as bars, longest for the leader; the score is the members' average. */
function TeamBars({ teams, large = false }: { teams: ArenaTeamScore[]; large?: boolean }) {
    const most = Math.max(1, ...teams.map((t) => t.score));
    return (
        <ol className={large ? 'space-y-4' : 'space-y-3'}>
            {teams.map((t) => (
                <li key={t.team}>
                    <div className={`flex items-baseline justify-between gap-3 ${large ? 'text-[19px]' : 'text-[15px]'}`}>
                        <span className="font-semibold text-ink">
                            {ARENA_TEAMS[t.team]} <span className="font-normal text-muted">· {t.members} em</span>
                        </span>
                        <span className="font-mono font-semibold tabular text-ink">{t.score}</span>
                    </div>
                    <div className={`mt-1.5 overflow-hidden rounded-full bg-surface-2 ${large ? 'h-5' : 'h-3'}`}>
                        <div className={`h-full rounded-full ${TILE[t.team - 1]}`} style={{ width: `${Math.max(3, (t.score / most) * 100)}%` }} />
                    </div>
                </li>
            ))}
        </ol>
    );
}

/** For the teacher: each student's right answers, speed, and a quiet flag on quick guesses. */
function Stats({ stats }: { stats: NonNullable<ArenaHost['stats']> }) {
    const guess = new Set(guessers(stats).map((s) => s.user_id));
    const rows = [...stats].sort((a, b) => a.correct / Math.max(1, a.answered) - b.correct / Math.max(1, b.answered));
    return (
        <div className="mt-4">
            {guess.size > 0 && (
                <p className="mb-3 text-[15px] text-ink-2">
                    <b className="text-warm">Đoán vội</b>: nhiều câu sai trả lời dưới 1,5 giây. Nhắc em đọc hết câu trước khi chọn.
                </p>
            )}
            <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface px-5 shadow-[var(--shadow-card)]">
                {rows.map((s) => (
                    <li key={s.user_id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 text-[15px]">
                        <span className="min-w-0 text-ink">
                            {s.name}
                            {guess.has(s.user_id) && <span className="ml-2 font-semibold text-warm">Đoán vội</span>}
                        </span>
                        <span className="shrink-0 text-ink-2 tabular">
                            {s.answered === 0 ? 'chưa trả lời câu nào' : `đúng ${s.correct}/${s.answered} · ${((s.avg_ms ?? 0) / 1000).toFixed(1)} giây/câu`}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
