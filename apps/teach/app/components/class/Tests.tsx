'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Plus, Presentation } from 'lucide-react';
import { testScoreLine, type Board, type ClassTest, type TestResults } from '@cortex/classroom';
import { LEXICA } from '@cortex/classroom-lexica';
import { Badge, Button, Card, Drawer, Empty, ErrorNote, errorText, Field, inputClass, LinkButton } from '../ui';
import { api } from '../../lib/supabase';
import { localDay, reviewAssignment } from '../../lib/forecasts';
import { arenaQuestions, forgettingWords, hardWords, shortMeaning, sourceWords, type ArenaSource } from '../../lib/arena';
import { testReviews } from '../../lib/suggest';
import type { IndexCard } from '../../modules/lexica/words';
import { useWordIndex } from './Suggestions';
import { dueText } from './Overview';

/**
 * "Kiểm tra" (T3): a test of the class's words that each student takes in
 * Lexica, once, by the due date. The teacher sees who handed in, each score,
 * the questions the class missed most, and gives each student a review of
 * exactly the words they missed in one tap.
 */
export default function Tests({ board }: { board: Board }) {
    const [tests, setTests] = useState<ClassTest[] | null>(null);
    const [error, setError] = useState('');
    const [creating, setCreating] = useState(false);
    const [open, setOpen] = useState<string | null>(null);
    const load = useCallback(async () => {
        try {
            setTests(await api.testsList(board.class.id));
            setError('');
        } catch (e) {
            setError(errorText(e));
            setTests((t) => t ?? []);
        }
    }, [board.class.id]);
    useEffect(() => {
        const t = setTimeout(() => void load(), 0);
        return () => clearTimeout(t);
    }, [load]);

    if (!board.class.apps.includes(LEXICA)) return <Empty title="Bài kiểm tra cần Lexica">Bật Lexica cho lớp ở mục Cài đặt để kiểm tra từ vựng.</Empty>;

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button onClick={() => setCreating(true)}>
                    <Plus className="h-4 w-4" /> Tạo bài kiểm tra
                </Button>
            </div>
            <ErrorNote error={error} />
            {tests === null ? (
                <div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-surface-2" />
            ) : tests.length === 0 ? (
                <Empty title="Chưa có bài kiểm tra nào" action={<Button onClick={() => setCreating(true)}>Tạo bài đầu tiên</Button>}>
                    Mỗi em làm trên điện thoại trong Lexica, một lần, trước hạn. Bạn thấy điểm từng em và giao ôn đúng những từ em sai chỉ với một lần bấm.
                </Empty>
            ) : (
                tests.map((t) => (
                    <Card key={t.id}>
                        <button onClick={() => setOpen((o) => (o === t.id ? null : t.id))} aria-expanded={open === t.id} className="flex w-full flex-wrap items-start justify-between gap-3 text-left">
                            <div>
                                <p className="text-[17px] font-semibold text-ink">{t.title}</p>
                                <p className="mt-1 flex flex-wrap items-center gap-2">
                                    <Badge>{t.total} câu</Badge>
                                    {t.due_on && <Badge>{dueText(t.due_on)}</Badge>}
                                    {t.closed && <Badge tone="warm">Đã đóng</Badge>}
                                </p>
                            </div>
                            <p className="text-[15px] text-ink-2 tabular">
                                <b className="text-ink">{t.submitted}</b>/{board.students.length} em đã nộp
                                {t.average !== null && (
                                    <>
                                        {' '}
                                        · trung bình <b className="text-ink">{t.average}</b>/{t.total}
                                    </>
                                )}
                            </p>
                        </button>
                        {open === t.id && <Results board={board} testId={t.id} onChanged={load} />}
                    </Card>
                ))
            )}
            <Drawer open={creating} title="Tạo bài kiểm tra" onClose={() => setCreating(false)}>
                {creating && (
                    <CreateTest
                        board={board}
                        onCreated={async (id) => {
                            setCreating(false);
                            await load();
                            setOpen(id);
                        }}
                    />
                )}
            </Drawer>
        </div>
    );
}

const COUNTS = [10, 20, 30];

