'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, ClipboardCopy, Printer, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthGate from '../../components/AuthGate';
import ClassCode from '../../components/ClassCode';
import { activeLabel, assignWords, classBoard, isSlipping, matchWords, myClasses, parentNote, unassign, weekDelta, type Assignment, type Board } from '../../lib/classes';
import { getCard, getCardByWord, useContentVersion } from '../../lib/content/repository';
import { STEP_LABEL, STEPS } from '../../lib/journey/steps';
import { BRANCH_LABEL } from '../../lib/journey/path';

/**
 * A class for its teacher (docs/LEXICA_DIRECTION.md, "Trung tâm"): each
 * student's four numbers, streak and last day active; words to assign by
 * lesson; and the week in numbers, to print or send to parents.
 */
export default function ClassBoardPage() {
    const { id } = useParams<{ id: string }>();
    const { user, loading } = useAuth();
    useContentVersion();
    const [board, setBoard] = useState<Board | null>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [error, setError] = useState('');
    const [tab, setTab] = useState<'board' | 'assign' | 'report'>('board');

    const load = useCallback(async () => {
        try {
            const [b, classes] = await Promise.all([classBoard(id), myClasses()]);
            setBoard(b);
            setAssignments(classes.find((c) => c.id === id)?.assignments ?? []);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
    }, [id]);

    useEffect(() => {
        if (!user) return;
        const t = setTimeout(() => void load(), 0);
        return () => clearTimeout(t);
    }, [user, load]);

    if (loading) return <div className="min-h-screen bg-bg" />;
    if (!user) {
        return (
            <div className="min-h-screen bg-bg px-4 py-8">
                <div className="max-w-xl mx-auto">
                    <AuthGate reason="Đăng nhập để xem lớp." redirectPath={`/teach/${id}`} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg px-4 py-8 print:bg-white print:text-black">
            <div className="max-w-5xl mx-auto space-y-5">
                <div className="flex items-center justify-between print:hidden">
                    <Link href="/teach" className="text-muted hover:text-accent text-sm">
                        ← Lớp tôi dạy
                    </Link>
                    {board && <ClassCode code={board.class.code} />}
                </div>
                {error && <p className="text-sm text-danger">{error}</p>}
                {board && (
                    <>
                        <div>
                            <h1 className="text-2xl font-semibold text-ink">{board.class.name}</h1>
                            <p className="font-mono text-[11px] text-muted">
                                {BRANCH_LABEL[board.class.branch as 'cert' | 'talk'] ?? board.class.branch} · {board.students.length} học viên · mã {board.class.code}
                            </p>
                        </div>
                        <div className="flex gap-1 border-b border-line print:hidden" role="tablist">
                            {(
                                [
                                    ['board', 'Bảng lớp'],
                                    ['assign', `Giao từ (${assignments.length})`],
                                    ['report', 'Báo cáo tuần'],
                                ] as const
                            ).map(([k, label]) => (
                                <button
                                    key={k}
                                    role="tab"
                                    aria-selected={tab === k}
                                    onClick={() => setTab(k)}
                                    className={`px-3 py-2 text-sm -mb-px border-b-2 ${tab === k ? 'border-accent text-ink' : 'border-transparent text-muted hover:text-ink'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        {tab === 'board' && <BoardTable board={board} />}
                        {tab === 'assign' && <Assign classId={id} assignments={assignments} onChanged={load} onError={setError} />}
                        {tab === 'report' && <Report board={board} />}
                    </>
                )}
            </div>
        </div>
    );
}

function BoardTable({ board }: { board: Board }) {
    if (board.students.length === 0) {
        return <p className="text-sm text-muted">Chưa có học viên. Gửi mã {board.class.code} cho lớp, học viên vào &ldquo;Lớp học&rdquo; trong Lexica rồi nhập mã.</p>;
    }
    const slipping = board.students.filter((s) => isSlipping(s));
    return (
        <div className="space-y-3">
            {slipping.length > 0 && (
                <p className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/5 px-3 py-2 text-sm text-ink">
                    <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                    {slipping.length} học viên chưa học hơn 3 ngày: {slipping.map((s) => s.name).join(', ')}.
                </p>
            )}
            <div className="overflow-x-auto rounded-2xl border border-line">
                <table data-testid="class-board" className="w-full text-sm">
                    <thead className="bg-surface text-subtle text-xs">
                        <tr>
                            <th className="text-left font-normal px-3 py-2">Học viên</th>
                            {STEPS.map((s) => (
                                <th key={s} className="text-right font-normal px-2">
                                    {STEP_LABEL[s]}
                                </th>
                            ))}
                            <th className="text-right font-normal px-2">Từ của lớp</th>
                            <th className="text-right font-normal px-2">Chuỗi</th>
                            <th className="text-right font-normal px-3">Lần cuối</th>
                        </tr>
                    </thead>
                    <tbody>
                        {board.students.map((s) => (
                            <tr key={s.user_id} className="border-t border-line">
                                <td className="px-3 py-2 text-ink">{s.name}</td>
                                {STEPS.map((step) => (
                                    <td key={step} className={`text-right px-2 font-mono ${step === 'dung' ? 'text-accent' : 'text-ink-2'}`}>
                                        {s.counts[step] ?? 0}
                                    </td>
                                ))}
                                <td className="text-right px-2 font-mono text-ink-2">{s.assigned.total ? `${s.assigned.dung ?? 0}/${s.assigned.total}` : '–'}</td>
                                <td className="text-right px-2 font-mono text-ink-2">{s.streak}</td>
                                <td className={`text-right px-3 text-xs ${isSlipping(s) ? 'text-warning' : 'text-muted'}`}>{activeLabel(s.inactive_days, s.joined_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="text-xs text-muted">Hiểu → Nhớ → Gặp → Dùng: từ đã tới mỗi bước. &ldquo;Từ của lớp&rdquo; là số từ được giao đã tới Dùng.</p>
        </div>
    );
}

function Assign({ classId, assignments, onChanged, onError }: { classId: string; assignments: Assignment[]; onChanged: () => void; onError: (e: string) => void }) {
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [busy, setBusy] = useState(false);
    const [note, setNote] = useState('');
    const match = useMemo(() => matchWords(text, (w) => getCardByWord(w)), [text]);
    const submit = async () => {
        setBusy(true);
        onError('');
        try {
            const r = await assignWords(classId, title.trim() || 'Bài mới', match.cardIds, match.missing);
            setNote(`Đã giao ${r.cards} từ.${r.missing ? ` ${r.missing} từ chưa có thẻ đã gửi cho đội nội dung; khi có thẻ, giao lại bài này.` : ''}`);
            setTitle('');
            setText('');
            onChanged();
        } catch (e) {
            onError(e instanceof Error ? e.message : String(e));
        } finally {
            setBusy(false);
        }
    };
    return (
        <div className="space-y-4">
            <section className="rounded-2xl border border-line bg-surface p-4 space-y-3">
                <p className="font-semibold text-ink">Giao từ theo bài</p>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tên bài, ví dụ Unit 3: Environment" maxLength={80} className="h-11 w-full rounded-xl border border-line bg-bg px-3 text-sm text-ink" aria-label="Tên bài" />
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={6}
                    placeholder={'Dán danh sách từ của bài, mỗi dòng một từ hoặc cách nhau bằng dấu phẩy\nabundant\nfeasible\ndilemma'}
                    className="w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-ink"
                    aria-label="Danh sách từ"
                />
                {text.trim() && (
                    <p data-testid="assign-match" className="text-sm text-ink-2">
                        <Check className="inline w-4 h-4 text-accent" /> {match.cardIds.length} từ có thẻ
                        {match.missing.length > 0 && <span className="text-warning"> · {match.missing.length} từ chưa có thẻ: {match.missing.slice(0, 8).join(', ')}{match.missing.length > 8 ? '…' : ''}</span>}
                    </p>
                )}
                <button onClick={() => void submit()} disabled={busy || (match.cardIds.length === 0 && match.missing.length === 0)} className="h-11 px-5 rounded-xl bg-accent text-on-accent font-bold disabled:opacity-40">
                    {busy ? 'Đang giao…' : 'Giao cho lớp'}
                </button>
                {note && <p className="text-sm text-accent">{note}</p>}
                <p className="text-xs text-muted">Học viên sẽ gặp các từ này trước tiên trong phiên Hôm nay, và bạn thấy số từ đã tới Dùng ở bảng lớp.</p>
            </section>
            {assignments.map((a) => (
                <div key={a.id} className="rounded-xl border border-line bg-surface p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-ink">{a.title}</p>
                        <button
                            onClick={() => {
                                if (window.confirm(`Xoá bài "${a.title}"?`)) void unassign(a.id).then(onChanged);
                            }}
                            className="text-muted hover:text-danger"
                            aria-label={`Xoá bài ${a.title}`}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="mt-1 text-ink-2 lowercase">{a.card_ids.map((cid) => getCard(cid)?.word ?? cid).join(', ')}</p>
                    {a.missing_words.length > 0 && <p className="mt-1 text-xs text-warning">Chờ thẻ: {a.missing_words.join(', ')}</p>}
                </div>
            ))}
        </div>
    );
}

function Report({ board }: { board: Board }) {
    const [copied, setCopied] = useState<string | null>(null);
    const copy = (key: string, text: string) =>
        void navigator.clipboard?.writeText(text).then(() => {
            setCopied(key);
            setTimeout(() => setCopied(null), 1500);
        });
    const all = board.students.map((s) => parentNote(s, board.class.name)).join('\n\n');
    return (
        <div data-testid="week-report" className="space-y-3">
            <div className="flex flex-wrap gap-2 print:hidden">
                <button onClick={() => window.print()} className="h-10 px-4 rounded-xl border border-line text-sm text-ink flex items-center gap-2 hover:border-line-strong">
                    <Printer className="w-4 h-4" /> In hoặc lưu PDF
                </button>
                <button onClick={() => copy('all', all)} className="h-10 px-4 rounded-xl border border-line text-sm text-ink flex items-center gap-2 hover:border-line-strong">
                    <ClipboardCopy className="w-4 h-4" /> {copied === 'all' ? 'Đã chép' : 'Chép cả lớp'}
                </button>
            </div>
            <table className="w-full text-sm">
                <thead className="text-subtle text-xs">
                    <tr>
                        <th className="text-left font-normal py-1">Học viên</th>
                        <th className="text-right font-normal">+Nhớ tuần này</th>
                        <th className="text-right font-normal">+Dùng tuần này</th>
                        <th className="text-right font-normal">Tổng Nhớ</th>
                        <th className="text-right font-normal">Tổng Dùng</th>
                        <th className="text-right font-normal">Chuỗi</th>
                        <th className="print:hidden" />
                    </tr>
                </thead>
                <tbody>
                    {board.students.map((s) => {
                        const d = weekDelta(s);
                        return (
                            <tr key={s.user_id} className="border-t border-line">
                                <td className="py-2 text-ink">{s.name}</td>
                                <td className="text-right font-mono text-ink-2">+{d.nho}</td>
                                <td className="text-right font-mono text-accent">+{d.dung}</td>
                                <td className="text-right font-mono text-ink-2">{s.counts.nho ?? 0}</td>
                                <td className="text-right font-mono text-ink-2">{s.counts.dung ?? 0}</td>
                                <td className="text-right font-mono text-ink-2">{s.streak}</td>
                                <td className="text-right print:hidden">
                                    <button onClick={() => copy(s.user_id, parentNote(s, board.class.name))} className="text-xs text-muted hover:text-ink" title="Chép tin nhắn gửi phụ huynh">
                                        {copied === s.user_id ? 'Đã chép' : 'Chép tin nhắn'}
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <p className="text-xs text-muted">So với báo cáo gần nhất cách đây ít nhất 7 ngày; học viên mới vào tính từ báo cáo đầu tiên.</p>
        </div>
    );
}