function CreateTest({ board, onCreated }: { board: Board; onCreated: (id: string) => void }) {
    const words = useWordIndex();
    const lessons = board.assignments.filter((a) => a.app === LEXICA && !a.for_user);
    const forgetting = useMemo(() => forgettingWords(board), [board]);
    const [source, setSource] = useState<ArenaSource>(lessons[0] ? { kind: 'lesson', assignmentId: lessons[0].id } : { kind: 'all' });
    const [count, setCount] = useState(10);
    const [title, setTitle] = useState('');
    const [due, setDue] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 3);
        return localDay(d.getTime());
    });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const cards = useMemo<IndexCard[]>(() => (words ? sourceWords(board, source).map((id) => words.byId.get(id)).filter((c): c is IndexCard => Boolean(c)) : []), [board, source, words]);
    const lessonTitle = source.kind === 'lesson' ? lessons.find((a) => a.id === source.assignmentId)?.title : null;
    const chip = (on: boolean) => `h-10 rounded-full border px-4 text-[15px] ${on ? 'border-accent bg-accent-soft font-semibold text-accent-strong' : 'border-line-strong text-ink-2 hover:bg-surface-2'}`;

    return (
        <div className="space-y-6">
            <div>
                <p className="mb-2 text-[15px] font-medium text-ink-2">Hỏi từ nào</p>
                <div className="flex flex-wrap gap-2">
                    {lessons.length > 0 && (
                        <button className={chip(source.kind === 'lesson')} onClick={() => setSource({ kind: 'lesson', assignmentId: lessons[0].id })}>
                            Một bài giao
                        </button>
                    )}
                    <button className={chip(source.kind === 'all')} onClick={() => setSource({ kind: 'all' })}>
                        Mọi bài của lớp
                    </button>
                    <button className={chip(source.kind === 'forgetting')} disabled={forgetting.length < 3} onClick={() => setSource({ kind: 'forgetting' })}>
                        Từ cả lớp sắp quên
                    </button>
                </div>
                {source.kind === 'lesson' && (
                    <select value={source.assignmentId} onChange={(e) => setSource({ kind: 'lesson', assignmentId: e.target.value })} aria-label="Bài giao" className={`${inputClass} mt-3`}>
                        {lessons.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.title}
                            </option>
                        ))}
                    </select>
                )}
            </div>
            <div>
                <p className="mb-2 text-[15px] font-medium text-ink-2">Số câu</p>
                <div className="flex gap-2">
                    {COUNTS.map((n) => (
                        <button key={n} className={chip(count === n)} onClick={() => setCount(n)}>
                            {n}
                        </button>
                    ))}
                </div>
                <p className="mt-2 text-[13px] text-muted">{!words ? 'Đang tải danh sách từ…' : words.error ?? `Nguồn này có ${cards.length} từ.`}</p>
            </div>
            <Field label="Tên bài">
                <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder={lessonTitle ? `Kiểm tra: ${lessonTitle}` : 'Kiểm tra từ vựng'} className={inputClass} />
            </Field>
            <Field label="Hạn nộp" hint="Sau hạn em vẫn nộp được cho tới khi bạn đóng bài.">
                <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={inputClass} />
            </Field>
            <ErrorNote error={error} />
            <Button
                className="w-full"
                disabled={busy || !words || cards.length < 3}
                onClick={async () => {
                    if (!words) return;
                    const qs = arenaQuestions(cards, words.cards, count);
                    if (qs.length < 3) {
                        setError('Chưa đủ từ có nghĩa để ra 3 câu. Chọn nguồn khác.');
                        return;
                    }
                    setBusy(true);
                    setError('');
                    try {
                        const r = await api.testCreate(board.class.id, title.trim() || (lessonTitle ? `Kiểm tra: ${lessonTitle}` : 'Kiểm tra từ vựng'), due || null, qs);
                        onCreated(r.id);
                    } catch (e) {
                        setError(errorText(e));
                    } finally {
                        setBusy(false);
                    }
                }}
            >
                {busy ? 'Đang tạo…' : `Giao bài kiểm tra ${Math.min(count, cards.length)} câu`}
            </Button>
        </div>
    );
}

const STATUS = { submitted: 'Đã nộp', started: 'Đang làm', not_started: 'Chưa làm' } as const;

function Results({ board, testId, onChanged }: { board: Board; testId: string; onChanged: () => Promise<void> }) {
    const [r, setR] = useState<TestResults | null>(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [given, setGiven] = useState(false);
    const words = useWordIndex();
    const load = useCallback(async () => {
        try {
            setR(await api.testResults(testId));
        } catch (e) {
            setError(errorText(e));
        }
    }, [testId]);
    useEffect(() => {
        const t = setTimeout(() => void load(), 0);
        return () => clearTimeout(t);
    }, [load]);

    if (!r) return <div className="mt-5">{error ? <ErrorNote error={error} /> : <div className="h-24 animate-pulse rounded-[12px] bg-surface-2" />}</div>;
    const reviews = testReviews(r, board);
    const again = hardWords(r.questions);
    const rows = [...r.students].sort((a, b) => (a.status === 'submitted' ? 0 : 1) - (b.status === 'submitted' ? 0 : 1) || (a.correct ?? 0) - (b.correct ?? 0));
    const hard = [...r.questions].filter((q) => q.answered > 0).sort((a, b) => a.correct / a.answered - b.correct / b.answered).slice(0, 5);
    // The word and its meaning, whichever way the question asked
    const pair = (q: TestResults['questions'][number]) => {
        const c = q.card_id ? words?.byId.get(q.card_id) : undefined;
        return c ? { word: c.word, meaning: shortMeaning(c.meaning) } : { word: q.prompt, meaning: q.right };
    };
    const act = async (fn: () => Promise<unknown>) => {
        setBusy(true);
        setError('');
        try {
            await fn();
            await load();
            await onChanged();
        } catch (e) {
            setError(errorText(e));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="mt-6 grid gap-8 border-t border-line pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <section>
                <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">Từng em</p>
                <ul className="divide-y divide-line">
                    {rows.map((s) => (
                        <li key={s.user_id} className="flex items-baseline justify-between gap-3 py-2.5 text-[15px]">
                            <span className="min-w-0 truncate text-ink">{s.name}</span>
                            <span className={`shrink-0 tabular ${s.status === 'submitted' ? ((s.correct ?? 0) / r.total < 0.5 ? 'font-semibold text-warm' : 'text-ink') : 'text-muted'}`}>
                                {s.status === 'submitted' ? testScoreLine(s.correct ?? 0, r.total) : STATUS[s.status]}
                            </span>
                        </li>
                    ))}
                </ul>
            </section>
            <section>
                {hard.length > 0 && (
                    <>
                        <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">Câu sai nhiều nhất</p>
                        <ul className="divide-y divide-line">
                            {hard.map((q) => (
                                <li key={q.idx} className="flex items-baseline justify-between gap-3 py-2.5 text-[15px]">
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
                    </>
                )}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                    {reviews.length > 0 &&
                        (given ? (
                            <span className="flex items-center gap-1.5 text-[15px] text-accent-strong">
                                <Check className="h-4 w-4" /> Đã giao ôn cho {reviews.length} em
                            </span>
                        ) : (
                            <Button
                                size="sm"
                                disabled={busy}
                                onClick={() =>
                                    act(async () => {
                                        const today = localDay(Date.now());
                                        for (const v of reviews) await api.assignTo(board.class.id, v.userId, { ...reviewAssignment(v.cardIds, today), title: `Ôn lại ${v.cardIds.length} từ sai trong “${r.title}”` });
                                        setGiven(true);
                                    })
                                }
                            >
                                Giao ôn từ sai cho {reviews.length} em
                            </Button>
                        ))}
                    {again.length > 0 && (
                        <LinkButton href={`/present/${board.class.id}?tool=slides&words=${again.join(',')}`} kind="secondary" size="sm">
                            <Presentation className="h-4 w-4" /> Giảng lại {again.length} từ
                        </LinkButton>
                    )}
                    <Button size="sm" kind="secondary" disabled={busy} onClick={() => act(() => api.testClose(testId, !r.closed))}>
                        {r.closed ? 'Mở lại' : 'Đóng bài'}
                    </Button>
                    <Button
                        size="sm"
                        kind="danger"
                        disabled={busy}
                        onClick={() => {
                            if (!window.confirm(`Xoá “${r.title}” và mọi bài làm của học viên?`)) return;
                            // The list reloads without it; nothing left here to reload
                            api.testDelete(testId).then(onChanged, (e: unknown) => setError(errorText(e)));
                        }}
                    >
                        Xoá
                    </Button>
                </div>
                <ErrorNote error={error} />
            </section>
        </div>
    );
}
